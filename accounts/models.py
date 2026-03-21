from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        PATIENT = 'PATIENT', _('Patient')
        DOCTOR = 'DOCTOR', _('Doctor')
        LAB_TECH = 'LAB_TECH', _('Lab Technician')
        HOSPITAL_ADMIN = 'HOSPITAL_ADMIN', _('Hospital Admin')
        ADMIN = 'ADMIN', _('Admin')

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT,
        help_text=_("User role for access control")
    )

    # Enforce a unique email across all users
    email = models.EmailField(
        _('email address'),
        unique=True,
        blank=False,
    )

    def save(self, *args, **kwargs):
        # Ensure superusers always have the ADMIN role
        if self.is_superuser and self.role != self.Role.ADMIN:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Notification(models.Model):
    """Generic notification model for all users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
