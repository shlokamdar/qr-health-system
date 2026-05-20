from django.conf import settings
from rest_framework import viewsets, generics, permissions, status, decorators
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DiagnosticLab, LabTechnician, LabTest, LabReport
from patients.models import Patient
from .serializers import (
    DiagnosticLabSerializer, DiagnosticLabRegisterSerializer,
    LabTechnicianSerializer, LabTechnicianRegisterSerializer,
    LabTestSerializer, LabReportSerializer
)
from role_permissions.roles import IsLabTech, IsDoctor
from audit.models import AccessLog

class DiagnosticLabViewSet(viewsets.ModelViewSet):
    """ViewSet for DiagnosticLab CRUD operations."""
    queryset = DiagnosticLab.objects.all()
    serializer_class = DiagnosticLabSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'list']:
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
    serializer_class = LabReportSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLabTech()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'LAB_TECH':
            try:
                technician = LabTechnician.objects.get(user=user)
                return LabReport.objects.filter(technician=technician)
            except LabTechnician.DoesNotExist:
                return LabReport.objects.none()
        elif user.role == 'PATIENT':
            try:
                patient = Patient.objects.get(user=user)
                return LabReport.objects.filter(patient=patient)
            except Patient.DoesNotExist:
                return LabReport.objects.none()
        elif user.role == 'DOCTOR':
            # Show reports for patients who have granted access to this doctor
            return LabReport.objects.filter(
                patient__sharingpermission__doctor__user=user, 
                patient__sharingpermission__is_active=True
            ).distinct()
        
        return LabReport.objects.none()
    
    def perform_create(self, serializer):
        technician = get_object_or_404(LabTechnician, user=self.request.user)
        report = serializer.save(technician=technician)
        
        # Log the action
        AccessLog.objects.create(
            actor=self.request.user,
            patient=report.patient,
            action=AccessLog.Action.VIEW_RECORDS,
            details=f"Uploaded lab report: {report.test_type.name}"
        )


class LabRecentUploadsView(generics.ListAPIView):
    """View for technicians to see their recent uploads."""
    permission_classes = [IsLabTech]
    serializer_class = LabReportSerializer
    
    def get_queryset(self):
        technician = get_object_or_404(LabTechnician, user=self.request.user)
        return LabReport.objects.filter(technician=technician).order_by('-created_at')


class PatientLabReportsView(generics.ListAPIView):
    """Allows a verified lab tech or doctor to view all lab reports for a patient by health_id."""
    permission_classes = [(IsLabTech | IsDoctor)]
    serializer_class = LabReportSerializer

    def get_queryset(self):
        health_id = self.kwargs['health_id']
        patient = get_object_or_404(Patient, health_id=health_id)
        return LabReport.objects.filter(patient=patient).order_by('-created_at')


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
        reason = request.data.get('rejection_reason', '')
        
        lab.is_verified = verify
        if not verify:
            lab.rejection_reason = reason
        else:
            lab.rejection_reason = ""
        lab.save()

        if verify:
            # Find the technicians linked to this lab
            admin_techs = LabTechnician.objects.filter(lab=lab)
            admin_tech = admin_techs.first()
            
            # Verify all technicians for this lab
            admin_techs.update(is_verified=True)

            if admin_tech:
                print(f"\n{'='*60}")
                print(f"LAB APPROVED: {lab.name}")
                print(f"Admin Username: {admin_tech.user.username}")
                print(f"Admin Email:    {admin_tech.user.email}")
                print(f"Login at: {getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/login (select Lab Tech role)")
                print(f"{'='*60}\n")
                return Response({
                    "message": "Lab approved successfully.",
                    "credentials": {
                        "username": admin_tech.user.username,
                        "email": admin_tech.user.email,
                        "role": "Lab Technician"
                    }
                }, status=status.HTTP_200_OK)
            return Response({"message": "Lab approved successfully."}, status=status.HTTP_200_OK)
        
        return Response({"message": f"Lab rejected. Reason has been recorded."}, status=status.HTTP_200_OK)


class TechnicianListView(generics.ListAPIView):
    """View for admins to list all lab technicians."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = LabTechnicianSerializer
    queryset = LabTechnician.objects.all()


class TechnicianVerificationView(generics.UpdateAPIView):
    """View for admins to verify lab technicians."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = LabTechnicianSerializer
    queryset = LabTechnician.objects.all()
    
    def patch(self, request, *args, **kwargs):
        tech = self.get_object()
        verify = request.data.get('verify', False)
        reason = request.data.get('rejection_reason', '')
        
        tech.is_verified = verify
        if not verify:
            tech.rejection_reason = reason
        else:
            tech.rejection_reason = ""
        
        if 'lab' in request.data:
            lab_id = request.data.get('lab')
            if lab_id:
                lab = get_object_or_404(DiagnosticLab, id=lab_id)
                tech.lab = lab
            else:
                tech.lab = None
        
        tech.save()
        
        status_msg = "verified" if verify else "rejected"
        return Response({"message": f"Technician {status_msg} successfully"}, status=status.HTTP_200_OK)
