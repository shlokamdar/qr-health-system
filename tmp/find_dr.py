import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from doctors.models import Doctor
from patients.models import Patient

print("--- DOCTORS ---")
for dr in Doctor.objects.all():
    print(f"ID: {dr.id} | User: {dr.user.username} | Name: {dr.user.first_name} {dr.user.last_name}")

print("\n--- PATIENT ---")
p = Patient.objects.filter(health_id='HID-4A2487BA').first()
if p:
    print(f"ID: {p.id} | User: {p.user.username} | Health ID: {p.health_id}")
else:
    print("Patient HID-4A2487BA not found")
