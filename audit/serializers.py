from rest_framework import serializers
from .models import AccessLog

class AccessLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    patient_health_id = serializers.CharField(source='patient.health_id', read_only=True)

    class Meta:
        model = AccessLog
        fields = ['id', 'actor', 'actor_username', 'patient', 'patient_health_id', 'action', 'details', 'ip_address', 'timestamp']
        read_only_fields = fields
