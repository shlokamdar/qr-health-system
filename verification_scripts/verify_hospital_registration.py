import requests
import json
import random
import string

BASE_URL = "http://127.0.0.1:8000/api"

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_test():
    # 1. Register a new hospital
    hospital_name = f"Test Hospital {get_random_string()}"
    reg_number = f"REG-{get_random_string().upper()}"
    
    print(f"[*] Registering Hospital: {hospital_name} ({reg_number})...")
    
    reg_data = {
        "name": hospital_name,
        "address": "123 Test St",
        "registration_number": reg_number,
        "phone": "555-0199",
        "email": f"contact@{get_random_string()}.com"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/doctors/hospitals/", json=reg_data)
        if resp.status_code == 201:
            print("[+] Registration Successful!")
            hospital_id = resp.json().get('id') # Note: Endpoint might not return ID if using default serializer, let's check.
            # actually HospitalRegisterSerializer might not return the full obj including ID if it's just 'create'. 
            # But standard CreateAPIView usually returns the serialized instance.
            # If the serializer Meta fields are limited, it returns those fields.
            # HospitalRegisterSerializer only has ['name', 'address', ...] no ID.
            # So we might not get ID here. We'll find it via Admin List.
            print(f"    Response: {resp.json()}")
        else:
            print(f"[-] Registration Failed: {resp.status_code} - {resp.text}")
            return
            
    except Exception as e:
        print(f"[-] Error during registration: {e}")
        return

    # 2. Login as Admin
    print("\n[*] Logging in as Admin...")
    login_data = {"username": "admin", "password": "password123"}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if resp.status_code == 200:
            token = resp.json().get("access")
            print("[+] Admin Login Successful")
        else:
            print(f"[-] Admin Login Failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"[-] Error during login: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. List Hospitals (Admin) and find the new one
    print("\n[*] Fetching Hospital List...")
    hospital_id = None
    try:
        resp = requests.get(f"{BASE_URL}/admin/hospitals/", headers=headers)
        if resp.status_code == 200:
            hospitals = resp.json()
            print(f"    Found {len(hospitals)} hospitals.")
            
            target_hospital = next((h for h in hospitals if h["registration_number"] == reg_number), None)
            
            if target_hospital:
                print(f"[+] Found newly registered hospital: ID {target_hospital['id']}")
                print(f"    Current Verification Status: {target_hospital['is_verified']}")
                hospital_id = target_hospital['id']
                
                if target_hospital['is_verified']:
                     print("[-] Unexpected: Hospital is already verified.")
                else:
                    print("[+] Correct: Hospital is Pending Verification.")
            else:
                 print("[-] Failed to find the new hospital in the list.")
                 return
        else:
            print(f"[-] Failed to fetch hospitals: {resp.status_code}")
            return
    except Exception as e:
        print(f"[-] Error fetching hospitals: {e}")
        return

    # 4. Approve Hospital
    if hospital_id:
        print(f"\n[*] Approving Hospital ID {hospital_id}...")
        try:
            resp = requests.patch(f"{BASE_URL}/admin/hospitals/{hospital_id}/manage/", json={"verify": True}, headers=headers)
            if resp.status_code == 200:
                print("[+] Approval Request Sent.")
                print(f"    Response: {resp.json()}")
            else:
                print(f"[-] Approval Failed: {resp.status_code} - {resp.text}")
                return
        except Exception as e:
             print(f"[-] Error verifying hospital: {e}")
             return

        # 5. Verify Status Change
        print("\n[*] Verifying Final Status...")
        try:
             resp = requests.get(f"{BASE_URL}/admin/hospitals/", headers=headers)
             target_hospital = next((h for h in resp.json() if h["id"] == hospital_id), None)
             if target_hospital and target_hospital['is_verified']:
                 print("[SUCCESS] Hospital is now VERIFIED.")
             else:
                 print("[-] Failed: Hospital is still NOT verified.")
        except Exception as e:
             print(f"[-] Error verification check: {e}")

if __name__ == "__main__":
    run_test()
