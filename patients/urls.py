from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet, EmergencyContactViewSet, PatientDocumentViewSet,
    OldPrescriptionViewSet, SharingPermissionViewSet, SharingHistoryView
)

router = DefaultRouter()
router.register(r'', PatientViewSet, basename='patient')
router.register(r'emergency-contacts', EmergencyContactViewSet, basename='emergency-contact')
router.register(r'documents', PatientDocumentViewSet, basename='document')
router.register(r'prescriptions', OldPrescriptionViewSet, basename='prescription')
router.register(r'sharing', SharingPermissionViewSet, basename='sharing')

urlpatterns = [
    path('', include(router.urls)),
    path('sharing-history/', SharingHistoryView.as_view(), name='sharing-history'),
]
