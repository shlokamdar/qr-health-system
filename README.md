# PulseID: Secure QR-Based Unified Health Record System

PulseID is a state-of-the-art, secure, and unified digital healthcare platform designed to provide instant access to life-saving patient records during emergencies. Built on a robust and modern architecture using **Django REST Framework** and **React**, it enables secure medical data sharing via dynamic QR codes, protected by two-factor verification workflows.

---

## 🚀 Key Features

*   **Secure Unified Health ID (HID)**: Automatically generates a unique, cryptographic Health ID and high-definition dynamic QR Code for every registered patient.
*   **Dual-Tier Emergency Workflows**:
    *   *Public QR Scan (Basic Tier)*: Provides immediate access to critical life-saving information (blood group, allergies, chronic conditions, and emergency contacts) without requiring login.
    *   *Secure Verification (Full Access Tier)*: Allows authorized doctors to request comprehensive clinical records (consultations, lab test ledgers, and history) via secure One-Time PIN (OTP) verification sent to the patient or emergency contacts.
*   **Granular Role-Based Access Control (RBAC)**: Supports customized dashboards and functionalities for **Patients**, **Doctors**, **Lab Technicians**, and **System Administrators**.
*   **Clinical Medical Ledger**: Unified timeline containing doctor consultations, laboratory diagnostic reports, and personal uploads.
*   **Secure Document Exports**: Direct download of password-protected PDF medical summaries for patients.
*   **Comprehensive Audit Trails**: Automated `AccessLog` logging of every single profile access, upload, and permission modification for institutional accountability and compliance.

---

## 📂 Project Structure

```text
qr-health/
├── accounts/           # User Authentication, Profiles & Custom Roles
├── audit/              # Access Logs & Compliance Security Tracking
├── config/             # Central Django Configuration & Security Rules
├── doctors/            # Doctor Profiles & Consultation Workflows
├── labs/               # Lab Technicians & Diagnostic Seeding Commands
├── patients/           # Patient Profiles, OTP Requests, & QR Generation
├── records/            # Clinical Records Structure
├── role_permissions/   # Custom Role Rules & Access Guards
├── support/            # Help Center & In-App Support Services
├── utils/              # PDF Generation, Emails & Shared Helpers
├── frontend/           # React Frontend Application (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Interactive Role Dashboards & Public Views
│   │   ├── utils/      # Axios API Interceptors with Auto-Token Headers
│   │   └── App.jsx     # Routing & Application Flow
│   ├── package.json
│   └── vite.config.js
├── db.sqlite3          # Database Store (SQLite for Local Prototype)
├── manage.py           # Django Management Entrypoint
└── README.md
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
*   Python 3.10+
*   Node.js 16+

---

### 1. Backend Server Setup

1. **Activate Environment**:
   ```bash
   # Create a virtual environment
   python -m venv venv

   # Activate on Windows (PowerShell)
   .\venv\Scripts\Activate.ps1

   # Activate on Mac/Linux
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Setup**:
   ```bash
   python manage.py migrate
   ```

4. **Initialize Standard Lookup Data**:
   ```bash
   # Seed standard lab tests
   python manage.py runscript populate_lab_tests
   ```

5. **Start Dev Server**:
   ```bash
   python manage.py runserver
   ```
   *The API server will run at: `http://127.0.0.1:8000`.*

---

### 2. Frontend Application Setup

1. **Navigate and Install**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Dev Environment**:
   ```bash
   npm run dev
   ```
   *The React application will run at: `http://localhost:5173`.*

---

## 📖 Access & Usage Guide

### Automated Documentation
*   **Interactive Swagger Specification**: `http://127.0.0.1:8000/swagger/`
*   **ReDoc Technical Overview**: `http://127.0.0.1:8000/redoc/`

### System Roles
*   **Patients**: Manage emergency settings, add emergency contacts, upload historic prescriptions, download password-secured health summaries, and grant/revoke active doctor permissions.
*   **Doctors**: Perform health record searches, request OTP verification for full profiles, log new patient consultation summaries, and view unified patient medical ledgers.
*   **Lab Technicians**: Manage diagnostic uploads, file official reports, and record diagnostic test results.
*   **Administrators**: Access the administrative control panel (`/admin`) to audit database transactions, view `AccessLogs`, and manage user roles.
