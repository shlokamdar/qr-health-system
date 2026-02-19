
print("Verifying DoctorDashboard.jsx for Mobile Optimization & Feedback...")

file_path = r'c:\Users\Zalak\OneDrive\Documents\project\qr-health-system\frontend\src\pages\DoctorDashboard.jsx'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for Import MobileNav
    if "import MobileNav from '../components/doctor/MobileNav';" in content:
        print("[PASS] MobileNav imported.")
    else:
        print("[FAIL] MobileNav NOT imported.")

    # Check for Import toast
    if "import toast from 'react-hot-toast';" in content:
        print("[PASS] toast imported.")
    else:
        print("[FAIL] toast NOT imported.")

    # Check for usage of toast instead of alert
    if "alert(" not in content:
        print("[PASS] No alert() calls found.")
    else:
        print("[FAIL] alert() calls still exist.")

    # Check for MobileNav component usage
    if "<MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />" in content:
        print("[PASS] MobileNav component used.")
    else:
        print("[FAIL] MobileNav component NOT found in JSX.")

    # Check for hidden top tab bar on mobile
    if "className=\"hidden md:flex border-b border-slate-100" in content:
        print("[PASS] Top tab bar hidden on mobile.")
    else:
        print("[FAIL] Top tab bar NOT hidden on mobile.")

except Exception as e:
    print(f"Error reading file: {e}")
