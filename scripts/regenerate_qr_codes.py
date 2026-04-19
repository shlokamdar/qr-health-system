import os
import sys
import django
from django.conf import settings

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from patients.models import Patient
import qrcode
from io import BytesIO
from django.core.files import File

def regenerate_qr_codes():
    patients = Patient.objects.all()
    print(f"Starting QR code regeneration for {patients.count()} patients...")
    
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pulseid.online')
    print(f"Using FRONTEND_URL: {frontend_url}")

    for patient in patients:
        print(f"Regenerating QR for {patient.health_id}...", end=" ")
        
        # Generate new QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr_data = f"{frontend_url}/patients/{patient.health_id}"
        qr.add_data(qr_data)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        
        # Delete old QR code if it exists
        if patient.qr_code:
            patient.qr_code.delete(save=False)
            
        file_name = f"qr_{patient.health_id}.png"
        patient.qr_code.save(file_name, File(buffer), save=True)
        print("Done.")

if __name__ == "__main__":
    regenerate_qr_codes()
