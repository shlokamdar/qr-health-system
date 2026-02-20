from rest_framework import viewsets, generics, permissions, status, decorators
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DiagnosticLab, LabTechnician, LabTest, LabReport
from .serializers import (
    DiagnosticLabSerializer, DiagnosticLabRegisterSerializer,
    LabTechnicianSerializer, LabTechnicianRegisterSerializer,
    LabTestSerializer, LabReportSerializer
)
from role_permissions.roles import IsLabTech
from audit.models import AccessLog

class DiagnosticLabViewSet(viewsets.ModelViewSet):
    """ViewSet for DiagnosticLab CRUD operations."""
    queryset = DiagnosticLab.objects.all()
    serializer_class = DiagnosticLabSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DiagnosticLabRegisterSerializer
        return DiagnosticLabSerializer
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return DiagnosticLab.objects.all()
        return DiagnosticLab.objects.filter(is_verified=True)


class LabTechnicianRegisterView(generics.CreateAPIView):
    """View for lab technician registration."""
    permission_classes = [permissions.AllowAny]
    serializer_class = LabTechnicianRegisterSerializer


class LabTechnicianProfileView(generics.RetrieveUpdateAPIView):
    """View for current lab technician's profile."""
    permission_classes = [IsLabTech]
    serializer_class = LabTechnicianSerializer
    
    def get_object(self):
        return get_object_or_404(LabTechnician, user=self.request.user)


class LabTestListView(generics.ListAPIView):
    """View for listing available lab tests."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LabTestSerializer
    queryset = LabTest.objects.all()


class LabReportViewSet(viewsets.ModelViewSet):
    """ViewSet for LabReport CRUD operations."""
    permission_classes = [IsLabTech]
    serializer_class = LabReportSerializer
    
    def get_queryset(self):
        technician = get_object_or_404(LabTechnician, user=self.request.user)
        return LabReport.objects.filter(technician=technician)
    
    def perform_create(self, serializer):
        technician = get_object_or_404(LabTechnician, user=self.request.user)
        report = serializer.save(technician=technician)
        
        # Log the action
        AccessLog.objects.create(
            actor=self.request.user,
            patient=report.patient,
            action=AccessLog.Action.VIEW_RECORDS, # Or add a new action type if needed
            details=f"Uploaded lab report: {report.test_type.name}"
        )


class LabRecentUploadsView(generics.ListAPIView):
    """View for technicians to see their recent uploads."""
    permission_classes = [IsLabTech]
    serializer_class = LabReportSerializer
    
    def get_queryset(self):
        technician = get_object_or_404(LabTechnician, user=self.request.user)
        return LabReport.objects.filter(technician=technician).order_by('-created_at')


# Admin specific views
class LabListView(generics.ListAPIView):
    """View for admins to list all diagnostic labs."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = DiagnosticLabSerializer
    queryset = DiagnosticLab.objects.all()


class LabVerificationView(generics.UpdateAPIView):
    """View for admins to verify diagnostic labs."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = DiagnosticLabSerializer
    queryset = DiagnosticLab.objects.all()
    
    def patch(self, request, *args, **kwargs):
        lab = self.get_object()
        verify = request.data.get('verify', False)
        lab.is_verified = verify
        lab.save()
        
        status = "verified" if verify else "unverified"
        return Response({"message": f"Lab {status} successfully"}, status=status.HTTP_200_OK)
