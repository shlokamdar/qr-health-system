from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MedicalRecordViewSet

router = SimpleRouter()
router.register(r'', MedicalRecordViewSet, basename='records')

urlpatterns = [
    path('', include(router.urls)),
]
