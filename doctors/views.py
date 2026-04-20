from django.conf import settings
from rest_framework import viewsets, generics, permissions, status, decorators
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from .models import (
    Hospital, Department, Doctor, Consultation, Appointment, HospitalAdmin
)
from .serializers import (
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
from audit.models import AccessLog


class HospitalViewSet(viewsets.ModelViewSet):
    """ViewSet for Hospital CRUD operations."""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return HospitalRegisterSerializer
        if self.action == 'retrieve':
            return HospitalDetailSerializer
        return HospitalSerializer
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Hospital.objects.all()
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
        from django.contrib.auth import get_user_model
        from patients.serializers import PatientSerializer
        
        user_data = {
            'username': request.data.get('username'),
            'password': request.data.get('password'),
            'email': request.data.get('email', ''),
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'role': 'PATIENT'
        }
        
        User = get_user_model()
        
        try:
            user = User.objects.create_user(**user_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        patient_data = {
            'date_of_birth': request.data.get('date_of_birth'),
            'contact_number': request.data.get('contact_number', ''),
            'address': request.data.get('address', ''),
            'blood_group': request.data.get('blood_group', ''),
        }
        
        patient = Patient.objects.create(user=user, **patient_data)
        
        AccessLog.objects.create(
            actor=request.user,
            patient=patient,
            action=AccessLog.Action.CREATE_HEALTH_ID,
            details=f"Doctor registered patient with Health ID: {patient.health_id}"
        )
        
        # Send Welcome Email
        send_registration_welcome_email(user)
        
        serializer = PatientSerializer(patient)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DoctorListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = DoctorSerializer
    queryset = Doctor.objects.all().order_by('-user__date_joined')


class VerifiedDoctorListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DoctorSerializer
    queryset = Doctor.objects.filter(is_verified=True).order_by('user__first_name')


class DoctorVerificationView(generics.UpdateAPIView):
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
                doctor.rejection_reason = request.data.get('rejection_reason', '')
            else:
                doctor.rejection_reason = ''
            doctor.save()
            action = 'verified' if doctor.is_verified else 'rejected'
            return Response({'message': f'Doctor {action} successfully'})

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
    permission_classes = [permissions.IsAdminUser]
    serializer_class = HospitalSerializer
    queryset = Hospital.objects.all().order_by('name')


class HospitalVerificationView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = HospitalSerializer
    queryset = Hospital.objects.all()
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        hospital = self.get_object()

        if 'verify' in request.data:
            is_verified = bool(request.data.get('verify', False))
            hospital.is_verified = is_verified
            if not is_verified:
                hospital.rejection_reason = request.data.get('rejection_reason', '')
            else:
                hospital.rejection_reason = ''
            hospital.save()

            if is_verified:
                # Find the admin user linked to this hospital
                from .models import HospitalAdmin
                admin_profiles = HospitalAdmin.objects.filter(hospital=hospital)
                admin_profile = admin_profiles.first()
                
                # Verify all admins for this hospital
                admin_profiles.update(is_verified=True)

                if admin_profile:
                    print(f"\n{'='*60}")
                    print(f"HOSPITAL APPROVED: {hospital.name}")
                    print(f"Admin Username: {admin_profile.user.username}")
                    print(f"Admin Email:    {admin_profile.user.email}")
                    print(f"Login at: {getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/login (select Hospital role)")
                    print(f"{'='*60}\n")
                    return Response({
                        'message': 'Hospital approved successfully.',
                        'credentials': {
                            'username': admin_profile.user.username,
                            'email': admin_profile.user.email,
                            'role': 'Hospital Admin'
                        }
                    })
                return Response({'message': 'Hospital approved successfully.'})
            else:
                return Response({'message': f'Hospital rejected. Reason has been recorded.'})

        return super().update(request, *args, **kwargs)


from utils.notifications import send_record_uploaded_email, send_registration_welcome_email

class ConsultationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDoctor]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConsultationCreateSerializer
        return ConsultationSerializer
    
    def get_queryset(self):
        doctor = get_object_or_404(Doctor, user=self.request.user)
        queryset = Consultation.objects.filter(doctor=doctor)
        
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient__health_id=patient_id)
        
        return queryset
    
    def perform_create(self, serializer):
        consultation = serializer.save()
        
        AccessLog.objects.create(
            actor=self.request.user,
            patient=consultation.patient,
            action=AccessLog.Action.CREATE_CONSULTATION,
            details=f"Created consultation: {consultation.chief_complaint[:50]}"
        )

        doctor_name = self.request.user.get_full_name() or self.request.user.username
        send_record_uploaded_email(consultation.patient, "Consultation Record", doctor_name)


