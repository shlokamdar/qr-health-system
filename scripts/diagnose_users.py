import os
import sys
import django
from django.contrib.auth import get_user_model

# Add the project root to the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

print("--- Listing All Users and Emails ---")
for user in User.objects.all():
    print(f"Username: {user.username}, Email: {user.email}, Role: {user.role}")
print("--- End of List ---")
