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

    def test_superuser_role_assignment(self):
        # Create a superuser and check if the role is automatically set to ADMIN
        admin_user = User.objects.create_superuser(username='newadmin', password='password123', email='admin@test.com')
        self.assertEqual(admin_user.role, User.Role.ADMIN)
        
        # Verify it works even if role is explicitly set to something else during creation
        admin_user_2 = User.objects.create_superuser(
            username='newadmin2', 
            password='password123', 
            email='admin2@test.com',
            role='PATIENT'
        )
        self.assertEqual(admin_user_2.role, User.Role.ADMIN)

    def test_existing_superuser_gets_updated_role_on_save(self):
        # Manually create a superuser with PATIENT role (bypassing save override via update)
        User.objects.filter(username='testuser').update(is_superuser=True, role='PATIENT')
        user = User.objects.get(username='testuser')
        self.assertEqual(user.role, 'PATIENT')
        
        # Now save it and check if it gets updated
        user.save()
        self.assertEqual(user.role, User.Role.ADMIN)
