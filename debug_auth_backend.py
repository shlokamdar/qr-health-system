import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

def test_auth():
    username = 'shloka'
    password = 'password123'

    print(f"Testing authentication for user: {username}")
    
    # 1. Check if user exists and is active
    try:
        user = User.objects.get(username=username)
        print(f"User found: ID={user.id}, Role={user.role}, Active={user.is_active}")
        print(f"Password hash: {user.password[:20]}...")
        
        # 2. Check password check
        if user.check_password(password):
            print("check_password() passed!")
        else:
            print("check_password() FAILED!")
            
    except User.DoesNotExist:
        print("User does not exist!")
        return

    # 3. Test authenticate()
    user_auth = authenticate(username=username, password=password)
    if user_auth:
        print("authenticate() returned User object. Login SHOULD work.")
    else:
        print("authenticate() returned None. Django auth backend rejected credentials.")

if __name__ == '__main__':
    test_auth()
