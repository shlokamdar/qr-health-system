from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LabTechnicianViewSet, LabTestViewSet, LabReportViewSet

router = DefaultRouter()
router.register(r'technicians', LabTechnicianViewSet, basename='lab-technician')
router.register(r'tests', LabTestViewSet, basename='lab-test')
router.register(r'reports', LabReportViewSet, basename='lab-report')

urlpatterns = [
    path('', include(router.urls)),
]
