from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import LabTechnician, LabTest, LabReport
from .serializers import (
    LabTechnicianSerializer, LabTechnicianRegisterSerializer,
    LabTestSerializer, LabReportSerializer
)
from patients.models import Patient
from audit.models import AccessLog

class IsLabTechnician(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LAB_TECH'

class LabTechnicianViewSet(viewsets.ModelViewSet):
    queryset = LabTechnician.objects.all()
    serializer_class = LabTechnicianSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return LabTechnicianRegisterSerializer
        return LabTechnicianSerializer


class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class LabReportViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsLabTechnician()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return LabReport.objects.filter(patient__user=user)
        elif user.role == 'LAB_TECH':
            return LabReport.objects.filter(technician__user=user)
        elif user.role == 'DOCTOR':
            # Doctors can see reports if they have access to the patient
            # This logic needs to align with SharingPermission 
            # ideally, we check individual patient access in retrieve
            return LabReport.objects.all() # Filtering should happen via patient filter
        return LabReport.objects.none()

    def perform_create(self, serializer):
        patient = serializer.validated_data['patient']
        report = serializer.save(technician=self.request.user.lab_profile)
        
        # Log Access
        AccessLog.objects.create(
            actor=self.request.user,
            patient=patient,
            action=AccessLog.Action.UPLOAD_DOCUMENT,
            details=f"Uploaded Lab Report: {report.test_type.name}"
        )
        
        # We could also send notification here!
