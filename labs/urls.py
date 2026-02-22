from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    DiagnosticLabViewSet, LabTechnicianRegisterView, 
    LabTechnicianProfileView, LabTestListView, 
    LabReportViewSet, LabRecentUploadsView,
    PatientLabReportsView,
    LabListView, LabVerificationView,
    TechnicianListView, TechnicianVerificationView
)

router = SimpleRouter()
router.register(r'organizations', DiagnosticLabViewSet, basename='lab-organization')
router.register(r'reports', LabReportViewSet, basename='lab-report')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', LabTechnicianRegisterView.as_view(), name='lab-tech-register'),
    path('me/', LabTechnicianProfileView.as_view(), name='lab-tech-profile'),
    path('tests/', LabTestListView.as_view(), name='lab-test-list'),
    path('recent-uploads/', LabRecentUploadsView.as_view(), name='lab-recent-uploads'),
    path('patient-reports/<str:health_id>/', PatientLabReportsView.as_view(), name='lab-patient-reports'),
    
    # Admin endpoints
    path('admin/list/', LabListView.as_view(), name='admin-lab-list'),
    path('admin/verify/<int:pk>/', LabVerificationView.as_view(), name='admin-lab-verify'),
    path('admin/technicians/', TechnicianListView.as_view(), name='admin-tech-list'),
    path('admin/technicians/verify/<int:pk>/', TechnicianVerificationView.as_view(), name='admin-tech-verify'),
]
