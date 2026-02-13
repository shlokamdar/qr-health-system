"""
Test with updated credentials
"""
import requests

# Get first patient username
import sys
sys.path.insert(0, '.')
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
patient_user = User.objects.filter(role='PATIENT').first()

if patient_user:
    username = patient_user.username
    password = 'test123'
    
    print(f"Testing login with: {username} / {password}")
    
    # Login
    login_resp = requests.post('http://localhost:8000/api/auth/login/', json={
        'username': username,
        'password': password
    })
    
    if login_resp.status_code == 200:
        token = login_resp.json()['access']
        print(f"✓ Login successful!")
        
        # Test /api/patients/me/ endpoint
        headers = {'Authorization': f'Bearer {token}'}
        me_resp = requests.get('http://localhost:8000/api/patients/me/', headers=headers)
        
        print(f"\n/api/patients/me/ status: {me_resp.status_code}")
        if me_resp.status_code == 200:
            data = me_resp.json()
            print(f"✓ Patient data retrieved successfully!")
            print(f"  Health ID: {data.get('health_id')}")
            print(f"  Name: {data.get('user', {}).get('first_name')} {data.get('user', {}).get('last_name')}")
        else:
            print(f"✗ Failed: {me_resp.text[:200]}")
    else:
        print(f"✗ Login failed: {login_resp.status_code}")
        print(f"  {login_resp.text[:200]}")
else:
    print("No patient users found!")
