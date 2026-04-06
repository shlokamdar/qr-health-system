# PythonAnywhere Deployment Guide for PulseID

This guide will walk you through deploying your PulseID Django application on PythonAnywhere. PythonAnywhere is perfectly suited to host your backend, while your frontend can continue to point to it via API calls or be served from elsewhere.

## 1. Initial Setup on PythonAnywhere

1. Log into your PythonAnywhere account (username: `pulseid`).
2. Open a new **Bash** console from the "Consoles" tab.

## 2. Clone the Repository

In the bash console, clone your source code from your Git provider (GitHub/GitLab/etc):
```bash
git clone <your-git-repository-url> pulseid-backend
cd pulseid-backend
```

## 3. Create a Virtual Environment

PythonAnywhere strongly recommends using a virtual environment:
```bash
mkvirtualenv --python=python3.10 myvenv
```
*(Note: replace `python3.10` with the Python version you want to use, such as `python3.9` or `python3.10` depending on your account's supported versions).*

Install the required dependencies:
```bash
pip install -r requirements.txt
```

*Note: Since you are using Postgres/SQLite depending on `.env`, make sure that the required DB drivers are in `requirements.txt` (like `psycopg2-binary` if using Postgres).*

## 4. Setup Environment Variables

Create your `.env` file in the project's root folder (`~/pulseid-backend/`):
```bash
nano .env
```
Add the following necessary production variables to it:
```env
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=127.0.0.1,localhost,pulseid.pythonanywhere.com
FRONTEND_URL=https://your-frontend-deployment-url.com

# Email Settings
EMAIL_HOST_PASSWORD=your-app-specific-password
```
*(Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit).*

## 5. Setup the Database and Static Files

Run the database migrations:
```bash
python manage.py migrate
```

Collect all your static files into the `staticfiles` directory:
```bash
python manage.py collectstatic --noinput
```

Create a superuser for accessing the Django Admin:
```bash
python manage.py createsuperuser
```

## 6. Configure the Web App

1. Go to the **Web** tab on the PythonAnywhere dashboard.
2. Click **Add a new web app**.
3. Choose **Manual configuration** (do not choose Django, as we will configure WSGI ourselves), and choose your Python version (e.g. Python 3.10).
4. Enter your virtual environment path in the **Virtualenv** section:
   `/home/pulseid/.virtualenvs/myvenv`
5. In the Code section, specify the **Source code** directory as:
   `/home/pulseid/pulseid-backend`

### Configure Static Files on Web Tab

In the **Static files** section of the Web tab, map your static URLs so PythonAnywhere serves them efficiently:
- **URL**: `/static/`
- **Directory**: `/home/pulseid/pulseid-backend/staticfiles`
- **URL**: `/media/`
- **Directory**: `/home/pulseid/pulseid-backend/media`

### Configure the WSGI File

In the **Code** section of the Web tab, click the link to edit your WSGI configuration file (it will look like `/var/www/pulseid_pythonanywhere_com_wsgi.py`). Delete all existing code in this file, and replace it with:

```python
import os
import sys

# Add your project directory to the sys.path
path = '/home/pulseid/pulseid-backend'
if path not in sys.path:
    sys.path.append(path)

# Set environment variable to tell Django where your settings module is
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

# Serve standard django WSGI application
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise
from django.conf import settings

application = get_wsgi_application()

# Use Whitenoise to wrap the WSGI application (for static files) if you haven't relied completely on PythonAnywhere mappings.
application = WhiteNoise(application, root='/home/pulseid/pulseid-backend/staticfiles')
```

Save the file and go back to the **Web** tab.

## 7. Reload the Web App

Click the big green **Reload pulseid.pythonanywhere.com** button at the top of the **Web** tab.

## 8. Success!

Your backend is now live! You can verify it by visiting `https://pulseid.pythonanywhere.com/api/` or `https://pulseid.pythonanywhere.com/admin/`. 
*(If you deploy a React App, you will point its API base URL to `https://pulseid.pythonanywhere.com`)*.
