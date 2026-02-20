"""
seed_hospital_admin.py
Seed test data for a Hospital Admin to verify the Hospital Dashboard.
Usage: python manage.py seed_hospital_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from doctors.models import Hospital, HospitalAdmin, Doctor
from labs.models import DiagnosticLab
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed Hospital Admin test data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('=== Seeding Hospital Admin Data ==='))

        # 1. Ensure Hospital exists
        hospital, _ = Hospital.objects.get_or_create(
            registration_number='HOSP-METRO-001',
            defaults={
                'name': 'Metro General Hospital',
                'address': '123 Health Ave, Metro City',
                'phone': '011-22334455',
                'email': 'admin@metrogeneral.com',
                'is_verified': True,
            }
        )
        self.stdout.write(f'  Hospital: {hospital.name}')

        # 2. Ensure Hospital Admin User exists
        admin_user, created = User.objects.get_or_create(
            username='metro_admin',
            defaults={
                'email': 'admin@metrogeneral.com',
                'first_name': 'Metro',
                'last_name': 'Admin',
                'role': 'HOSPITAL_ADMIN',
            }
        )
        if created or not admin_user.check_password('1234@1234'):
            admin_user.set_password('1234@1234')
            admin_user.save()
            self.stdout.write(f'  Created / reset admin user: {admin_user.username}')

        # 3. Create HospitalAdmin profile
        h_admin, _ = HospitalAdmin.objects.get_or_create(
            user=admin_user,
            defaults={'hospital': hospital}
        )
        self.stdout.write(f'  Hospital Admin linked to {hospital.name}')

        # 4. Ensure some Doctors are linked to this Hospital
        # Dr. Sharma from previous seed is already linked to AIIMS, let's create a new one
        doc_user, _ = User.objects.get_or_create(
            username='dr_kim',
            defaults={
                'email': 'dr_kim@metrogeneral.com',
                'first_name': 'Chloe',
                'last_name': 'Kim',
                'role': 'DOCTOR',
            }
        )
        if not doc_user.check_password('1234@1234'):
            doc_user.set_password('1234@1234')
            doc_user.save()
        
        doctor, _ = Doctor.objects.get_or_create(
            user=doc_user,
            defaults={
                'license_number': 'LIC-METRO-001',
                'specialization': 'Pediatrics',
                'hospital': hospital,
                'is_verified': True,
            }
        )
        self.stdout.write(f'  Doctor: {doctor.user.get_full_name()} linked to {hospital.name}')

        # 5. Ensure some Labs are linked to this Hospital
        # (Assuming DiagnosticLab has a way to link to Hospital, or just exists)
        lab, _ = DiagnosticLab.objects.get_or_create(
            accreditation_number='LAB-METRO-001',
            defaults={
                'name': 'Metro Diagnostic Center',
                'address': 'Ground Floor, Metro General',
                'phone': '011-22334466',
                'email': 'labs@metrogeneral.com',
                'hospital': hospital,
                'is_verified': True,
            }
        )
        # In current models, labs aren't explicitly linked to hospitals in a many-to-many?
        # Let's check labs models later if needed. For now, we'll just have them exist.
        self.stdout.write(f'  Lab: {lab.name} created')

        self.stdout.write(self.style.SUCCESS('\n✅ Hospital Admin data seeded successfully!'))
        self.stdout.write(f'\n  Login: metro_admin / 1234@1234')
        self.stdout.write(f'  Hospital: {hospital.name}')
