from django.core.management.base import BaseCommand
from labs.models import LabTest

LAB_TESTS = [
    {"name": "Complete Blood Count (CBC)", "code": "CBC"},
    {"name": "Lipid Profile", "code": "LIPID"},
    {"name": "Thyroid Function Test (TFT)", "code": "TFT"},
    {"name": "Urinalysis", "code": "URINE"},
    {"name": "COVID-19 RT-PCR", "code": "COVID_PCR"},
    {"name": "Liver Function Test (LFT)", "code": "LFT"},
    {"name": "Kidney Function Test (KFT)", "code": "KFT"},
    {"name": "HbA1c", "code": "HBA1C"},
    {"name": "Blood Glucose Test", "code": "GLUCOSE"},
    {"name": "ECG", "code": "ECG"},
    {"name": "Vitamin D", "code": "VIT_D"},
    {"name": "Vitamin B12", "code": "VIT_B12"},
    {"name": "Chest X-Ray", "code": "XRAY_CHEST"},
    {"name": "Ultrasound", "code": "ULTRASOUND"},
]


class Command(BaseCommand):
    help = "Seed the LabTest catalog with all 14 standard diagnostic test types."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for test in LAB_TESTS:
            obj, created = LabTest.objects.update_or_create(
                code=test["code"],
                defaults={"name": test["name"]},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  [CREATED] {obj}"))
            else:
                updated_count += 1
                self.stdout.write(f"  [EXISTS]  {obj}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! {created_count} created, {updated_count} already existed. "
                f"Total: {LabTest.objects.count()} lab tests in DB."
            )
        )
