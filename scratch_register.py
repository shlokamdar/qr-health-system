import os
import sys

# Mock decouple before django loads
class MockDecouple:
    def __call__(self, key, default=None, cast=None):
        if key == 'SECRET_KEY': return 'test-secret'
        if key == 'DEBUG': return True
        return default

def MockCsv(cast=None):
    def parser(value):
        return []
    return parser

import types
mock_module = types.ModuleType('decouple')
mock_module.config = MockDecouple()
mock_module.Csv = MockCsv
sys.modules['decouple'] = mock_module

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from doctors.views import DoctorRegisterPatientView

User = get_user_model()
doctor_user = User.objects.filter(role='DOCTOR').first()
if not doctor_user:
    print("No doctor found")
    sys.exit(0)

factory = RequestFactory()
request = factory.post('/api/doctors/register-patient/', {
    'username': 'testpatient1234',
    'password': 'password123',
    'email': 'test1234@example.com',
    'first_name': 'Test',
    'last_name': 'Patient',
    'date_of_birth': '1990-01-01',
    'contact_number': '1234567890',
    'blood_group': 'O+',
})
request.user = doctor_user

view = DoctorRegisterPatientView.as_view()
try:
    response = view(request)
    print("STATUS:", response.status_code)
    print("DATA:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
