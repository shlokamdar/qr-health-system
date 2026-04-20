from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from audit.views import AdminDashboardStatsView
from doctors.views import DoctorListView, DoctorVerificationView, HospitalListView, HospitalVerificationView
from labs.views import LabListView, LabVerificationView
from doctors.urls import doctor_urlpatterns, hospital_urlpatterns

schema_view = get_schema_view(
   openapi.Info(
      title="Unified Health Record System API",
      default_version='v1',
      description="API for accessing and managing patient health records via QR code.",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@example.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/records/', include('records.urls')),
    
    # Mount doctor and hospital routes specifically
    path('api/doctors/', include((doctor_urlpatterns, 'doctors'), namespace='doctors-api')),
    path('api/hospitals/', include((hospital_urlpatterns, 'hospitals'), namespace='hospitals-api')),
    path('api/', include((hospital_urlpatterns, 'hospitals'))), # For /api/departments/ etc
    
    path('api/labs/', include('labs.urls')),
    path('api/audit/', include('audit.urls')),
    path('api/support/', include('support.urls')),

    # Admin Dashboard API
    path('api/admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('api/admin/doctors/', DoctorListView.as_view(), name='admin-doctors'),
    path('api/admin/doctors/<int:pk>/manage/', DoctorVerificationView.as_view(), name='admin-doctor-manage'),
    path('api/admin/hospitals/', HospitalListView.as_view(), name='admin-hospitals'),
    path('api/admin/hospitals/<int:pk>/manage/', HospitalVerificationView.as_view(), name='admin-hospital-manage'),
    path('api/admin/labs/', LabListView.as_view(), name='admin-labs'),
    path('api/admin/labs/<int:pk>/manage/', LabVerificationView.as_view(), name='admin-lab-manage'),

    # Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
