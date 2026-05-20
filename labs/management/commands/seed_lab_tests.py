from django.core.management.base import BaseCommand
from labs.models import LabTest

class Command(BaseCommand):
    help = 'Seed initial lab tests'

    def handle(self, *args, **kwargs):
        tests = [
            {'id': 1, 'name': 'Complete Blood Count (CBC)', 'code': 'CBC', 'description': 'Measures different parts of the blood.'},
            {'id': 2, 'name': 'Lipid Profile', 'code': 'LIPID', 'description': 'Measures cholesterol and triglycerides.'},
            {'id': 3, 'name': 'Thyroid Function Test (TFT)', 'code': 'TFT', 'description': 'Checks how well your thyroid is working.'},
            {'id': 4, 'name': 'Urinalysis', 'code': 'URINE', 'description': 'Examines the appearance, concentration and content of urine.'},
            {'id': 5, 'name': 'COVID-19 RT-PCR', 'code': 'RTPCR', 'description': 'Detects SARS-CoV-2 viral RNA.'},
            {'id': 6, 'name': 'Liver Function Test (LFT)', 'code': 'LFT', 'description': 'Measures levels of proteins, liver enzymes, and bilirubin.'},
            {'id': 7, 'name': 'Kidney Function Test (KFT)', 'code': 'KFT', 'description': 'Evaluates how well kidneys are working.'},
            {'id': 8, 'name': 'HbA1c', 'code': 'HBA1C', 'description': 'Average blood sugar levels over the past 3 months.'},
            {'id': 9, 'name': 'Blood Glucose Test', 'code': 'GLUCOSE', 'description': 'Measures sugar levels in the blood.'},
            {'id': 10, 'name': 'ECG', 'code': 'ECG', 'description': 'Records the electrical signal from the heart.'},
            {'id': 11, 'name': 'Vitamin D', 'code': 'VITD', 'description': 'Measures vitamin D levels.'},
            {'id': 12, 'name': 'Vitamin B12', 'code': 'VITB12', 'description': 'Measures vitamin B12 levels.'},
            {'id': 13, 'name': 'Chest X-Ray', 'code': 'CXRAY', 'description': 'Produces images of the heart, lungs, and blood vessels.'},
            {'id': 14, 'name': 'Ultrasound', 'code': 'ULTRASOUND', 'description': 'Uses sound waves to produce pictures of the inside of the body.'},
        ]

        for test_data in tests:
            test, created = LabTest.objects.update_or_create(
                id=test_data['id'],
                defaults={'name': test_data['name'], 'code': test_data['code'], 'description': test_data['description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created test: {test.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Updated test: {test.name}'))
