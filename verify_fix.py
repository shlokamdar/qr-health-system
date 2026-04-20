import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from patients.models import Patient
from patients.serializers import PatientPublicSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def verify_serializer():
    # Get or create a patient
    user, _ = User.objects.get_or_create(username='testverify', defaults={'role': 'PATIENT'})
    patient, _ = Patient.objects.get_or_create(user=user, defaults={'date_of_birth': '2000-01-01'})
    
    serializer = PatientPublicSerializer(patient)
    data = serializer.data
    
    print(f"Serialized Data: {json.dumps(data, indent=2)}")
    
    if 'id' in data:
        print("SUCCESS: 'id' field is present in PatientPublicSerializer.")
    else:
        print("FAILURE: 'id' field is missing in PatientPublicSerializer.")

if __name__ == "__main__":
    verify_serializer()
