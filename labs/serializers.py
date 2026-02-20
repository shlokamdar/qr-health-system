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
            'is_verified', 'technician_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']
    
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
    
    class Meta:
        model = LabTechnician
        fields = [
            'id', 'user', 'lab', 'lab_details', 
            'license_number', 'is_verified', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_verified', 'created_at', 'updated_at']


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
    
    class Meta:
        model = LabReport
        fields = [
            'id', 'patient', 'patient_health_id', 'technician', 
            'test_type', 'test_type_details', 'file', 
            'result_data', 'comments', 'created_at'
        ]
        read_only_fields = ['id', 'technician', 'created_at']
