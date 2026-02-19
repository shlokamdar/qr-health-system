from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Patient

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_patient_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'PATIENT':
        Patient.objects.create(user=instance)

# New Signals for Access Control
from .models import SharingPermission
from utils.notifications import send_access_granted_email, send_access_revoked_email

@receiver(post_save, sender=SharingPermission)
def notify_access_grant_revoke(sender, instance, created, **kwargs):
    """
    Handle notifications for access granted or revoked.
    Note: Revoking via delete is handled by post_delete signal below.
    Revoking via update (is_active=False) is handled here.
    """
    if created:
        send_access_granted_email(instance.patient, instance.doctor, instance.access_type)
    else:
        # Check if revoked (assuming is_active changed to False, or we can check revoked_at)
        # But for now, let's just send revoked email if revoked_at is set?
        # Simpler: if not active and was active? Requires pre_save/fetching old instance.
        # Let's rely on explicit revoke method usage for now or check if just revoked.
        if instance.revoked_at and not instance.is_active:
             send_access_revoked_email(instance.patient, instance.doctor)

from django.db.models.signals import post_delete 
@receiver(post_delete, sender=SharingPermission)
def notify_access_deleted(sender, instance, **kwargs):
    """Notify if permission is deleted forcefully."""
    send_access_revoked_email(instance.patient, instance.doctor)
