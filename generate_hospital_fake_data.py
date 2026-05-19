import os
import django
import random
from django.utils import timezone
import datetime

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from doctors.models import Hospital, Department, Doctor, Consultation, HospitalAdmin
from labs.models import DiagnosticLab, LabTechnician, LabTest
from patients.models import Patient

User = get_user_model()

def seed_hospital_data():
    password = 'demoPassword123!'
    
    print("[*] Finding target hospital...")
    # First attempt: Look for the specific hospital created in the demo
    hospital = Hospital.objects.filter(name__icontains="HeartLine").first()
    
    # Second attempt: Fall back to the newest hospital registered
    if not hospital:
        hospital = Hospital.objects.order_by('-created_at').first()
        
    if not hospital:
        print("[-] No hospital found in the database. Please register a hospital first.")
        return
        
    print(f"[+] Found Hospital: {hospital.name} (ID: {hospital.id}, Reg No: {hospital.registration_number})")

    # 1. Initialize Standard Departments
    print("\n[*] Seeding Departments...")
    departments = [
        ("Cardiology", "Specialized cardiac care and cardiovascular diagnosis."),
        ("Pediatrics", "Comprehensive medical care for infants, children, and adolescents."),
        ("Neurology", "Diagnosis and treatment of all categories of conditions and disease involving the brain."),
        ("Radiology", "Advanced medical imaging services including X-Ray, MRI, and CT scans.")
    ]
    dept_objs = {}
    for name, desc in departments:
        dept, created = Department.objects.get_or_create(
            hospital=hospital,
            name=name,
            defaults={'description': desc}
        )
        dept_objs[name] = dept
        if created:
            print(f"    Created Department: {name}")
        else:
            print(f"    Department exists: {name}")

    # 2. Seed 4 Doctors (3 verified, 1 pending verification)
    print("\n[*] Seeding Staff Doctors...")
    doctor_data = [
        {
            "username": "dr.aarav_sharma",
            "email": "aarav.sharma@heartline.com",
            "first_name": "Aarav",
            "last_name": "Sharma",
            "specialization": "Cardiology",
            "license_number": "LIC-CARD-89211",
            "years_of_experience": 12,
            "is_verified": True,
            "dept_name": "Cardiology"
        },
        {
            "username": "dr.priya_patel",
            "email": "priya.patel@heartline.com",
            "first_name": "Priya",
            "last_name": "Patel",
            "specialization": "Pediatrics",
            "license_number": "LIC-PEDS-11043",
            "years_of_experience": 8,
            "is_verified": True,
            "dept_name": "Pediatrics"
        },
        {
            "username": "dr.vikram_malhotra",
            "email": "vikram.malhotra@heartline.com",
            "first_name": "Vikram",
            "last_name": "Malhotra",
            "specialization": "Neurology",
            "license_number": "LIC-NEUR-55421",
            "years_of_experience": 15,
            "is_verified": True,
            "dept_name": "Neurology"
        },
        {
            "username": "dr.kabir_mehta",
            "email": "kabir.mehta@heartline.com",
            "first_name": "Kabir",
            "last_name": "Mehta",
            "specialization": "Radiology",
            "license_number": "LIC-RAD-00942",
            "years_of_experience": 5,
            "is_verified": False,  # This will show as "1 Pending Verification" in stats!
            "dept_name": "Radiology"
        }
    ]

    for data in doctor_data:
        user, u_created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data["email"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "role": User.Role.DOCTOR
            }
        )
        if u_created:
            user.set_password(password)
            user.save()
            
        doctor, d_created = Doctor.objects.get_or_create(
            user=user,
            defaults={
                "hospital": hospital,
                "department": dept_objs.get(data["dept_name"]),
                "specialization": data["specialization"],
                "license_number": data["license_number"],
                "years_of_experience": data["years_of_experience"],
                "is_verified": data["is_verified"]
            }
        )
        status = "Verified" if doctor.is_verified else "Pending Review"
        print(f"    Doctor: Dr. {user.first_name} {user.last_name} ({data['specialization']}) - {status}")

    # 3. Seed Affiliated Labs & Technicians
    print("\n[*] Seeding Affiliated Labs...")
    labs_data = [
        {
            "name": "PulseCare Diagnostic Lab",
            "accreditation_number": "ACCRED-PC-982",
            "email": "info@pulscarelab.com",
            "phone": "555-0812",
            "address": "Ground Floor, HeartLine Annex, Mumbai",
            "tech_username": "tech.neha_sen",
            "tech_email": "neha.sen@pulsecarelab.com",
            "tech_first_name": "Neha",
            "tech_last_name": "Sen",
            "tech_license": "LT-NEHA-39211"
        },
        {
            "name": "HeartLine Imaging Center",
            "accreditation_number": "ACCRED-HL-442",
            "email": "imaging@heartline.com",
            "phone": "555-0442",
            "address": "Basement Block B, HeartLine Main Bldg, Mumbai",
            "tech_username": "tech.rahul_roy",
            "tech_email": "rahul.roy@heartline.com",
            "tech_first_name": "Rahul",
            "tech_last_name": "Roy",
            "tech_license": "LT-RAHUL-78411"
        }
    ]

    for l_data in labs_data:
        lab, l_created = DiagnosticLab.objects.get_or_create(
            accreditation_number=l_data["accreditation_number"],
            defaults={
                "name": l_data["name"],
                "email": l_data["email"],
                "phone": l_data["phone"],
                "address": l_data["address"],
                "hospital": hospital,
                "is_verified": True
            }
        )
        if l_created:
            print(f"    Created Lab: {lab.name}")
        else:
            print(f"    Lab exists: {lab.name}")
            
        # Seed Lab Tech
        t_user, tu_created = User.objects.get_or_create(
            username=l_data["tech_username"],
            defaults={
                "email": l_data["tech_email"],
                "first_name": l_data["tech_first_name"],
                "last_name": l_data["tech_last_name"],
                "role": User.Role.LAB_TECH
            }
        )
        if tu_created:
            t_user.set_password(password)
            t_user.save()
            
        tech, t_created = LabTechnician.objects.get_or_create(
            user=t_user,
            defaults={
                "lab": lab,
                "license_number": l_data["tech_license"],
                "is_verified": True
            }
        )
        print(f"      Lab Tech: {t_user.first_name} {t_user.last_name} ({l_data['tech_license']})")

    # 4. Seed Patients
    print("\n[*] Seeding Patients...")
    patients_data = [
        {
            "username": "pat.amit_verma",
            "email": "amit.verma@gmail.com",
            "first_name": "Amit",
            "last_name": "Verma",
            "dob": "1988-09-14",
            "contact": "555-0912",
            "address": "402 Royal Palms, Andheri West, Mumbai",
            "blood_group": "A+",
            "gender": "Male"
        },
        {
            "username": "pat.rohan_joshi",
            "email": "rohan.joshi@gmail.com",
            "first_name": "Rohan",
            "last_name": "Joshi",
            "dob": "1995-12-03",
            "contact": "555-1102",
            "address": "701 Signature Heights, Bandra, Mumbai",
            "blood_group": "O-",
            "gender": "Male"
        }
    ]

    pat_objs = []
    for p_data in patients_data:
        p_user, pu_created = User.objects.get_or_create(
            username=p_data["username"],
            defaults={
                "email": p_data["email"],
                "first_name": p_data["first_name"],
                "last_name": p_data["last_name"],
                "role": User.Role.PATIENT
            }
        )
        if pu_created:
            p_user.set_password(password)
            p_user.save()
            
        patient, p_created = Patient.objects.get_or_create(
            user=p_user,
            defaults={
                "date_of_birth": p_data["dob"],
                "contact_number": p_data["contact"],
                "address": p_data["address"],
                "blood_group": p_data["blood_group"],
                "gender": p_data["gender"]
            }
        )
        pat_objs.append(patient)
        print(f"    Patient: {p_user.first_name} {p_user.last_name} (Blood Group: {patient.blood_group})")

    # 5. Seed Consultations / Visit Logs
    print("\n[*] Seeding Consultation Visit Logs...")
    
    # Fetch active/verified doctors
    verified_docs = Doctor.objects.filter(hospital=hospital, is_verified=True)
    if verified_docs.count() >= 3 and len(pat_objs) >= 2:
        doc_aarav = verified_docs.get(user__username="dr.aarav_sharma")
        doc_priya = verified_docs.get(user__username="dr.priya_patel")
        doc_vikram = verified_docs.get(user__username="dr.vikram_malhotra")
        
        pat_amit = pat_objs[0]
        pat_rohan = pat_objs[1]
        
        visits = [
            {
                "doctor": doc_aarav,
                "patient": pat_amit,
                "date": timezone.now() - datetime.timedelta(days=1),
                "complaint": "Experiencing episodic chest tightness during moderate exercise.",
                "diagnosis": "Mild Angina / Coronary Artery spasm suspected.",
                "prescription": "Tab. Nitroglycerin 0.5mg sublingual PRN, Tab. Aspirin 75mg OD.",
                "notes": "ECG shows minor ST segment fluctuations. Advised Stress Test and low sodium diet."
            },
            {
                "doctor": doc_priya,
                "patient": pat_rohan,
                "date": timezone.now() - datetime.timedelta(days=2),
                "complaint": "Acute onset high-grade fever accompanied by sore throat and dry cough.",
                "diagnosis": "Acute Viral Pharyngitis.",
                "prescription": "Tab. Paracetamol 650mg TDS, Lozenges PRN, Warm saline rinses.",
                "notes": "Patient advised rest for 3 days and high fluid intake. Re-evaluate if fever persists beyond 5 days."
            },
            {
                "doctor": doc_vikram,
                "patient": pat_amit,
                "date": timezone.now() - datetime.timedelta(days=4),
                "complaint": "Severe unilateral throbbing headache with photophobia.",
                "diagnosis": "Classic Migraine with Aura.",
                "prescription": "Tab. Naproxen 500mg BD after meals, Tab. Sumatriptan 50mg SOS.",
                "notes": "Identify triggers (lack of sleep, coffee). Advised to rest in a dark, quiet room during episodes."
            },
            {
                "doctor": doc_priya,
                "patient": pat_amit,
                "date": timezone.now() - datetime.timedelta(days=6),
                "complaint": "Persistent dry cough for over 10 days with post-nasal drip.",
                "diagnosis": "Post-Infectious Bronchitis.",
                "prescription": "Syr. Dextromethorphan 10ml TDS, Tab. Cetirizine 10mg HS.",
                "notes": "Chest clear on auscultation. No indicators of pneumonia. Steam inhalation advised twice daily."
            }
        ]

        for v in visits:
            consultation, c_created = Consultation.objects.get_or_create(
                doctor=v["doctor"],
                patient=v["patient"],
                consultation_date=v["date"],
                defaults={
                    "chief_complaint": v["complaint"],
                    "diagnosis": v["diagnosis"],
                    "prescription": v["prescription"],
                    "notes": v["notes"]
                }
            )
            if c_created:
                print(f"    Created Visit: Pat {v['patient'].user.first_name} with Dr. {v['doctor'].user.last_name} on {v['date'].strftime('%Y-%m-%d')}")
            else:
                print(f"    Visit exists: Pat {v['patient'].user.first_name} with Dr. {v['doctor'].user.last_name}")
    else:
        print("[-] Insufficient doctors/patients seeded to generate visit logs.")

    print(f"\n[SUCCESS] Fake data populated successfully for Hospital '{hospital.name}'!")
    print("========================================================================")
    print("--- SEEDED USER CREDENTIALS ---")
    print(f"  All accounts use password:  {password}")
    print("  * Cardiologist:             dr.aarav_sharma")
    print("  * Pediatrician:             dr.priya_patel")
    print("  * Neurologist:              dr.vikram_malhotra")
    print("  * Radiologist (Pending):    dr.kabir_mehta")
    print("  * Lab Technician:           tech.neha_sen")
    print("  * Patient 1:                pat.amit_verma")
    print("  * Patient 2:                pat.rohan_joshi")
    print("========================================================================")

if __name__ == '__main__':
    seed_hospital_data()
