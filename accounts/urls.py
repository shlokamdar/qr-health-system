from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, AdminUserCreateView, UserListView, CustomTokenObtainPairView, MeView, CheckUsernameView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('admin/create-user/', AdminUserCreateView.as_view(), name='admin_user_create'),
    path('admin/users/', UserListView.as_view(), name='user_list'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('check-username/', CheckUsernameView.as_view(), name='check_username'),
]
