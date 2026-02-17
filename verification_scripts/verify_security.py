
import os
import sys
import django
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from labs.models import LabTechnician, LabTest, LabReport
from patients.models import Patient
import random

User = get_user_model()

def verify_security():
    print("Starting Security Verification...")

    # 1. Setup Data
    tech_user, _ = User.objects.get_or_create(username='sec_tech', defaults={'role': 'LAB_TECH'})
    LabTechnician.objects.get_or_create(user=tech_user, defaults={'license_number': 'LIC-SEC'})
    
    patient_user, _ = User.objects.get_or_create(username='sec_patient', defaults={'role': 'PATIENT'})
    Patient.objects.get_or_create(user=patient_user)
    patient = patient_user.patient_profile
    
    test, _ = LabTest.objects.get_or_create(code='SEC-TEST', defaults={'name': 'Security Test'})

    client = APIClient()
    client.force_authenticate(user=tech_user)

    # 2. Test Invalid Extension
    print("\n--- Testing Invalid File Extension ---")
    file = SimpleUploadedFile("test.txt", b"content", content_type="text/plain")
    data = {
        'patient': patient.id,
        'test_type': test.id,
        'file': file,
        'comments': 'Invalid Extension'
    }
    response = client.post('/api/labs/reports/', data, format='multipart')
    if response.status_code == 400 and 'file' in response.data:
        print("Correctly rejected invalid extension.")
        print(f"Error: {response.data['file'][0]}")
    else:
        print(f"Failed to reject invalid extension. Status: {response.status_code}")
        print(response.data)

    # 3. Test Large File (>5MB)
    print("\n--- Testing Large File ---")
    # Create a dummy large file (6MB)
    large_content = b"x" * (6 * 1024 * 1024)
    file = SimpleUploadedFile("large.pdf", large_content, content_type="application/pdf")
    data['file'] = file
    
    # We anticipate this might be slow or memory intensive, so be careful.
    # Actually, 6MB in memory is fine.
    try:
        response = client.post('/api/labs/reports/', data, format='multipart')
        if response.status_code == 400 and 'file' in response.data:
            print("Correctly rejected large file.")
            print(f"Error: {response.data['file'][0]}")
        else:
             print(f"Failed to reject large file. Status: {response.status_code}")
             print(response.data)
    except Exception as e:
        print(f"Error checking large file: {e}")

    # 4. Test Rate Limiting
    print("\n--- Testing Rate Limiting (Limit: 20/day) ---")
    # We created 0 successful requests so far (both above failed).
    # We need to make 20 successful requests to hit the limit? 
    # Or 20 requests total? Rate limiting usually counts all requests to the endpoint?
    # ScopedRateThrottle documentation: "The throttle will allow X requests per Y duration."
    # It might count 400s too? Let's assume so.
    
    # Reset limit? hard to do in script without cache clearing.
    # We will just loop until we hit 429 or 25 times.
    
    hit_limit = False
    for i in range(25):
        file = SimpleUploadedFile(f"valid_{i}.pdf", b"content", content_type="application/pdf")
        data['file'] = file
        response = client.post('/api/labs/reports/', data, format='multipart')
        
        if response.status_code == 429:
            print(f"Rate limit hit at request #{i+1}")
            print(f"Response: {response.data}")
            hit_limit = True
            break
        elif response.status_code != 201:
            print(f"Request #{i+1} failed with {response.status_code}")
    
    if not hit_limit:
        print("Failed to hit rate limit (or limit is higher than tested).")

if __name__ == "__main__":
    verify_security()
