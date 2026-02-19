
import os
import sys
import django
import random
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# OVERRIDE EMAIL BACKEND TO PREVENT SPAM
from django.conf import settings
settings.EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'

from django.contrib.auth import get_user_model
from doctors.models import Doctor, Consultation
from patients.models import Patient
from rest_framework.test import APIClient

User = get_user_model()

def verify_prescription_structure():
    print("Starting Prescription Structure Verification...")

    # 1. Create Data
    # Doctor
    doc_user, created = User.objects.get_or_create(
        username='test_doc_presc',
        defaults={
            'email': 'doc@test.com',
            'first_name': 'Test',
            'last_name': 'Doc',
            'role': 'DOCTOR'
        }
    )
    if created:
        doc_user.set_password('password123')
        doc_user.save()
        Doctor.objects.create(
            user=doc_user,
            license_number=f"DOC-{random.randint(1000,9999)}",
            is_verified=True
        )
    print(f"Doctor: {doc_user.username}")
    
    # Patient
    patient_user, created = User.objects.get_or_create(
        username='test_patient_presc',
        defaults={
            'email': 'patient@test.com',
            'role': 'PATIENT'
        }
    )
    if created:
        patient_user.set_password('password123')
        patient_user.save()
        Patient.objects.get_or_create(user=patient_user)
    
    patient = patient_user.patient_profile
    print(f"Patient: {patient.health_id}")

    # 2. Test API client
    client = APIClient()
    client.force_authenticate(user=doc_user)

    # 3. Create Consultation with Medicines
    print("Creating Consultation with medicines...")
    medicines_data = [
        {'name': 'Paracetamol', 'dosage': '500mg', 'frequency': 'Daily'},
        {'name': 'Amoxicillin', 'dosage': '250mg', 'frequency': 'Twice Daily'}
    ]
    
    data = {
        'patient_health_id': patient.health_id,
        'consultation_date': datetime.now(),
        'chief_complaint': 'Fever',
        'medicines': medicines_data,
        'notes': 'Rest well'
    }
    
    response = client.post('/api/doctors/consultations/', data, format='json')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {response.data}")
    
    if response.status_code == 201:
        print("Consultation created successfully")
        cons_id = response.data.get('id')
    else:
        print(f"Consultation creation failed")
        return

    # 4. Verify Medicines in DB
    print("Verifying medicines in database...")
    consultation = Consultation.objects.get(id=cons_id)
    if consultation.medicines == medicines_data:
        print("Medicines JSON stored correctly")
    else:
        print(f"Medicines JSON mismatch: {consultation.medicines}")

    print("\nVerification Complete!")

if __name__ == "__main__":
    verify_prescription_structure()
