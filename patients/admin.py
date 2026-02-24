from django.contrib import admin
from .models import (
    Patient, EmergencyContact, PatientDocument, 
    OldPrescription, SharingPermission
)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = (
        'health_id', 'get_full_name', 'blood_group', 
        'organ_donor_status', 'organ_donor_submitted_at', 'created_at'
    )
    readonly_fields = (
        'health_id', 'qr_code', 'created_at', 'updated_at',
        'organ_donor_submitted_at', 'organ_donor_verified_at'
    )
    list_filter = ['organ_donor_status', 'blood_group', 'created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'health_id', 'contact_number']
    actions = ['verify_organ_donor', 'reject_organ_donor']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Name'

    @admin.action(description='Approve selected Donor Declarations')
    def verify_organ_donor(self, request, queryset):
        from django.utils import timezone
        rows_updated = queryset.update(
            organ_donor_status='VERIFIED',
            organ_donor_verified_at=timezone.now()
        )
        self.message_user(request, f"{rows_updated} patients verified as organ donors.")

    @admin.action(description='Reject selected Donor Declarations')
    def reject_organ_donor(self, request, queryset):
        rows_updated = queryset.update(
            organ_donor_status='REJECTED',
            organ_donor_verified_at=None
        )
        self.message_user(request, f"{rows_updated} donor declarations rejected.")


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
