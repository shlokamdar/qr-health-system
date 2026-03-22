from rest_framework import serializers
from django.conf import settings
from .models import (
    Patient, EmergencyContact, PatientDocument, 
    OldPrescription, SharingPermission
)
from accounts.serializers import UserSerializer


class EmergencyContactSerializer(serializers.ModelSerializer):
    """Serializer for EmergencyContact."""
    
    class Meta:
        model = EmergencyContact
        fields = [
            'id', 'name', 'relationship', 'phone', 
            'can_grant_access', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PatientSerializer(serializers.ModelSerializer):
    """Full patient serializer with user details."""
    user = UserSerializer(read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    age = serializers.ReadOnlyField()
    
    # Writeable fields for name updates
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = (
            'health_id', 'qr_code', 'user', 'created_at', 'updated_at'
        )

    def update(self, instance, validated_data):
        # Handle nested user data if provided (first_name, last_name)
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
            
        return super().update(instance, validated_data)


class PatientPublicSerializer(serializers.ModelSerializer):
    """Public basic patient info for QR scan view (no login required)."""
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    age = serializers.ReadOnlyField()
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'health_id', 'first_name', 'last_name', 'age', 'gender', 
            'blood_group', 'allergies', 'chronic_conditions',
            'emergency_contacts'
        ]
        read_only_fields = fields


class PatientBasicSerializer(serializers.ModelSerializer):
    """Basic patient info for BASIC authorization level doctors."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'health_id', 'qr_code', 
            'date_of_birth', 'contact_number', 'address'
        ]
        read_only_fields = fields


class PatientDocumentSerializer(serializers.ModelSerializer):
    """Serializer for PatientDocument."""
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username', 
        read_only=True
    )
    
    class Meta:
        model = PatientDocument
        fields = [
            'id', 'document_type', 'title', 'file', 
            'description', 'uploaded_by', 'uploaded_by_username', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']


class OldPrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for OldPrescription with detailed medicine info."""
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username', 
        read_only=True
    )
    
    class Meta:
        model = OldPrescription
        fields = [
            'id', 'prescription_date', 'doctor_name', 'hospital_name',
            'symptoms', 'diagnosis', 'medicines', 'insights', 'file',
            'uploaded_by', 'uploaded_by_username', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']


class SharingPermissionSerializer(serializers.ModelSerializer):
    """Serializer for SharingPermission."""
    doctor_name = serializers.SerializerMethodField()
    patient_health_id = serializers.CharField(
        source='patient.health_id', 
        read_only=True
    )
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = SharingPermission
        fields = [
            'id', 'patient', 'patient_health_id', 'doctor', 'doctor_name',
            'access_type', 'granted_at', 'expires_at', 'granted_by',
            'can_view_records', 'can_view_documents', 'can_add_records',
            'is_active', 'is_expired', 'revoked_at'
        ]
        read_only_fields = ['id', 'granted_at', 'is_expired', 'revoked_at']
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"


class GrantAccessSerializer(serializers.Serializer):
    """Serializer for granting access to a doctor."""
    doctor_id = serializers.IntegerField()
    access_type = serializers.ChoiceField(
        choices=SharingPermission.AccessType.choices
    )
    
    def validate_doctor_id(self, value):
        from doctors.models import Doctor
        try:
            Doctor.objects.get(id=value, is_verified=True)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError("Doctor not found or not verified.")
        return value
