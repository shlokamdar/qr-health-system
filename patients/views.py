from rest_framework import viewsets, permissions, decorators, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Patient
from .serializers import PatientSerializer
from permissions.roles import IsDoctor, IsPatient, IsPatientOwner
from audit.models import AccessLog

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    lookup_field = 'health_id'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        if self.action == 'me':
            return [IsPatient()]
        if self.action == 'retrieve':
            # Allow Doctors to retrieve by ID (Scanning QR) or Patient to see own
            return [permissions.IsAuthenticated()] 
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Access Logging
        action_type = AccessLog.Action.VIEW_PROFILE
        
        # Check permissions manually for finer control and logging
        is_owner = instance.user == user
        is_doctor = user.role == 'DOCTOR'
        
        if is_owner or is_doctor:
            # Log the successful access
            AccessLog.objects.create(
                actor=user,
                patient=instance,
                action=action_type,
                details=f"Viewed profile of {instance.health_id}"
            )
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            # Log denied access
            AccessLog.objects.create(
                actor=user,
                patient=instance,
                action=action_type,
                details=f"Usage denied for {instance.health_id}"
            )
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    @decorators.action(detail=False, methods=['get'])
    def me(self, request):
        patient = get_object_or_404(Patient, user=request.user)
        serializer = self.get_serializer(patient)
        return Response(serializer.data)
