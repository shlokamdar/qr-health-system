from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'health_id', 'created_at')
    readonly_fields = ('health_id', 'qr_code')
