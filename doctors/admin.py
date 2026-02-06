from django.contrib import admin
from .models import Hospital, Doctor, Consultation


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'registration_number', 'is_verified', 'created_at']
    list_filter = ['is_verified']
    search_fields = ['name', 'registration_number', 'email']
    actions = ['verify_hospitals']
    
    @admin.action(description='Verify selected hospitals')
    def verify_hospitals(self, request, queryset):
        queryset.update(is_verified=True)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['user', 'hospital', 'license_number', 'specialization', 'authorization_level', 'is_verified']
    list_filter = ['is_verified', 'authorization_level', 'hospital']
    search_fields = ['user__username', 'user__email', 'license_number']
    actions = ['verify_doctors', 'set_basic_auth', 'set_standard_auth', 'set_full_auth']
    
    @admin.action(description='Verify selected doctors')
    def verify_doctors(self, request, queryset):
        queryset.update(is_verified=True)
    
    @admin.action(description='Set authorization level to BASIC')
    def set_basic_auth(self, request, queryset):
        queryset.update(authorization_level='BASIC')
    
    @admin.action(description='Set authorization level to STANDARD')
    def set_standard_auth(self, request, queryset):
        queryset.update(authorization_level='STANDARD')
    
    @admin.action(description='Set authorization level to FULL')
    def set_full_auth(self, request, queryset):
        queryset.update(authorization_level='FULL')


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'consultation_date', 'chief_complaint', 'follow_up_date']
    list_filter = ['consultation_date', 'doctor']
    search_fields = ['patient__health_id', 'doctor__user__username', 'chief_complaint']
    date_hierarchy = 'consultation_date'
