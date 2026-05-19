import os
import django
import random
from django.utils import timezone
import datetime
from django.utils.timezone import make_aware

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import Hospital, Department, Doctor, Consultation, Appointment, HospitalAdmin
from patients.models import Patient, EmergencyContact, SharingPermission, OTPRequest
from audit.models import AccessLog

User = get_user_model()

def populate_data():
    password = 'demoPassword123!'
    print("========================================================================")
    print("[*] STARTING HIGH-FIDELITY MUMBAI HEALTHCARE ECOSYSTEM POPULATION")
    print("========================================================================")

    # ==========================================
    # 1. CREATE HOSPITALS (Skipping Hospital 2)
    # ==========================================
    hospitals_to_create = [
        {
            "id": "HSP001",
            "name": "PulseCare MultiSpeciality Hospital",
            "address": "Plot 18, Central Avenue\nPowai, Mumbai – 400076",
            "phone": "+91 22 4812 4455",
            "email": "contact@pulsecarehospital.in",
            "registration_number": "MH-HSP-784211",
            "is_verified": True,
            "admin_name": "Priya Menon",
            "admin_email": "admin.pulsecare@example.com",
            "admin_phone": "+91 98201 48291",
            "admin_username": "admin.pulsecare"
        },
        # Skipping HSP002: HeartLine Institute of Cardiac Sciences as requested!
        {
            "id": "HSP003",
            "name": "Metro Emergency & Trauma Center",
            "address": "Eastern Express Highway\nSion, Mumbai – 400022",
            "phone": "+91 22 4022 1100",
            "email": "contact@metroemergency.in",
            "registration_number": "MH-HSP-402211",
            "is_verified": True,
            "admin_name": "Radhika Kulkarni",
            "admin_email": "admin.metro@example.com",
            "admin_phone": "+91 98920 22334",
            "admin_username": "admin.metro"
        },
        {
            "id": "HSP004",
            "name": "Lifebridge Community Hospital",
            "address": "Chembur East\nMumbai – 400071",
            "phone": "+91 22 4389 7777",
            "email": "contact@lifebridgehospital.in",
            "registration_number": "MH-HSP-438977",
            "is_verified": True,
            "admin_name": "Suresh Patil",
            "admin_email": "admin.lifebridge@example.com",
            "admin_phone": "+91 98202 55667",
            "admin_username": "admin.lifebridge"
        }
    ]

    hospitals = {}
    print("\n[*] Seeding Hospitals and Admins...")
    for h_data in hospitals_to_create:
        hospital, h_created = Hospital.objects.get_or_create(
            registration_number=h_data["registration_number"],
            defaults={
                "name": h_data["name"],
                "address": h_data["address"],
                "phone": h_data["phone"],
                "email": h_data["email"],
                "is_verified": h_data["is_verified"]
            }
        )
        hospitals[h_data["name"]] = hospital
        action = "Created" if h_created else "Found existing"
        print(f"  [+] {action} Hospital: {hospital.name}")

        # Seed Hospital Admin
        admin_user, u_created = User.objects.get_or_create(
            username=h_data["admin_username"],
            defaults={
                "email": h_data["admin_email"],
                "first_name": h_data["admin_name"].split(" ")[0],
                "last_name": h_data["admin_name"].split(" ")[1] if len(h_data["admin_name"].split(" ")) > 1 else "",
                "role": User.Role.HOSPITAL_ADMIN
            }
        )
        if u_created:
            admin_user.set_password(password)
            admin_user.save()
            print(f"    Created User: {admin_user.username}")

        admin_profile, ap_created = HospitalAdmin.objects.get_or_create(
            user=admin_user,
            defaults={
                "hospital": hospital,
                "is_verified": True
            }
        )
        print(f"    Admin assigned: {h_data['admin_name']} -> {hospital.name}")

    # ==========================================
    # 2. CREATE DEPARTMENTS FOR EACH HOSPITAL
    # ==========================================
    print("\n[*] Seeding Departments...")
    departments_by_hospital = {
        "PulseCare MultiSpeciality Hospital": [
            ("Emergency Medicine", "24/7 acute trauma and emergency support services."),
            ("Cardiology", "Advanced heart care, diagnostics, and cardiac therapeutic facilities."),
            ("Neurology", "Comprehensive brain, spine, and nerve disorders treatment."),
            ("Orthopedics", "Specialized bone, joint, and musculoskeletal therapy and surgery."),
            ("General Medicine", "Primary health evaluation, preventative treatment, and chronic disease management."),
            ("Radiology", "State-of-the-art diagnostic imaging including MRI, CT, and X-Ray."),
            ("Pulmonology", "Advanced respiratory therapy, lung disease diagnostics, and allergy care.")
        ],
        "Metro Emergency & Trauma Center": [
            ("Trauma Care", "Level-1 emergency response and advanced surgical trauma services."),
            ("Emergency", "Immediate treatment of critical illnesses and life-threatening injuries."),
            ("ICU", "Intensive care monitoring and advanced life support setups."),
            ("Surgery", "General, trauma, and orthopedic surgical operation suites."),
            ("Imaging", "Fast-response trauma imaging, ultrasound, and CT scanning.")
        ],
        "Lifebridge Community Hospital": [
            ("Pediatrics", "Specialized medical attention and developmental care for children."),
            ("General Medicine", "Primary healthcare diagnostics, vaccinations, and family medicine."),
            ("ENT", "Diagnosis and treatment of Ear, Nose, and Throat diseases."),
            ("Gynecology", "Comprehensive female wellness, maternity, and pre-natal support.")
        ]
    }

    depts = {}
    for h_name, dept_list in departments_by_hospital.items():
        hospital = hospitals[h_name]
        depts[h_name] = {}
        print(f"  [+] Seeding departments for {h_name}:")
        for name, desc in dept_list:
            dept, d_created = Department.objects.get_or_create(
                hospital=hospital,
                name=name,
                defaults={"description": desc}
            )
            depts[h_name][name] = dept
            status = "Created" if d_created else "Exists"
            print(f"    - {name} ({status})")

    # ==========================================
    # 3. CREATE DOCTORS
    # ==========================================
    print("\n[*] Seeding Doctor Profiles (Skipping Doctor Arjun Rao of HeartLine)...")
    doctors_to_create = [
        {
            "username": "dr.nehajoshi",
            "email": "neha.joshi@pulsecarehospital.in",
            "first_name": "Neha",
            "last_name": "Joshi",
            "hospital_name": "PulseCare MultiSpeciality Hospital",
            "dept_name": "General Medicine",
            "specialization": "General Medicine",
            "license_number": "MH-DOC-12345",
            "years_of_experience": 10
        },
        {
            "username": "dr.sanakhan",
            "email": "sana.khan@pulsecarehospital.in",
            "first_name": "Sana",
            "last_name": "Khan",
            "hospital_name": "PulseCare MultiSpeciality Hospital",
            "dept_name": "Pulmonology",
            "specialization": "Pulmonology",
            "license_number": "MH-DOC-23456",
            "years_of_experience": 7
        },
        {
            "username": "dr.vivekpatel",
            "email": "vivek.patel@metroemergency.in",
            "first_name": "Vivek",
            "last_name": "Patel",
            "hospital_name": "Metro Emergency & Trauma Center",
            "dept_name": "Trauma Care",
            "specialization": "Trauma Care & Emergency Medicine",
            "license_number": "MH-DOC-34567",
            "years_of_experience": 14
        },
        {
            "username": "dr.ishitashah",
            "email": "ishita.shah@lifebridgehospital.in",
            "first_name": "Ishita",
            "last_name": "Shah",
            "hospital_name": "Lifebridge Community Hospital",
            "dept_name": "Pediatrics",
            "specialization": "Pediatrics",
            "license_number": "MH-DOC-45678",
            "years_of_experience": 6
        }
    ]

    docs = {}
    for d_data in doctors_to_create:
        user, u_created = User.objects.get_or_create(
            username=d_data["username"],
            defaults={
                "email": d_data["email"],
                "first_name": d_data["first_name"],
                "last_name": d_data["last_name"],
                "role": User.Role.DOCTOR
            }
        )
        if u_created:
            user.set_password(password)
            user.save()
            print(f"  [+] Created User: {user.username}")

        hospital = hospitals[d_data["hospital_name"]]
        dept = depts[d_data["hospital_name"]][d_data["dept_name"]]

        doctor, doc_created = Doctor.objects.get_or_create(
            user=user,
            defaults={
                "hospital": hospital,
                "department": dept,
                "specialization": d_data["specialization"],
                "license_number": d_data["license_number"],
                "years_of_experience": d_data["years_of_experience"],
                "is_verified": True,
                "authorization_level": Doctor.AuthorizationLevel.FULL
            }
        )
        docs[d_data["username"]] = doctor
        status = "Created" if doc_created else "Exists"
        print(f"  [+] Doctor Profile: Dr. {user.first_name} {user.last_name} ({d_data['specialization']}) at {hospital.name} ({status})")

    # ==========================================
    # 4. SEED DEMO STORY: AARAV MEHTA TIMELINE
    # ==========================================
    print("\n[*] Seeding DEMO STORY: Patient Aarav Mehta's Journey...")

    # A. Create Patient Aarav Mehta
    pat_user, pu_created = User.objects.get_or_create(
        username="aarav_mehta",
        defaults={
            "email": "aarav.mehta@gmail.com",
            "first_name": "Aarav",
            "last_name": "Mehta",
            "role": User.Role.PATIENT
        }
    )
    if pu_created:
        pat_user.set_password(password)
        pat_user.save()
        print(f"  [+] Created Patient User: {pat_user.username}")

    patient, p_created = Patient.objects.get_or_create(
        user=pat_user,
        defaults={
            "date_of_birth": datetime.date(1998, 4, 12),
            "contact_number": "+91 98199 88776",
            "address": "B-402, Shanti Heights, Powai, Mumbai - 400076",
            "blood_group": "O+",
            "gender": "Male",
            "allergies": "Dust, Pollen, Shellfish",
            "chronic_conditions": "Mild Allergic Asthma",
            "show_all_emergency_contacts": True,
            "allow_public_qr_access": False,
            "doctor_snapshot_enabled": True
        }
    )
    # The Patient model auto-generates health_id and QR code during save!
    print(f"  [+] Patient Profile: Aarav Mehta (Health ID: {patient.health_id})")

    # B. Add Emergency Contact: Karan Mehta
    emergency_contact, ec_created = EmergencyContact.objects.get_or_create(
        patient=patient,
        name="Karan Mehta",
        defaults={
            "relationship": "Brother",
            "phone": "+91 98200 11223",
            "email": "karan.mehta@example.com",
            "is_primary": True,
            "preferred_otp_method": EmergencyContact.OTPMethod.SMS,
            "allow_emergency_access": True,
            "can_grant_access": True
        }
    )
    status = "Added" if ec_created else "Exists"
    print(f"  [+] Emergency Contact: {emergency_contact.name} ({emergency_contact.relationship}) - {status}")

    # Timeline Setup - Dates in past
    now = timezone.now()
    two_days_ago = now - datetime.timedelta(days=2)
    one_hour_ago = now - datetime.timedelta(hours=1)

    # 1. Create Appointment (PulseCare -> General Medicine)
    doc_neha = docs["dr.nehajoshi"]
    appointment, app_created = Appointment.objects.get_or_create(
        patient=patient,
        doctor=doc_neha,
        appointment_date=two_days_ago,
        defaults={
            "reason": "Routine general health assessment and mild breathing distress during change of seasons.",
            "status": Appointment.Status.COMPLETED,
            "notes": "Patient reports mild chest tightness on walking in dusty environment. Recommended pulmonology review if inhalers aren't fully relieving it."
        }
    )
    print(f"  [+] Timeline Step 1: Appointment with Dr. Neha Joshi ({appointment.status}) on {two_days_ago.strftime('%Y-%m-%d')}")

    # 2. Doctor updates record (Consultation created)
    medicines_list = [
        {"name": "Levosalbutamol Inhaler 100mcg", "dosage": "1 puff", "frequency": "When required (PRN) for breathlessness"},
        {"name": "Montelukast 10mg", "dosage": "1 tablet", "frequency": "Once daily at bedtime (HS)"}
    ]
    consultation, c_created = Consultation.objects.get_or_create(
        doctor=doc_neha,
        patient=patient,
        consultation_date=two_days_ago,
        defaults={
            "chief_complaint": "Episodic dry cough, chest congestion and difficulty in deep breathing when exposed to dust or pollen.",
            "diagnosis": "Mild Allergic Asthma / Bronchial Hyperresponsiveness",
            "prescription": "Levosalbutamol Inhaler 100mcg (1 puff SOS), Tab Montelukast 10mg OD HS for 30 days.",
            "medicines": medicines_list,
            "notes": "Advised to avoid highly polluted areas, carry inhaler at all times. Follow up in 2 weeks or if episodes worsen.",
            "follow_up_date": (two_days_ago + datetime.timedelta(days=14)).date()
        }
    )
    print(f"  [+] Timeline Step 2: Consultation Record added by Dr. Neha Joshi (Diagnosis: {consultation.diagnosis})")

    # 3. Simulate Audit logs leading up to emergency
    # Log 1: Patient Created Health ID
    log_created_id = AccessLog.objects.create(
        actor=pat_user,
        patient=patient,
        action=AccessLog.Action.CREATE_HEALTH_ID,
        details=f"Patient registered and generated unique QR Medical Profile with ID {patient.health_id}.",
        ip_address="192.168.1.42"
    )
    # Update timestamp to 10 days ago
    AccessLog.objects.filter(id=log_created_id.id).update(timestamp=now - datetime.timedelta(days=10))

    # Log 2: Doctor Neha Joshi reviews history before consultation
    log_doc_view = AccessLog.objects.create(
        actor=doc_neha.user,
        patient=patient,
        action=AccessLog.Action.VIEW_PROFILE,
        details="Access requested under scheduled appointment workflow. Authorized by patient authorization token.",
        ip_address="192.168.2.11"
    )
    AccessLog.objects.filter(id=log_doc_view.id).update(timestamp=two_days_ago - datetime.timedelta(minutes=15))

    # Log 3: Doctor Neha Joshi records consultation
    log_doc_record = AccessLog.objects.create(
        actor=doc_neha.user,
        patient=patient,
        action=AccessLog.Action.CREATE_CONSULTATION,
        details="Added Allergic Asthma diagnosis, treatment plan, and prescription detail.",
        ip_address="192.168.2.11"
    )
    AccessLog.objects.filter(id=log_doc_record.id).update(timestamp=two_days_ago)

    # 4. Emergency Incident simulated
    print("  [+] Timeline Step 4: Emergency incident occurred near Sion Highway. Aarav collapsed with acute respiratory failure.")

    # 5. Hospital scans QR (Metro Emergency & Trauma Center - Dr. Vivek Patel)
    doc_vivek = docs["dr.vivekpatel"]
    log_scan = AccessLog.objects.create(
        actor=doc_vivek.user,
        patient=patient,
        action=AccessLog.Action.VIEW_PROFILE,
        details="EMERGENCY SCAN: Patient Aarav Mehta brought to Metro Emergency & Trauma ER after collapsing. Scanned patient's QR code to pull crucial clinical details.",
        ip_address="192.168.4.88"
    )
    AccessLog.objects.filter(id=log_scan.id).update(timestamp=one_hour_ago - datetime.timedelta(minutes=10))
    print(f"  [+] Timeline Step 5: Dr. Vivek Patel scanned Aarav's QR code at {doc_vivek.hospital.name}.")

    # 6. OTP sent to emergency contact (Karan Mehta)
    otp_req, o_created = OTPRequest.objects.get_or_create(
        patient=patient,
        doctor=doc_vivek,
        otp_code="884219",
        defaults={
            "is_verified": True,
            "attempts": 1,
            "is_revoked": False,
            "delivery_method": OTPRequest.DeliveryMethod.DASHBOARD,
            "verifier_type": OTPRequest.VerifierType.EMERGENCY_CONTACT,
            "verifier_contact": emergency_contact
        }
    )
    # Adjust created_at timestamp
    OTPRequest.objects.filter(id=otp_req.id).update(created_at=one_hour_ago - datetime.timedelta(minutes=8))
    
    log_otp = AccessLog.objects.create(
        actor=doc_vivek.user,
        patient=patient,
        action=AccessLog.Action.VIEW_PROFILE,
        details=f"Emergency access authorization OTP requested and sent to Primary Emergency Contact: {emergency_contact.name} ({emergency_contact.phone}) via SMS.",
        ip_address="192.168.4.88"
    )
    AccessLog.objects.filter(id=log_otp.id).update(timestamp=one_hour_ago - datetime.timedelta(minutes=8))
    print(f"  [+] Timeline Step 6: OTP (Code: 884219) generated and transmitted to emergency contact {emergency_contact.name}.")

    # 7. Temporary access granted (SharingPermission)
    permission, perm_created = SharingPermission.objects.get_or_create(
        patient=patient,
        doctor=doc_vivek,
        access_type=SharingPermission.AccessType.EMERGENCY,
        defaults={
            "is_active": True,
            "granted_by": emergency_contact.patient.user,
            "expires_at": now + datetime.timedelta(hours=23),
            "can_view_records": True,
            "can_view_documents": True,
            "can_add_records": True
        }
    )
    # Adjust granted_at
    SharingPermission.objects.filter(id=permission.id).update(granted_at=one_hour_ago - datetime.timedelta(minutes=5))
    
    log_grant = AccessLog.objects.create(
        actor=doc_vivek.user,
        patient=patient,
        action=AccessLog.Action.GRANT_ACCESS,
        details=f"Full emergency records authorization unlocked successfully. Verified by OTP submitted by emergency contact {emergency_contact.name}.",
        ip_address="192.168.4.88"
    )
    AccessLog.objects.filter(id=log_grant.id).update(timestamp=one_hour_ago - datetime.timedelta(minutes=5))
    print(f"  [+] Timeline Step 7: Emergency access granted! Dr. Vivek Patel successfully unlocked full historic record access.")

    # 8. Dr. Vivek Patel reviews historical record and saves Aarav's life!
    log_view_history = AccessLog.objects.create(
        actor=doc_vivek.user,
        patient=patient,
        action=AccessLog.Action.VIEW_RECORDS,
        details="EMERGENCY REVIEW: Read historical consultation logs. Discovered 'Mild Allergic Asthma' diagnosis and current active prescription (Levosalbutamol Inhaler, Montelukast) from Dr. Neha Joshi. Administering targeted emergency therapies.",
        ip_address="192.168.4.88"
    )
    AccessLog.objects.filter(id=log_view_history.id).update(timestamp=one_hour_ago - datetime.timedelta(minutes=3))
    print("  [+] Timeline Step 8: Dr. Vivek Patel reviewed Aarav's historical records. Found crucial Asthma history & prescription detail, preventing counter-indicated drugs!")

    # 9. Create Emergency Consultation (Metro Emergency & Trauma Center)
    emergency_meds = [
        {"name": "Budesonide Resps 1mg + Salbutamol Resps 2.5mg", "dosage": "Nebulization", "frequency": "Immediate / Stat"},
        {"name": "IV Hydrocortisone 100mg", "dosage": "Intravenous injection", "frequency": "Stat"},
        {"name": "Oxygen Inhalation", "dosage": "High flow (6L/min)", "frequency": "Continuous until SpO2 > 95%"}
    ]
    emergency_consultation, ec_created = Consultation.objects.get_or_create(
        doctor=doc_vivek,
        patient=patient,
        consultation_date=one_hour_ago,
        defaults={
            "chief_complaint": "Acute severe respiratory distress, dyspnea, and subsequent collapse on highway. SpO2 on admission: 82%. Severe bronchospasm.",
            "diagnosis": "Acute Severe Exacerbation of Bronchial Asthma (Triggered by dust/smog on highway)",
            "prescription": "Budesonide + Salbutamol Nebulization Stat, Inj Hydrocortisone 100mg IV Stat, 100% High flow Oxygen support.",
            "medicines": emergency_meds,
            "notes": "Emergency scan of QR medical card revealed history of asthma, enabling quick, targeted bronchodilator therapy. Patient stabilized remarkably. Chest tightness cleared. SpO2 improved to 96%. Patient shifted to ICU for observation. Life saved by immediate QR clinical profile access.",
            "follow_up_date": (now + datetime.timedelta(days=3)).date()
        }
    )
    
    log_create_emergency_consult = AccessLog.objects.create(
        actor=doc_vivek.user,
        patient=patient,
        action=AccessLog.Action.CREATE_CONSULTATION,
        details="Added Emergency Consultation record following asthma collapse stabilization and ICU admission.",
        ip_address="192.168.4.88"
    )
    AccessLog.objects.filter(id=log_create_emergency_consult.id).update(timestamp=one_hour_ago)
    print("  [+] Timeline Step 9: Emergency Consultation recorded. Life saved, audit log fully established!")

    # ==========================================
    # 5. GENERAL SEED COMPLETION SUMMARY
    # ==========================================
    print("\n========================================================================")
    print("[SUCCESS] MUMBAI MEDICAL ECOSYSTEM SUCCESSFULLY POPULATED!")
    print("========================================================================")
    print("  All seeded accounts use password:  " + password)
    print("\n  HOSPITALS SEEDED (Except HeartLine HSP002):")
    print("  1. PulseCare MultiSpeciality Hospital (HSP001)")
    print("  2. Metro Emergency & Trauma Center (HSP003)")
    print("  3. Lifebridge Community Hospital (HSP004)")
    print("\n  DOCTOR LOGIN CREDENTIALS:")
    print("  * Dr. Neha Joshi (PulseCare):       dr.nehajoshi")
    print("  * Dr. Sana Khan (PulseCare):        dr.sanakhan")
    print("  * Dr. Vivek Patel (Metro Emergency): dr.vivekpatel")
    print("  * Dr. Ishita Shah (Lifebridge):     dr.ishitashah")
    print("\n  PATIENT CREDENTIALS:")
    print(f"  * Aarav Mehta:                      aarav_mehta  (Health ID: {patient.health_id})")
    print(f"  * Primary Emergency Contact:        Karan Mehta  (Phone: {emergency_contact.phone})")
    print("\n  HOSPITAL ADMIN CREDENTIALS:")
    print("  * Priya Menon (PulseCare Admin):    admin.pulsecare")
    print("  * Radhika Kulkarni (Metro Admin):   admin.metro")
    print("  * Suresh Patil (Lifebridge Admin):  admin.lifebridge")
    print("========================================================================")

if __name__ == '__main__':
    populate_data()
