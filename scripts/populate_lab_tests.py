import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from labs.models import LabTest

def populate_tests():
    tests = [
        {'name': 'Complete Blood Count (CBC)', 'code': 'CBC', 'description': 'Full blood count including WBC, RBC, and Platelets.'},
        {'name': 'Lipid Profile', 'code': 'LIPID', 'description': 'Cholesterol, HDL, LDL, and Triglycerides.'},
        {'name': 'Thyroid Function Test', 'code': 'TFT', 'description': 'TSH, T3, and T4 levels.'},
        {'name': 'Liver Function Test (LFT)', 'code': 'LFT', 'description': 'ALT, AST, Bilirubin, and Albumin.'},
        {'name': 'Renal Function Test (KFT)', 'code': 'KFT', 'description': 'Creatinine, Urea, and Electrolytes.'},
        {'name': 'Vitamin B12', 'code': 'B12', 'description': 'Measurement of Vitamin B12 levels.'},
        {'name': 'Vitamin D', 'code': 'VITD', 'description': 'Measurement of 25-hydroxy vitamin D.'},
        {'name': 'HbA1c', 'code': 'HBA1C', 'description': 'Average blood glucose over the past 3 months.'},
        {'name': 'Blood Glucose (Fasting)', 'code': 'GLU-F', 'description': 'Blood sugar level after fasting.'},
        {'name': 'Blood Glucose (Post Prandial)', 'code': 'GLU-PP', 'description': 'Blood sugar level after a meal.'},
        {'name': 'Urine Routine', 'code': 'URINE-R', 'description': 'Physical, chemical and microscopic examination of urine.'},
        {'name': 'COVID-19 RT-PCR', 'code': 'COVID-PCR', 'description': 'Molecular testing for SARS-CoV-2.'},
        {'name': 'X-Ray Chest', 'code': 'XRAY-C', 'description': 'Radiographic image of the chest.'},
        {'name': 'MRI Brain', 'code': 'MRI-B', 'description': 'Magnetic resonance imaging of the brain.'},
        {'name': 'CT Abdomen', 'code': 'CT-A', 'description': 'Computed tomography of the abdomen.'},
        {'name': 'Ultrasound Whole Abdomen', 'code': 'USG-WA', 'description': 'Ultrasonic imaging of the abdominal cavity.'},
    ]

    print(f"Checking for {len(tests)} lab tests...")
    created_count = 0
    for t_data in tests:
        obj, created = LabTest.objects.get_or_create(
            code=t_data['code'],
            defaults={'name': t_data['name'], 'description': t_data['description']}
        )
        if created:
            created_count += 1
            print(f"Created: {t_data['name']}")
    
    print(f"\nPopulation complete! Added {created_count} new tests.")
    print(f"Total tests in database: {LabTest.objects.all().count()}")

if __name__ == "__main__":
    populate_tests()
