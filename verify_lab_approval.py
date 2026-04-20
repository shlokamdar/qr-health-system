import os
import django
import sys

# Add current directory to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from labs.models import DiagnosticLab, LabTechnician
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

print("Testing Lab Approval with fixes...")
# Create a test lab
lab, created = DiagnosticLab.objects.get_or_create(
    accreditation_number="LAB_TEST_FIX",
    defaults={
        "name": "Test Lab Fix",
        "address": "456 Test St",
        "phone": "0987654321",
        "email": "test@lab.com"
    }
)
print(f"Lab: {lab.name}, Created: {created}")

# Create tech admin
user, u_created = User.objects.get_or_create(
    username="test_tech_fix",
    defaults={"email": "tech@test.com", "role": "LAB_TECH"}
)
if u_created:
    user.set_password("password123")
    user.save()

tech_prof, a_created = LabTechnician.objects.get_or_create(
    user=user,
    lab=lab
)
tech_prof.is_verified = False
tech_prof.save()
print(f"Tech: {user.username}, Created: {a_created}, Verified: {tech_prof.is_verified}")

# Run the logic from LabVerificationView.patch
try:
    verify = True
    lab.is_verified = verify
    lab.rejection_reason = ""
    lab.save()
    print("Lab saved successfully.")

    if verify:
        # Use exact names from the view logic to test imports
        from labs.models import LabTechnician
        admin_techs = LabTechnician.objects.filter(lab=lab)
        admin_tech = admin_techs.first()
        
        # Verify all technicians
        admin_techs.update(is_verified=True)
        print("Tech profiles updated to True.")

        if admin_tech:
            # Reload from DB
            tech_prof.refresh_from_db()
            print(f"Tech {tech_prof.user.username} is now verified: {tech_prof.is_verified}")
            
            # Test strings that failed before due to NameError
            print(f"LAB APPROVED: {lab.name}")
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            print(f"Login at: {frontend_url}/login")
    
    print("Lab Approval verification successful!")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
