from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Consultation, Doctor, Hospital
from utils.notifications import (
    send_consultation_notification, 
    send_doctor_registration_email, 
    send_doctor_approved_email,
    send_hospital_registration_email,
    send_hospital_approved_email
)

@receiver(post_save, sender=Consultation)
def notify_patient_consultation(sender, instance, created, **kwargs):
    if created:
        send_consultation_notification(instance.patient, instance)

@receiver(post_save, sender=Doctor)
def notify_doctor_onboarding(sender, instance, created, **kwargs):
    if created:
        send_doctor_registration_email(instance)

@receiver(post_save, sender=Hospital)
def notify_hospital_registration(sender, instance, created, **kwargs):
    if created:
        send_hospital_registration_email(instance)

@receiver(pre_save, sender=Doctor)
def doctor_verification_shapshot(sender, instance, **kwargs):
    """Capture verification status before saving."""
    if instance.pk:
        instance._previous_is_verified = Doctor.objects.get(pk=instance.pk).is_verified
    else:
        instance._previous_is_verified = False

@receiver(post_save, sender=Doctor)
def notify_doctor_approval(sender, instance, created, **kwargs):
    """Notify doctor if they just got verified."""
    if not created and hasattr(instance, '_previous_is_verified'):
        if instance.is_verified and not instance._previous_is_verified:
            send_doctor_approved_email(instance)

@receiver(pre_save, sender=Hospital)
def hospital_verification_snapshot(sender, instance, **kwargs):
    """Capture verification status before saving."""
    if instance.pk:
        try:
            instance._previous_is_verified = Hospital.objects.get(pk=instance.pk).is_verified
        except Hospital.DoesNotExist:
            instance._previous_is_verified = False
    else:
        instance._previous_is_verified = False

@receiver(post_save, sender=Hospital)
def notify_hospital_approval(sender, instance, created, **kwargs):
    """Notify hospital admins if they just got verified."""
    if not created and hasattr(instance, '_previous_is_verified'):
        if instance.is_verified and not instance._previous_is_verified:
            from .models import HospitalAdmin
            
            # Find and verify all admins for this hospital
            admins = HospitalAdmin.objects.filter(hospital=instance)
            for admin_profile in admins:
                if not admin_profile.is_verified:
                    admin_profile.is_verified = True
                    admin_profile.save()
                send_hospital_approved_email(admin_profile)
