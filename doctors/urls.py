from django.urls import path, include
from rest_framework.routers import SimpleRouter
    HospitalMeView, HospitalDoctorListView, HospitalLabListView, HospitalStatsView,
    HospitalTechnicianListView, HospitalTechnicianCreateView,
    DepartmentViewSet, HospitalVisitationLogsView
)

router = SimpleRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('hospitals/me/', HospitalMeView.as_view(), name='hospital-me'),
    path('hospitals/doctors/', HospitalDoctorListView.as_view(), name='hospital-doctors'),
    path('hospitals/labs/', HospitalLabListView.as_view(), name='hospital-labs'),
    path('hospitals/technicians/', HospitalTechnicianListView.as_view(), name='hospital-technicians'),
    path('hospitals/technicians/create/', HospitalTechnicianCreateView.as_view(), name='hospital-technician-create'),
    path('hospitals/stats/', HospitalStatsView.as_view(), name='hospital-stats'),
    path('hospitals/visit-logs/', HospitalVisitationLogsView.as_view(), name='hospital-visit-logs'),
    path('', include(router.urls)),
    path('register/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('me/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('verified/', VerifiedDoctorListView.as_view(), name='verified-doctors'),
    path('register-patient/', DoctorRegisterPatientView.as_view(), name='doctor-register-patient'),
    path('patient-history/<str:health_id>/', PatientHistoryView.as_view(), name='patient-history'),
]
