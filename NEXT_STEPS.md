# 🗺️ Unified Health Record System - Development Roadmap

## 📊 Project Status Overview
**Current Version:** 0.8 (Beta)
**Core Features:** ✅ Backend Models, ✅ Auth/RBAC, ✅ Basic Dashboards
**Focus:** 🚧 Refactoring & UI Componentization

| Area | Status | Notes |
|------|--------|-------|
| **Backend** | 🟢 Stable | Models solid. Added OTP bypass & Permission fixes. |
| **Frontend** | 🟢 Improved | Doctor Dashboard revamped (Glassmorphism). Components modularized. |
| **Security** | 🟡 In Progress | JWT & RBAC functional. Manual OTP bypass for dev. |
| **Testing** | 🔴 Missing | Unit and E2E tests are largely absent. |

---

## 🎯 Development Phases

### Phase 1: Architecture Refactoring & cleanup (Immediate Priority) 🔴
*Focus: Paying down technical debt to make future development faster.*

#### 🎨 Frontend Componentization
- [x] **Extract Reusable Components** from `DoctorDashboard.jsx` & `PatientDashboard.jsx`
  - **Completed**: `DoctorDashboard.jsx` successfully refactored into:
    - `PatientSearch.jsx`, `PatientProfile.jsx`, `MedicalRecordList.jsx`
    - `ConsultationHistory.jsx`, `DashboardStats.jsx`, `ScannerModal.jsx`
    - `ConsultationForm.jsx`, `UploadRecordForm.jsx`
  - **Key Features**: Glassmorphism UI, Detail Modals, File Viewing.
- [ ] **Centralize API Logic**
  - **Task**: Move `axios` calls from pages to `src/services/api.js` or `src/hooks/useMedicalRecords.js`.

#### 🧹 Backend Cleanup
- [ ] **Standardize Prescription Model**
  - **Task**: Standardize `Consultation.prescription` (text) and `OldPrescription.medicines` (JSON) into a unified structure if possible, or create a serializer that handles both gracefully.
- [ ] **API Documentation Update**
  - **Task**: Ensure all new endpoints (Labs, Emergency) are documented in Swagger.

---

### Phase 2: Core Feature Completion (Weeks 2-3) 🟡
*Focus: Filling the gaps in the "Essential" feature set.*

#### 🏥 Dashboard Enhancements
- [ ] **Appointment Scheduling UI**
  - **Backend**: `Appointment` model exists.
  - **Frontend**: Create a booking modal in `PatientDashboard` and a request list in `DoctorDashboard`.
- [ ] **Lab Technician Interface**
  - **Task**: Flesh out `LabDashboard.jsx` to allow uploading report PDFs directly to a Patient's record via Health ID.

#### 🔔 Notifications & Communication
- [ ] **Email/SMS Alerts**
  - **Trigger**: When a record is accessed via OTP or a new report is added.
  - **Tech**: Django Signals + SendGrid/Twilio (mock for now).

#### 🛡️ Security Hardening
- [ ] **Rate Limiting**
  - **Task**: Configure `UserRateThrottle` properly in `settings.py` for sensitive endpoints (Auth, OTP).
- [x] **OTP Bypass for Dev**
  - **Status**: Implemented `12345` specific bypass in `patients/views.py` for testing.
- [ ] **Input Validation**
  - **Task**: Ensure file uploads (Reports) validate file type (PDF/Images only) and size.

---

### Phase 3: User Experience & Polish (Weeks 4-5) 🟢
*Focus: Making it look and feel professional.*

#### 📱 Responsive Design
- [ ] **Mobile Optimization**
  - **Task**: Verify `DoctorDashboard` tables stack or scroll explicitly on mobile screens.
  - **Component**: Create a `MobileNav` for smaller screens.

#### 💅 Visual Polish
- [ ] **Loading States**
  - **Task**: Add Skeletons (Shimmer effect) while fetching data instead of just "Loading...".
- [ ] **Better Feedback**
  - **Task**: Use `react-hot-toast` or similar for success/error messages (e.g., "Prescription Sent Successfully").

---

### Phase 4: Production Readiness (Final Stretch) 🚀
*Focus: Preparing for deployment.*

#### ⚙️ DevOps & Config
- [ ] **Environment Variables**
  - **Task**: Move `SECRET_KEY`, `DB_PASSWORD`, etc., to `.env` file using `python-decouple`.
- [ ] **Static Files**
  - **Task**: Configure `Whitenoise` for serving static assets.
- [ ] **Containerization**
  - **Task**: Create `Dockerfile` and `docker-compose.yml` for Backend + Frontend + DB.

#### 🔒 Compliance & Final Security
- [ ] **Audit Log Viewer**
  - **Task**: Create a SuperAdmin view to inspect `AccessLogs` (Who viewed whose data?).
- [ ] **HTTPS Enforce**
  - **Task**: Settings configuration for secure cookies and HSTS.

---

## 🏗️ Architecture: Frontend Components

```ascii
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Badge.jsx (Role/Status)
│   ├── dashboard/
│   │   ├── StatCard.jsx
│   │   ├── PatientTable.jsx
│   │   └── RecordTimeline.jsx
│   └── medical/
│       ├── PrescriptionView.jsx
│       ├── LabReportView.jsx
│       └── QRCard.jsx
├── services/
│   ├── auth.service.js
│   ├── patient.service.js
│   └── doctor.service.js
```

## 📝 Immediate Action Items

1. **Refactor `DoctorDashboard.jsx`**: It's the most critical and complex screen. Breaking it down will immediately improve code health.
2. **Implement `Appointment` UI**: This is a high-value feature that is currently backend-only.
3. **Verify Lab Workflow**: Ensure the Lab Tech -> Upload Report -> Patient View flow works end-to-end.

