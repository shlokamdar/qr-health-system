from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Patient, Record
from doctors.models import Doctor
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

User = get_user_model()

class PatientModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='pat', password='pw', role='PATIENT')
        self.patient = Patient.objects.create(
            user=self.user,
            date_of_birth='2000-01-01',
            contact_number='1234567890'
        )

    def test_health_id_generation(self):
        self.assertTrue(self.patient.health_id.startswith('HID-'))
    
    def test_str(self):
        self.assertTrue(str(self.patient).startswith(self.user.username))

class RecordAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Patient
        self.pat_user = User.objects.create_user(username='patentRecord', password='pw', role='PATIENT')
        self.patient = Patient.objects.create(user=self.pat_user, date_of_birth='1990-01-01', contact_number='123')
        
        # Doctor
        self.doc_user = User.objects.create_user(username='docRecord', password='pw', role='DOCTOR')
        self.doctor = Doctor.objects.create(user=self.doc_user, license_number='LIC', specialization='Gen')

    def test_record_upload(self):
        self.client.force_authenticate(user=self.pat_user)
        # Mocking file upload
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test_report.pdf", b"file_content", content_type="application/pdf")
        
        data = {
            'title': 'Blood Test',
            'record_type': 'REPORT',
            'file': file,
            'description': 'Annual Checkup'
        }
        # Assuming endpoint is /api/records/ based on router
        response = self.client.post('/api/records/', data, format='multipart')
        
        # If the view expects 'patient' field or automatically sets it.
        # Based on previous knowledge, `perform_create` sets patient=request.user.patient_profile
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Record.objects.count(), 1)
        
        record = Record.objects.first()
        self.assertEqual(record.uploaded_by, self.pat_user)
        self.assertEqual(record.patient, self.patient)
