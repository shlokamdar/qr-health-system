
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LabReport
from utils.notifications import send_lab_report_notification

@receiver(post_save, sender=LabReport)
def notify_patient_lab_report(sender, instance, created, **kwargs):
    if created:
        send_lab_report_notification(instance.patient, instance)
