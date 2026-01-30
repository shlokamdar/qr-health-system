from django.db import models
from django.conf import settings
from patients.models import Patient

class MedicalRecord(models.Model):
    class RecordType(models.TextChoices):
        PRESCRIPTION = 'PRESCRIPTION', 'Prescription'
        DIAGNOSIS = 'DIAGNOSIS', 'Diagnosis'
        LAB_REPORT = 'LAB_REPORT', 'Lab Report'
        VISIT_NOTE = 'VISIT_NOTE', 'Visit Note'

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='records')
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='uploaded_records'
    )
    record_type = models.CharField(max_length=20, choices=RecordType.choices)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='records/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.record_type} for {self.patient.health_id} by {self.doctor}"