class PatientHistoryView(generics.ListAPIView):
    permission_classes = [IsDoctor]
    serializer_class = ConsultationSerializer
    
    def get_queryset(self):
        health_id = self.kwargs.get('health_id')
        patient = get_object_or_404(Patient, health_id=health_id)
        
        AccessLog.objects.create(
            actor=self.request.user,
            patient=patient,
            action=AccessLog.Action.VIEW_RECORDS,
            details="Viewed consultation history"
        )
        
        return Consultation.objects.filter(patient=patient)


class AppointmentViewSet(viewsets.ModelViewSet):
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
        if hasattr(self.request.user, 'patient_profile'):
            serializer.save(patient=self.request.user.patient_profile)
        else:
            serializer.save()

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class HospitalMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsHospitalAdmin]
    serializer_class = HospitalSerializer

    def get_object(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return admin_profile.hospital


class HospitalDoctorListView(generics.ListAPIView):
    permission_classes = [IsHospitalAdmin]
    serializer_class = DoctorSerializer

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return Doctor.objects.filter(hospital=admin_profile.hospital)


class HospitalLabListView(generics.ListAPIView):
    permission_classes = [IsHospitalAdmin]

    def get_serializer_class(self):
        from labs.serializers import DiagnosticLabSerializer
        return DiagnosticLabSerializer

    def get_queryset(self):
        from labs.models import DiagnosticLab
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return DiagnosticLab.objects.filter(hospital=admin_profile.hospital)


class HospitalTechnicianListView(generics.ListAPIView):
    permission_classes = [IsHospitalAdmin]
    serializer_class = LabTechnicianSerializer

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return LabTechnician.objects.filter(lab__hospital=admin_profile.hospital)


class HospitalTechnicianCreateView(generics.CreateAPIView):
    permission_classes = [IsHospitalAdmin]
    serializer_class = LabTechnicianRegisterSerializer

    def perform_create(self, serializer):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        lab_id = self.request.data.get('lab')
        lab = get_object_or_404(DiagnosticLab, id=lab_id, hospital=admin_profile.hospital)
        serializer.save(lab=lab)


class HospitalStatsView(APIView):
    permission_classes = [IsHospitalAdmin]

    def get(self, request, *args, **kwargs):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        hospital = admin_profile.hospital
        
        doctors_count = Doctor.objects.filter(hospital=hospital).count()
        pending_doctors = Doctor.objects.filter(hospital=hospital, is_verified=False).count()
        labs_count = DiagnosticLab.objects.filter(hospital=hospital).count()
        consultations_count = Consultation.objects.filter(doctor__hospital=hospital).count()
        
        return Response({
            'total_doctors': doctors_count,
            'pending_doctors': pending_doctors,
            'total_labs': labs_count,
            'total_consultations': consultations_count
        })


class HospitalVisitationLogsView(generics.ListAPIView):
    permission_classes = [IsHospitalAdmin]
    serializer_class = ConsultationSerializer

    def get_queryset(self):
        admin_profile = get_object_or_404(HospitalAdmin, user=self.request.user)
        return Consultation.objects.filter(doctor__hospital=admin_profile.hospital).order_by('-consultation_date')
