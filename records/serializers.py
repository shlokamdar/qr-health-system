from rest_framework import serializers
from .models import MedicalRecord
from accounts.serializers import UserSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor_details = UserSerializer(source='doctor', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ('doctor', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Assign the currently logged-in user as the doctor
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['doctor'] = request.user
        return super().create(validated_data)
