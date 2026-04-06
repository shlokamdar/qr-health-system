# Single-VM Deployment Guide (Amazon Linux)

This guide documents a standard deployment for the PulseID project on **Amazon Linux** using `yum`/`dnf` package managers. Instead of relying on a CI/CD pipeline, this guide covers cloning the repository directly from GitHub to your production server and running it using Gunicorn, Nginx, and PostgreSQL.

---

## 1. Set Up the Amazon Linux Server

Launch an **Amazon Linux 2023** (or Amazon Linux 2) EC2 instance:
- **Specs**: t2.micro or t2.small
- **Security Group**: Allow Ports `22` (SSH), `80` (HTTP), and `443` (HTTPS)

Connect to the instance via SSH:
```bash
ssh -i "your-key.pem" ec2-user@<your-ec2-ip-address>
```

---

## 2. Install System Dependencies

Update the system and install required packages including Python 3, PostgreSQL, Nginx, Git, and Node.js (for the React frontend):

```bash
sudo dnf update -y
sudo dnf install -y python3 python3-pip git nginx postgresql15-server

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

---

## 3. Database Configuration

Initialize and start the PostgreSQL service:

```bash
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
```

Create a database and a user for your Django application:

```bash
sudo -u postgres psql
```

*In the PostgreSQL prompt:*
```sql
CREATE DATABASE qrhealth;
CREATE USER dbadmin WITH PASSWORD 'mypassword';
ALTER ROLE dbadmin SET client_encoding TO 'utf8';
ALTER ROLE dbadmin SET default_transaction_isolation TO 'read committed';
ALTER ROLE dbadmin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE qrhealth TO dbadmin;
\q
```

---

## 4. Clone and Setup the Project

Clone the repository from GitHub into the `ec2-user` home directory:

```bash
cd ~
git clone https://github.com/your-username/qr-health-system.git
cd qr-health-system
```

Add a `.env` file at `~/qr-health-system/.env` with your secure production settings:

```text
SECRET_KEY=your_django_secret_key_here
DEBUG=False
ALLOWED_HOSTS=*
POSTGRES_DB=qrhealth
POSTGRES_USER=dbadmin
POSTGRES_PASSWORD=mypassword
CORS_ALLOWED_ORIGINS=http://<your-ec2-ip-address>
FRONTEND_URL=http://<your-ec2-ip-address>
```

---

## 5. Backend (Django) Setup

Create a virtual environment, install Python dependencies, and apply migrations:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
```

---

## 6. Frontend (React) Setup

Navigate to the `frontend` folder to install NPM packages and build the static assets:

```bash
cd ~/qr-health-system/frontend
npm install
npm run build
cd ~/qr-health-system
```

---

## 7. Service Configuration

We need to make `Gunicorn` and `Nginx` run our app as native Linux services.

### Gunicorn Systemd Service

Create the service file:
```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Insert the following configuration:
```ini
[Unit]
Description=gunicorn daemon for qr-health-system
After=network.target

[Service]
User=ec2-user
Group=nginx
WorkingDirectory=/home/ec2-user/qr-health-system
Environment="PATH=/home/ec2-user/qr-health-system/venv/bin"
ExecStart=/home/ec2-user/qr-health-system/venv/bin/gunicorn --access-logfile - --workers 3 --bind 127.0.0.1:8000 config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Start and enable Gunicorn:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
```

### Nginx Server Block (Frontend + Proxying)

Configure Nginx to serve your React frontend build and reverse proxy API requests to Gunicorn.

```bash
sudo nano /etc/nginx/conf.d/qr-health.conf
```

Add server configuration:
```nginx
server {
    listen 80;
    server_name _; 

    # React Frontend build
    location / {
        root /home/ec2-user/qr-health-system/frontend/dist;
        try_files $uri /index.html;
    }

    # Django Static / Media files
    location /static/ {
        alias /home/ec2-user/qr-health-system/staticfiles/;
    }
    location /media/ {
        alias /home/ec2-user/qr-health-system/media/;
    }

    # Reverse proxy backend requests to Gunicorn
    location ~ ^/(api|admin|swagger|redoc) {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ensure Nginx has permission to access the `ec2-user` home directory for static files:
```bash
sudo chmod +x /home/ec2-user
```

Start and enable Nginx:
```bash
sudo systemctl enable --now nginx
```

---

## 8. Completion

Your deployment is complete! Visit your EC2 instance's public IP address in your browser.
To pull the latest updates in the future, simply `git pull` from the project root, build the frontend (`npm run build`), apply migrations, and restart the `gunicorn` and `nginx` services.
