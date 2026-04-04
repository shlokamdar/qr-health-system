# Multi-VM Deployment Guide (No Docker)

This guide documents a standard bare-metal deployment across **two distinct EC2 instances**:
1. **Jenkins VM**: Builds the code when changes are pushed to `main` and deploys it over SSH.
2. **Production VM**: Runs the application natively using Gunicorn, Nginx, and PostgreSQL.

---

## 1. Set Up the Jenkins VM (CI/CD Server)

This VM orchestrates the pipeline.

1. **Launch EC2 Instance**: 
   - **OS**: Ubuntu 22.04 LTS
   - **Specs**: t2.micro or t2.small
   - **Security Group**: Allow Ports `22` (SSH) and `8080` (Jenkins)
2. **Install Jenkins and Dependencies**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y openjdk-17-jdk git curl
   
   # Install Jenkins
   curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
   echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
   sudo apt update
   sudo apt install -y jenkins
   sudo systemctl enable --now jenkins
   
   # Install Node.js (for building the React frontend on the Jenkins server)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
3. **Configure Jenkins Plugin**: Log into Jenkins (port 8080). Navigate to **Manage Jenkins > Plugins** and install the **SSH Agent** plugin.

---

## 2. Set Up the Production VM (Application Server)

This VM runs your database, backend, and serves the frontend.

1. **Launch EC2 Instance**:
   - **OS**: Ubuntu 22.04 LTS
   - **Specs**: t2.micro or t2.small
   - **Security Group**: Allow Ports `22` (SSH), `80` (HTTP), and `443` (HTTPS).
2. **Install Nginx, Python, and PostgreSQL**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib
   ```
3. **Database Configuration**:
   Create a database and a user for your Django application.
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
4. **Setup the Project structure**:
   ```bash
   mkdir -p /home/ubuntu/qr-health-system
   ```
   Add a `.env` file at `/home/ubuntu/qr-health-system/.env` with your secure production settings:
   ```text
   SECRET_KEY=your_django_secret
   DEBUG=False
   ALLOWED_HOSTS=*
   POSTGRES_DB=qrhealth
   POSTGRES_USER=dbadmin
   POSTGRES_PASSWORD=mypassword
   CORS_ALLOWED_ORIGINS=http://<prod-vm-ip>
   ```

---

## 3. Link Jenkins VM to Production VM

Jenkins needs SSH access to push files and run commands on the Production VM.

1. **Generate SSH Key on Jenkins VM**:
   ```bash
   sudo su - jenkins
   ssh-keygen -t rsa -b 4096
   cat ~/.ssh/id_rsa.pub
   ```
2. **Add Key to Production VM**:
   On the **Production VM**, paste the output of the Jenkins public key into the `authorized_keys` file:
   ```bash
   nano ~/.ssh/authorized_keys
   ```
   Save and close.
3. **Add credentials to Jenkins**:
   - Go to **Manage Jenkins > Credentials > System > Global credentials**.
   - Add a credential of kind **SSH Username with private key**.
   - **ID**: `prod-vm-ssh-key` (Must match the `Jenkinsfile`!).
   - **Username**: `ubuntu` (or the SSH user of your Prod VM).
   - Paste the **PRIVATE** key (`cat ~/.ssh/id_rsa` on the Jenkins VM) into the private key area.

---

## 4. Production VM: Service Configuration

We need to make `Gunicorn` and `Nginx` run our app as native Linux services.

### Gunicorn Systemd Service
Create the service file on the **Production VM**:
```bash
sudo nano /etc/systemd/system/gunicorn.service
```
Insert the following configuration:
```ini
[Unit]
Description=gunicorn daemon for qr-health-system
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/qr-health-system
Environment="PATH=/home/ubuntu/qr-health-system/venv/bin"
ExecStart=/home/ubuntu/qr-health-system/venv/bin/gunicorn --access-logfile - --workers 3 --bind 127.0.0.1:8000 config.wsgi:application

[Install]
WantedBy=multi-user.target
```
Start and enable Gunicorn:
```bash
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
```

### Nginx Server Block (Frontend + Proxying)
Configure Nginx on the **Production VM** to serve your React frontend build and reverse proxy requests prefixed with `/api`, `/admin`, `/media`, etc., to Gunicorn.
```bash
sudo nano /etc/nginx/sites-available/qr-health
```
Add server configuration:
```nginx
server {
    listen 80;
    server_name _; # Or domain name if you have one

    # React Frontend build
    location / {
        root /home/ubuntu/qr-health-system/frontend/dist;
        try_files $uri /index.html;
    }

    # Django Static / Media files
    location /static/ {
        alias /home/ubuntu/qr-health-system/staticfiles/;
    }
    location /media/ {
        alias /home/ubuntu/qr-health-system/media/;
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
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/qr-health /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

## 5. Completing the Setup
1. In Jenkins Console UI, create a new **Pipeline** project.
2. Link your Git Repository to the Source Code Management section.
3. Update the `Jenkinsfile` currently in your repo `PROD_IP` variable to point to your Production VM's public IP address.
4. If you have setup GitHub webhooks, the trigger happens automatically. Alternatively, run **Build Now**.

Jenkins will check out your code, build the React frontend via NPM on the Jenkins VM, sync everything via SSH `rsync` over to the Prod VM, apply your Python dependencies, setup Django schemas, and restart the Nginx & Gunicorn daemons!
