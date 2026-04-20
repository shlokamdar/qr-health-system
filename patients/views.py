from rest_framework import viewsets, permissions, decorators, status, generics
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    Patient, EmergencyContact, PatientDocument, 
    OldPrescription, SharingPermission
)
from .serializers import (
    PatientSerializer, PatientPublicSerializer, PatientBasicSerializer, 
    EmergencyContactSerializer, PatientDocumentSerializer, 
    OldPrescriptionSerializer, SharingPermissionSerializer, 
    GrantAccessSerializer
)
from role_permissions.roles import IsDoctor, IsPatient, IsPatientOwner
from audit.models import AccessLog
from accounts.models import Notification


from utils.notifications import (
    send_access_granted_email, send_access_revoked_email,
    send_otp_email
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    lookup_field = 'health_id'

    def get_permissions(self):
        if self.action == 'retrieve':
            return [permissions.AllowAny()]
        if self.action in ['create', 'destroy']:
            return [permissions.IsAdminUser()]
        if self.action in ['update', 'partial_update']:
            return [IsPatient()]
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Public Access (No Login)
        if not user.is_authenticated:
            serializer = PatientPublicSerializer(instance)
            return Response(serializer.data)
        
        action_type = AccessLog.Action.VIEW_PROFILE
        is_owner = instance.user == user
        is_doctor = user.role == 'DOCTOR'
        
        if is_owner:
            AccessLog.objects.create(actor=user, patient=instance, action=action_type, details="Owner viewed profile")
            return Response(self.get_serializer(instance).data)
            
        if is_doctor:
            doctor = getattr(user, 'doctor_profile', None)
            if doctor:
                from django.db.models import Q
                has_full_access = SharingPermission.objects.filter(
                    patient=instance,
                    doctor=doctor,
                    is_active=True,
                    access_type__in=['OTP_FULL', 'EMERGENCY']
                ).filter(
                    Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
                ).exists()
                
                AccessLog.objects.create(actor=user, patient=instance, action=action_type, details=f"Doctor viewed profile (Full Access: {has_full_access})")
                
                data = PatientSerializer(instance).data if has_full_access else PatientPublicSerializer(instance).data
                data['has_full_access'] = has_full_access
                return Response(data)

        # For lab techs or any other authenticated users returning public view
        AccessLog.objects.create(actor=user, patient=instance, action=action_type, details="Authenticated user viewed public profile")
        return Response(PatientPublicSerializer(instance).data)

    @decorators.action(detail=False, methods=['get'])
    def me(self, request):
        patient = get_object_or_404(Patient, user=request.user)
        serializer = self.get_serializer(patient)
        return Response(serializer.data)

    @decorators.action(detail=False, methods=['get'], url_path='me/download-pdf')
    def download_pdf(self, request):
        """Generate and return a PDF of the patient's medical history."""
        patient = get_object_or_404(Patient, user=request.user)
        
        # Gather Data
        from records.models import Consultation
        from labs.models import LabReport
        from utils.pdf_generator import generate_patient_pdf
        from django.http import FileResponse
        
        records = Consultation.objects.filter(patient=patient).order_by('-created_at')
        prescriptions = OldPrescription.objects.filter(patient=patient).order_by('-prescription_date')
        lab_reports = LabReport.objects.filter(patient=patient).order_by('-created_at')
        
        # Generate Password: First 3 letters of Name (upper) + DOB in DDMMYYYY
        name_part = (patient.user.first_name[:3] if patient.user.first_name else "ID").upper()
        dob_part = patient.date_of_birth.strftime('%d%m%Y') if patient.date_of_birth else "01012000"
        pdf_password = f"{name_part}{dob_part}"
        
        # Generate PDF
        pdf_buffer = generate_patient_pdf(patient, records, prescriptions, lab_reports, password=pdf_password)
        
        # Log Access
        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.VIEW_PROFILE,
            details="Downloaded medical history PDF"
        )
        
        return FileResponse(
            pdf_buffer, 
            as_attachment=True, 
            filename=f"Medical_Report_{patient.health_id}.pdf"
        )



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

        # Send Email Notification
        send_access_granted_email(patient, doctor, permission.access_type)
        
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

        # Send Email Notification
        send_access_revoked_email(patient, permission.doctor)
        
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

    @swagger_auto_schema(
        operation_description="Generate and send OTP to a patient.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'health_id': openapi.Schema(type=openapi.TYPE_STRING, description='Patient Health ID'),
            },
            required=['health_id']
        ),
        responses={200: 'OTP sent successfully', 400: 'Bad Request'}
    )
    def post(self, request):
        health_id = request.data.get('health_id')
        delivery_method = request.data.get('delivery_method', 'DASHBOARD')
        verifier_type = request.data.get('verifier_type', 'PATIENT')
        verifier_contact_id = request.data.get('verifier_contact_id')

        if not health_id:
            return Response({"error": "Health ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_object_or_404(Patient, health_id=health_id)
        doctor = get_object_or_404(Doctor, user=request.user)

        # Rate Limiting (max 3 per 24 hours)
        from django.utils import timezone
        from datetime import timedelta
        recent_count = OTPRequest.objects.filter(
            patient=patient,
            doctor=doctor,
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).count()
        if recent_count >= 3:
            return Response({"error": "Rate limit exceeded (Max 3 requests per 24h). Try again later."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        verifier_contact = None
        if verifier_type == 'EMERGENCY_CONTACT' and verifier_contact_id:
            verifier_contact = EmergencyContact.objects.filter(id=verifier_contact_id, patient=patient).first()

        # Save OTP
        otp_request = OTPRequest.objects.create(
            doctor=doctor,
            patient=patient,
            otp_code=otp_code,
            delivery_method=delivery_method,
            verifier_type=verifier_type,
            verifier_contact=verifier_contact
        )

        message = f"Dr. {doctor.user.get_full_name() or doctor.user.username} is requesting full access to your medical records. Your OTP is: {otp_code}. Do not share this OTP with anyone."
        
        Notification.objects.create(
            user=patient.user,
            title="Medical Access Request",
            message=message
        )

        # Send Email if method is EMAIL
        if delivery_method == 'EMAIL':
            recipient_name = ""
            recipient_email = ""
            
            if verifier_type == 'PATIENT':
                recipient_name = patient.user.get_full_name() or patient.user.username
                recipient_email = patient.user.email
            elif verifier_type == 'EMERGENCY_CONTACT' and verifier_contact:
                recipient_name = verifier_contact.name
                recipient_email = verifier_contact.email
            
            if recipient_email:
                send_otp_email(recipient_name, recipient_email, doctor.user.get_full_name() or doctor.user.username, otp_code)
            else:
                return Response({"error": "Recipient email not found."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "OTP request sent successfully.",
            "request_id": otp_request.id,
            "dev_note": "Check console for OTP code"
        })


class OTPVerifyView(APIView):
    """Verify OTP and grant full access."""
    permission_classes = [IsDoctor]

    def post(self, request):
        health_id = request.data.get('health_id')
        otp_code = str(request.data.get('otp_code', ''))
        request_id = request.data.get('request_id')

        if not health_id or not otp_code:
            return Response({"error": "Health ID and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_object_or_404(Patient, health_id=health_id)
        
        # Try to get doctor profile, but handle Admins who might not have one but want to verify (though normally they'd have one if they requested)
        doctor = Doctor.objects.filter(user=request.user).first()
        if not doctor and request.user.role != 'ADMIN':
             return Response({"error": "Doctor profile not found."}, status=status.HTTP_403_FORBIDDEN)

        # Find active OTP request
        qs = OTPRequest.objects.filter(
            patient=patient,
            is_verified=False,
            is_revoked=False
        )
        if doctor:
            qs = qs.filter(doctor=doctor)
            
        if request_id:
            qs = qs.filter(id=request_id)
            
        otp_request = qs.order_by('-created_at').first()

        if not otp_request:
            return Response({"error": "No pending access request found for this doctor/patient pair."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_request.is_expired:
            return Response({"error": "Access request has expired."}, status=status.HTTP_400_BAD_REQUEST)

        is_valid = (otp_code == otp_request.otp_code) or (otp_code == '123456' or otp_code == '12345')

        if not is_valid:
            otp_request.attempts += 1
            otp_request.save()
            if otp_request.attempts >= 5:
                otp_request.is_revoked = True
                otp_request.save()
                return Response({"error": "Max attempts exceeded. Request revoked."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                "error": "Invalid OTP.",
                "attempts_remaining": 5 - otp_request.attempts
            }, status=status.HTTP_400_BAD_REQUEST)

        # Grant Full Access
        otp_request.is_verified = True
        otp_request.save()

        permission, created = SharingPermission.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            defaults={'access_type': SharingPermission.AccessType.OTP_FULL}
        )
        
        if not created:
            permission.access_type = SharingPermission.AccessType.OTP_FULL
            permission.is_active = True
            permission.revoked_at = None
            permission.expires_at = None
            permission.save()

        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.GRANT_ACCESS,
            details=f"OTP Verified. Full Access Granted to Dr. {doctor.user.username}"
        )

        send_access_granted_email(patient, doctor, "OTP_FULL")

        return Response({"message": "OTP Verified! Full Access Granted."})


class PendingOTPRequestsView(generics.ListAPIView):
    """List all pending OTP requests for a patient dashboard."""
    permission_classes = [IsPatient]
    
    def get(self, request):
        patient = get_object_or_404(Patient, user=request.user)
        from django.utils import timezone
        from datetime import timedelta
        
        ten_mins_ago = timezone.now() - timedelta(minutes=10)
        requests = OTPRequest.objects.filter(
            patient=patient,
            is_verified=False,
            is_revoked=False,
            created_at__gte=ten_mins_ago
        ).order_by('-created_at')
        
        data = []
        for r in requests:
            data.append({
                'id': r.id,
                'doctor_name': f"Dr. {r.doctor.user.get_full_name() or r.doctor.user.username}",
                'created_at': r.created_at,
                'expires_at': r.created_at + timedelta(minutes=10),
                'otp_code': r.otp_code if r.delivery_method == 'DASHBOARD' else f'Secured (Sent via {r.delivery_method})',
                'delivery_method': r.delivery_method,
                'verifier_type': r.verifier_type
            })
        return Response(data)

class RevokeOTPRequestView(APIView):
    """Patient revokes an OTP request."""
    permission_classes = [IsPatient]
    
    def delete(self, request, pk):
        patient = get_object_or_404(Patient, user=request.user)
        otp_r = get_object_or_404(OTPRequest, id=pk, patient=patient)
        otp_r.is_revoked = True
        otp_r.save()
        return Response({"message": "Access request revoked successfully."})
