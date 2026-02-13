import os
import django
import sys

# Add project root to path (parent directory)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import Patient
from doctors.models import Doctor, Hospital
from utils.notifications import send_access_granted_email, send_record_uploaded_email

User = get_user_model()

def verify_notifications():
    print("--- Verifying Notification System ---")
    
    # 1. Setup Test Data
    try:
        patient_user, _ = User.objects.get_or_create(username='test_notif_patient', email='patient@example.com', role='PATIENT')
        patient, _ = Patient.objects.get_or_create(user=patient_user)
        
        doctor_user, _ = User.objects.get_or_create(username='test_notif_doctor', email='doctor@example.com', role='DOCTOR')
        
        # Use registration_number for lookup to avoid unique constraint errors
        hospital, _ = Hospital.objects.get_or_create(
            registration_number='REG-TEST-001',
            defaults={
                'name': "Test Hospital", 
                'email': 'hospital@test.com', 
                'is_verified': True,
                'address': '123 Test St',
                'phone': '1234567890'
            }
        )
        
        # Use license_number for lookup
        doctor, _ = Doctor.objects.get_or_create(
            license_number='LIC-TEST-001',
            defaults={
                'user': doctor_user,
                'hospital': hospital, 
                'is_verified': True,
                'specialization': 'General'
            }
        )
        # Ensure user is linked if doctor existed but user didn't match (though unlikely with this script structure)
        if doctor.user != doctor_user:
            doctor.user = doctor_user
            doctor.save()
        
        print(f"Patient: {patient_user.email}")
        print(f"Doctor: {doctor_user.email}")
        
    except Exception as e:
        print(f"Setup failed: {e}")
        return

    # 2. Test Access Granted Email
    print("\n[TEST] Sending Access Granted Email...")
    send_access_granted_email(patient, doctor, "QR_QUICK")
    print("Check console for 'Access Granted' email content.")

    # 3. Test Record Uploaded Email
    print("\n[TEST] Sending Record Uploaded Email...")
    send_record_uploaded_email(patient, "Consultation Note", "Dr. Test Doctor")
    print("Check console for 'New Health Record' email content.")
    
    print("\n--- Verification Complete ---")

if __name__ == '__main__':
    verify_notifications()
