
import os
import sys
import django
from django.conf import settings

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Ensure EMAIL_BACKEND is dummy for testing, but we want to capture it?
# Actually, the settings are already loaded. 
# If settings.EMAIL_BACKEND is 'django.core.mail.backends.console.EmailBackend', it prints to stdout.
# We can capture stdout to verify.

from django.contrib.auth import get_user_model
from doctors.models import Doctor, Consultation
from patients.models import Patient
from labs.models import LabTechnician, LabTest, LabReport
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import datetime

User = get_user_model()

def verify_notifications():
    print("Starting Notification Verification...")

    # 1. Setup Users
    # Patient with Email
    patient_user, _ = User.objects.get_or_create(
        username='notify_patient',
        defaults={'email': 'patient@example.com', 'role': 'PATIENT'}
    )
    Patient.objects.get_or_create(user=patient_user)
    patient = patient_user.patient_profile
    
    # Doctor
    doc_user, _ = User.objects.get_or_create(
        username='notify_doctor',
        defaults={'email': 'doctor@example.com', 'role': 'DOCTOR'}
    )
    Doctor.objects.get_or_create(user=doc_user, defaults={'license_number': 'LIC-NOTIFY'})
    doctor = doc_user.doctor_profile

    # Lab Tech
    tech_user, _ = User.objects.get_or_create(
        username='notify_tech',
        defaults={'email': 'tech@example.com', 'role': 'LAB_TECH'}
    )
    LabTechnician.objects.get_or_create(user=tech_user, defaults={'license_number': 'LIC-LAB-NOTIFY'})
    tech = tech_user.lab_profile
    
    # Lab Test
    test, _ = LabTest.objects.get_or_create(code='NOTIFY-TEST', defaults={'name': 'Notification Test'})

    print("--- Testing Lab Report Notification ---")
    # 2. Create Lab Report -> Should trigger signal
    LabReport.objects.create(
        patient=patient,
        technician=tech,
        test_type=test,
        file=SimpleUploadedFile("report.pdf", b"content"),
        comments="Notification Test"
    )
    print("Lab Report Created. Check console for email.")

    print("\n--- Testing Consultation Notification ---")
    # 3. Create Consultation -> Should trigger signal
    Consultation.objects.create(
        doctor=doctor,
        patient=patient,
        consultation_date=datetime.now(),
        chief_complaint="Notification Check",
        notes="Check email"
    )
    print("Consultation Created. Check console for email.")

if __name__ == "__main__":
    verify_notifications()
