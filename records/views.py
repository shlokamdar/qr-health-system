from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer
from role_permissions.roles import IsDoctor, IsLabTech, IsPatient, IsPatientOwner
from audit.models import AccessLog
from patients.models import Patient
from django.shortcuts import get_object_or_404

class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = MedicalRecord.objects.all()

        if user.role == 'PATIENT':
            return queryset.filter(patient__user=user)
        
        # Doctors/Labs can view records if they filter by patient
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            return queryset.filter(patient__health_id=patient_id)
        
        # If Doctor/Lab requests all without filter, maybe return none or ones they created?
        # For prototype, return empty to prevent data leak, force filtering
        if user.role in ['DOCTOR', 'LAB']:
             return queryset.none() # Must specify patient

        return queryset.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [(IsDoctor | IsLab)()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        record = serializer.save(doctor=self.request.user)
        
        AccessLog.objects.create(
            actor=self.request.user,
            patient=record.patient,
            action=AccessLog.Action.UPLOAD_RECORD,
            details=f"Uploaded {record.record_type}"
        )

    def list(self, request, *args, **kwargs):
        # Wrap list to log access if patient param is present
        response = super().list(request, *args, **kwargs)
        
        patient_id = self.request.query_params.get('patient')
        if patient_id and response.status_code == 200:
            # We assume if they successfully got data, they had permission (handled in queryset/permissions conceptually)
            # But currently get_queryset just returns it. 
            # We should probably check if patient exists to log it correctly.
            try:
                p = Patient.objects.get(health_id=patient_id)
                AccessLog.objects.create(
                    actor=request.user,
                    patient=p,
                    action=AccessLog.Action.VIEW_RECORDS,
                    details="Viewed patient records"
                )
            except Patient.DoesNotExist:
                pass
        return response
