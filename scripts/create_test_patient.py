import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from patients.models import Patient

username = 'testpatient'
password = 'password123'

user, created = User.objects.get_or_create(username=username, defaults={
    'first_name': 'Test',
    'last_name': 'Patient',
    'email': 'test@example.com',
    'role': User.Role.PATIENT
})

if created:
    user.set_password(password)
    user.save()
    Patient.objects.create(
        user=user,
        health_id='HID-TEST1234',
        contact_number='1234567890',
        blood_group='O+',
        gender='Male',
        date_of_birth='1990-01-01'
    )
    print(f"Test patient created: {username} / {password}")
else:
    print(f"Test patient already exists: {username}")
