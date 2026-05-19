from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    PatientViewSet, EmergencyContactViewSet, PatientDocumentViewSet,
    OldPrescriptionViewSet, SharingPermissionViewSet, SharingHistoryView,
    OTPRequestView, OTPVerifyView, PendingOTPRequestsView, RevokeOTPRequestView,
    EmergencyOTPRequestView, EmergencyOTPVerifyView
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
    path('emergency/request-otp/', EmergencyOTPRequestView.as_view(), name='emergency-otp-request'),
    path('emergency/verify-otp/', EmergencyOTPVerifyView.as_view(), name='emergency-otp-verify'),
    path('otp/pending/', PendingOTPRequestsView.as_view(), name='otp-pending'),
    path('otp/revoke/<int:pk>/', RevokeOTPRequestView.as_view(), name='otp-revoke'),
    path('', include(router.urls)),
]
