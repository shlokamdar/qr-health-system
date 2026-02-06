from django.db import models
from django.conf import settings
from patients.models import Patient

class AccessLog(models.Model):
    class Action(models.TextChoices):
        VIEW_PROFILE = 'VIEW_PROFILE', 'View Profile'
        VIEW_RECORDS = 'VIEW_RECORDS', 'View Records'
        UPLOAD_RECORD = 'UPLOAD_RECORD', 'Upload Record'
        LOGIN = 'LOGIN', 'Login'
        CREATE_CONSULTATION = 'CREATE_CONSULTATION', 'Create Consultation'
        UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT', 'Upload Document'
        GRANT_ACCESS = 'GRANT_ACCESS', 'Grant Access'
        REVOKE_ACCESS = 'REVOKE_ACCESS', 'Revoke Access'
        CREATE_HEALTH_ID = 'CREATE_HEALTH_ID', 'Create Health ID'

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='actions')
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='access_logs')
    action = models.CharField(max_length=20, choices=Action.choices)
    details = models.TextField(blank=True, help_text="Additional context")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor} performed {self.action} on {self.timestamp}"
