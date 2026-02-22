# PulseID — Next Steps & Issue Tracker
Last updated: 22nd Feb 2026 12:15PM
Legend: 🔴 Bug/Blocker | 🟡 In Progress | 🟢 Done | 🔵 New Feature | ⚠️ Decision Needed

---

## 1. SYSTEM ADMIN (`/system/login` → `/admin-dashboard`)

**Backend:**
- [x] 🟢 Wire `/system/login` authentication to `/admin-dashboard` (real JWT auth via `AuthContext`)
- [x] 🟢 Admin: Approve / Reject doctor registrations with reason field
  - `rejection_reason` field added to `Doctor` model (migration applied)
  - `DoctorVerificationView` handles `verify: true/false` + `rejection_reason`
- [x] 🟢 Admin: View full doctor profile + uploaded license documents
- [x] 🟢 Admin: Manually create users (Patient, Doctor, Lab Tech, Admin)
- [x] 🟢 Admin: Register hospitals and labs, assign staff to them
- [x] 🟢 Admin: Ticketing system — patients/doctors can raise complaints, admin resolves
- [x] 🟢 Admin: Organ donation verification workflow
  - Admin reviews and approves/rejects organ donor status per patient
  - Approved status reflects on Health ID card
  - Rejected status shows "REJECTED" on card and modal with reason display

**Test credentials:** `sysadmin / Admin@1234` at `/system/login`

---

## 2. PATIENT REGISTRATION

**Bugs:**
- [x]  Health ID card download fixed — PNG download via html2canvas (dashboard only)
- [x] 🟢 Registration card preview — shows read-only preview, download moved to dashboard

**Features to add:**
- [ ] Emergency contacts during registration OR via dashboard "Complete Your Profile" prompt

  ⚠️ **DECISION NEEDED:** Collect emergency contacts + address at registration (longer form)
  OR show a "Complete Your Profile" banner on dashboard after registration (better UX, less friction)?
  **Recommendation:** Collect only critical fields at registration (name, DOB, blood group, email,
  password). Everything else (emergency contacts, address, organ donor) goes into a
  "Complete Your Profile" checklist on the dashboard. Show a completion % indicator.

- [x] 🟢 Card redesign to fit all details:
  - Front: Health ID, name, blood group, organ donor status, QR code
  - Back: Emergency contacts (up to 2), patient address, "Issued by PulseID"
  - Card download (PNG + PDF) available from dashboard only, not during registration

---

## 3. DOCTOR REGISTRATION

- [x] 🟢 UI redesign — 4-step wizard with modern visuals and progress tracking (DoctorRegister.jsx)
- [x] 🟢 Doctor linked to Hospital via dropdown in registration wizard
- [x] 🟢 License document upload connects to admin verification queue
- [x] 🟢 Post-submission: show verification pending screen, no dashboard access until approved
- [x] 🟢 Email notification to doctor when approved/rejected by admin (rejection reason shown on screen)

---

## 4. HOSPITAL & LAB ONBOARDING

- [x] 🟢 Hospital Registration (`/hospital/register`) — form built, backend registered
- [x] 🟢 Lab Registration (`/lab/register`) — form built, backend registered
- [x] 🟢 Admin can verify hospitals and labs via `/admin-dashboard`
- [x] 🟢 Hospital Admin role (`HOSPITAL_ADMIN`) — model, auth, and seeding complete
- [x] 🟢 Hospital Dashboard (`/hospital/dashboard`) — built with stats, doctor & lab lists
- [x] 🟢 Staff Assignment:
  - Doctors self-select their hospital during registration (dropdown of approved hospitals)
- [x] 🟢 Lab Techs are assigned to a lab by the Hospital admin via the Staff Management tab
- [x] 🟢 Lab Tech onboarding UI and backend flow implemented

⚠️ **DECISION NEEDED:** Who manages hospital staff?
  Option A: Hospital has its own admin dashboard to manage its doctors/labs/staff
  Option B: System admin manages all staff assignments centrally
  **Recommendation:** Option A long-term (Hospital Dashboard built), Option B for now

---

## 5. PATIENT DASHBOARD

- [x]  Card download (PNG) via html2canvas — works from dashboard
- [x] 🟢 Edit profile details (name, phone, address, blood group, allergies, chronic conditions)
- [x] 🟢 Organ donor edit → triggers admin verification workflow, shows "Pending" until approved
- [x] 🟢 Emergency contacts: add/edit/remove (max 3), reflected on card
- [x] 🟢 "Complete Your Profile" checklist banner if profile < 100% complete OR missing emergency info
- [x] 🟢 Access Control: Accept/Deny doctor requests, revoke active access, view history — built (SharingPermission model + Sharing & Access tab)

---

## 6. DOCTOR DASHBOARD

⚠️ UI redesigned with premium PulseID aesthetic. Core features built.

**Remaining:**
- [x] 🟢 Verification status banner / gate screen (Pending or Rejected with reason)
- [x] 🟢 Patient search (Health ID input + QR scan) — built
- [x] 🟢 Basic View → Request Full Access → OTP Entry → Full Access flow — built
- [x] 🟢 Add consultation form (diagnosis, symptoms, treatment, prescription) — built
- [x] 🟢 View patient medical history (timeline) — built
- [x] 🟢 Upload lab report for patient — built (UploadRecordForm with LAB_REPORT type in Patient Lookup tab)
- [x] 🟢 Notifications: access approvals, appointment confirmations — built (Notifications tab with pending appointment cards + consultations feed)
- [x] 🟢 Appointment schedule view — built

---

## 7. HOSPITAL DASHBOARD

- [x] 🟢 Built with stats, doctor & lab lists (`/hospital/dashboard`)
- [x] 🟢 Hospital Admin role and `HospitalAdmin` model complete
- [x] 🟢 Department management
- [x] 🟢 Patient visit logs (anonymised)

---

## 8. LAB DASHBOARD

- [x] 🟢 Lab Tech login + dashboard built (`/lab/dashboard`)
- [x] 🟢 Patient lookup by Health ID — built (Patient Lookup tab with report history)
- [x] 🟢 Upload report: type, date, file (PDF/image), notes — built (Upload tab)
- [x] 🟢 View uploaded reports history — built (Upload History tab with search)
- [x] 🟢 Link to parent hospital — shown in Profile tab via `lab_details.hospital_details`

---

## OPEN DECISIONS

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | When to collect emergency contacts + address? | At registration vs dashboard prompt | Dashboard "Complete Profile" |
| 2 | Who manages hospital staff? | System admin vs Hospital admin | Hospital admin (dashboard built) |
| 3 | Card download method? | Backend PDF vs Frontend PNG | Frontend PNG (html2canvas) — done ✅ |
| 4 | Organ donor verification — who approves? | System admin | System admin via verification queue |
| 5 | Lab Tech registration flow? | Self-register vs Hospital admin adds them | Hospital admin assigns (cleaner) |

---

## BUILD PRIORITY ORDER (updated)

1.  🟢 Organ donor verification workflow (admin → patient card)
2. 🔵 Lab Tech registration flow + Lab dashboard features (Upload report, history)
3. 🔵 Admin: manually create users / assign staff
4. 🔵 Admin: Ticketing system — patients/doctors can raise complaints
5. 🟢 Patient Dashboard: "Complete Your Profile" checklist banner
6. 🟢 Unified Card: redesigned back with emergency contacts