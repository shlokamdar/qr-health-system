import os
import sys
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

print("Starting diagnostic...")

try:
    print("Attempting to load settings...")
    from config import settings as project_settings
    print("Settings loaded.")
except Exception as e:
    print(f"FAILED to load settings: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("Attempting django.setup()...")
try:
    from django.apps import apps
    from django.conf import settings
    
    # Manually configure if not already
    if not settings.configured:
        django.setup()
    
    # If setup didn't fail, try loading each app
    for app_name in settings.INSTALLED_APPS:
        if not app_name.startswith('django.'):
            print(f"Loading app: {app_name}")
            try:
                apps.get_app_config(app_name.split('.')[-1])
                print(f"  {app_name} loaded successfully.")
            except Exception as e:
                print(f"  FAILED to load {app_name}: {e}")
                import traceback
                traceback.print_exc()
except Exception as e:
    print(f"django.setup() or app loading failed: {e}")
    import traceback
    traceback.print_exc()
