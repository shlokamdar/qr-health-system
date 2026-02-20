"""Create a superadmin user if one doesn't already exist."""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
user, created = User.objects.get_or_create(
    username='sysadmin',
    defaults={
        'email': 'sysadmin@pulseid.system',
        'first_name': 'System',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True,
        'role': 'ADMIN',
    }
)
if not user.check_password('Admin@1234'):
    user.set_password('Admin@1234')
    user.save()
action = 'created' if created else 'already exists (password reset)'
print(f"Superadmin user {action}: sysadmin / Admin@1234")
