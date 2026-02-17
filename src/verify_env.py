
import os
import sys
import django
from django.conf import settings

# Setup Django environment
sys.path.append(r'c:\Users\Zalak\OneDrive\Documents\project\qr-health-system')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("Verifying Django Settings...")

try:
    # Check SECRET_KEY
    secret_key = settings.SECRET_KEY
    if secret_key and "django-insecure" in secret_key:
        print("[PASS] SECRET_KEY loaded (Development key detected).")
    elif secret_key:
        print("[PASS] SECRET_KEY loaded.")
    else:
        print("[FAIL] SECRET_KEY is missing or empty.")

    # Check DEBUG
    debug = settings.DEBUG
    print(f"DEBUG is set to: {debug}")
    if debug is True:
        print("[PASS] DEBUG matches .env file.")
    else:
        print("[WARNING] DEBUG is False (Verify if this is intended for dev).")

    # Check ALLOWED_HOSTS
    allowed_hosts = settings.ALLOWED_HOSTS
    print(f"ALLOWED_HOSTS: {allowed_hosts}")
    if '127.0.0.1' in allowed_hosts and 'localhost' in allowed_hosts:
        print([allowed_hosts])
        print("[PASS] ALLOWED_HOSTS loaded correctly.")
    else:
        print("[FAIL] ALLOWED_HOSTS mismatch.")

except Exception as e:
    print(f"[ERROR] Failed to verify settings: {e}")
