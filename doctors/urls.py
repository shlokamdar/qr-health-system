from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    HospitalViewSet, ConsultationViewSet, AppointmentViewSet,
    DoctorRegisterView, DoctorProfileView, VerifiedDoctorListView,
    DoctorRegisterPatientView, PatientHistoryView,
    HospitalMeView, HospitalDoctorListView, HospitalLabListView, HospitalStatsView,
    HospitalTechnicianListView, HospitalTechnicianCreateView,
    DepartmentViewSet, HospitalVisitationLogsView
)

# Separate routers for better organization
doctor_router = SimpleRouter()
doctor_router.register(r'consultations', ConsultationViewSet, basename='consultation')
doctor_router.register(r'appointments', AppointmentViewSet, basename='appointment')

hospital_router = SimpleRouter()
hospital_router.register(r'hospitals', HospitalViewSet)
hospital_router.register(r'departments', DepartmentViewSet, basename='department')

# Hospital-facing patterns (will be mounted at /api/hospitals/ and /api/departments/)
hospital_urlpatterns = [
    path('me/', HospitalMeView.as_view(), name='hospital-me'),
    path('doctors/', HospitalDoctorListView.as_view(), name='hospital-doctors'),
    path('labs/', HospitalLabListView.as_view(), name='hospital-labs'),
    path('technicians/', HospitalTechnicianListView.as_view(), name='hospital-technicians'),
    path('technicians/create/', HospitalTechnicianCreateView.as_view(), name='hospital-technician-create'),
    path('stats/', HospitalStatsView.as_view(), name='hospital-stats'),
    path('visit-logs/', HospitalVisitationLogsView.as_view(), name='hospital-visit-logs'),
    path('', include(hospital_router.urls)),
]

# Doctor-facing patterns (will be mounted at /api/doctors/)
doctor_urlpatterns = [
    path('register/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('me/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('verified/', VerifiedDoctorListView.as_view(), name='verified-doctors'),
    path('register-patient/', DoctorRegisterPatientView.as_view(), name='doctor-register-patient'),
    path('patient-history/<str:health_id>/', PatientHistoryView.as_view(), name='patient-history'),
    path('hospitals/', include(hospital_router.urls)), # Keep for DoctorService.getHospitals()
    path('', include(doctor_router.urls)),
]

# Base urlpatterns for compatibility
urlpatterns = [
    path('hospitals/', include(hospital_urlpatterns)),
    path('doctors/', include(doctor_urlpatterns)),
    path('', include(doctor_urlpatterns)),
]
