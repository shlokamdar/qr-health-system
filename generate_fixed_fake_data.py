import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from doctors.models import Doctor, Hospital
from labs.models import DiagnosticLab, LabTechnician, LabTest
from patients.models import Patient

def create_fake_data():
    password = 'demoPassword123!'
    
    # Ensure Lab Tests exist! This fixes the 'test_type: Invalid pk "1"' upload error
    tests_data = [
        (1, 'Complete Blood Count (CBC)', 'CBC'),
        (2, 'Lipid Profile', 'LIPID'),
        (3, 'Thyroid Function Test', 'TFT'),
        (4, 'Urinalysis', 'URINE'),
        (5, 'COVID-19 RT-PCR', 'RTPCR')
    ]
    for tid, name, code in tests_data:
        LabTest.objects.get_or_create(
            id=tid, 
            defaults={'name': name, 'code': code}
        )
    print("Lab tests verified and initialized.")
    
    # Create Hospital
    hospital, _ = Hospital.objects.get_or_create(
        name="Global Health Hospital",
        defaults={
            'registration_number': 'REG-123456',
            'address': '101 Health Ave, Metropolis',
            'phone': '555-0101',
            'email': 'contact@globalhealth.com',
            'is_verified': True
        }
    )

    # Create Doctor
    doc_user, created = User.objects.get_or_create(
        username='demodoctor',
        defaults={
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'doctor@globalhealth.com',
            'role': User.Role.DOCTOR
        }
    )
    if created:
        doc_user.set_password(password)
        doc_user.save()
        
    Doctor.objects.get_or_create(
        user=doc_user,
        defaults={
            'license_number': 'LIC-123456',
            'hospital': hospital,
            'specialization': 'Cardiologist',
            'is_verified': True
        }
    )

    # Create Lab
    lab, _ = DiagnosticLab.objects.get_or_create(
        name="Precision Bio Lab",
        defaults={
            'accreditation_number': 'ACCRED-123456',
            'address': '202 Science Blvd, Metropolis',
            'phone': '555-0202',
            'email': 'contact@precisionbio.com',
            'is_verified': True,
            'hospital': hospital
        }
    )

    # Create Lab Technician
    lab_user, created = User.objects.get_or_create(
        username='demolabtech',
        defaults={
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'tech@precisionbio.com',
            'role': User.Role.LAB_TECH
        }
    )
    if created:
        lab_user.set_password(password)
        lab_user.save()

    LabTechnician.objects.get_or_create(
        user=lab_user,
        defaults={
            'lab': lab,
            'license_number': 'TECH-123456',
            'is_verified': True
        }
    )

    # Create Patient
    pat_user, created = User.objects.get_or_create(
        username='demopatient',
        defaults={
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'email': 'patient@example.com',
            'role': User.Role.PATIENT
        }
    )
    if created:
        pat_user.set_password(password)
        pat_user.save()

    Patient.objects.get_or_create(
        user=pat_user,
        defaults={
            'date_of_birth': '1990-05-15',
            'contact_number': '555-0303',
            'address': '789 Patient Way, Metropolis',
            'blood_group': 'O+',
            'gender': 'Female',
            'allergies': 'Penicillin',
            'chronic_conditions': 'None'
        }
    )

    print("Data successfully generated!")
    print("--- LOGIN CREDENTIALS ---")
    print(f"Doctor Login: demodoctor / {password}")
    print(f"Lab Tech Login: demolabtech / {password}")
    print(f"Patient Login: demopatient / {password}")

if __name__ == '__main__':
    create_fake_data()
