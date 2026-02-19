
import os
import sys
import django
from django.conf import settings

# Setup Django environment
sys.path.append(r'c:\Users\Zalak\OneDrive\Documents\project\qr-health-system')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Trick Django into loading with DEBUG=False for this test
# We can't easily change the loaded settings object after setup, 
# so we might need to rely on reading the file or mocking env vars BEFORE setup if decouple is used.
# Since we use decouple, we can set the env var.

os.environ['DEBUG'] = 'False'
django.setup()

print("Verifying HTTPS Settings (DEBUG=False)...")

try:
    print(f"DEBUG: {settings.DEBUG}")
    if settings.SECURE_SSL_REDIRECT:
        print("[PASS] SECURE_SSL_REDIRECT is True")
    else:
        print("[FAIL] SECURE_SSL_REDIRECT is False")

    if settings.SESSION_COOKIE_SECURE:
        print("[PASS] SESSION_COOKIE_SECURE is True")
    else:
        print("[FAIL] SESSION_COOKIE_SECURE is False")
        
    if settings.CSRF_COOKIE_SECURE:
        print("[PASS] CSRF_COOKIE_SECURE is True")
    else:
        print("[FAIL] CSRF_COOKIE_SECURE is False")

except Exception as e:
    print(f"Error: {e}")
