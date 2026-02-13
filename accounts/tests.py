from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserRegistrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_patient(self):
        data = {
            'username': 'newpatient',
            'password': 'password123',
            'email': 'patient@test.com',
            'role': 'PATIENT',
            'first_name': 'New',
            'last_name': 'Patient'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newpatient').exists())
        user = User.objects.get(username='newpatient')
        self.assertTrue(hasattr(user, 'patient_profile'))

    def test_register_doctor_create_only_user(self):
        # The auth/register endpoint creates a User, but for doctors, we usually have a separate flow 
        # or the register endpoint handles basic user creation. 
        # In our implementation, /auth/register/ is for generic users, but doctors use /doctors/register/
        # Let's test the generic registration for a doctor role user (which might just be a user with role='DOCTOR')
        data = {
            'username': 'newdoc',
            'password': 'password123',
            'email': 'doc@test.com',
            'role': 'DOCTOR',
            'first_name': 'New',
            'last_name': 'Doc'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newdoc').exists())
        # Note: Generic registration might NOT create a Doctor profile automatically unless signals are used.
        # We'll check if the role is set correctly.
        user = User.objects.get(username='newdoc')
        self.assertEqual(user.role, 'DOCTOR')

class UserLoginTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='password123', role='PATIENT')

    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'password123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_failure(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
