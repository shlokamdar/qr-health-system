from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from doctors.models import Doctor, Hospital, Consultation, Appointment
from patients.models import Patient
from records.models import MedicalRecord
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate rich dummy data for verification'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating rich dummy data...')

        # 1. Setup Doctor & Hospital
        hospital, _ = Hospital.objects.get_or_create(
            registration_number='HOSP-001',
            defaults={
                'name': 'General City Hospital',
                'address': '123 Medical Drive',
                'phone': '555-0123',
                'email': 'contact@gch.com',
                'is_verified': True
            }
        )
        
        doctor_user = User.objects.filter(role='DOCTOR').first()
        if not doctor_user:
            doctor_user = User.objects.first()
            if doctor_user:
                 doctor_user.role = 'DOCTOR'
                 doctor_user.save()
            else:
                 self.stdout.write(self.style.ERROR('No user found to assign as doctor.'))
                 return

        doctor, _ = Doctor.objects.get_or_create(
            user=doctor_user,
            defaults={
                'license_number': f'LIC-{doctor_user.username.upper()}',
                'specialization': 'General Medicine',
                'authorization_level': 'FULL',
                'hospital': hospital,
                'is_verified': True
            }
        )
        # Ensure verification
        doctor.is_verified = True
        doctor.authorization_level = 'FULL'
        doctor.save()

        # 2. Setup Patients
        patients_data = [
            {
                'username': 'sarah_connor', 'first': 'Sarah', 'last': 'Connor', 
                'health_id': 'SARAH001', 'dob': '1985-05-12', 'blood': 'O-',
                'allergies': 'Terminators', 'chronic': 'PTSD', 'contact': '555-1001'
            },
            {
                'username': 'bruce_wayne', 'first': 'Bruce', 'last': 'Wayne', 
                'health_id': 'BRUCE001', 'dob': '1980-02-19', 'blood': 'AB+',
                'allergies': 'None', 'chronic': 'Back Pain, Insomnia', 'contact': '555-1002'
            },
            {
                'username': 'clark_kent', 'first': 'Clark', 'last': 'Kent', 
                'health_id': 'CLARK001', 'dob': '1986-06-18', 'blood': 'A+',
                'allergies': 'Kryptonite', 'chronic': 'None', 'contact': '555-1003'
            },
            {
                'username': 'peter_parker', 'first': 'Peter', 'last': 'Parker', 
                'health_id': 'PETER001', 'dob': '2001-08-10', 'blood': 'B+',
                'allergies': 'None', 'chronic': 'None', 'contact': '555-1004'
            },
            {
                'username': 'tony_stark', 'first': 'Tony', 'last': 'Stark', 
                'health_id': 'TONY001', 'dob': '1970-05-29', 'blood': 'O+',
                'allergies': 'Shrapnel', 'chronic': 'Heart Condition', 'contact': '555-1005'
            }
        ]

        for p_data in patients_data:
            u, _ = User.objects.get_or_create(
                username=p_data['username'],
                defaults={
                    'email': f"{p_data['username']}@example.com",
                    'first_name': p_data['first'],
                    'last_name': p_data['last'],
                    'role': 'PATIENT'
                }
            )
            if not u.check_password('password'):
                u.set_password('password')
                u.save()

            patient, created = Patient.objects.get_or_create(
                user=u,
                defaults={
                    'date_of_birth': p_data['dob'],
                    'blood_group': p_data['blood'],
                    'contact_number': p_data['contact'],
                    'allergies': p_data['allergies'],
                    'chronic_conditions': p_data['chronic']
                }
            )
            
            # Update health ID if needed
            if patient.health_id != p_data['health_id']:
                # checks if specific HID is taken (unless it's self)
                if not Patient.objects.filter(health_id=p_data['health_id']).exclude(id=patient.id).exists():
                     patient.health_id = p_data['health_id']
                     patient.save()

            self.stdout.write(f"Processed Patient: {p_data['first']} {p_data['last']} (ID: {patient.health_id})")

            # Create Records & Consultations
            # Records
            types = ['PRESCRIPTION', 'DIAGNOSIS', 'LAB_REPORT', 'VISIT_NOTE']
            for i in range(random.randint(1, 4)):
                MedicalRecord.objects.get_or_create(
                    patient=patient,
                    title=f'Record {i+1} for {p_data["first"]}',
                    defaults={
                        'doctor': doctor_user,
                        'record_type': random.choice(types),
                        'description': f'Medical record details for {p_data["first"]}.',
                        'created_at': timezone.now() - timedelta(days=random.randint(1, 100))
                    }
                )

            # Consultations
            for i in range(random.randint(1, 3)):
                Consultation.objects.get_or_create(
                    doctor=doctor,
                    patient=patient,
                    consultation_date=timezone.now() - timedelta(days=random.randint(1, 60)),
                    defaults={
                        'chief_complaint': f'Complaint {i+1}: {random.choice(["Flu", "Back Pain", "Headache", "Fever", "Cough"])}',
                        'diagnosis': random.choice(['Viral Infection', 'Muscle Strain', 'Migraine', 'Common Cold']),
                        'prescription': 'Rest and hydration.',
                        'notes': 'Follow up if symptoms persist.',
                        'follow_up_date': timezone.now().date() + timedelta(days=7)
                    }
                )

            # Appointments
            # Create a mix of statuses
            statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED']
            
            # create one future appointment (PENDING or CONFIRMED)
            Appointment.objects.get_or_create(
                doctor=doctor,
                patient=patient,
                appointment_date=timezone.now() + timedelta(days=random.randint(1, 14)),
                defaults={
                    'reason': 'Regular Checkup',
                    'status': random.choice(['PENDING', 'CONFIRMED'])
                }
            )
            
            # create one past appointment
            Appointment.objects.get_or_create(
                doctor=doctor,
                patient=patient,
                appointment_date=timezone.now() - timedelta(days=random.randint(2, 20)),
                defaults={
                    'reason': 'Follow up',
                    'status': 'COMPLETED'
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully populated rich dummy data!'))
