from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DiagnosticLab, LabTechnician, LabTest, LabReport
from doctors.serializers import HospitalSerializer
from accounts.serializers import UserSerializer

User = get_user_model()

class DiagnosticLabSerializer(serializers.ModelSerializer):
    """Serializer for DiagnosticLab model."""
    technician_count = serializers.SerializerMethodField()
    hospital_details = HospitalSerializer(source='hospital', read_only=True)
    
    class Meta:
        model = DiagnosticLab
        fields = [
            'id', 'name', 'address', 'accreditation_number', 
            'phone', 'email', 'hospital', 'hospital_details',
            'is_verified', 'rejection_reason', 'technician_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'rejection_reason', 'created_at', 'updated_at']
    
    def get_technician_count(self, obj):
        return obj.technicians.filter(is_verified=True).count()


class DiagnosticLabRegisterSerializer(serializers.ModelSerializer):
    """Serializer for lab self-registration."""
    
    class Meta:
        model = DiagnosticLab
        fields = ['name', 'address', 'accreditation_number', 'phone', 'email', 'hospital']


class LabTechnicianSerializer(serializers.ModelSerializer):
    """Serializer for LabTechnician model."""
    user = UserSerializer(read_only=True)
    lab_details = DiagnosticLabSerializer(source='lab', read_only=True)
    lab_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LabTechnician
        fields = [
            'id', 'user', 'lab', 'lab_details', 'lab_name',
            'license_number', 'is_verified', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_verified', 'rejection_reason', 'created_at', 'updated_at']
    
    def get_lab_name(self, obj):
        return obj.lab.name if obj.lab else "Individual Practitioner"


class LabTechnicianRegisterSerializer(serializers.ModelSerializer):
    """Serializer for lab technician registration."""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = LabTechnician
        fields = [
            'username', 'password', 'email', 'first_name', 'last_name',
            'lab', 'license_number'
        ]
    
    def create(self, validated_data):
        user_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'email': validated_data.pop('email', ''),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'role': 'LAB_TECH'
        }
        
        user = User.objects.create_user(**user_data)
        lab_tech = LabTechnician.objects.create(user=user, **validated_data)
        return lab_tech


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'


class LabReportSerializer(serializers.ModelSerializer):
    test_type_details = LabTestSerializer(source='test_type', read_only=True)
    patient_health_id = serializers.CharField(source='patient.health_id', read_only=True)
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LabReport
        fields = [
            'id', 'patient', 'patient_health_id', 'patient_name', 'technician', 
            'test_type', 'test_type_details', 'file', 
            'result_data', 'comments', 'created_at'
        ]
        read_only_fields = ['id', 'technician', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username
