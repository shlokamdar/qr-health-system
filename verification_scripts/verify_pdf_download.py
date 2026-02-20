
import requests

BASE_URL = "http://localhost:8000/api/"

def test_pdf_download():
    # Login as patient
    login_data = {
        "username": "patient",
        "password": "password123"
    }
    print(f"Logging in as {login_data['username']}...")
    try:
        response = requests.post(f"{BASE_URL}auth/login/", json=login_data)
        response.raise_for_status()
        tokens = response.json()
        access_token = tokens['access']
        print("Login successful.")
        
        # Test PDF download
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        print("Testing PDF download endpoint...")
        pdf_response = requests.get(f"{BASE_URL}patients/me/download_pdf/", headers=headers)
        
        if pdf_response.status_code == 200:
            print("Successfully reached PDF download endpoint!")
            print(f"Content-Type: {pdf_response.headers.get('Content-Type')}")
            print(f"Content-Disposition: {pdf_response.headers.get('Content-Disposition')}")
            
            with open("test_medical_report.pdf", "wb") as f:
                f.write(pdf_response.content)
            print("PDF saved as test_medical_report.pdf")
        else:
            print(f"Failed to download PDF. Status code: {pdf_response.status_code}")
            print(f"Response: {pdf_response.text}")
            
    except Exception as e:
        print(f"Error during verification: {e}")

if __name__ == "__main__":
    test_pdf_download()
