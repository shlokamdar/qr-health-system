from rest_framework import viewsets, generics, permissions, status, decorators
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
    HospitalSerializer, HospitalDetailSerializer, HospitalRegisterSerializer,
    DoctorSerializer, DoctorRegisterSerializer,
    DepartmentSerializer,
    ConsultationSerializer, ConsultationCreateSerializer,
    AppointmentSerializer
)
from role_permissions.roles import IsDoctor, IsHospitalAdmin
from patients.models import Patient
from accounts.serializers import UserSerializer
from labs.models import DiagnosticLab, LabTechnician
from labs.serializers import LabTechnicianSerializer, LabTechnicianRegisterSerializer


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
    
        if self.action == 'retrieve':
            return HospitalDetailSerializer
        # Non-admin users only see verified hospitals
        return Hospital.objects.filter(is_verified=True)


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Department management by Hospital Admins."""
    serializer_class = DepartmentSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return admin_profile.hospital.departments.all()

    def perform_create(self, serializer):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        serializer.save(hospital=admin_profile.hospital)


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
        from audit.models import AccessLog
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
            is_verified = request.data.get('verify', False)
            doctor.is_verified = bool(is_verified)
            if not doctor.is_verified:
                # Save rejection reason when rejecting
                doctor.rejection_reason = request.data.get('rejection_reason', '')
            else:
                # Clear rejection reason on approval
                doctor.rejection_reason = ''
            doctor.save()
            action = 'verified' if doctor.is_verified else 'rejected'
            return Response({'message': f'Doctor {action} successfully'})
            
            return Response({'error': 'Invalid authorization level'}, status=status.HTTP_400_BAD_REQUEST)

        if 'hospital' in request.data:
            hospital_id = request.data.get('hospital')
            if hospital_id:
                hospital = get_object_or_404(Hospital, id=hospital_id)
                doctor.hospital = hospital
            else:
                doctor.hospital = None
            doctor.save()
            return Response({'message': 'Doctor hospital assignment updated'})

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

class HospitalMeView(generics.RetrieveUpdateAPIView):
    """View for current hospital admin's hospital profile."""
    permission_classes = [IsHospitalAdmin]
    serializer_class = HospitalSerializer

    def get_object(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return admin_profile.hospital


class HospitalDoctorListView(generics.ListAPIView):
    """List all doctors affiliated with the current hospital."""
    permission_classes = [IsHospitalAdmin]
    serializer_class = DoctorSerializer

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return Doctor.objects.filter(hospital=admin_profile.hospital)


class HospitalLabListView(generics.ListAPIView):
    """List all labs affiliated with the current hospital."""
    permission_classes = [IsHospitalAdmin]

    def get_serializer_class(self):
        from labs.serializers import DiagnosticLabSerializer
        return DiagnosticLabSerializer

    def get_queryset(self):
        from labs.models import DiagnosticLab
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return DiagnosticLab.objects.filter(hospital=admin_profile.hospital)


class HospitalTechnicianListView(generics.ListAPIView):
    """List all lab technicians affiliated with labs in the current hospital."""
    permission_classes = [IsHospitalAdmin]
    serializer_class = LabTechnicianSerializer

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return LabTechnician.objects.filter(lab__hospital=admin_profile.hospital)


class HospitalTechnicianCreateView(generics.CreateAPIView):
    """Allow hospital admins to create lab technicians for their hospital's labs."""
    permission_classes = [IsHospitalAdmin]
    serializer_class = LabTechnicianRegisterSerializer

    def perform_create(self, serializer):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        lab_id = self.request.data.get('lab')
        
        # Verify the lab belongs to this hospital
        lab = get_object_or_404(DiagnosticLab, id=lab_id, hospital=admin_profile.hospital)
        
        # Save with verified status automatically if created by hospital admin? 
        # Or keep as pending? Let's keep as is_verified=False but allow admin to see.
        # Actually, if a hospital admin creates them, they should probably be verified or easy to verify.
        # Let's just create them for now.
        serializer.save(lab=lab)


class HospitalStatsView(APIView):
    permission_classes = [IsHospitalAdmin]

        return Response({
            'total_doctors': doctors_count,
            'pending_doctors': pending_doctors,
            'total_labs': labs_count,
            'total_consultations': consultations_count
        })


class HospitalVisitationLogsView(generics.ListAPIView):
    """List all consultations affiliated with doctors in the current hospital."""
    permission_classes = [IsHospitalAdmin]
    serializer_class = ConsultationSerializer

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return Consultation.objects.filter(doctor__hospital=admin_profile.hospital).order_by('-consultation_date')
