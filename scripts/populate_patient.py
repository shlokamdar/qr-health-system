import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from patients.models import Patient, OTPRequest, SharingPermission
from doctors.models import Doctor, Hospital, Consultation, Appointment
from records.models import MedicalRecord

User = get_user_model()

def populate_dashboard():
    # 1. Get the target patient
    try:
        patient = Patient.objects.get(health_id="HID-767DDA23")
        print(f"Found patient: {patient.user.get_full_name() or patient.user.username} ({patient.health_id})")
    except Patient.DoesNotExist:
        print("Patient with HID-767DDA23 does not exist.")
        # Alternatively, let's just get the patient whose name is Shloka Kamdar
        patients = Patient.objects.filter(user__first_name='Shloka', user__last_name='Kamdar')
        if patients.exists():
            patient = patients.first()
            print(f"Fallback: found patient by name: {patient.health_id}")
        else:
            print("Could not find any user named Shloka Kamdar.")
            return

    # 2. Ensure we have a Doctor
    doctor_user, created = User.objects.get_or_create(username='dr_smith', email='dr_smith@example.com')
    if created:
        doctor_user.set_password('securepass123')
        doctor_user.first_name = 'John'
        doctor_user.last_name = 'Smith'
        doctor_user.save()
        print("Created new doctor user.")
    else:
        print("Doctor user already exists.")
        
    hospital, _ = Hospital.objects.get_or_create(name="City General Hospital", registration_number="REG12345", is_verified=True)
    doctor, _ = Doctor.objects.get_or_create(
        user=doctor_user,
        defaults={
            'license_number': f"DOC-{random.randint(1000, 9999)}",
            'specialization': "General Medicine",
            'is_verified': True,
            'hospital': hospital
        }
    )

    # 3. Add Consultations (Total Visits)
    for i in range(2):
        Consultation.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            consultation_date=timezone.now() - timedelta(days=i*10 + 2),
            defaults={
                'chief_complaint': f'Fever and headache (Visit {i+1})',
                'diagnosis': 'Viral Fever',
                'notes': 'Rest well and stay hydrated.'
            }
        )
    print("Added 2 Consultations (Visits).")

    # 4. Add Appointments
    Appointment.objects.get_or_create(
        patient=patient,
        doctor=doctor,
        appointment_date=timezone.now() + timedelta(days=3),
        defaults={
            'reason': 'Follow-up checkup',
            'status': Appointment.Status.CONFIRMED
        }
    )
    print("Added an upcoming Appointment.")

    # 5. Add Active Doctors (Sharing Permission)
    SharingPermission.objects.get_or_create(
        patient=patient,
        doctor=doctor,
        access_type=SharingPermission.AccessType.OTP_FULL,
        defaults={
            'is_active': True,
            'can_view_records': True,
            'can_view_documents': True,
            'can_add_records': True
        }
    )
    print("Added 1 Active Doctor access.")

    # 6. Add Pending Requests (OTP Request)
    # create a second doctor for variety
    doc_user2, _ = User.objects.get_or_create(username='dr_jane', email='dr_jane@example.com')
    doc_user2.first_name = "Jane"
    doc_user2.last_name = "Doe"
    doc_user2.save()
    doctor2, _ = Doctor.objects.get_or_create(
        user=doc_user2,
        defaults={'license_number': f"DOC-{random.randint(1000, 9999)}", 'is_verified': True, 'specialization': 'Cardiology'}
    )
    OTPRequest.objects.get_or_create(
        doctor=doctor2,
        patient=patient,
        otp_code='123456',
        defaults={
            'is_verified': False,
            'is_revoked': False
        }
    )
    print("Added 1 Pending Request.")

    # 7. Add Recent Medical Records
    MedicalRecord.objects.get_or_create(
        patient=patient,
        doctor=doctor_user,
        record_type=MedicalRecord.RecordType.PRESCRIPTION,
        title="Fever Prescription",
        defaults={
            'description': 'Paracetamol 500mg twice a day.',
        }
    )
    MedicalRecord.objects.get_or_create(
        patient=patient,
        doctor=doctor_user,
        record_type=MedicalRecord.RecordType.LAB_REPORT,
        title="Complete Blood Count",
        defaults={
            'description': 'All levels normal.',
        }
    )
    print("Added 2 Medical Records.")

    patient.save() # touch patient
    print("Done. Dashboard fields should now be populated.")

if __name__ == '__main__':
    populate_dashboard()
