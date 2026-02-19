# 🏥 Unified Health Record System

A secure, digital health record management system that allows patients to carry their medical history via a QR code and grants doctors temporary access through an OTP-based permission system.

---

## 🚀 Key Features

### 👤 For Patients
- **Digital Health ID & QR Code**: Every patient gets a unique Health ID and a QR code for quick profile access.
- **Medical History**: View consultation history, prescriptions, and lab reports in one place.
- **Document Locker**: Upload and store external medical reports, insurance, and ID proofs.
- **Access Control**:
    - **QR Scan**: Allows doctors to view *basic* profile details.
    - **OTP Verification**: Grants doctors *temporary full access* to add records and view private documents.
- **Appointment Booking**: Book appointments with registered doctors.

### 👨‍⚕️ For Doctors
- **Patient Lookup**: Scan a patient's QR code or manually search by Health ID.
- **Consultation Management**: Record diagnoses, prescriptions, and notes digitally.
- **Verification System**: Doctors must be verified by admin to access the platform.
- **Hospital Affiliation**: Link profiles to registered hospitals.

### 🧪 For Lab Technicians
- **Report Upload**: Upload lab test results directly to a patient's profile.

### 🛡️ Security & Privacy
- **Role-Based Access Control (RBAC)**: Strict separation between Patients, Doctors, Admin, and Lab Techs.
- **Temporal Access**: Doctor access expires automatically or can be revoked by the patient.
- **Data Privacy**: Sensitive records are hidden until OTP verification is complete.

---

## 📂 Project Structure

### Backend (`/`)
Built with **Django & Django REST Framework**.

| Directory | Purpose |
|---|---|
| `config/` | Project settings, URL routing, and WSGI/ASGI config. |
| `accounts/` | User authentication, custom `User` model, and role management. |
| `patients/` | Patient profiles, QR code generation, document storage, and access permissions. |
| `doctors/` | Doctor profiles, hospital affiliations, and consultation logic. |
| `records/` | Medical records handling (prescriptions, reports). |
| `labs/` | Lab technician interface and report uploads. |
| `audit/` | (Planned) Access logs and system monitoring. |

### Frontend (`/frontend`)
Built with **React + Vite**.

| Directory | Purpose |
|---|---|
| `src/pages/` | Main views (Login, Dashboards for Patient/Doctor/Admin). |
| `src/components/` | Reusable UI components. |
| `src/components/patient/` | Patient-specific components (MedicalList, AppointmentBooking, etc.). |
| `src/components/doctor/` | Doctor-specific components (PatientSearch, ConsultationForm, etc.). |
| `src/services/` | API integration (Axios calls to backend). |
| `src/context/` | Global state management (AuthContext). |

---

## 🔄 User Flows

### 1. Patient Registration & Profile
1.  **Sign Up**: User registers as a Patient.
2.  **QR Generation**: System automatically assigns a Health ID and generates a QR code.
3.  **Dashboard**: Patient logs in to view their QR code, appointments, and records.

### 2. Doctor-Patient Interaction (The Core Flow)
1.  **Scan/Search**: Doctor scans Patient's QR code or searches Health ID.
2.  **Basic View**: Doctor sees basic info (Name, Age, Blood Group) but **cannot** see records.
3.  **Request Access**: Doctor clicks "Request Full Access".
4.  **OTP Verification**: Patient accepts request -> System sends OTP -> Doctor enters OTP.
5.  **Consultation**: Doctor gains **Full Access** to:
    - View past history.
    - Add a new consultation/prescription.
    - Upload documents.
6.  **Completion**: Access serves its purpose and expires/is revoked.

### 3. Lab Reporting
1.  Lab Tech searches usage Patient Health ID.
2.  Uploads PDF/Image report.
3.  Report appears instantly in Patient's "Lab Reports" section.

---

## ✅ Feature Status

### Completed
- [x] User Authentication (Login/Register) for all roles.
- [x] QR Code Logic & Health ID generation.
- [x] Patient Dashboard (Records, Documents, Appointments).
- [x] Doctor Dashboard (Patient Search, OTP Verification, Consultation).
- [x] Medical Record & Prescription Management.
- [x] Basic Appointment Booking.

### In Progress / Pending
- [ ] Email/SMS Notifications for OTPs.
- [ ] Lab Technician Dashboard improvements.
- [ ] Admin Audit Logs.
- [ ] Mobile-responsive navigation improvements.

---

## 🛠️ Setup & Installation

### Backend
1.  Create virtual env: `python -m venv venv`
2.  Activate: `.\venv\Scripts\activate` (Windows)
3.  Install deps: `pip install -r requirements.txt`
4.  Run migrations: `python manage.py migrate`
5.  Start server: `python manage.py runserver`

### Frontend
1.  Navigate to `frontend`: `cd frontend`
2.  Install deps: `npm install`
3.  Run dev server: `npm run dev`

### Test Credentials
See `passwords.md` for pre-seeded user accounts.
