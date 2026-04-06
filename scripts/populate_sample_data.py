import os
import sys
import django
import datetime
from django.utils import timezone
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model

# Add the project root to the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Override email backend for script execution
from django.conf import settings
settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

from django.db import models
from accounts.models import User, Notification
from patients.models import Patient, EmergencyContact, PatientDocument, OldPrescription, SharingPermission
from doctors.models import Hospital, Department, HospitalAdmin, Doctor, Consultation, Appointment
from labs.models import DiagnosticLab, LabTechnician, LabTest, LabReport
from records.models import MedicalRecord
from support.models import SupportTicket
from audit.models import AccessLog

User = get_user_model()

def create_dummy_file(name, content="Sample content for demo purposes."):
    return ContentFile(content.encode('utf-8'), name=name)

def populate():
    print("--- Starting Database Population ---")

    # 0. Cleanup existing sample data to avoid Unique constraints
    sample_usernames = ['superadmin', 'city_admin', 'dr_sam_johnson', 'dr_sarah_smith', 'patient_rahul', 'patient_priya', 'patient_sneha', 'lab_tech_ravi']
    sample_emails = ['admin@pulseid.com', 'admin@citygeneral.com', 'sam@hospital.com', 'sarah@clinic.com', 'rahul@gmail.com', 'priya@outlook.com', 'sneha@gmail.com', 'ravi@apexlab.com']
    
    User.objects.filter(models.Q(username__in=sample_usernames) | models.Q(email__in=sample_emails)).delete()
    print("Cleaned up existing sample users and emails.")

    # 1. Create Superuser (Update if exists)
    import uuid
    uid = uuid.uuid4().hex[:4]
    
    admin, created = User.objects.get_or_create(username='superadmin')
    admin.set_password('password123')
    admin.email = f'admin_{uid}@pulseid.com'
    admin.is_staff = True
    admin.is_superuser = True
    admin.role = User.Role.ADMIN
    admin.first_name = "Super"
    admin.last_name = "Admin"
    admin.save()
    print(f"{'Created' if created else 'Updated'} Superuser: superadmin / password123")

    # 2. Create Hospitals & Departments
    h1, _ = Hospital.objects.get_or_create(
        registration_number="HOSP-001",
        defaults={
            'name': "City General Hospital",
            'address': "123 Healthcare Ave, Central City",
            'phone': "011-2345678",
            'email': f"info_{uid}@citygeneral.com",
            'is_verified': True
        }
    )
    
    h2, _ = Hospital.objects.get_or_create(
        registration_number="HOSP-002",
        defaults={
            'name': "Grace Memorial Clinic",
            'address': "45 Wellness Road, North Hills",
            'phone': "011-9876543",
            'email': f"contact_{uid}@gracememorial.org",
            'is_verified': True
        }
    )

    dept_cardio, _ = Department.objects.get_or_create(hospital=h1, name="Cardiology")
    dept_gen, _ = Department.objects.get_or_create(hospital=h1, name="General Medicine")
    dept_pedia, _ = Department.objects.get_or_create(hospital=h2, name="Pediatrics")

    # 3. Create Hospital Admin
    ha_user, created = User.objects.get_or_create(username='city_admin', defaults={'role': User.Role.HOSPITAL_ADMIN})
    ha_user.set_password('password123')
    ha_user.email = f'admin_{uid}@citygeneral.com'
    ha_user.first_name = "City"
    ha_user.last_name = "Admin"
    ha_user.save()
    HospitalAdmin.objects.get_or_create(user=ha_user, defaults={'hospital': h1, 'is_verified': True})
    print(f"{'Created' if created else 'Updated'} Hospital Admin: city_admin / password123")

    # 4. Create Labs & Tests
    lab1, _ = DiagnosticLab.objects.get_or_create(
        accreditation_number="LAB-AX77",
        defaults={
            'name': "Apex Diagnostics",
            'address': "12 Lab Lane, Industry Zone",
            'phone': "011-5550123",
            'email': f"results_{uid}@apexlab.com",
            'is_verified': True
        }
    )

    t1, _ = LabTest.objects.get_or_create(code="CBC", defaults={'name': "Complete Blood Count", 'normal_range': "WBC: 4.5-11.0, HB: 13.5-17.5"})
    t2, _ = LabTest.objects.get_or_create(code="LIPID", defaults={'name': "Lipid Profile", 'normal_range': "Total Chol: <200, LDL: <100"})
    t3, _ = LabTest.objects.get_or_create(code="LFT", defaults={'name': "Liver Function Test", 'normal_range': "ALT: 7-55, AST: 8-48"})
    t4, _ = LabTest.objects.get_or_create(code="RFT", defaults={'name': "Renal Function Test", 'normal_range': "Creatinine: 0.7-1.3, Urea: 7-20"})
    t5, _ = LabTest.objects.get_or_create(code="GLU", defaults={'name': "Blood Glucose (Fasting)", 'normal_range': "70-99 mg/dL"})

    # 5. Create Lab Tech
    lt_user, created = User.objects.get_or_create(username='lab_tech_ravi', defaults={'role': User.Role.LAB_TECH})
    lt_user.set_password('password123')
    lt_user.email = f'ravi_{uid}@apexlab.com'
    lt_user.first_name = "Ravi"
    lt_user.last_name = "Kumar"
    lt_user.save()
    LabTechnician.objects.get_or_create(user=lt_user, defaults={'lab': lab1, 'license_number': "LT-99887", 'is_verified': True})
    print(f"{'Created' if created else 'Updated'} Lab Tech: lab_tech_ravi / password123")

    # 6. Create Doctors
    d1_user, created = User.objects.get_or_create(username='dr_sam_johnson', defaults={'role': User.Role.DOCTOR})
    d1_user.set_password('password123')
    d1_user.email = f'sam_{uid}@hospital.com'
    d1_user.first_name = "Sam"
    d1_user.last_name = "Johnson"
    d1_user.save()
    d1, _ = Doctor.objects.get_or_create(user=d1_user, defaults={
        'hospital': h1, 'department': dept_cardio,
        'license_number': "DOC-00123", 'specialization': "Cardiologist",
        'is_verified': True, 'years_of_experience': 12
    })
    print(f"{'Created' if created else 'Updated'} Doctor: dr_sam_johnson / password123")

    d2_user, created = User.objects.get_or_create(username='dr_sarah_smith', defaults={'role': User.Role.DOCTOR})
    d2_user.set_password('password123')
    d2_user.email = f'sarah_{uid}@clinic.com'
    d2_user.first_name = "Sarah"
    d2_user.last_name = "Smith"
    d2_user.save()
    d2, _ = Doctor.objects.get_or_create(user=d2_user, defaults={
        'hospital': h2, 'department': dept_pedia,
        'license_number': "DOC-00456", 'specialization': "Pediatrician",
        'is_verified': True, 'years_of_experience': 8
    })
    print(f"{'Created' if created else 'Updated'} Doctor: dr_sarah_smith / password123")

    # 7. Create Patients
    p1_user, created = User.objects.get_or_create(username='patient_rahul', defaults={'role': User.Role.PATIENT})
    p1_user.set_password('password123')
    p1_user.email = f'rahul_{uid}@gmail.com'
    p1_user.first_name = "Rahul"
    p1_user.last_name = "Kapoor"
    p1_user.save()
    p1, _ = Patient.objects.get_or_create(user=p1_user, defaults={
        'health_id': "HID-RAHUL123",
        'date_of_birth': datetime.date(1990, 5, 15),
        'contact_number': "9876543210", 'blood_group': "B+",
        'gender': "Male", 'address': "S-45, Green Park, New Delhi",
        'chronic_conditions': "Asthma"
    })
    print(f"{'Created' if created else 'Updated'} Patient: patient_rahul / password123")

    p2_user, created = User.objects.get_or_create(username='patient_priya', defaults={'role': User.Role.PATIENT})
    p2_user.set_password('password123')
    p2_user.email = f'priya_{uid}@outlook.com'
    p2_user.first_name = "Priya"
    p2_user.last_name = "Sharma"
    p2_user.save()
    p2, _ = Patient.objects.get_or_create(user=p2_user, defaults={
        'health_id': "HID-PRIYA456",
        'date_of_birth': datetime.date(1995, 8, 22),
        'contact_number': "9988776655", 'blood_group': "O+",
        'gender': "Female", 'address': "A-12, Rohini, New Delhi"
    })
    print(f"{'Created' if created else 'Updated'} Patient: patient_priya / password123")

    p3_user, created = User.objects.get_or_create(username='patient_sneha', defaults={'role': User.Role.PATIENT})
    p3_user.set_password('password123')
    p3_user.email = f'sneha_{uid}@gmail.com'
    p3_user.first_name = "Sneha"
    p3_user.last_name = "Reddy"
    p3_user.save()
    p3, _ = Patient.objects.get_or_create(user=p3_user, defaults={
        'health_id': "HID-SNEHA789",
        'date_of_birth': datetime.date(1982, 3, 10),
        'contact_number': "9123456789", 'blood_group': "A+",
        'gender': "Female", 'address': "C-9, Jubilee Hills, Hyderabad",
        'chronic_conditions': "Type 2 Diabetes"
    })
    print(f"{'Created' if created else 'Updated'} Patient: patient_sneha / password123")

    # 8. Clinical Data for Rahul (Cardiology Focus)
    # Appointments
    Appointment.objects.get_or_create(
        patient=p1, doctor=d1,
        appointment_date=timezone.now() + datetime.timedelta(days=2),
        defaults={'reason': "Heart palpitations follow-up", 'status': Appointment.Status.CONFIRMED}
    )
    Appointment.objects.get_or_create(
        patient=p1, doctor=d2,
        appointment_date=timezone.now() - datetime.timedelta(days=10),
        defaults={'reason': "Regular checkup", 'status': Appointment.Status.COMPLETED}
    )

    # Consultations
    Consultation.objects.get_or_create(
        patient=p1, doctor=d1,
        consultation_date=timezone.now() - datetime.timedelta(days=30),
        defaults={
            'chief_complaint': "Chest tightness during exercise",
            'diagnosis': "Mild Tachycardia",
            'prescription': "Prescribed beta-blockers. Keep monitoring heart rate.",
            'medicines': [{'name': 'Propranolol', 'dosage': '20mg', 'frequency': 'Once daily'}]
        }
    )

    Consultation.objects.get_or_create(
        patient=p1, doctor=d1,
        consultation_date=timezone.now() - datetime.timedelta(days=90),
        defaults={
            'chief_complaint': "Occasional short breath",
            'diagnosis': "Anxiety related palpitation",
            'prescription': "Lifestyle changes and meditation suggested.",
            'medicines': []
        }
    )

    # Medical Records
    MedicalRecord.objects.get_or_create(
        patient=p1, doctor=d1.user,
        title="ECG Report - Normal",
        defaults={
            'record_type': MedicalRecord.RecordType.DIAGNOSIS,
            'description': "ECG (12-lead) shows normal sinus rhythm. Ejection fraction 62%.",
            'file': create_dummy_file("ecg_rahul.png")
        }
    )
    
    MedicalRecord.objects.get_or_create(
        patient=p1, doctor=d1.user,
        title="Stress Test Results",
        defaults={
            'record_type': MedicalRecord.RecordType.DIAGNOSIS,
            'description': "Negative for ischemia. Good exercise tolerance.",
            'file': create_dummy_file("stress_test.pdf")
        }
    )

    # Lab Reports
    LabReport.objects.get_or_create(
        patient=p1, technician=lt_user.lab_profile, test_type=t1,
        defaults={'result_data': {'WBC': '7.2', 'RBC': '5.1', 'Hb': '14.5'}, 'comments': "Normal CBC."}
    )
    LabReport.objects.get_or_create(
        patient=p1, technician=lt_user.lab_profile, test_type=t2,
        defaults={'result_data': {'Cholesterol': '185', 'LDL': '95', 'HDL': '48'}, 'comments': "Lipid profile optimal."}
    )

    # 9. Clinical Data for Sneha (Diabetes Focus)
    Consultation.objects.get_or_create(
        patient=p3, doctor=d2,
        consultation_date=timezone.now() - datetime.timedelta(days=15),
        defaults={
            'chief_complaint': "High fasting sugar levels",
            'diagnosis': "Poorly controlled Type 2 Diabetes",
            'prescription': "Increase insulin dosage. Low carb diet.",
            'medicines': [
                {'name': 'Metformin', 'dosage': '1000mg', 'frequency': 'Twice daily after meals'},
                {'name': 'Gliclazide', 'dosage': '80mg', 'frequency': 'Before breakfast'}
            ]
        }
    )

    LabReport.objects.get_or_create(
        patient=p3, technician=lt_user.lab_profile, test_type=t5,
        defaults={'result_data': {'Blood Glucose': '142 mg/dL', 'HbA1c': '7.4%'}, 'comments': "Glucose levels elevated."}
    )

    LabReport.objects.get_or_create(
        patient=p3, technician=lt_user.lab_profile, test_type=t3,
        defaults={'result_data': {'ALT': '32', 'AST': '28', 'Bilirubin': '0.9'}, 'comments': "Liver function normal."}
    )

    # Old Prescriptions
    OldPrescription.objects.get_or_create(
        patient=p3,
        prescription_date=datetime.date(2022, 6, 15),
        defaults={
            'doctor_name': "Dr. K. S. Rao",
            'hospital_name': "Apollo Hospitals",
            'symptoms': "Excessive thirst, frequent urination",
            'diagnosis': "Diabetes Mellitus Onset",
            'medicines': [{'name': 'Metformin', 'dosage': '500mg', 'frequency': 'Once daily'}],
            'uploaded_by': p3.user
        }
    )

    # 10. Sharing Permissions & Other Data
    SharingPermission.objects.get_or_create(
        patient=p1, doctor=d1,
        defaults={'access_type': SharingPermission.AccessType.OTP_FULL, 'is_active': True, 'granted_by': p1.user}
    )
    
    SharingPermission.objects.get_or_create(
        patient=p3, doctor=d2,
        defaults={'access_type': SharingPermission.AccessType.OTP_FULL, 'is_active': True, 'granted_by': p3.user}
    )

    # Emergency Contact
    EmergencyContact.objects.get_or_create(
        patient=p1, name="Amit Kapoor",
        defaults={'relationship': "Brother", 'phone': "9999988888", 'can_grant_access': True}
    )

    # 11. Support Tickets
    SupportTicket.objects.get_or_create(
        user=p1.user,
        subject="Unable to download QR code",
        defaults={'description': "The download button isn't responding on my mobile phone.", 'status': SupportTicket.Status.OPEN, 'priority': SupportTicket.Priority.MEDIUM}
    )
    
    SupportTicket.objects.get_or_create(
        user=d1.user,
        subject="Verification Request",
        defaults={'description': "Please verify my specialized cardiology certification.", 'status': SupportTicket.Status.RESOLVED, 'priority': SupportTicket.Priority.HIGH, 'admin_notes': "Verified and approved."}
    )

    # 12. Notifications
    Notification.objects.create(user=p1.user, title="New Prescription", message="Dr. Sam Johnson has uploaded a new record for you.")
    Notification.objects.create(user=p1.user, title="Appointment Confirmed", message="Your appointment on Wednesday has been confirmed.")
    Notification.objects.create(user=d1.user, title="Access Granted", message="Patient Rahul Kapoor has granted you full access to their records.")

    # 13. Access Logs
    AccessLog.objects.create(actor=d1.user, patient=p1, action=AccessLog.Action.VIEW_RECORDS, details="Viewed clinical history for consultation.")
    AccessLog.objects.create(actor=p1.user, patient=p1, action=AccessLog.Action.GRANT_ACCESS, details="Granted OTP access to Dr. Sam Johnson.")

    print("Populated Clinical Data, Tickets, and Logs.")
    print("--- Database Population Complete ---")

if __name__ == "__main__":
    populate()
