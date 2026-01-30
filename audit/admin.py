from django.contrib import admin
from .models import AccessLog

@admin.register(AccessLog)
class AccessLogAdmin(admin.ModelAdmin):
    list_display = ('actor', 'patient', 'action', 'timestamp')
    list_filter = ('action', 'timestamp')
    readonly_fields = ('actor', 'patient', 'action', 'details', 'ip_address', 'timestamp')
