from rest_framework import viewsets, permissions, decorators, status, generics
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    Patient, EmergencyContact, PatientDocument, 
    OldPrescription, SharingPermission
)
from .serializers import (
    PatientSerializer, PatientBasicSerializer, EmergencyContactSerializer,
    PatientDocumentSerializer, OldPrescriptionSerializer,
    SharingPermissionSerializer, GrantAccessSerializer
)
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
            
            # For doctors, check authorization level for sensitive fields
            if is_doctor and not is_owner:
                try:
                    doctor = user.doctor_profile
                    if doctor.authorization_level == 'BASIC':
                        serializer = PatientBasicSerializer(instance)
                        return Response(serializer.data)
                except:
                    pass
            
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


class EmergencyContactViewSet(viewsets.ModelViewSet):
    """ViewSet for patient's emergency contacts."""
    serializer_class = EmergencyContactSerializer
    permission_classes = [IsPatient]
    
    def get_queryset(self):
        patient = get_object_or_404(Patient, user=self.request.user)
        return EmergencyContact.objects.filter(patient=patient)
    
    def perform_create(self, serializer):
        patient = get_object_or_404(Patient, user=self.request.user)
        serializer.save(patient=patient)


class PatientDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for patient documents."""
    serializer_class = PatientDocumentSerializer
    permission_classes = [IsPatient]
    
    def get_queryset(self):
        patient = get_object_or_404(Patient, user=self.request.user)
        return PatientDocument.objects.filter(patient=patient)
    
    def perform_create(self, serializer):
        patient = get_object_or_404(Patient, user=self.request.user)
        serializer.save(patient=patient, uploaded_by=self.request.user)
        
        # Log the action
        AccessLog.objects.create(
            actor=self.request.user,
            patient=patient,
            action=AccessLog.Action.UPLOAD_DOCUMENT,
            details=f"Uploaded document: {serializer.validated_data.get('title')}"
        )


class OldPrescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for old prescriptions."""
    serializer_class = OldPrescriptionSerializer
    permission_classes = [IsPatient]
    
    def get_queryset(self):
        patient = get_object_or_404(Patient, user=self.request.user)
        return OldPrescription.objects.filter(patient=patient)
    
    def perform_create(self, serializer):
        patient = get_object_or_404(Patient, user=self.request.user)
        serializer.save(patient=patient, uploaded_by=self.request.user)
        
        # Log the action
        AccessLog.objects.create(
            actor=self.request.user,
            patient=patient,
            action=AccessLog.Action.UPLOAD_DOCUMENT,
            details=f"Uploaded old prescription from {serializer.validated_data.get('prescription_date')}"
        )


class SharingPermissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing sharing permissions."""
    serializer_class = SharingPermissionSerializer
    permission_classes = [IsPatient]
    
    def get_queryset(self):
        patient = get_object_or_404(Patient, user=self.request.user)
        return SharingPermission.objects.filter(patient=patient)
    
    @decorators.action(detail=False, methods=['post'])
    def grant(self, request):
        """Grant access to a doctor."""
        serializer = GrantAccessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        patient = get_object_or_404(Patient, user=request.user)
        
        from doctors.models import Doctor
        doctor = Doctor.objects.get(id=serializer.validated_data['doctor_id'])
        
        permission = SharingPermission.objects.create(
            patient=patient,
            doctor=doctor,
            access_type=serializer.validated_data['access_type'],
            granted_by=request.user
        )
        
        # Log the action
        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.GRANT_ACCESS,
            details=f"Granted {permission.access_type} access to Dr. {doctor.user.username}"
        )
        
        return Response(
            SharingPermissionSerializer(permission).data, 
            status=status.HTTP_201_CREATED
        )
    
    @decorators.action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke a specific permission."""
        patient = get_object_or_404(Patient, user=request.user)
        permission = get_object_or_404(SharingPermission, pk=pk, patient=patient)
        
        permission.revoke()
        
        # Log the action
        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.REVOKE_ACCESS,
            details=f"Revoked access from Dr. {permission.doctor.user.username}"
        )
        
        return Response({"detail": "Access revoked successfully."})


class SharingHistoryView(generics.ListAPIView):
    """View for patient to see their access history."""
    permission_classes = [IsPatient]
    
    def get(self, request):
        patient = get_object_or_404(Patient, user=request.user)
        logs = AccessLog.objects.filter(patient=patient).order_by('-timestamp')[:50]
        
        data = [
            {
                'actor': log.actor.username if log.actor else 'Unknown',
                'action': log.get_action_display(),
                'details': log.details,
                'timestamp': log.timestamp
            }
            for log in logs
        ]
        
        return Response(data)


from rest_framework.views import APIView
from .models import OTPRequest
from doctors.models import Doctor
import random

class OTPRequestView(APIView):
    """Generate and send OTP to patient."""
    permission_classes = [IsDoctor]

    def post(self, request):
        health_id = request.data.get('health_id')
        if not health_id:
            return Response({"error": "Health ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_object_or_404(Patient, health_id=health_id)
        doctor = get_object_or_404(Doctor, user=request.user)

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Save OTP
        OTPRequest.objects.create(
            doctor=doctor,
            patient=patient,
            otp_code=otp_code
        )

        # In production, send via SMS/Email
        print(f"==========================================")
        print(f"OTP for {patient.health_id}: {otp_code}")
        print(f"==========================================")

        return Response({
            "message": "OTP sent successfully to patient's registered contact.",
            "dev_note": "Check console for OTP code"
        })


class OTPVerifyView(APIView):
    """Verify OTP and grant full access."""
    permission_classes = [IsDoctor]

    def post(self, request):
        health_id = request.data.get('health_id')
        otp_code = request.data.get('otp_code')

        if not health_id or not otp_code:
            return Response({"error": "Health ID and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_object_or_404(Patient, health_id=health_id)
        doctor = get_object_or_404(Doctor, user=request.user)

        # Find valid OTP
        otp_request = OTPRequest.objects.filter(
            doctor=doctor,
            patient=patient,
            otp_code=otp_code,
            is_verified=False
        ).order_by('-created_at').first()

        if not otp_request:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if otp_request.is_expired:
            return Response({"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as verified
        otp_request.is_verified = True
        otp_request.save()

        # Grant Full Access
        permission, created = SharingPermission.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            defaults={'access_type': SharingPermission.AccessType.OTP_FULL}
        )
        
        if not created:
            permission.access_type = SharingPermission.AccessType.OTP_FULL
            permission.is_active = True
            permission.revoked_at = None
            permission.expires_at = None # Full access might not expire or have long expiry
            permission.save()

        # Log Access
        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.GRANT_ACCESS,
            details=f"OTP Verified. Full Access Granted to Dr. {doctor.user.username}"
        )

        return Response({"message": "OTP Verified! Full Access Granted."})
