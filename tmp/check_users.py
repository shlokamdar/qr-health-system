import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from patients.models import Patient

patients = Patient.objects.all()
print(f"Found {patients.count()} patients:")
for p in patients:
    print(f"Username: {p.user.username}, Role: {p.user.role}, HealthID: {p.health_id}")

if not patients.exists():
    print("No patients found. Creating a test patient...")
    user, created = User.objects.get_or_create(
        username='testpatient',
        email='testpatient@example.com',
        defaults={'role': 'PATIENT'}
    )
    if created:
        user.set_password('password123')
        user.save()
    
    patient, p_created = Patient.objects.get_or_create(
        user=user,
        defaults={'health_id': 'HID-TEST1234'}
    )
    print(f"Created/Found test patient: {user.username} / password123")
