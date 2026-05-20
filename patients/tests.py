from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Patient
from records.models import MedicalRecord as Record
from doctors.models import Doctor
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

User = get_user_model()

class PatientModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='pat', password='pw', role='PATIENT', email='pat@model.com')
        # Patient profile is created via signals
        self.patient = self.user.patient_profile
        self.patient.date_of_birth = '2000-01-01'
        self.patient.contact_number = '1234567890'
        self.patient.save()

    def test_health_id_generation(self):
        self.assertTrue(self.patient.health_id.startswith('HID-'))
    
    def test_str(self):
        self.assertTrue(str(self.patient).startswith(self.user.username))

class RecordAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Patient
        self.pat_user = User.objects.create_user(username='patentRecord', password='pw', role='PATIENT', email='p@record.com')
        self.patient = self.pat_user.patient_profile
        self.patient.date_of_birth = '1990-01-01'
        self.patient.contact_number = '123'
        self.patient.save()
        
        # Doctor
        self.doc_user = User.objects.create_user(username='docRecord', password='pw', role='DOCTOR', email='d@record.com')
        # Doctor profile is NOT created via signals automatically based on my check of doctors/signals.py
        self.doctor = Doctor.objects.create(user=self.doc_user, license_number='LIC', specialization='Gen')

    def test_record_upload(self):
        self.client.force_authenticate(user=self.pat_user)
        # Mocking file upload
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test_report.pdf", b"file_content", content_type="application/pdf")
        
        data = {
            'patient': self.patient.id,
            'title': 'Blood Test',
            'record_type': 'LAB_REPORT',
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
        self.assertEqual(record.doctor, self.pat_user)
        self.assertEqual(record.patient, self.patient)

    def test_my_consultations(self):
        from doctors.models import Consultation
        # Create a consultation for this patient
        con = Consultation.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            consultation_date=timezone.now(),
            chief_complaint='Fever and headache',
            diagnosis='Viral fever',
            prescription='Paracetamol 500mg',
            temperature='101',
            blood_pressure='120/80',
            pulse='80',
            spo2='98',
            weight='70',
            notes='Rest for 3 days'
        )
        
        # Authenticate patient
        self.client.force_authenticate(user=self.pat_user)
        response = self.client.get('/api/patients/me/consultations/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['chief_complaint'], 'Fever and headache')
        self.assertEqual(response.data[0]['diagnosis'], 'Viral fever')
        self.assertEqual(response.data[0]['temperature'], '101.00')

