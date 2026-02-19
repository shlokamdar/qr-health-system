from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')
        read_only_fields = ('id', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)
    profile_data = serializers.JSONField(required=False, write_only=True)
    
    # File fields for Doctor registration
    license_document = serializers.FileField(required=False, write_only=True)
    degree_certificate = serializers.FileField(required=False, write_only=True)
    identity_proof = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'first_name', 'last_name', 'profile_data', 
                  'license_document', 'degree_certificate', 'identity_proof')

    def create(self, validated_data):
        profile_data = validated_data.pop('profile_data', {})
        role = validated_data.get('role', User.Role.PATIENT)
        
        # Extract files
        license_document = validated_data.get('license_document')
        degree_certificate = validated_data.get('degree_certificate')
        identity_proof = validated_data.get('identity_proof')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            role=role,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        # Create specific profile based on role
        if role == User.Role.PATIENT:
            from patients.models import Patient
            # Profile might already exist due to signals
            patient, created = Patient.objects.get_or_create(user=user)
            
            # Update fields
            patient.contact_number = profile_data.get('phone', '')
            patient.date_of_birth = profile_data.get('dob')
            patient.gender = profile_data.get('gender', 'Male')
            patient.blood_group = profile_data.get('bloodGroup', '')
            patient.organ_donor = profile_data.get('organDonor', False)
            patient.allergies = profile_data.get('allergies', '')
            patient.chronic_conditions = profile_data.get('conditions', '')
            patient.address = f"{profile_data.get('addressLine1', '')}, {profile_data.get('city', '')}, {profile_data.get('state', '')} - {profile_data.get('pin', '')}"
            patient.save()
            
        elif role == User.Role.DOCTOR:
            from doctors.models import Doctor
            Doctor.objects.create(
                user=user,
                specialization=profile_data.get('specialization', 'General'),
                license_number=profile_data.get('licenseNumber', ''), # Mapped from frontend 'licenseNumber'
                issuing_medical_council=profile_data.get('issuingCouncil', ''), # Mapped from frontend
                license_expiry_date=profile_data.get('licenseExpiry') or None, # Mapped from frontend
                years_of_experience=profile_data.get('experience', 0),
                
                # New fields
                date_of_birth=profile_data.get('dob') or None,
                contact_number=profile_data.get('phone', ''),
                address=f"{profile_data.get('addressLine1', '')}, {profile_data.get('city', '')}, {profile_data.get('state', '')} - {profile_data.get('pin', '')}",
                
                license_document=license_document,
                degree_certificate=degree_certificate,
                identity_proof=identity_proof
            )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['is_superuser'] = self.user.is_superuser
        return data
