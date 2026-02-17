
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation
from utils.notifications import send_consultation_notification

@receiver(post_save, sender=Consultation)
def notify_patient_consultation(sender, instance, created, **kwargs):
    if created:
        send_consultation_notification(instance.patient, instance)
