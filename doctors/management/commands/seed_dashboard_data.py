"""
seed_dashboard_data.py
Seed rich demo data for john_doe (patient) so the patient dashboard
can be visually verified with realistic content.

Usage: python manage.py seed_dashboard_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, date

from doctors.models import Doctor, Hospital, Appointment
from patients.models import (
    Patient, EmergencyContact, PatientDocument,
    OldPrescription, SharingPermission
)
from records.models import MedicalRecord

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed dashboard demo data for john_doe patient'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('=== Seeding Dashboard Demo Data ==='))

        # ── Ensure john_doe patient exists ─────────────────────────────────────
        user, created = User.objects.get_or_create(
            username='john_doe',
            defaults={
                'email': 'john_doe@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'PATIENT',
            }
        )
        if created or not user.check_password('1234@1234'):
            user.set_password('1234@1234')
            user.save()
            self.stdout.write(f'  Created / reset user: {user.username}')
        user.first_name = 'John'
        user.last_name = 'Doe'
        user.save()

        patient, _ = Patient.objects.get_or_create(
            user=user,
            defaults={
                'date_of_birth': date(1985, 5, 15),
                'blood_group': 'A+',
                'contact_number': '+91 98765 43210',
                'address': '42 Elm Street, Mumbai, MH 400001',
                'allergies': 'Penicillin, Pollen',
                'chronic_conditions': 'Hypertension',
                'organ_donor': True,
                'gender': 'Male',
            }
        )
        # Update fields even if patient already existed
        patient.blood_group = 'A+'
        patient.contact_number = '+91 98765 43210'
        patient.organ_donor = True
        patient.allergies = 'Penicillin, Pollen'
        patient.chronic_conditions = 'Hypertension'
        patient.save()
        self.stdout.write(f'  Patient: {patient.health_id}')

        # ── Ensure Hospital ─────────────────────────────────────────────────────
        hospital, _ = Hospital.objects.get_or_create(
            registration_number='HOSP-AIIMS-001',
            defaults={
                'name': 'AIIMS New Delhi',
                'address': 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
                'phone': '011-26588500',
                'email': 'contact@aiims.edu',
                'is_verified': True,
            }
        )

        hospital2, _ = Hospital.objects.get_or_create(
            registration_number='HOSP-FORTIS-001',
            defaults={
                'name': 'Fortis Hospital Mumbai',
                'address': 'Mulund Goregaon Link Rd, Nahur West, Mumbai',
                'phone': '022-67120000',
                'email': 'contact@fortis.in',
                'is_verified': True,
            }
        )

        # ── Ensure Doctors ──────────────────────────────────────────────────────
        def get_or_create_doctor(username, first, last, email, spec, hospital, license_no):
            du, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'role': 'DOCTOR',
                }
            )
            if not du.check_password('1234@1234'):
                du.set_password('1234@1234')
                du.save()
            doc, _ = Doctor.objects.get_or_create(
                user=du,
                defaults={
                    'license_number': license_no,
                    'specialization': spec,
                    'authorization_level': 'FULL',
                    'hospital': hospital,
                    'is_verified': True,
                }
            )
            doc.is_verified = True
            doc.authorization_level = 'FULL'
            doc.hospital = hospital
            doc.save()
            return doc

        dr_sharma = get_or_create_doctor(
            'dr_sharma', 'Anil', 'Sharma', 'dr_sharma@aiims.edu',
            'Cardiology', hospital, 'LIC-AIIMS-001'
        )
        dr_patel = get_or_create_doctor(
            'dr_patel', 'Priya', 'Patel', 'dr_patel@fortis.in',
            'General Medicine', hospital2, 'LIC-FORTIS-001'
        )

        # ── Medical Records ─────────────────────────────────────────────────────
        records_data = [
            ('DIAGNOSIS',    'Hypertension Follow-up',      'BP measured at 142/90. Advised lifestyle modification and increased medication dosage. Next review in 4 weeks.', dr_sharma.user, 5),
            ('PRESCRIPTION', 'Atenolol Prescription',       'Atenolol 50mg once daily for blood pressure management. Monitor for bradycardia.', dr_sharma.user, 12),
            ('LAB_REPORT',   'Complete Blood Count (CBC)',  'WBC: 6.2 K/uL, RBC: 5.1 M/uL, Hemoglobin: 14.8 g/dL, Platelets: 250 K/uL. All within normal range.', dr_patel.user, 18),
            ('VISIT_NOTE',   'Annual Physical Examination', 'Patient in good general health. BMI 24.5. No new complaints. Advised continued medication compliance and yearly CBC.', dr_patel.user, 35),
            ('LAB_REPORT',   'Lipid Panel',                 'Total Cholesterol: 195 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL, Triglycerides: 130 mg/dL. Borderline LDL — dietary changes advised.', dr_sharma.user, 60),
            ('DIAGNOSIS',    'Seasonal Allergic Rhinitis',   'Patient presents with sneezing, runny nose, and watery eyes. Prescribed antihistamines and nasal spray for 2 weeks.', dr_patel.user, 90),
        ]
        for rtype, title, desc, doc_user, days_ago in records_data:
            rec, created = MedicalRecord.objects.get_or_create(
                patient=patient, title=title,
                defaults={
                    'doctor': doc_user,
                    'record_type': rtype,
                    'description': desc,
                }
            )
            if created:
                MedicalRecord.objects.filter(pk=rec.pk).update(
                    created_at=timezone.now() - timedelta(days=days_ago)
                )
        self.stdout.write(f'  ✓ {len(records_data)} medical records')

        # ── Old Prescriptions ───────────────────────────────────────────────────
        prescriptions = [
            {
                'prescription_date': date.today() - timedelta(days=12),
                'doctor_name': 'Dr. Anil Sharma',
                'hospital_name': 'AIIMS New Delhi',
                'symptoms': 'Elevated blood pressure, mild headaches in the morning',
                'diagnosis': 'Hypertension — Stage 1',
                'medicines': [
                    {'name': 'Atenolol', 'dosage': '50mg', 'frequency': 'Once daily, morning'},
                    {'name': 'Amlodipine', 'dosage': '5mg', 'frequency': 'Once daily, evening'},
                    {'name': 'Aspirin', 'dosage': '75mg', 'frequency': 'Once daily after breakfast'},
                ],
                'insights': 'Reduce sodium intake. Regular 30-minute walks. Follow-up blood pressure check in 4 weeks.',
            },
            {
                'prescription_date': date.today() - timedelta(days=90),
                'doctor_name': 'Dr. Priya Patel',
                'hospital_name': 'Fortis Hospital Mumbai',
                'symptoms': 'Sneezing, runny nose, watery eyes during spring',
                'diagnosis': 'Seasonal Allergic Rhinitis',
                'medicines': [
                    {'name': 'Cetirizine', 'dosage': '10mg', 'frequency': 'Once daily at bedtime'},
                    {'name': 'Fluticasone nasal spray', 'dosage': '50mcg/spray', 'frequency': '2 sprays each nostril once daily'},
                ],
                'insights': 'Avoid outdoor exposure during high pollen days. Use air purifier indoors.',
            },
            {
                'prescription_date': date.today() - timedelta(days=180),
                'doctor_name': 'Dr. Anil Sharma',
                'hospital_name': 'AIIMS New Delhi',
                'symptoms': 'Mild chest pain on exertion, fatigue',
                'diagnosis': 'Stable Angina — under investigation',
                'medicines': [
                    {'name': 'Nitroglycerin sublingual', 'dosage': '0.5mg', 'frequency': 'As needed for chest pain'},
                    {'name': 'Metoprolol', 'dosage': '25mg', 'frequency': 'Twice daily'},
                ],
                'insights': 'Stress test scheduled for next week. Avoid strenuous activity until follow-up.',
            },
        ]
        for presc in prescriptions:
            OldPrescription.objects.get_or_create(
                patient=patient,
                prescription_date=presc['prescription_date'],
                doctor_name=presc['doctor_name'],
                defaults={
                    'hospital_name': presc['hospital_name'],
                    'symptoms': presc['symptoms'],
                    'diagnosis': presc['diagnosis'],
                    'medicines': presc['medicines'],
                    'insights': presc['insights'],
                    'uploaded_by': user,
                }
            )
        self.stdout.write(f'  ✓ {len(prescriptions)} prescriptions')

        # ── Appointments ────────────────────────────────────────────────────────
        appointments_data = [
            (timedelta(days=7),   'Regular cardiology follow-up and ECG review', 'CONFIRMED', dr_sharma),
            (timedelta(days=21),  'Hypertension management — 6-month check', 'PENDING',   dr_patel),
            (timedelta(days=-5),  'Blood pressure review post-medication change',  'COMPLETED', dr_sharma),
            (timedelta(days=-30), 'Allergy consultation and skin prick test',       'COMPLETED', dr_patel),
            (timedelta(days=-60), 'Annual physical examination',                    'COMPLETED', dr_patel),
        ]
        for delta, reason, status, doctor in appointments_data:
            Appointment.objects.get_or_create(
                doctor=doctor,
                patient=patient,
                reason=reason,
                defaults={
                    'appointment_date': timezone.now() + delta,
                    'status': status,
                }
            )
        self.stdout.write(f'  ✓ {len(appointments_data)} appointments')

        # ── Emergency Contacts ──────────────────────────────────────────────────
        EmergencyContact.objects.filter(patient=patient).delete()
        contacts = [
            {'name': 'Jane Doe', 'relationship': 'Spouse', 'phone': '+91 98765 11111', 'can_grant_access': True},
            {'name': 'Robert Doe', 'relationship': 'Parent', 'phone': '+91 98765 22222', 'can_grant_access': False},
        ]
        for c in contacts:
            EmergencyContact.objects.create(patient=patient, **c)
        self.stdout.write(f'  ✓ {len(contacts)} emergency contacts')

        # ── Sharing Permissions ─────────────────────────────────────────────────
        SharingPermission.objects.filter(patient=patient).delete()
        SharingPermission.objects.create(
            patient=patient,
            doctor=dr_sharma,
            access_type='OTP_FULL',
            is_active=True,
            can_view_records=True,
            can_view_documents=True,
            can_add_records=True,
            granted_by=user,
            expires_at=timezone.now() + timedelta(hours=22),
        )
        SharingPermission.objects.create(
            patient=patient,
            doctor=dr_patel,
            access_type='QR_QUICK',
            is_active=False,
            revoked_at=timezone.now() - timedelta(days=3),
            can_view_records=True,
            granted_by=user,
        )
        self.stdout.write('  ✓ 1 active + 1 revoked sharing permission')

        self.stdout.write(self.style.SUCCESS('\n✅ Dashboard demo data seeded successfully!'))
        self.stdout.write(f'\n  Login: john_doe / 1234@1234')
        self.stdout.write(f'  Health ID: {patient.health_id}')
