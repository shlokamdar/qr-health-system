from rest_framework import generics, decorators
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Notification
from .serializers import (
    RegisterSerializer, UserSerializer, NotificationSerializer,
    CustomTokenObtainPairSerializer
)
from django.contrib.auth import get_user_model
from django.core import signing
from django.core.mail import send_mail
from django.conf import settings
from urllib.parse import quote

User = get_user_model()

RESET_SALT = 'password-reset'
RESET_MAX_AGE = 60 * 60 * 24  # 24 hours in seconds

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class AdminUserCreateView(generics.CreateAPIView):
    """View for admins to manually create users."""
    queryset = User.objects.all()
    permission_classes = (IsAdminUser,)
    serializer_class = RegisterSerializer


class UserListView(generics.ListAPIView):
    """View for admins to list all users."""
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = (IsAdminUser,)
    serializer_class = UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CheckUsernameView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        username = request.query_params.get('username', '')
        if not username:
             return Response({'available': False, 'error': 'Username required'}, status=400)
        
        is_taken = User.objects.filter(username__iexact=username).exists()
        return Response({'available': not is_taken})

class CheckEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        email = request.query_params.get('email', '')
        if not email:
             return Response({'available': False, 'error': 'Email required'}, status=400)
        
        is_taken = User.objects.filter(email__iexact=email).exists()
        return Response({'available': not is_taken})

class CheckPhoneView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        phone = request.query_params.get('phone', '')
        if not phone:
             return Response({'available': False, 'error': 'Phone required'}, status=400)
        
        from patients.models import Patient
        is_taken = Patient.objects.filter(contact_number=phone).exists()
        
        return Response({'available': not is_taken})

class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = signing.dumps({'user_id': user.pk}, salt=RESET_SALT)
            url_safe_token = quote(token, safe='')
            reset_link = f"http://localhost:5173/reset-password/{url_safe_token}"
            send_mail(
                subject='Password Reset Request - PulseID',
                message=f'Use the following link to reset your password:\n\n{reset_link}\n\nThis link expires in 24 hours.\n\nIf you did not request this, ignore this email.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response({'message': 'If an account with that email exists, a password reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not token or not new_password:
            return Response({'error': 'Missing required fields'}, status=400)

        try:
            data = signing.loads(token, salt=RESET_SALT, max_age=RESET_MAX_AGE)
            user = User.objects.get(pk=data['user_id'])
        except signing.SignatureExpired:
            return Response({'error': 'The reset link has expired. Please request a new one.'}, status=400)
        except (signing.BadSignature, User.DoesNotExist, KeyError):
            return Response({'error': 'The reset link is invalid. Please request a new one.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password has been successfully reset'})


from rest_framework import viewsets

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications."""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @decorators.action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})

