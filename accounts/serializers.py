from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _

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

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

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
            from doctors.models import Doctor, Hospital
            hospital_id = profile_data.get('hospital_id')
            hospital = Hospital.objects.filter(id=hospital_id, is_verified=True).first() if hospital_id else None
            Doctor.objects.create(
                user=user,
                hospital=hospital,
                specialization=profile_data.get('specialization', 'General'),
                license_number=profile_data.get('licenseNumber', ''),
                issuing_medical_council=profile_data.get('issuingCouncil', ''),
                license_expiry_date=profile_data.get('licenseExpiry') or None,
                years_of_experience=profile_data.get('experience', 0),

                date_of_birth=profile_data.get('dob') or None,
                contact_number=profile_data.get('phone', ''),
                address=f"{profile_data.get('addressLine1', '')}, {profile_data.get('city', '')}, {profile_data.get('state', '')} - {profile_data.get('pin', '')}",

                license_document=license_document,
                degree_certificate=degree_certificate,
                identity_proof=identity_proof
            )
        
        elif role == 'HOSPITAL_ADMIN':
            from doctors.models import HospitalAdmin, Hospital
            hospital_id = profile_data.get('hospital_id')
            if hospital_id:
                hospital = Hospital.objects.get(id=hospital_id)
                HospitalAdmin.objects.create(
                    user=user,
                    hospital=hospital
                )
            else:
                # Handle case where hospital is not yet created (e.g. initial hospital registration)
                pass

        elif role == 'LAB_TECH':
            from labs.models import LabTechnician, DiagnosticLab
            lab_id = profile_data.get('lab')
            lab = None
            if lab_id:
                try:
                    lab = DiagnosticLab.objects.get(id=lab_id)
                except DiagnosticLab.DoesNotExist:
                    pass

            LabTechnician.objects.create(
                user=user,
                lab=lab,
                license_number=profile_data.get('license_number') or profile_data.get('licenseNumber', f"TEMP-{user.id}"),
                is_verified=False  # Requires admin approval
            )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accept either a username or an email in the 'username' field.
    simplejwt uses 'username' as the field name by default; we intercept
    it here and resolve the actual user before passing control back.
    """

    def validate(self, attrs):
        # attrs["username"] may contain either a username or an email address
        credential = attrs.get("username", "").strip()
        password = attrs.get("password", "")

        # Try to find the user by email first, then by username (case-insensitive)
        user = None
        if "@" in credential:
            try:
                db_user = User.objects.get(email__iexact=credential)
                user = authenticate(
                    request=self.context.get("request"),
                    username=db_user.username,
                    password=password,
                )
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(
                request=self.context.get("request"),
                username=credential,
                password=password,
            )
            # Fallback: maybe the credential is still an email without '@' — skip,
            # as that's very unlikely.

        if not user:
            raise serializers.ValidationError(
                _("No active account found with the given credentials."),
                code="no_active_account",
            )

        # Swap username back so the parent serializer can proceed
        attrs["username"] = user.username

        data = super().validate(attrs)
        data["role"] = self.user.role
        data["username"] = self.user.username
        data["is_superuser"] = self.user.is_superuser
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        token["is_superuser"] = user.is_superuser
        return token
