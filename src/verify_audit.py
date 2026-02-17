
import os
import sys
import django
import os
import sys
import django

# Setup Django environment
sys.path.append(r'c:\Users\Zalak\OneDrive\Documents\project\qr-health-system')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

print("Verifying Audit Log Access Control...")

def verify_audit_access():
    url = '/api/audit/logs/'

    # 1. Unauthenticated Access
    response = client.get(url)
    if response.status_code == 401:  # Assuming IsAuthenticated is default
        print("[PASS] Unauthenticated access denied (401).")
    elif response.status_code == 403:
         print("[PASS] Unauthenticated access denied (403).")
    else:
        print(f"[FAIL] Unauthenticated access allowed? Status: {response.status_code}")

    # 2. Regular User Access
    user = User.objects.create_user(username='testuser', password='password123')
    client.force_authenticate(user=user)
    response = client.get(url)
    if response.status_code == 403:
        print("[PASS] Regular user access denied (403).")
    else:
        print(f"[FAIL] Regular user access allowed? Status: {response.status_code}")

    # 3. Superuser Access
    admin = User.objects.create_superuser(username='testadmin', password='password123', email='admin@example.com')
    client.force_authenticate(user=admin)
    response = client.get(url)
    if response.status_code == 200:
        print("[PASS] Superuser access granted (200).")
    else:
        print(f"[FAIL] Superuser access denied? Status: {response.status_code}")
        print(response.data)

    user.delete()
    admin.delete()

try:
    verify_audit_access()
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error: {e}")
