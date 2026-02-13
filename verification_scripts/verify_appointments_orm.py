import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from doctors.models import Doctor, Appointment, Hospital
from patients.models import Patient
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

def run():
    print("--- Starting Appointment Verification (ORM + APIClient) ---")

    # 1. Create Verified Doctor
    doc_user, created = User.objects.get_or_create(username='verify_doc', defaults={
        'email': 'doc@example.com',
        'first_name': 'Verify',
        'last_name': 'Doctor',
        'role': 'DOCTOR'
    })
    if created:
        doc_user.set_password('pass123')
        doc_user.save()
        Doctor.objects.create(
            user=doc_user,
            license_number='VERIFY-LIC-001',
            specialization='Cardiology',
            is_verified=True  # Important!
        )
        print("Created Verified Doctor: verify_doc")
    else:
        print("Using existing Verified Doctor: verify_doc")
        if not hasattr(doc_user, 'doctor_profile'):
             Doctor.objects.create(user=doc_user, license_number='VERIFY-LIC-001', specialization='Cardiology', is_verified=True)

    # 2. Create Patient
    pat_user, created = User.objects.get_or_create(username='verify_pat', defaults={
        'email': 'pat@example.com',
        'first_name': 'Verify',
        'last_name': 'Patient',
        'role': 'PATIENT'
    })
    if created:
        pat_user.set_password('pass123')
        pat_user.save()
        Patient.objects.create(
            user=pat_user,
            date_of_birth='1990-01-01',
            contact_number='1234567890'
        )
        print("Created Patient: verify_pat")
    else:
        print("Using existing Patient: verify_pat")
        if not hasattr(pat_user, 'patient_profile'):
            Patient.objects.create(user=pat_user, date_of_birth='1990-01-01', contact_number='1234567890')

    # 3. Patient Books Appointment
    client = APIClient()
    client.force_authenticate(user=pat_user)
    
    print("\n[Patient] Booking Appointment...")
    response = client.post('/api/doctors/appointments/', {
        'doctor': doc_user.doctor_profile.id,
        'appointment_date': '2025-12-31T10:00:00Z',
        'reason': 'Checkup verification'
    })
    
    if response.status_code == 201:
        apt_id = response.data['id']
        print(f"SUCCESS: Appointment Booked (ID: {apt_id})")
    else:
        print(f"FAILED to book: {response.data}")
        return

    # 4. Doctor Accepts Appointment
    client.force_authenticate(user=doc_user)
    print("\n[Doctor] Accepting Appointment...")
    response = client.patch(f'/api/doctors/appointments/{apt_id}/', {
        'status': 'CONFIRMED'
    })
    
    if response.status_code == 200 and response.data['status'] == 'CONFIRMED':
        print("SUCCESS: Appointment Confirmed")
    else:
        print(f"FAILED to confirm: {response.data}")
        return

    # 5. Verify Database State
    apt = Appointment.objects.get(id=apt_id)
    print(f"\n[DB Verification] Appointment Status: {apt.status}")
    
    if apt.status == 'CONFIRMED':
        print("--- VERIFICATION PASSED ---")
    else:
        print("--- VERIFICATION FAILED ---")

run()
