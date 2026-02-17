
import os
import sys
import django
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from labs.models import LabTechnician, LabTest, LabReport
from patients.models import Patient
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


def verify_lab_flow():
    print("Starting Lab Flow Verification...")

    # 1. Create Data
    # Lab Tech
    tech_user, created = User.objects.get_or_create(
        username='test_tech',
        defaults={
            'email': 'tech@test.com',
            'first_name': 'Test',
            'last_name': 'Tech',
            'role': 'LAB_TECH'
        }
    )
    if created:
        tech_user.set_password('password123')
        tech_user.save()
        LabTechnician.objects.create(
            user=tech_user,
            license_number=f"LIC-{random.randint(1000,9999)}"
        )
    print(f"Lab Tech User: {tech_user.username}")

    # Patient
    patient_user, created = User.objects.get_or_create(
        username='test_patient_lab',
        defaults={
            'email': 'patient@test.com',
            'role': 'PATIENT'
        }
    )
    if created:
        patient_user.set_password('password123')
        patient_user.save()
        Patient.objects.create(user=patient_user)
    
    patient = patient_user.patient_profile
    print(f"Patient: {patient.health_id}")

    # Lab Test
    test, _ = LabTest.objects.get_or_create(
        code='CBC',
        defaults={'name': 'Complete Blood Count'}
    )

    # 2. Test API client
    client = APIClient()
    client.force_authenticate(user=tech_user)

    # 2a. Search Patient
    print(f"Searching for patient {patient.health_id}...")
    response = client.get(f'/api/patients/{patient.health_id}/')
    
    if response.status_code == 200:
        print("Patient search successful")
    else:
        print(f"Patient search failed: {response.status_code} - {response.data}")
        return

    # 2b. Upload Report
    print("Uploading Report...")
    file = SimpleUploadedFile("report.pdf", b"dummy pdf content", content_type="application/pdf")
    
    data = {
        'patient': patient.id,
        'test_type': test.id,
        'file': file,
        'comments': 'Test upload from script'
    }
    
    response = client.post('/api/labs/reports/', data, format='multipart')
    
    if response.status_code == 201:
        print("Report upload successful")
        report_id = response.data['id']
    else:
        print(f"Report upload failed: {response.status_code} - {response.data}")
        return

    # 2c. Verify Report
    print("Verifying report existence...")
    if LabReport.objects.filter(id=report_id).exists():
        print("Report found in database")
    else:
        print("Report not found in database")

    print("\nVerification Complete!")


if __name__ == "__main__":
    verify_lab_flow()
