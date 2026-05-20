import os
import sys

with open('config/settings.py', 'r') as f:
    content = f.read()

content = content.replace("CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)", "if isinstance(CORS_ALLOWED_ORIGINS, list): CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)")

with open('config/settings.py', 'w') as f:
    f.write(content)
