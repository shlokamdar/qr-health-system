from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from datetime import timedelta


class Patient(models.Model):
    """Patient profile with Health ID and QR code for quick access."""
    
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='patient_profile'
    )
    health_id = models.CharField(max_length=50, unique=True, blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    
    # New enhanced fields
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, blank=True)
    organ_donor = models.BooleanField(default=False, help_text=_("Willing to donate organs"))
    allergies = models.TextField(blank=True, help_text=_("Known allergies"))
    chronic_conditions = models.TextField(blank=True, help_text=_("Ongoing health conditions"))
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.health_id}"

    def save(self, *args, **kwargs):
        if not self.health_id:
            # Generate a unique Health ID (Simple version: UUID prefix)
            self.health_id = f"HID-{uuid.uuid4().hex[:8].upper()}"
        
        # Generate QR Code if it doesn't exist
        if not self.qr_code:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            # Encode the generic URL for fetching this patient's data
            # In production, use ACTUAL_DOMAIN from settings
            qr_data = f"http://localhost:8000/api/patients/{self.health_id}/"
            qr.add_data(qr_data)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            file_name = f"qr_{self.health_id}.png"
            self.qr_code.save(file_name, File(buffer), save=False)

        super().save(*args, **kwargs)


class EmergencyContact(models.Model):
    """Emergency contacts who can grant access on behalf of the patient."""
    
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='emergency_contacts'
    )
    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)
    can_grant_access = models.BooleanField(
        default=True, 
        help_text=_("Can share OTP on behalf of patient in emergencies")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.relationship}) for {self.patient.health_id}"


class PatientDocument(models.Model):
    """General documents uploaded by patients (reports, insurance, IDs)."""
    
    class DocumentType(models.TextChoices):
        REPORT = 'REPORT', _('Medical Report')
        INSURANCE = 'INSURANCE', _('Insurance Document')
        ID_PROOF = 'ID_PROOF', _('ID Proof')
        OTHER = 'OTHER', _('Other')
    
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=20, 
        choices=DocumentType.choices
    )
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='patient_documents/')
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.document_type}) - {self.patient.health_id}"

    class Meta:
        ordering = ['-uploaded_at']


class OldPrescription(models.Model):
    """Detailed prescription history uploaded by patients."""
    
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='old_prescriptions'
    )
    prescription_date = models.DateField()
    doctor_name = models.CharField(max_length=100, blank=True)
    hospital_name = models.CharField(max_length=200, blank=True)
    symptoms = models.TextField(help_text=_("Symptoms reported at the time"))
    diagnosis = models.TextField(blank=True)
    medicines = models.JSONField(
        default=list, 
        help_text=_("List of medicines with dosage, e.g., [{'name': 'Paracetamol', 'dosage': '500mg', 'frequency': 'twice daily'}]")
    )
    insights = models.TextField(blank=True, help_text=_("Doctor's notes/insights"))
    file = models.FileField(upload_to='old_prescriptions/', blank=True, null=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription from {self.prescription_date} - {self.patient.health_id}"

    class Meta:
        ordering = ['-prescription_date']


class SharingPermission(models.Model):
    """Access permissions granted to doctors - QR quick preview or OTP full access."""
    
    class AccessType(models.TextChoices):
        QR_QUICK = 'QR_QUICK', _('QR Quick Preview (24hr)')
        OTP_FULL = 'OTP_FULL', _('OTP Full Access')
        EMERGENCY = 'EMERGENCY', _('Emergency Access')
    
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='sharing_permissions'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor', 
        on_delete=models.CASCADE, 
        related_name='patient_permissions'
    )
    access_type = models.CharField(
        max_length=20, 
        choices=AccessType.choices, 
        default=AccessType.QR_QUICK
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='permissions_granted',
        help_text=_("Patient or Emergency Contact who granted access")
    )
    
    # Permission flags
    can_view_records = models.BooleanField(default=True)
    can_view_documents = models.BooleanField(default=False)
    can_add_records = models.BooleanField(
        default=False, 
        help_text=_("Only for OTP_FULL access")
    )
    
    # Status tracking
    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        status = "Active" if self.is_active else "Revoked"
        return f"{self.access_type}: {self.patient.health_id} -> Dr. {self.doctor.user.username} ({status})"

    def save(self, *args, **kwargs):
        # Auto-set expiry for QR_QUICK access (24 hours)
        if self.access_type == self.AccessType.QR_QUICK and not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        
        # Set permissions based on access type
        if self.access_type == self.AccessType.QR_QUICK:
            self.can_add_records = False
            self.can_view_documents = False
        elif self.access_type in [self.AccessType.OTP_FULL, self.AccessType.EMERGENCY]:
            self.can_add_records = True
            self.can_view_documents = True
        
        super().save(*args, **kwargs)

    def revoke(self):
        """Revoke this permission."""
        self.is_active = False
        self.revoked_at = timezone.now()
        self.save()

    @property
    def is_expired(self):
        """Check if the permission has expired."""
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False

    class Meta:
        ordering = ['-granted_at']


class OTPRequest(models.Model):
    """Temporary storage for OTPs requested by doctors."""
    
    doctor = models.ForeignKey(
        'doctors.Doctor', 
        on_delete=models.CASCADE, 
        related_name='otp_requests'
    )
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name='otp_requests'
    )
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"OTP for {self.patient.health_id} by Dr. {self.doctor.user.username}"

    @property
    def is_expired(self):
        # OTP valid for 10 minutes
        return timezone.now() > self.created_at + timedelta(minutes=10)
