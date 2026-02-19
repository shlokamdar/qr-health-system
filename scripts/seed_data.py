import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import Doctor, Hospital
from patients.models import Patient

User = get_user_model()

def create_users():
    print("Creating users...")

    # Create Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin1234@1234')
        print("Superuser 'admin' created.")
    else:
        print("Superuser 'admin' already exists.")

    # Create Doctors
    doctors_data = [
        {'username': 'dr_smith', 'first_name': 'John', 'last_name': 'Smith', 'specialization': 'Cardiology', 'license': 'LIC001'},
        {'username': 'dr_jones', 'first_name': 'Sarah', 'last_name': 'Jones', 'specialization': 'Pediatrics', 'license': 'LIC002'},
    ]

    for data in doctors_data:
        if not User.objects.filter(username=data['username']).exists():
            user = User.objects.create_user(
                username=data['username'],
                email=f"{data['username']}@example.com",
                password='1234@1234',
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=User.Role.DOCTOR
            )
            Doctor.objects.create(
                user=user,
                specialization=data['specialization'],
                license_number=data['license'],
                is_verified=True,
                authorization_level=Doctor.AuthorizationLevel.STANDARD
            )
            print(f"Doctor '{data['username']}' created.")
        else:
            print(f"Doctor '{data['username']}' already exists.")

    # Create Patients
    patients_data = [
        {'username': 'john_doe', 'first_name': 'John', 'last_name': 'Doe', 'dob': '1985-05-15', 'blood_group': 'A+'},
        {'username': 'jane_doe', 'first_name': 'Jane', 'last_name': 'Doe', 'dob': '1990-08-20', 'blood_group': 'O-'},
    ]

    for data in patients_data:
        if not User.objects.filter(username=data['username']).exists():
            user = User.objects.create_user(
                username=data['username'],
                email=f"{data['username']}@example.com",
                password='1234@1234',
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=User.Role.PATIENT
            )
            # Patient profile is auto-created by signal on user creation
            # We fetch it and update fields
            try:
                patient = Patient.objects.get(user=user)
                patient.date_of_birth = data['dob']
                patient.blood_group = data['blood_group']
                patient.save()
                print(f"Patient '{data['username']}' created and profile updated.")
            except Patient.DoesNotExist:
                print(f"Error: Patient profile for '{data['username']}' was not auto-created.")
        else:
            print(f"Patient '{data['username']}' already exists.")

if __name__ == '__main__':
    create_users()
