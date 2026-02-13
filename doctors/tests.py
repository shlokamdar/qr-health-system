from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Doctor, Hospital, Appointment
from patients.models import Patient
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

User = get_user_model()

class DoctorModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='drtest', 
            password='password',
            role='DOCTOR',
            email='dr@test.com'
        )
        self.doctor = Doctor.objects.create(
            user=self.user,
            license_number='LIC123',
            specialization='Cardiology'
        )

    def test_doctor_str(self):
        self.assertEqual(str(self.doctor), f"Dr. {self.user.get_full_name()} - Cardiology")

class AppointmentModelTest(TestCase):
    def setUp(self):
        # Create Doctor
        self.doc_user = User.objects.create_user(username='doc', password='pw', role='DOCTOR')
        self.doctor = Doctor.objects.create(user=self.doc_user, license_number='D1', specialization='Gen')
        
        # Create Patient
        self.pat_user = User.objects.create_user(username='pat', password='pw', role='PATIENT')
        self.patient = Patient.objects.create(user=self.pat_user, date_of_birth='2000-01-01', contact_number='123')

        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            appointment_date=timezone.now(),
            reason='Test Visit'
        )

    def test_initial_status(self):
        self.assertEqual(self.appointment.status, 'PENDING')

    def test_status_transition(self):
        self.appointment.status = 'CONFIRMED'
        self.appointment.save()
        self.assertEqual(self.appointment.status, 'CONFIRMED')

class AppointmentAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Doctor
        self.doc_user = User.objects.create_user(username='docapi', password='pw', role='DOCTOR', first_name='Doc', last_name='Tor')
        self.doctor = Doctor.objects.create(user=self.doc_user, license_number='DAPI', specialization='Ortho', is_verified=True)
        
        # Patient
        self.pat_user = User.objects.create_user(username='patapi', password='pw', role='PATIENT', first_name='Pat', last_name='Ient')
        self.patient = Patient.objects.create(user=self.pat_user, date_of_birth='2000-01-01', contact_number='123')
        
        # Another user
        self.other_user = User.objects.create_user(username='other', password='pw')

    def test_book_appointment(self):
        self.client.force_authenticate(user=self.pat_user)
        data = {
            'doctor': self.doctor.id,
            'appointment_date': timezone.now().isoformat(),
            'reason': 'Knee pain'
        }
        response = self.client.post('/api/doctors/appointments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        self.assertEqual(Appointment.objects.first().patient, self.patient)

    def test_doctor_update_appointment(self):
        # Create appointment
        apt = Appointment.objects.create(doctor=self.doctor, patient=self.patient, appointment_date=timezone.now(), reason='Test')
        
        self.client.force_authenticate(user=self.doc_user)
        response = self.client.patch(f'/api/doctors/appointments/{apt.id}/', {'status': 'CONFIRMED'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        apt.refresh_from_db()
        self.assertEqual(apt.status, 'CONFIRMED')

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get('/api/doctors/appointments/')
        # Should be empty or 403 depending on view logic. Viewset filters by profile, 
        # so if user has no profile, it returns empty list or error if `hasattr` fails securely.
        # Actually our view checks hasattr(user, 'doctor_profile') etc.
        # If user has neither, it returns none.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
