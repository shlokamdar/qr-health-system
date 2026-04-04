# Unified Health Record System (PulseID) - Project Overview

## 1. Project Features
A secure, prototype healthcare system allowing doctors and healthcare providers to access patient medical records via QR code scanning, built with **Django REST Framework** (Backend) and **React** (Frontend).

### Core Capabilities
- **QR Code Health Access**: Patients get a unique Health ID and a generated QR code. Scanning the QR code leads to a quick public view, with an option for the doctor to request higher-level access.
- **Role-Based Access Control (RBAC)**: Distinct portals and permissions for Patients, Doctors, Lab Technicians, Hospital Admins, and System Admins.
- **Granular Sharing Permissions**: Patients can grant "QR Quick Preview" (24hr temporary view) or "OTP Full Access" for deeper records.
- **End-to-End OTP Verification Flow**: OTP requests support attempts tracking, delivery methods (Dashboard, SMS, Email), and revocation. Digital PIN pad UI for OTP entry.
- **Comprehensive Audit Trail**: Every critical action (viewing profiles, accessing records, granting access, logging in) is logged securely via the `AccessLog` model for HIPAA-style compliance tracking.
- **Organization Management**: Hospitals and Diagnostic Labs can onboard natively, adding their relative doctors and technicians under their umbrella.
- **System Admin Approval Flow**: Doctors, Hospitals, and Labs must be verified/approved by a System Admin before gaining active system privileges.
- **Medical Records System**: Tracking for Past Prescriptions, Consultations (visit notes, medicines), Lab Reports, and Patient-uploaded documents.
- **Support & Ticketing**: Built-in support ticket management between users and system admins.

---

## 2. Users and Roles
The system extends Django's `AbstractUser` to support multiple distinct roles:

1. **Patient (PATIENT)**
   - Registration/Login, manages medical profile (allergies, chronic conditions, blood group).
   - Views auto-generated Health ID and QR code.
   - Sets Emergency Contacts who can grant access proxy.
   - Uploads old prescriptions, insurance, and ID proofs.
   - Manages pending OTP requests (approve/revoke) directly from the dashboard.
   - Downloads a password-protected Health Card PDF.

2. **Doctor (DOCTOR)**
   - Can operate independently or under a `Hospital`.
   - Requires verification by System Admin.
   - Has Authorization Levels (`BASIC`, `STANDARD`, `FULL`).
   - Scans QR/Enters Health ID -> Views Patient History (requires OTP for full access).
   - Creates new Consultations, writes prescriptions, adds medical notes.
   - Books and manages Appointments.

3. **Lab Technician (LAB_TECH)**
   - Must be attached to a `DiagnosticLab`.
   - Requires verification.
   - Uploads `LabReport`s containing test results, file attachments, and comments directly to a patient's Health ID.

4. **Hospital Admin (HOSPITAL_ADMIN)**
   - Manages a specific `Hospital` entity.
   - Manages linked `Department`s.
   - Oversees affiliated Doctors, Lab Technicians, and unified visit logs.

5. **System Admin (ADMIN)**
   - Overall system manager.
   - Approves/Rejects/Revokes access for Doctors, Hospitals, and Labs.
   - Views global real-time stats, registration trends, and detailed Audit Logs.
   - Resolves Support Tickets.

---

## 3. Database Models and Schema

### 3.1 Accounts (`accounts/`)
- **`User`**: Custom user extending `AbstractUser`, enforces unique email, adds `role` choices.
- **`Notification`**: Generic notification model.

### 3.2 Patients (`patients/`)
- **`Patient`**: 1-to-1 with `User`. Stores `health_id`, `qr_code`, medical vitals (blood group, allergies, conditions).
- **`EmergencyContact`**: Proxy access granters.
- **`PatientDocument`**: Reports, ID Proofs, Insurance uploaded by the patient.
- **`OldPrescription`**: Legacy data uploads by patient.
- **`SharingPermission`**: Access bridges between Patient and Doctor (`QR_QUICK`, `OTP_FULL`, `EMERGENCY`). Tracking expiry and active status.
- **`OTPRequest`**: Logs doctor's request for access, OTP code, delivery method, verification status, and attempts.

### 3.3 Doctors & Hospitals (`doctors/`)
- **`Hospital`**: Org model (verified/pending).
- **`Department`**: Sub-division of Hospital.
- **`HospitalAdmin`**: 1-to-1 with `User`, linked to `Hospital`.
- **`Doctor`**: 1-to-1 with `User`. Linked to `Hospital` and `Department` (optional). Stores license details, specialization, and docs.
- **`Consultation`**: Records a doctor-patient visit (complaint, diagnosis, medicines, notes).
- **`Appointment`**: Scheduling model.

