import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from labs.models import LabTest

def populate_tests():
    tests = [
        {'id': 1, 'name': 'Complete Blood Count (CBC)', 'code': 'CBC', 'description': 'Full blood count including WBC, RBC, and Platelets.'},
        {'id': 2, 'name': 'Lipid Profile', 'code': 'LIPID', 'description': 'Cholesterol, HDL, LDL, and Triglycerides.'},
        {'id': 3, 'name': 'Thyroid Function Test (TFT)', 'code': 'TFT', 'description': 'TSH, T3, and T4 levels.'},
        {'id': 4, 'name': 'Urinalysis', 'code': 'URINE', 'description': 'Physical, chemical and microscopic examination of urine.'},
        {'id': 5, 'name': 'COVID-19 RT-PCR', 'code': 'RTPCR', 'description': 'Molecular testing for SARS-CoV-2.'},
        {'id': 6, 'name': 'Liver Function Test (LFT)', 'code': 'LFT', 'description': 'ALT, AST, Bilirubin, and Albumin.'},
        {'id': 7, 'name': 'Kidney Function Test (KFT)', 'code': 'KFT', 'description': 'Creatinine, Urea, and Electrolytes.'},
        {'id': 8, 'name': 'HbA1c', 'code': 'HBA1C', 'description': 'Average blood glucose over the past 3 months.'},
        {'id': 9, 'name': 'Blood Glucose Test', 'code': 'GLUCOSE', 'description': 'Measures sugar levels in the blood.'},
        {'id': 10, 'name': 'ECG', 'code': 'ECG', 'description': 'Records the electrical signal from the heart.'},
        {'id': 11, 'name': 'Vitamin D', 'code': 'VITD', 'description': 'Measurement of 25-hydroxy vitamin D.'},
        {'id': 12, 'name': 'Vitamin B12', 'code': 'VITB12', 'description': 'Measurement of Vitamin B12 levels.'},
        {'id': 13, 'name': 'Chest X-Ray', 'code': 'CXRAY', 'description': 'Radiographic image of the chest.'},
        {'id': 14, 'name': 'Ultrasound', 'code': 'ULTRASOUND', 'description': 'Ultrasonic imaging.'},
    ]

    print(f"Checking for {len(tests)} lab tests...")
    created_count = 0
    for t_data in tests:
        obj, created = LabTest.objects.update_or_create(
            id=t_data['id'],
            defaults={'name': t_data['name'], 'code': t_data['code'], 'description': t_data['description']}
        )
        if created:
            created_count += 1
            print(f"Created: {t_data['name']}")
        else:
            print(f"Updated: {t_data['name']}")
    
    # Try to delete other tests that are not in our list
    allowed_ids = [t['id'] for t in tests]
    try:
        deleted, _ = LabTest.objects.exclude(id__in=allowed_ids).delete()
        if deleted:
            print(f"Removed {deleted} obsolete tests.")
    except Exception as e:
        print(f"Could not delete some obsolete tests due to protection: {e}")
    
    print(f"\nPopulation complete! Added {created_count} new tests.")
    print(f"Total tests in database: {LabTest.objects.all().count()}")

if __name__ == "__main__":
    populate_tests()
