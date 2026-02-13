from rest_framework import serializers
from .models import LabTechnician, LabTest, LabReport
from accounts.serializers import UserSerializer
from doctors.serializers import HospitalSerializer

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'


class LabTechnicianSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    hospital_details = HospitalSerializer(source='hospital', read_only=True)
    
    class Meta:
        model = LabTechnician
        fields = ['id', 'user', 'hospital', 'hospital_details', 'license_number', 'is_verified', 'created_at']


class LabTechnicianRegisterSerializer(serializers.ModelSerializer):
    """Serializer for registering a new Lab Technician."""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = LabTechnician
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'hospital', 'license_number']

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'role': User.Role.LAB_TECH
        }
        
        user = User.objects.create_user(**user_data)
        lab_tech = LabTechnician.objects.create(user=user, **validated_data)
        return lab_tech


class LabReportSerializer(serializers.ModelSerializer):
    test_type_data = LabTestSerializer(source='test_type', read_only=True)
    technician_name = serializers.CharField(source='technician.user.get_full_name', read_only=True)
    hospital_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LabReport
        fields = [
            'id', 'patient', 'technician', 'technician_name', 'hospital_name', 
            'test_type', 'test_type_data', 'file', 'result_data', 'comments', 'created_at'
        ]
        read_only_fields = ['technician', 'created_at']

    def get_hospital_name(self, obj):
        if obj.technician and obj.technician.hospital:
            return obj.technician.hospital.name
        return "Independent Lab"

    def create(self, validated_data):
        # Assign current user's lab profile as technician
        request = self.context.get('request')
        if request and hasattr(request.user, 'lab_profile'):
            validated_data['technician'] = request.user.lab_profile
        return super().create(validated_data)
