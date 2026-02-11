from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from doctors.models import Doctor, Hospital, Consultation
from patients.models import Patient

User = get_user_model()


class AdminDashboardStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        data = {
            'total_patients': Patient.objects.count(),
            'total_doctors': Doctor.objects.count(),
            'total_hospitals': Hospital.objects.count(),
            'total_consultations': Consultation.objects.count(),
            'pending_hospitals': Hospital.objects.filter(is_verified=False).count(),
            'pending_doctors': Doctor.objects.filter(is_verified=False).count(),
            'recent_users': User.objects.order_by('-date_joined')[:5].values('username', 'role', 'date_joined')
        }
        return Response(data)
