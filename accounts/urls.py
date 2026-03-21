from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, AdminUserCreateView, UserListView, CustomTokenObtainPairView, 
    MeView, CheckUsernameView, PasswordResetRequestView, PasswordResetConfirmView,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('admin/create-user/', AdminUserCreateView.as_view(), name='admin_user_create'),
    path('admin/users/', UserListView.as_view(), name='user_list'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('check-username/', CheckUsernameView.as_view(), name='check_username'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('', include(router.urls)),
]
