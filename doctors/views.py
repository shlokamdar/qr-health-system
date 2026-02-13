from rest_framework import viewsets, generics, permissions, status, decorators
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Hospital, Doctor, Consultation, Appointment
from .serializers import (
    HospitalSerializer, HospitalRegisterSerializer,
    DoctorSerializer, DoctorRegisterSerializer,
    ConsultationSerializer, ConsultationCreateSerializer,
    AppointmentSerializer
)
from permissions.roles import IsDoctor
from audit.models import AccessLog
from patients.models import Patient
from accounts.serializers import UserSerializer


class HospitalViewSet(viewsets.ModelViewSet):
    """ViewSet for Hospital CRUD operations."""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            # Anyone can register a hospital (pending approval)
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            # Only superadmin can modify hospitals
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return HospitalRegisterSerializer
        return HospitalSerializer
    
    def get_queryset(self):
        user = self.request.user
        if self.request.user.is_staff:
            return Hospital.objects.all()
        # Non-admin users only see verified hospitals
        return Hospital.objects.filter(is_verified=True)


class DoctorRegisterView(generics.CreateAPIView):
    """View for doctor registration."""
    permission_classes = [permissions.AllowAny]
    serializer_class = DoctorRegisterSerializer


class DoctorProfileView(generics.RetrieveUpdateAPIView):
    """View for current doctor's profile."""
    permission_classes = [IsDoctor]
    serializer_class = DoctorSerializer
    
    def get_object(self):
        return get_object_or_404(Doctor, user=self.request.user)


class DoctorRegisterPatientView(generics.CreateAPIView):
    """View for doctors to register new patients."""
    permission_classes = [IsDoctor]
    
    def post(self, request, *args, **kwargs):
        from accounts.serializers import RegisterSerializer
        from patients.serializers import PatientSerializer
        
        # Create user first
        user_data = {
            'username': request.data.get('username'),
            'password': request.data.get('password'),
            'email': request.data.get('email', ''),
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'role': 'PATIENT'
        }
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.create_user(**user_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create patient profile
        patient_data = {
            'date_of_birth': request.data.get('date_of_birth'),
            'contact_number': request.data.get('contact_number', ''),
            'address': request.data.get('address', ''),
            'blood_group': request.data.get('blood_group', ''),
        }
        
        patient = Patient.objects.create(user=user, **patient_data)
        
        # Log the action
        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.CREATE_HEALTH_ID,
            details=f"Doctor registered patient with Health ID: {patient.health_id}"
        )
        
        serializer = PatientSerializer(patient)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DoctorListView(generics.ListAPIView):
    """View for admins to list all doctors (verified and unverified)."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = DoctorSerializer
    queryset = Doctor.objects.all().order_by('-user__date_joined')


class VerifiedDoctorListView(generics.ListAPIView):
    """View for patients to list verified doctors."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DoctorSerializer
    queryset = Doctor.objects.filter(is_verified=True).order_by('user__first_name')


class DoctorVerificationView(generics.UpdateAPIView):
    """View to verify/update doctor status."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = DoctorSerializer
    queryset = Doctor.objects.all()
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        doctor = self.get_object()
        
        if 'verify' in request.data:
            doctor.is_verified = True
            doctor.save()
            return Response({'message': 'Doctor verified successfully'})
            
        if 'auth_level' in request.data:
            level = request.data.get('auth_level')
            if level in ['BASIC', 'STANDARD', 'FULL']:
                doctor.authorization_level = level
                doctor.save()
                return Response({'message': f'Authorization level set to {level}'})
            return Response({'error': 'Invalid authorization level'}, status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)


        return super().update(request, *args, **kwargs)


class HospitalListView(generics.ListAPIView):
    """View for admins to list all hospitals."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = HospitalSerializer
    queryset = Hospital.objects.all().order_by('name')


class HospitalVerificationView(generics.UpdateAPIView):
    """View to verify hospital status."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = HospitalSerializer
    queryset = Hospital.objects.all()
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        hospital = self.get_object()
        
        if 'verify' in request.data:
            hospital.is_verified = True
            hospital.save()
            return Response({'message': 'Hospital verified successfully'})
            
        return super().update(request, *args, **kwargs)


from utils.notifications import send_record_uploaded_email

class ConsultationViewSet(viewsets.ModelViewSet):
    """ViewSet for Consultation CRUD operations."""
    permission_classes = [IsDoctor]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConsultationCreateSerializer
        return ConsultationSerializer
    
    def get_queryset(self):
        doctor = get_object_or_404(Doctor, user=self.request.user)
        queryset = Consultation.objects.filter(doctor=doctor)
        
        # Filter by patient if provided
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient__health_id=patient_id)
        
        return queryset
    
    def perform_create(self, serializer):
        consultation = serializer.save()
        
        # Log the action
        AccessLog.objects.create(
            actor=self.request.user,
            patient=consultation.patient,
            action=AccessLog.Action.CREATE_CONSULTATION,
            details=f"Created consultation: {consultation.chief_complaint[:50]}"
        )

        # Send Email Notification
        doctor_name = self.request.user.get_full_name() or self.request.user.username
        send_record_uploaded_email(consultation.patient, "Consultation Record", doctor_name)


class PatientHistoryView(generics.ListAPIView):
    """View for getting consultation history for a specific patient."""
    permission_classes = [IsDoctor]
    serializer_class = ConsultationSerializer
    
    def get_queryset(self):
        health_id = self.kwargs.get('health_id')
        patient = get_object_or_404(Patient, health_id=health_id)
        
        # Log access
        AccessLog.objects.create(
            actor=self.request.user,
            patient=patient,
            action=AccessLog.Action.VIEW_RECORDS,
            details="Viewed consultation history"
        )
        
        return Consultation.objects.filter(patient=patient)


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Appointment booking and management."""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        if hasattr(user, 'patient_profile'):
            return Appointment.objects.filter(patient=user.patient_profile)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        # Patient booking an appointment
        if hasattr(self.request.user, 'patient_profile'):
            serializer.save(patient=self.request.user.patient_profile)
        else:
            # Doctors/Admins usually don't book for themselves in this flow, but fallback
            serializer.save()

    def update(self, request, *args, **kwargs):
        # Allow partial updates for status change
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
