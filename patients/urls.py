from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    PatientViewSet, EmergencyContactViewSet, PatientDocumentViewSet,
    OldPrescriptionViewSet, SharingPermissionViewSet, SharingHistoryView,
    OTPRequestView, OTPVerifyView
)

router = SimpleRouter()
router.register(r'emergency-contacts', EmergencyContactViewSet, basename='emergency-contact')
router.register(r'documents', PatientDocumentViewSet, basename='document')
router.register(r'prescriptions', OldPrescriptionViewSet, basename='old-prescription')
router.register(r'sharing', SharingPermissionViewSet, basename='sharing')
# Register PatientViewSet last to avoid shadowing other routes with its lookup regex
router.register(r'', PatientViewSet, basename='patient')

urlpatterns = [
    path('sharing-history/', SharingHistoryView.as_view(), name='sharing-history'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('', include(router.urls)),
]
