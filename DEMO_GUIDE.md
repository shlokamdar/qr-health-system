# 🎓 PulseID: The Ultimate Healthcare Ecosystem Demo

*This script covers every major functional component of the system to impress your college panel.*

## 🛠️ Step 0: Master Setup
**Objective**: Clear the stage and prep the data.

1. **Refresh the Environment**:
   Run these in your terminal from the project root:
   ```powershell
   python manage.py migrate
   python populate_more_data.py
   ```

2. **Spin up the Engines**:
   - **Backend**: `python manage.py runserver`
   - **Frontend**: `cd frontend` then `npm run dev`

---

## 🎭 Actor 1: The Patient (Onboarding & Security)
**Objective**: Registration and setting up the trust environment.

1. **Sign Up**: Register as a new patient (e.g., "Amit Sharma").
2. **Profile Completion**:
   - Go to Profile settings.
   - **Action**: Add blood group (O+), allergies (Penicillin), and chronic conditions (Asthma).
   - **Talking Point**: "PulseID doesn't just store IDs; it stores a dynamic health snapshot."
3. **The Guardian**: 
   - Add an **Emergency Contact** (Name: "Sunita Sharma", Relation: "Spouse").
   - **Talking Point**: "Sunita can grant access if Amit is ever unresponsive."
4. **The Health ID**: Showcase the **HID-XXXX** and the **QR Code**.

---

## 🎭 Actor 2: The Doctor (The Scrutiny Flow)
**Objective**: Demonstrating Role-Based Access and OTP-secured views.

1. **Doctor Login**: Login as a verified doctor (e.g., `drarjun`).
2. **The Search**: Enter Amit's Health ID in the Search bar.
3. **The Gatekeeper (OTP)**: 
   - Click "Request Full Access".
   - **Action**: Choose "Send OTP to Patient".
   - **Talking Point**: "Privacy is paramount. Doctors cannot see Amit's history without his explicit consent via OTP."
4. **Verification**: 
   - Switch tabs to the Patient's Dashboard. Show the OTP arriving.
   - Enter the OTP in the Doctor's screen.
5. **Insights**: Show the doctor browsing through Amit's past prescriptions.

---

## 🎭 Actor 3: The Lab Technician (The Diagnostic Cycle)
**Objective**: Formal report generation.

1. **Lab Tech Login**: Login as a lab technician (e.g., `labtechneha`).
2. **Upload Report**:
   - Search for Amit's Health ID.
   - Upload a "Blood Test" report.
   - **Talking Point**: "Labs operate independently, feeding data directly into the patient's global record."

---

## 🎭 Actor 4: Emergency Scenario (Life-Saving Access) 🚨
**Objective**: High-stakes use case.

1. **Explainer**: "What if the patient is unconscious and cannot provide an OTP?"
2. **Action**: Doctor clicks "Emergency Access".
3. **The Workflow**: Choose "Contact Emergency Guardian (Sunita)".
4. **The Notification**: Show (or explain) that Sunita receives a bypass request. Once she confirms, the doctor gets instant access to life-saving allergies and blood group info.

---

## 🎭 Actor 5: User Support (The Safety Net)
**Objective**: Handling real-world errors.

1. **Raising a Ticket**: As the Patient (Amit), click "Support" and raise a ticket: *"Incorrect report uploaded by City Lab."*
2. **Admin Action**: Open the Django Admin -> Support folder. Resolve the ticket.
3. **Talking Point**: "The system includes an integrated helpdesk for data integrity and user assistance."

---

## 🎭 Actor 6: The Admin & Auditor (The "A+" Section)
**Objective**: Explaining technical superiority (Security & Logs).

1. **Audit Logs**: Navigate to `Admin -> AccessLog`.
2. **Point Out**:
   - **IP Addresses**: "Every access is tied to a physical device/IP."
   - **Actions**: "VIEW_RECORDS, LOGIN, UPLOAD_RECORDS — all tracked."
   - **Timestamp**: "Un-editable proof for legal compliance."
3. **Developer Insights**:
   - Mention **SimpleJWT** for secure authentication.
   - Show **Swagger Documentation** (`/swagger`) to show clean API design.

---

## 🏁 Final Pitch
"PulseID is more than a project; it's a HIPAA-inspired, secure, and unified framework that puts the patient back in control of their own life."
