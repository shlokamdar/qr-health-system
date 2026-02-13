from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from doctors.models import Hospital

class LabTechnician(models.Model):
    """
    Profile for Lab Technicians.
    Can be independent or attached to a Hospital.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='lab_profile'
    )
    hospital = models.ForeignKey(
        Hospital, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='lab_technicians'
    )
    license_number = models.CharField(max_length=50, unique=True)
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Set to True after admin approval")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Lab Tech: {self.user.get_full_name() or self.user.username} ({self.license_number})"


class LabTest(models.Model):
    """
    Catalog of available lab tests.
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    normal_range = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class LabReport(models.Model):
    """
    A specific lab report for a patient.
    """
    patient = models.ForeignKey(
        'patients.Patient', 
        on_delete=models.CASCADE, 
        related_name='lab_reports'
    )
    technician = models.ForeignKey(
        LabTechnician, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='reports'
    )
    test_type = models.ForeignKey(
        LabTest, 
        on_delete=models.PROTECT, 
        related_name='reports'
    )
    file = models.FileField(upload_to='lab_reports/', null=True, blank=True)
    result_data = models.JSONField(default=dict, blank=True)
    comments = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report: {self.test_type.name} for {self.patient.health_id}"
