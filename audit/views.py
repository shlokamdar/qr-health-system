from rest_framework import viewsets, permissions
from .models import AccessLog
from .serializers import AccessLogSerializer

class IsSuperUser(permissions.BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows audit logs to be viewed by superusers.
    """
    queryset = AccessLog.objects.all().order_by('-timestamp')
    serializer_class = AccessLogSerializer
    permission_classes = [IsSuperUser]
    filterset_fields = ['action', 'actor', 'patient']
    search_fields = ['details', 'ip_address', 'actor__username', 'patient__health_id']


from rest_framework.views import APIView
from rest_framework.response import Response
from doctors.models import Doctor, Hospital, Appointment
from patients.models import Patient
from labs.models import DiagnosticLab
from django.contrib.auth import get_user_model
User = get_user_model()

class AdminDashboardStatsView(APIView):
    """
    Returns statistics for the admin dashboard.
    """
    permission_classes = [IsSuperUser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        from django.db.models.functions import TruncDate
        
        last_7_days = timezone.now() - timedelta(days=7)
        
        # Calculate trends for Doctors (could be combined for all users if preferred)
        trends_data = User.objects.filter(date_joined__gte=last_7_days) \
            .annotate(date=TruncDate('date_joined')) \
            .values('date') \
            .annotate(count=Count('id')) \
            .order_by('date')
            
        # Format trends for frontend (Chart.js/Recharts)
        trends = []
        for i in range(7):
            date = (timezone.now() - timedelta(days=6-i)).date()
            match = next((t for t in trends_data if t['date'] == date), None)
            trends.append({
                'name': date.strftime('%a'),
                'value': match['count'] if match else 0
            })

        stats = {
            'total_doctors': Doctor.objects.count(),
            'verified_doctors': Doctor.objects.filter(is_verified=True).count(),
            'pending_doctors': Doctor.objects.filter(is_verified=False).count(),
            'total_hospitals': Hospital.objects.count(),
            'total_labs': DiagnosticLab.objects.count(),
            'pending_labs': DiagnosticLab.objects.filter(is_verified=False).count(),
            'total_patients': Patient.objects.count(),
            'total_appointments': Appointment.objects.count(),
            'registration_trends': trends
        }
        return Response(stats)


from django.core import serializers
from django.http import HttpResponse
from itertools import chain

class SystemBackupView(APIView):
    """
    Triggers a database backup for system administrators.
    """
    permission_classes = [IsSuperUser]

    def get(self, request):
        users = User.objects.all()
        patients = Patient.objects.all()
        doctors = Doctor.objects.all()
        hospitals = Hospital.objects.all()
        labs = DiagnosticLab.objects.all()
        
        # Serialize database records to JSON
        data = serializers.serialize('json', chain(users, patients, doctors, hospitals, labs))
        
        response = HttpResponse(data, content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="pulseid_backup.json"'
        return response
