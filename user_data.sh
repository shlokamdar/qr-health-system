#!/bin/bash
# PulseID EC2 User Data Script (Secrets Manager Integrated)

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting deployment..."

# -------------------------------
# 1. Install Dependencies
# -------------------------------
dnf update -y
dnf install -y python3 python3-pip git nginx postgresql15-server openssl

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Install AWS CLI + boto3
pip3 install boto3 awscli

# -------------------------------
# 2. Fetch Secrets from AWS
# -------------------------------
REGION="ap-south-1"

# Fetch email password from Secrets Manager
EMAIL_PASSWORD=$(aws secretsmanager get-secret-value \
    --secret-id "/pulseid/prod/email_password" \
    --region $REGION \
    --query SecretString \
    --output text)

# -------------------------------
# 3. PostgreSQL Setup
# -------------------------------
postgresql-setup --initdb
systemctl enable --now postgresql

sleep 3

# Generate secure DB password
DB_PASSWORD=$(openssl rand -base64 12)

sudo -u postgres psql <<EOF
CREATE DATABASE qrhealth;
CREATE USER dbadmin WITH PASSWORD '${DB_PASSWORD}';
ALTER ROLE dbadmin SET client_encoding TO 'utf8';
ALTER ROLE dbadmin SET default_transaction_isolation TO 'read committed';
ALTER ROLE dbadmin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE qrhealth TO dbadmin;
EOF

# -------------------------------
# 4. Clone Project
# -------------------------------
cd /home/ec2-user
git clone https://github.com/shlokamdar/qr-health-system.git
cd qr-health-system

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "127.0.0.1")

# -------------------------------
# 5. Create .env File
# -------------------------------
cat <<EOF > .env
SECRET_KEY=$(openssl rand -base64 32)
DEBUG=False
ALLOWED_HOSTS=127.0.0.1,localhost,${PUBLIC_IP}

POSTGRES_DB=qrhealth
POSTGRES_USER=dbadmin
POSTGRES_PASSWORD=${DB_PASSWORD}

EMAIL_HOST_PASSWORD=${EMAIL_PASSWORD}

CORS_ALLOWED_ORIGINS=http://${PUBLIC_IP}
FRONTEND_URL=http://${PUBLIC_IP}
EOF

chown ec2-user:ec2-user .env

# -------------------------------
# 6. Backend Setup
# -------------------------------
python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

python manage.py migrate
python manage.py collectstatic --noinput

deactivate

chown -R ec2-user:ec2-user /home/ec2-user/qr-health-system

# -------------------------------
# 7. Frontend Setup
# -------------------------------
cd /home/ec2-user/qr-health-system/frontend
sudo -u ec2-user npm install
sudo -u ec2-user npm run build
cd /home/ec2-user/qr-health-system

# -------------------------------
# 8. Gunicorn Service
# -------------------------------
cat <<EOF > /etc/systemd/system/gunicorn.service
[Unit]
Description=Gunicorn daemon for PulseID
After=network.target

[Service]
User=ec2-user
Group=nginx
WorkingDirectory=/home/ec2-user/qr-health-system
Environment="PATH=/home/ec2-user/qr-health-system/venv/bin"
ExecStart=/home/ec2-user/qr-health-system/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now gunicorn

# -------------------------------
# 9. Nginx Setup
# -------------------------------
cat <<EOF > /etc/nginx/conf.d/qr-health.conf
server {
    listen 80;
    server_name _;

    location / {
        root /home/ec2-user/qr-health-system/frontend/dist;
        try_files \$uri /index.html;
    }

    location /static/ {
        alias /home/ec2-user/qr-health-system/staticfiles/;
    }

    location /media/ {
        alias /home/ec2-user/qr-health-system/media/;
    }

    location ~ ^/(api|admin|swagger|redoc) {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 10M;
}
EOF

chmod +x /home/ec2-user

systemctl enable --now nginx

# -------------------------------
# 10. Restart Services
# -------------------------------
systemctl restart gunicorn
systemctl restart nginx

echo "Deployment completed successfully!"