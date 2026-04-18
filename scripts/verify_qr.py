import os
import sys
import django
import cv2
from PIL import Image
import numpy as np

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.getcwd())
django.setup()

from patients.models import Patient
from django.conf import settings

def verify_qr_codes():
    print(f"FRONTEND_URL in settings: {settings.FRONTEND_URL}")
    
    patient = Patient.objects.first()
    if not patient:
        print("No patients found.")
        return

    if not patient.qr_code:
        print(f"No QR code for patient {patient.health_id}")
        return

    # Path to the QR code image
    qr_path = patient.qr_code.path
    print(f"Verifying QR code for {patient.health_id} at {qr_path}")

    # Read QR code
    img = cv2.imread(qr_path)
    detector = cv2.QRCodeDetector()
    data, bbox, straight_qrcode = detector.detectAndDecode(img)

    if data:
        print(f"Decoded QR data: {data}")
        expected_url = f"https://pusleid.online/patients/{patient.health_id}"
        if data == expected_url:
            print("SUCCESS: QR data matches expected URL.")
        else:
            print(f"FAILURE: QR data {data} does not match expected {expected_url}")
    else:
        print("FAILURE: Could not decode QR code.")

if __name__ == "__main__":
    verify_qr_codes()
