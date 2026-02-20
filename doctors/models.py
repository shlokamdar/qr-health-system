from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Hospital(models.Model):
    """Hospital/Organization that doctors can be affiliated with."""
    name = models.CharField(max_length=200)
    address = models.TextField()
    registration_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    is_verified = models.BooleanField(
        default=False, 
        help_text=_("Set to True after superadmin approval")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Verified" if self.is_verified else "Pending"
        return f"{self.name} ({status})"

    class Meta:
        ordering = ['name']


class HospitalAdmin(models.Model):
    """Admin profile for a specific hospital."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hospital_admin_profile'
    )
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='admins'
    )
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Set to True after superadmin approval")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Admin: {self.user.get_full_name() or self.user.username} ({self.hospital.name})"


class Doctor(models.Model):
    """Extended doctor profile linked to User model."""
    
    class AuthorizationLevel(models.TextChoices):
        BASIC = 'BASIC', _('Basic')           # Can view basic profile only
        STANDARD = 'STANDARD', _('Standard')  # Can view records
        FULL = 'FULL', _('Full')              # Can view everything + sensitive data
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='doctor_profile'
    )
    hospital = models.ForeignKey(
        Hospital, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='doctors'
    )
    license_number = models.CharField(max_length=50, unique=True)
    issuing_medical_council = models.CharField(max_length=200, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    
    # Personal Details
    date_of_birth = models.DateField(null=True, blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    
    # Documents
    license_document = models.FileField(upload_to='doctor_documents/licenses/', blank=True, null=True)
    degree_certificate = models.FileField(upload_to='doctor_documents/degrees/', blank=True, null=True)
    identity_proof = models.FileField(upload_to='doctor_documents/ids/', blank=True, null=True)

    specialization = models.CharField(max_length=100)
    authorization_level = models.CharField(
        max_length=20,
        choices=AuthorizationLevel.choices, 
        default=AuthorizationLevel.BASIC
    )
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Set to True after superadmin approval")
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text=_("Reason for rejection, if applicable")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        hospital_name = self.hospital.name if self.hospital else "Independent"
        return f"Dr. {self.user.get_full_name() or self.user.username} ({hospital_name})"

    class Meta:
        ordering = ['user__last_name', 'user__first_name']


class Consultation(models.Model):
    """Record of a consultation between a doctor and patient."""
    
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='consultations'
    )
    patient = models.ForeignKey(
        'patients.Patient', 
        on_delete=models.CASCADE, 
        related_name='consultations'
    )
    consultation_date = models.DateTimeField()
    chief_complaint = models.TextField(help_text=_("Primary reason for visit"))
    diagnosis = models.TextField(blank=True)
    prescription = models.TextField(blank=True, help_text=_("Legacy text prescription or general notes"))
    medicines = models.JSONField(
        default=list, 
        blank=True, 
        help_text=_("List of medicines, e.g., [{'name': 'Paracetamol', 'dosage': '500mg', 'frequency': 'twice daily'}]")
    )
    notes = models.TextField(blank=True, help_text=_("Additional clinical notes"))
    follow_up_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation: {self.patient.health_id} with Dr. {self.doctor.user.username} on {self.consultation_date.date()}"

    class Meta:
        ordering = ['-consultation_date']


class Appointment(models.Model):
    """Appointment booking model."""
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        REJECTED = 'REJECTED', _('Rejected')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    patient = models.ForeignKey(
        'patients.Patient', 
        on_delete=models.CASCADE, 
        related_name='appointments'
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='appointments'
    )
    appointment_date = models.DateTimeField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    notes = models.TextField(blank=True, help_text=_("Doctor's notes"))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['appointment_date']

    def __str__(self):
        return f"Appointment: {self.patient.user.get_full_name()} with Dr. {self.doctor.user.get_full_name()} on {self.appointment_date}"
