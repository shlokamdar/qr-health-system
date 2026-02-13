import requests
import sys
import random
import string

BASE_URL = 'http://localhost:8000/api'

def get_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def get_token(username, password):
    response = requests.post(f'{BASE_URL}/auth/login/', json={
        'username': username,
        'password': password
    })
    if response.status_code == 200:
        return response.json()['access']
    return None

def run_verification():
    print("--- Starting Appointment Verification (Self-Contained) ---")

    # 1. Create a Doctor
    doc_username = f"doc_{get_random_string()}"
    doc_password = "docpass123"
    print(f"\n1. Registering Doctor: {doc_username}...")
    
    resp = requests.post(f'{BASE_URL}/doctors/register/', json={
        'username': doc_username,
        'password': doc_password,
        'email': f"{doc_username}@example.com",
        'first_name': 'Test',
        'last_name': 'Doctor',
        'license_number': f"LIC-{get_random_string()}",
        'specialization': 'General',
        'hospital': None
    })
    if resp.status_code != 201:
        print(f"Failed to register doctor: {resp.text}")
        sys.exit(1)
    
    # 2. Verify Doctor (as Admin)
    # Assuming standard admin credentials or skipped if no admin
    # Actually, I can just use raw SQL or shell to verify? No, let's try to login as admin.
    # If admin login fails, I can't verify via API.
    # Alternative: Use shell command to verify.
    # But let's try standard admin: admin / admin123 (from previous sessions?)
    # Or just proceed? Unverified doctors might not show up in the list for patients.
    # `VerifiedDoctorListView` filters by `is_verified=True`.
    
    # Let's try to verify via shell command after this script if this fails.
    # For now, I'll use a hack: I'll use the shell to create the doctor and verify them, 
    # OR I'll just use the Django shell to run the whole test?
    # No, API test is better.
    
    # I'll rely on the `run_command` to verify the doctor via shell if I can't do it here.
    # But wait, I can just run a python script that imports django models!
    # That is much easier.
    pass

if __name__ == '__main__':
    # I will switch to a Django management command script style
    print("Please run this via 'python manage.py shell < verify_appointments_script.py'")
