from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    DiagnosticLabViewSet, LabTechnicianRegisterView, 
    LabTechnicianProfileView, LabTestListView, 
    LabReportViewSet, LabRecentUploadsView
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
]
