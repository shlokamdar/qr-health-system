from django.core.management.base import BaseCommand
from labs.models import LabTest

class Command(BaseCommand):
    help = 'Seed initial lab tests'

    def handle(self, *args, **kwargs):
        tests = [
            {'name': 'Complete Blood Count (CBC)', 'code': 'CBC', 'description': 'Measures different parts of the blood.'},
            {'name': 'Lipid Profile', 'code': 'LIPID', 'description': 'Measures cholesterol and triglycerides.'},
            {'name': 'Thyroid Function Test', 'code': 'TFT', 'description': 'Checks how well your thyroid is working.'},
            {'name': 'Urinalysis', 'code': 'UA', 'description': 'Examines the appearance, concentration and content of urine.'},
            {'name': 'COVID-19 RT-PCR', 'code': 'COVID-PCR', 'description': 'Detects SARS-CoV-2 viral RNA.'},
            {'name': 'Blood Glucose', 'code': 'GLUCOSE', 'description': 'Measures the amount of glucose in the blood.'},
            {'name': 'Liver Function Test', 'code': 'LFT', 'description': 'Measures levels of proteins, liver enzymes, and bilirubin.'},
        ]

        for test_data in tests:
            test, created = LabTest.objects.get_or_create(
                code=test_data['code'],
                defaults={'name': test_data['name'], 'description': test_data['description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created test: {test.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Test already exists: {test.name}'))
