import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import Doctor, Hospital
from patients.models import Patient
from datetime import date

User = get_user_model()

def create_demo_data():
    # 1. Create/Get Hospital
    hospital, _ = Hospital.objects.get_or_create(
        name="City General Hospital",
        defaults={
            'address': "123 Main St",
            'is_verified': True
        }
    )
    print(f"Hospital: {hospital.name}")

    # 2. Create Demo Doctor
    doc_username = 'demo_doctor'
    doc_password = 'password123'
    doc_email = 'doctor@example.com'
    
    doctor_user, created = User.objects.get_or_create(
        username=doc_username,
        defaults={
            'email': doc_email,
            'first_name': 'Gregory',
            'last_name': 'House',
            'role': 'DOCTOR'
        }
    )
    if created:
        doctor_user.set_password(doc_password)
        doctor_user.save()
        Doctor.objects.create(
            user=doctor_user,
            hospital=hospital,
            license_number="MD-12345",
            specialization="Diagnostician",
            authorization_level='FULL',
            is_verified=True
        )
        print(f"Created Doctor: {doc_username} / {doc_password}")
    else:
        print(f"Doctor exits: {doc_username} (Password: {doc_password} if not changed)")

    # 3. Create Demo Patient
    pat_username = 'demo_patient'
    pat_password = 'password123'
    pat_email = 'patient@example.com'

    patient_user, created = User.objects.get_or_create(
        username=pat_username,
        defaults={
            'email': pat_email,
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'PATIENT'
        }
    )
    if created:
        patient_user.set_password(pat_password)
        patient_user.save()
        Patient.objects.create(
            user=patient_user,
            date_of_birth=date(1990, 1, 1),
            blood_group='O+',
            contact_number="555-0200",
            address="456 Elm St"
        )
        print(f"Created Patient: {pat_username} / {pat_password}")
    else:
        print(f"Patient exists: {pat_username} (Password: {pat_password} if not changed)")

    # 4. Create Admin
    admin_username = 'admin'
    admin_password = 'password123'
    admin_user, created = User.objects.get_or_create(
        username=admin_username,
        defaults={
            'email': 'admin@example.com',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"Created Admin: {admin_username} / {admin_password}")
    else:
        # Ensure role is ADMIN
        if admin_user.role != 'ADMIN':
            admin_user.role = 'ADMIN'
            admin_user.save()
        print(f"Admin exists: {admin_username} (Password: {admin_password} if not changed)")

if __name__ == '__main__':
    create_demo_data()
