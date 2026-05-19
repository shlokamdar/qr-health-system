import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from doctors.models import Doctor

User = get_user_model()
c = Client()

# We need a doctor to authenticate
doctor_user = User.objects.filter(role='DOCTOR').first()
if doctor_user:
    c.force_login(doctor_user)
    print("Logged in as", doctor_user.username)
    
    # Try PatientHistoryView
    response = c.get('/api/doctors/patient-history/HID-4A0C6D53/')
    print("PatientHistoryView Status:", response.status_code)
    if response.status_code != 200:
        print(response.content)

    # Try records
    response = c.get('/api/records/?patient=HID-4A0C6D53')
    print("Records Status:", response.status_code)
    if response.status_code != 200:
        print(response.content)
else:
    print("No doctor found")
