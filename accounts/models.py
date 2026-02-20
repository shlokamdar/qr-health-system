from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        PATIENT = 'PATIENT', _('Patient')
        DOCTOR = 'DOCTOR', _('Doctor')
        LAB_TECH = 'LAB_TECH', _('Lab Technician')
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

    def __str__(self):
        return f"{self.username} ({self.role})"
