import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def check_and_fix_admin():
    username = 'admin'
    try:
        user = User.objects.get(username=username)
        print(f"User '{username}' found.")
        print(f"Current Role: {user.role}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")

        if user.role != 'ADMIN':
            print(f"Updating role from '{user.role}' to 'ADMIN'...")
            user.role = 'ADMIN'
            user.save()
            print("Role updated.")
        
        if not user.is_superuser:
            print("Updating is_superuser to True...")
            user.is_superuser = True
            user.save()
            print("is_superuser updated.")
            
        if not user.is_staff:
            print("Updating is_staff to True...")
            user.is_staff = True
            user.save()
            print("is_staff updated.")
            
        print(f"Final State -> Role: {user.role}, Superuser: {user.is_superuser}")

    except User.DoesNotExist:
        print(f"User '{username}' not found. Creating it...")
        User.objects.create_superuser('admin', 'admin@example.com', 'password123', role='ADMIN')
        print("User 'admin' created with role 'ADMIN' and password 'password123'.")

if __name__ == '__main__':
    check_and_fix_admin()
