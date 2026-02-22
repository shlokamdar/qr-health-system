from rest_framework import serializers
from .models import SupportTicket
from django.contrib.auth import get_user_model

User = get_user_model()

class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = (
            'id', 'user', 'username', 'full_name', 'subject', 'description', 
            'status', 'priority', 'admin_notes', 'resolved_by', 
            'resolved_by_name', 'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = ('user', 'status', 'resolved_by', 'resolved_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
