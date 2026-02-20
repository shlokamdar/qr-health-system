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

class AdminDashboardStatsView(APIView):
    """
    Returns statistics for the admin dashboard.
    """
    permission_classes = [IsSuperUser]

    def get(self, request):
        stats = {
            'total_doctors': Doctor.objects.count(),
            'verified_doctors': Doctor.objects.filter(is_verified=True).count(),
            'pending_doctors': Doctor.objects.filter(is_verified=False).count(),
            'total_hospitals': Hospital.objects.count(),
            'total_labs': DiagnosticLab.objects.count(),
            'pending_labs': DiagnosticLab.objects.filter(is_verified=False).count(),
            'total_patients': Patient.objects.count(),
            'total_appointments': Appointment.objects.count(),
        }
        return Response(stats)
