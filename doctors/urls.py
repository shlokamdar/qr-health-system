from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HospitalViewSet, DoctorRegisterView, DoctorProfileView,
    DoctorRegisterPatientView, ConsultationViewSet, PatientHistoryView
)

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'consultations', ConsultationViewSet, basename='consultation')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('me/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('register-patient/', DoctorRegisterPatientView.as_view(), name='doctor-register-patient'),
    path('patient-history/<str:health_id>/', PatientHistoryView.as_view(), name='patient-history'),
]
