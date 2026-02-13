import os
import django
import sys
from django.core.files.uploadedfile import SimpleUploadedFile

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import Patient
from labs.models import LabTechnician, LabReport, LabTest
from rest_framework.test import APIRequestFactory

User = get_user_model()

def verify_lab_flow():
    print("--- Verifying Lab Workflow ---")

    # 1. Setup Data
    print("\n[SETUP] Creating Test Data...")
    patient_user, _ = User.objects.get_or_create(username='lab_patient', email='patient@lab.com', role='PATIENT')
    patient, _ = Patient.objects.get_or_create(user=patient_user)
    print(f"Patient: {patient.health_id}")

    lab_user, _ = User.objects.get_or_create(username='lab_tech_test', email='tech@lab.com', role='LAB_TECH')
    if not hasattr(lab_user, 'lab_profile'):
        LabTechnician.objects.create(
            user=lab_user, 
            license_number='LAB-12345',
            is_verified=True # Auto-verify for test
        )
    else:
        lab_tech = lab_user.lab_profile
        lab_tech.is_verified = True
        lab_tech.save()
    print(f"Lab Tech: {lab_user.username} (Verified)")

    test_type, _ = LabTest.objects.get_or_create(
        code='CBC',
        defaults={'name': 'Complete Blood Count', 'normal_range': 'N/A'}
    )
    print(f"Lab Test: {test_type.name}")

    # 2. Simulate Upload via Model (Backend logic check)
    print("\n[ACTION] Lab Tech uploading report...")
    
    # Create dummy file
    dummy_file = SimpleUploadedFile("report.pdf", b"file_content", content_type="application/pdf")

    report = LabReport.objects.create(
        patient=patient,
        technician=lab_user.lab_profile,
        test_type=test_type,
        file=dummy_file,
        comments="Everything looks normal.",
        result_data={"wbc": 5.5, "rbc": 4.8}
    )
    
    print(f"Report Created. ID: {report.id}")

    # 3. Verify Patient Can See It (API Level)
    print("\n[VERIFY] Checking Patient API Access...")
    factory = APIRequestFactory()
    request = factory.get('/api/labs/reports/')
    request.user = patient_user
    
    from labs.views import LabReportViewSet
    from rest_framework.test import force_authenticate
    
    view = LabReportViewSet.as_view({'get': 'list'})
    force_authenticate(request, user=patient_user)
    response = view(request)
    
    if response.status_code == 200:
        print(f"API Success (200). Count: {len(response.data)}")
        if len(response.data) > 0:
            rep = response.data[0]
            print(f"API Data: Tech={rep.get('technician_name')}, Hospital={rep.get('hospital_name')}")
    else:
        print(f"API Failed: {response.status_code}")

    print("\n--- Verification Complete ---")

if __name__ == '__main__':
    verify_lab_flow()
