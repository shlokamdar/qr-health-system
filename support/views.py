from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SupportTicket
from .serializers import SupportTicketSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN' or user.is_superuser:
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = SupportTicket.Status.RESOLVED
        ticket.resolved_by = request.user
        ticket.resolved_at = timezone.now()
        ticket.admin_notes = request.data.get('admin_notes', ticket.admin_notes)
        ticket.save()
        return Response({'status': 'ticket resolved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = request.data.get('status', ticket.status)
        ticket.admin_notes = request.data.get('admin_notes', ticket.admin_notes)
        ticket.save()
        return Response({'status': 'status updated'})
