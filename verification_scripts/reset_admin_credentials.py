import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def reset_admin():
    username = 'admin'
    password = 'password123'
    
    try:
        user = User.objects.get(username=username)
        print(f"User '{username}' found.")
        
        # Force set password
        user.set_password(password)
        user.role = 'ADMIN'
        user.is_superuser = True
        user.is_staff = True
        user.save()
        
        print(f"SUCCESS: User '{username}' updated.")
        print(f"Password set to: {password}")
        print(f"Role: {user.role}")
        print(f"Is Superuser: {user.is_superuser}")
        
    except User.DoesNotExist:
        print(f"User '{username}' not found. Creating...")
        User.objects.create_superuser(username, 'admin@example.com', password, role='ADMIN')
        print(f"SUCCESS: User '{username}' created with password '{password}'.")

if __name__ == '__main__':
    reset_admin()