### 3.4 Labs (`labs/`)
- **`DiagnosticLab`**: Lab organization model.
- **`LabTechnician`**: 1-to-1 with `User`, linked to `DiagnosticLab`.
- **`LabTest`**: Catalog of standard tests.
- **`LabReport`**: Specific test execution attached to a `Patient` by a `LabTechnician`.

### 3.5 Records (`records/`)
- **`MedicalRecord`**: Generic records (Prescription, Diagnosis, Visit Note) uploaded by Doctors.

### 3.6 Audit (`audit/`)
- **`AccessLog`**: Retains unalterable logs of who (`actor`), what (`action`), when (`timestamp`), and context (`patient`, `ip_address`).

### 3.7 Support (`support/`)
- **`SupportTicket`**: User-submitted tickets (Status, Priority, Admin Notes).

---

## 4. APIs and URLs (Backend)

Built using Django REST Framework (DRF) + SimpleJWT.

### Authentication (`/api/auth/`)
- `POST /register/` — Core user creation.
- `POST /login/` (JWT Obtain Pair) & `POST /refresh/` — Authentication.
- `GET /me/` — Get currently authenticated user details.
- Password Resets & Check Username.
- `Router /notifications/`

### Patient Endpoints (`/api/patients/`)
- `GET /sharing-history/`
- **OTP Operations**: `/otp/request/`, `/otp/verify/`, `/otp/pending/`, `/otp/revoke/<id>/`
- **Routers**: `/emergency-contacts/`, `/documents/`, `/prescriptions/`, `/sharing/`, `/` (Patient ViewSet)

### Doctor Endpoints (`/api/doctors/`)
- `POST /register/` — Doctor specific signup.
- `GET /me/` — Doctor profile.
- `GET /verified/` — List of system-approved doctors.
- `GET /patient-history/<str:health_id>/` — Fetch patient clinical timeline.
- **Hospital Endpoints**: `/hospitals/me/`, `/hospitals/doctors/`, `/hospitals/labs/`, `/hospitals/technicians/`, `/hospitals/stats/`, `/hospitals/visit-logs/`
- **Routers**: `/hospitals/`, `/consultations/`, `/appointments/`, `/departments/`

### Lab Endpoints (`/api/labs/`)
- `POST /register/`, `GET /me/`, `GET /tests/`, `GET /recent-uploads/`, `GET /patient-reports/<health_id>/`
- **Admin Lab Management**: `/admin/list/`, `/admin/verify/<id>/`, `/admin/technicians/`
- **Routers**: `/organizations/`, `/reports/`

### Record Endpoints (`/api/records/`)
- **Router**: `/` (General MedicalRecord model CRUD operations)

### System Admin Analytics (`/api/admin/`)
- `/stats/` — Realtime system analytics.
- `/doctors/`, `/doctors/<id>/manage/` — Manage Doctors.
- `/hospitals/`, `/hospitals/<id>/manage/` — Manage Hospitals.
- `/labs/`, `/labs/<id>/manage/` — Manage Labs.

### Audit & Support
- `/api/audit/` — Access logs viewing.
- `/api/support/` — Ticketing system CRUD.

### Documentation
- Swagger UI (`/swagger/`) and ReDoc (`/redoc/`)

---

## 5. Frontend Pages and Routes (React)

Powered by Vite, React Router, and TailwindCSS.

### Public & Shared Pages
- `/` — Landing/Homepage.
- `/about`, `/privacy`, `/terms` — Informational.
- `/login`, `/register`, `/reset-password/:token` — Unified auth pages.
- `/patients/:healthId` — **Public Patient View**: Displayed when a QR code is randomly scanned, shows base details and prompt to trigger OTP request.

### Role-Specific Portals
#### Patient
- `/patient/login`, `/patient/register`
- `/patient/dashboard` — Main hub, QR view, pending OTP manager, upload handlers.

#### Doctor
- `/doctor/login`, `/doctor/register`
- `/doctor/dashboard` — Scan QR tool, patient history browser, consultation entries.

#### Hospital Admin
- `/hospital/login`, `/hospital/register`
- `/hospital/dashboard` — Manage linked doctors, unified logs.

#### Lab Technician
- `/lab/login`, `/lab/register`
- `/lab/dashboard` — Upload lab test results, view recent submissions.

#### System Admin
- `/system/login` — Specific secure portal.
- `/admin-dashboard` — Overarching approval hub and stats dashboard.
