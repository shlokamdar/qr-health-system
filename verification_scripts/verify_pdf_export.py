import os
import django
import sys
from django.test import RequestFactory

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import Patient
from patients.views import PatientViewSet

User = get_user_model()

def verify_pdf_export():
    print("--- Verifying PDF Export ---")

    # 1. Setup User
    print("\n[SETUP] Getting Patient...")
    patient_user, _ = User.objects.get_or_create(username='demo_patient', role='PATIENT')
    patient = Patient.objects.get(user=patient_user)
    print(f"Patient: {patient.health_id}")

    # 2. Simulate Request
    print("\n[ACTION] Requesting PDF...")
    factory = RequestFactory()
    request = factory.get('/api/patients/me/download_pdf/')
    request.user = patient_user

    view = PatientViewSet.as_view({'get': 'download_pdf'})
    response = view(request)

    # 3. Verify Response
    print(f"Status Code: {response.status_code}")
    print(f"Content Type: {response['Content-Type']}")
    
    if response.status_code == 200 and response['Content-Type'] == 'application/pdf':
        print("SUCCESS: PDF generated successfully.")
        
        # Optional: Save to file to inspect manually
        filename = f"verify_export_{patient.health_id}.pdf"
        with open(filename, 'wb') as f:
            f.write(response.getvalue())
        print(f"Saved to {filename} for manual inspection.")
            
    else:
        print("FAILURE: PDF generation failed.")

    print("\n--- Verification Complete ---")

if __name__ == '__main__':
    verify_pdf_export()
