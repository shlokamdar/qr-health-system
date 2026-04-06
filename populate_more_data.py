import os
import django
import random
import uuid
from datetime import timedelta, datetime, timezone as dt_timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from patients.models import Patient
from doctors.models import Doctor, Hospital
from labs.models import DiagnosticLab, LabTechnician
from audit.models import AccessLog
from support.models import SupportTicket

print("Populating MORE realistic data for Admin Dashboard...")

now = datetime.now(dt_timezone.utc)

def random_date_last_week():
    return now - timedelta(days=random.randint(0, 6), hours=random.randint(0, 23), minutes=random.randint(0, 59))

def unique_hex(length=6):
    return uuid.uuid4().hex[:length].upper()

hospital_names = ['City Hospital', 'Metro Care', 'Sunrise Medical Center', 'Hope Clinic', 'CarePlus Hospital']
hospitals = list(Hospital.objects.all())
for name in hospital_names:
    h, created = Hospital.objects.get_or_create(
        name=name,
        defaults={
            'registration_number': f'REG-{unique_hex()}',
            'address': f'{random.randint(10,99)} Main St, Cityville',
            'phone': f'555-{random.randint(1000,9999)}',
            'email': f'contact@{name.replace(" ", "").lower()}.com',
            'is_verified': random.choice([True, True, False])
        }
    )
    if created:
        h.created_at = random_date_last_week()
        h.save()
        hospitals.append(h)

lab_names = ['City Diagnostics', 'QuickLab Paths', 'Central Bio Labs', 'Precision Diagnostics']
labs = list(DiagnosticLab.objects.all())
for name in lab_names:
    l, created = DiagnosticLab.objects.get_or_create(
        name=name,
        defaults={
            'accreditation_number': f'ACCRED-{unique_hex()}',
            'address': f'{random.randint(100,200)} Lab Avenue',
            'phone': f'555-{random.randint(1000,9999)}',
            'email': f'contact@{name.replace(" ", "").lower()}.com',
            'is_verified': random.choice([True, False]),
            'hospital': random.choice([None, random.choice(hospitals)])
        }
    )
    if created:
        l.created_at = random_date_last_week()
        l.save()
        labs.append(l)

first_names = ['Sanjay', 'Priya', 'Ramesh', 'Kavita', 'Vikram', 'Neha', 'Arjun', 'Anjali', 'Rohan', 'Sneha', 'Aditya', 'Pooja', 'Rahul', 'Amit', 'Sunita', 'Asha', 'Deepak', 'Rajesh', 'Suresh']
last_names = ['Kumar', 'Singh', 'Patil', 'Joshi', 'Desai', 'Bhat', 'Rao', 'Iyer', 'Menon', 'Nair', 'Sharma', 'Gupta', 'Das', 'Chatterjee', 'Sen']
specializations = ['Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'Dermatologist', 'General Physician', 'Oncologist', 'Endocrinologist']

doctors = list(Doctor.objects.all())
for i in range(15):
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    username = f'dr{fn.lower()}{unique_hex(4)}'
    
    u, created = User.objects.get_or_create(username=username, defaults={
        'first_name': fn, 'last_name': ln, 'email': f'{username}@example.com', 'role': User.Role.DOCTOR
    })
    
    if created:
        u.set_password('demo123')
        u.date_joined = random_date_last_week()
        u.save()
        
        is_ver = random.choice([True, True, True, False])
        d, _ = Doctor.objects.update_or_create(
            user=u,
            defaults={
                'license_number': f'LIC-{unique_hex(8)}',
                'hospital': random.choice(hospitals),
                'specialization': random.choice(specializations),
                'is_verified': is_ver
            }
        )
        Doctor.objects.filter(id=d.id).update(created_at=u.date_joined)
        doctors.append(d)

# Create 100 more patients
for i in range(100):
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    username = f'patient{fn.lower()}{unique_hex(4)}'
    
    u, created = User.objects.get_or_create(username=username, defaults={
        'first_name': fn, 'last_name': ln, 'email': f'{username}@example.com', 'role': User.Role.PATIENT
    })
    
    if created:
        u.set_password('demo123')
        u.date_joined = random_date_last_week()
        u.save()
        
        p, _ = Patient.objects.update_or_create(
            user=u,
            defaults={
                'health_id': f'HID-{unique_hex(8)}',
                'contact_number': f'987{random.randint(1000000, 9999999)}'
            }
        )
        Patient.objects.filter(id=p.id).update(created_at=u.date_joined)

for i in range(8):
    fn = random.choice(first_names)
    username = f'labtech{fn.lower()}{unique_hex(4)}'
    
    u, created = User.objects.get_or_create(username=username, defaults={
        'first_name': fn, 'last_name': 'Tech', 'email': f'{username}@example.com', 'role': User.Role.LAB_TECH
    })
    
    if created:
        u.set_password('demo123')
        u.date_joined = random_date_last_week()
        u.save()
        
        l, _ = LabTechnician.objects.update_or_create(
            user=u,
            defaults={
                'lab': random.choice(labs),
                'license_number': f'TECH-{unique_hex(6)}',
                'is_verified': random.choice([True, False])
            }
        )
        LabTechnician.objects.filter(id=l.id).update(created_at=u.date_joined)

admin = User.objects.filter(role=User.Role.ADMIN).first()
if admin:
    actions = ['VIEW_PROFILE', 'VIEW_RECORDS', 'LOGIN', 'UPLOAD_RECORD', 'CREATE_CONSULTATION']
    patients = list(Patient.objects.all())
    
    # 100 new log events
    for i in range(100):
        log = AccessLog.objects.create(
            actor=random.choice([admin, random.choice(doctors).user]),
            patient=random.choice(patients) if random.random() > 0.2 else None,
            action=random.choice(actions),
            details=random.choice(['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED']),
            ip_address=f'192.168.{random.randint(0,255)}.{random.randint(1,254)}'
        )
        AccessLog.objects.filter(id=log.id).update(timestamp=random_date_last_week()) 

for i in range(15):
    t_status = random.choice(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    ticket = SupportTicket.objects.create(
        user=random.choice([admin, random.choice(doctors).user]),
        subject=random.choice(['Login Issue', 'Registration help', 'Data sync failed', 'Need access', 'Bug report', 'Feature request']),
        description='Detailed description of the problem goes here.',
        priority=random.choice(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        status=t_status
    )
    if t_status in ['RESOLVED', 'CLOSED']:
        ticket.admin_notes = "Resolved. System was updated."
        ticket.resolved_at = random_date_last_week()
        ticket.save()
        
    SupportTicket.objects.filter(id=ticket.id).update(created_at=random_date_last_week())

print(f"Added comprehensive realistic data! Totals -> Patients: {Patient.objects.count()}, Doctors: {Doctor.objects.count()}, Logs: {AccessLog.objects.count()}")
