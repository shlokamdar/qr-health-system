import os
import sys

with open('config/settings.py', 'r') as f:
    content = f.read()

content = content.replace("CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)", "if isinstance(CSRF_TRUSTED_ORIGINS, list): CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)")

with open('config/settings.py', 'w') as f:
    f.write(content)
