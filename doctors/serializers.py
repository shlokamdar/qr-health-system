from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Hospital, Doctor, Consultation
from accounts.serializers import UserSerializer

User = get_user_model()


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model."""
    doctor_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'address', 'registration_number', 
            'phone', 'email', 'is_verified', 'doctor_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']
    
    def get_doctor_count(self, obj):
        return obj.doctors.filter(is_verified=True).count()


class HospitalRegisterSerializer(serializers.ModelSerializer):
    """Serializer for hospital self-registration."""
    
    class Meta:
        model = Hospital
        fields = ['name', 'address', 'registration_number', 'phone', 'email']


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model with nested user and hospital details."""
    user = UserSerializer(read_only=True)
    hospital_details = HospitalSerializer(source='hospital', read_only=True)
    hospital = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.filter(is_verified=True),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'hospital', 'hospital_details', 
            'license_number', 'specialization', 'authorization_level',
            'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'authorization_level', 'is_verified', 'created_at', 'updated_at']


class DoctorRegisterSerializer(serializers.ModelSerializer):
    """Serializer for doctor registration."""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    hospital = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.filter(is_verified=True),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Doctor
        fields = [
            'username', 'password', 'email', 'first_name', 'last_name',
            'hospital', 'license_number', 'specialization'
        ]
    
    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'email': validated_data.pop('email', ''),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'role': 'DOCTOR'
        }
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Create doctor profile
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for Consultation model."""
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    patient_health_id = serializers.CharField(source='patient.health_id', read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'doctor', 'doctor_details', 'patient', 'patient_health_id',
            'consultation_date', 'chief_complaint', 'diagnosis', 
            'prescription', 'notes', 'follow_up_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'created_at', 'updated_at']


class ConsultationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating consultations."""
    patient_health_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'patient_health_id', 'consultation_date', 'chief_complaint',
            'diagnosis', 'prescription', 'notes', 'follow_up_date'
        ]
    
    def create(self, validated_data):
        from patients.models import Patient
        
        health_id = validated_data.pop('patient_health_id')
        patient = Patient.objects.get(health_id=health_id)
        
        # Get doctor from request context
        request = self.context.get('request')
        doctor = request.user.doctor_profile
        
        consultation = Consultation.objects.create(
            doctor=doctor,
            patient=patient,
            **validated_data
        )
        return consultation
