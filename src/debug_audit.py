
import os
import sys
import django

sys.path.append(r'c:\Users\Zalak\OneDrive\Documents\project\qr-health-system')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

try:
    from audit.models import AccessLog
    print("SUCCESS: Imported AccessLog")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Other Error: {e}")
