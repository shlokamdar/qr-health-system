
import os
import sys
import django
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.request import Request
from config.urls import schema_view

def verify_swagger_schema():
    print("Starting Swagger Schema Verification...")
    
    # Create request
    factory = RequestFactory()
    wsgi_request = factory.get('/swagger/?format=openapi', content_type='application/json')
    
    # Mock Superuser
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(username='swagger_test').exists():
         User.objects.create_superuser('swagger_test', 'test@example.com', 'password')
    wsgi_request.user = User.objects.get(username='swagger_test')
    
    # Wrap in DRF Request
    request = Request(wsgi_request)
    
    # Get schema view function
    view = schema_view.without_ui(cache_timeout=0)
    
    try:
        response = view(wsgi_request)
        
        if response.status_code == 200:
            print("Schema generated successfully.")
            
            # Response data should be the schema dictionary (Codec) or bytes?
            # DRF-YASG returns a Response with data as dictionary or yaml
            
            schema = response.data
            
            if not schema or not schema.get('paths'):
                print("Schema has no paths!")
                return

            paths_list = list(schema['paths'].keys())
            
            with open('swagger_paths.txt', 'w') as f:
                for p in paths_list:
                    f.write(p + '\n')
            
            print(f"Dumped {len(paths_list)} paths to swagger_paths.txt")
            
            # Check for our endpoints
            found_lab = False
            found_otp = False
            
            for p in paths_list:
                if 'labs/reports' in p:
                    print(f"Found match for labs: {p}")
                    found_lab = True
                if 'patients/otp/request' in p:
                    print(f"Found match for otp: {p}")
                    found_otp = True
            
            if found_lab and found_otp:
                print("SUCCESS: All endpoints found.")
            else:
                print("FAILURE: Missing endpoints.")
                
        else:
            print(f"Schema view returned status {response.status_code}")
            print(response.content)

    except Exception as e:
        print(f"Schema generation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_swagger_schema()
