from django.contrib import admin
from .models import (
    Patient, EmergencyContact, PatientDocument, 
    OldPrescription, SharingPermission
)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'health_id', 'blood_group', 'contact_number', 'created_at')
    readonly_fields = ('health_id', 'qr_code', 'created_at', 'updated_at')
    list_filter = ['blood_group', 'created_at']
    search_fields = ['user__username', 'health_id', 'contact_number']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'patient', 'relationship', 'phone', 'can_grant_access')
    list_filter = ['can_grant_access', 'relationship']
    search_fields = ['name', 'patient__health_id', 'phone']


@admin.register(PatientDocument)
class PatientDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'patient', 'document_type', 'uploaded_by', 'uploaded_at')
    list_filter = ['document_type', 'uploaded_at']
    search_fields = ['title', 'patient__health_id']


@admin.register(OldPrescription)
class OldPrescriptionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'prescription_date', 'doctor_name', 'hospital_name', 'uploaded_at')
    list_filter = ['prescription_date', 'uploaded_at']
    search_fields = ['patient__health_id', 'doctor_name', 'hospital_name', 'symptoms']


@admin.register(SharingPermission)
class SharingPermissionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'access_type', 'is_active', 'granted_at', 'expires_at')
    list_filter = ['access_type', 'is_active', 'granted_at']
    search_fields = ['patient__health_id', 'doctor__user__username']
    actions = ['revoke_permissions']
    
    @admin.action(description='Revoke selected permissions')
    def revoke_permissions(self, request, queryset):
        for permission in queryset:
            permission.revoke()
