# PulseID — Next Steps & Issue Tracker
Last updated: 20th Feb 2026 9:41PM
Legend: 🔴 Bug/Blocker | 🟡 In Progress | 🟢 Done | 🔵 New Feature | ⚠️ Decision Needed

---

## 1. SYSTEM ADMIN (`/system/login` → `/admin-dashboard`)

**Backend:**
- [x] 🟢 Wire `/system/login` authentication to `/admin-dashboard` (real JWT auth via `AuthContext`)
- [x] 🟢 Admin: Approve / Reject doctor registrations with reason field
  - `rejection_reason` field added to `Doctor` model (migration applied)
  - `DoctorVerificationView` handles `verify: true/false` + `rejection_reason`
- [ ] 🔵 Admin: View full doctor profile + uploaded license documents
- [ ] 🔵 Admin: Manually create users (Patient, Doctor, Lab Tech, Admin)
- [ ] 🔵 Admin: Register hospitals and labs, assign staff to them
- [ ] 🔵 Admin: Ticketing system — patients/doctors can raise complaints, admin resolves
- [ ] 🔵 Admin: Organ donation verification workflow
  - Admin reviews and approves/rejects organ donor status per patient
  - Approved status reflects on Health ID card
  - Rejected status shows "Pending Verification" on card instead of Yes/No

**Test credentials:** `sysadmin / Admin@1234` at `/system/login`

---

## 2. PATIENT REGISTRATION

**Bugs:**
- [x] � Health ID card download fixed — PNG download via html2canvas (dashboard only)
- [x] 🟢 Registration card preview — shows read-only preview, download moved to dashboard

**Features to add:**
- [ ] Emergency contacts during registration OR via dashboard "Complete Your Profile" prompt

  ⚠️ **DECISION NEEDED:** Collect emergency contacts + address at registration (longer form)
  OR show a "Complete Your Profile" banner on dashboard after registration (better UX, less friction)?
  **Recommendation:** Collect only critical fields at registration (name, DOB, blood group, email,
  password). Everything else (emergency contacts, address, organ donor) goes into a
  "Complete Your Profile" checklist on the dashboard. Show a completion % indicator.

- [ ] 🔵 Card redesign to fit all details:
  - Front: Health ID, name, blood group, organ donor status, QR code
  - Back: Emergency contacts (up to 3), patient address, "Issued by PulseID"
  - Card download (PNG + PDF) available from dashboard only, not during registration

---

## 3. DOCTOR REGISTRATION

- [ ] ⚠️ UI redesign required — 4-step flow (designed, not yet built)
- [ ] Doctor must be linked to a registered Hospital (dropdown of approved hospitals)
- [ ] License document upload must connect to admin verification queue
- [ ] Post-submission: show verification pending screen, no dashboard access until approved
- [ ] Email notification to doctor when approved/rejected by admin (rejection reason shown)

---

## 4. HOSPITAL & LAB ONBOARDING

- [x] 🟢 Hospital Registration (`/hospital/register`) — form built, backend registered
- [x] 🟢 Lab Registration (`/lab/register`) — form built, backend registered
- [x] 🟢 Admin can verify hospitals and labs via `/admin-dashboard`
- [x] 🟢 Hospital Admin role (`HOSPITAL_ADMIN`) — model, auth, and seeding complete
- [x] 🟢 Hospital Dashboard (`/hospital/dashboard`) — built with stats, doctor & lab lists
- [ ] Staff Assignment:
  - Doctors self-select their hospital during registration (dropdown of approved hospitals)
  - Lab Techs are assigned to a lab by the Lab/Hospital admin
  - Lab Tech registration currently has no UI or flow — needs full design + build

⚠️ **DECISION NEEDED:** Who manages hospital staff?
  Option A: Hospital has its own admin dashboard to manage its doctors/labs/staff
  Option B: System admin manages all staff assignments centrally
  **Recommendation:** Option A long-term (Hospital Dashboard built), Option B for now

---

## 5. PATIENT DASHBOARD

- [x] � Card download (PNG) via html2canvas — works from dashboard
- [ ] Edit profile details (name, phone, address, blood group)
- [ ] Organ donor edit → triggers admin verification workflow, shows "Pending" until approved
- [ ] Emergency contacts: add/edit/remove (max 3), reflected on card
- [ ] "Complete Your Profile" checklist banner if profile < 100% complete
- [ ] Access Control: Accept/Deny doctor requests, revoke active access, view history

---

## 6. DOCTOR DASHBOARD

⚠️ UI redesigned with premium PulseID aesthetic. Core features built.

**Remaining:**
- [ ] Verification status banner (if pending/rejected — show rejection reason from admin)
- [x] 🟢 Patient search (Health ID input + QR scan) — built
- [x] 🟢 Basic View → Request Full Access → OTP Entry → Full Access flow — built
- [x] 🟢 Add consultation form (diagnosis, symptoms, treatment, prescription) — built
- [x] 🟢 View patient medical history (timeline) — built
- [ ] Upload lab report for patient
- [ ] Notifications: access approvals, appointment confirmations
- [x] 🟢 Appointment schedule view — built

---

## 7. HOSPITAL DASHBOARD

- [x] 🟢 Built with stats, doctor & lab lists (`/hospital/dashboard`)
- [x] 🟢 Hospital Admin role and `HospitalAdmin` model complete
- [ ] Department management
- [ ] Patient visit logs (anonymised)

---

## 8. LAB DASHBOARD

- [x] 🟢 Lab Tech login + dashboard built (`/lab/dashboard`)
- [ ] Patient lookup by Health ID
- [ ] Upload report: type, date, file (PDF/image), notes
- [ ] View uploaded reports history
- [ ] Link to parent hospital if applicable

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

1. 🔴 Doctor registration: verification pending screen + rejection reason display
2. � Admin: view doctor profile + uploaded license documents
3. 🔵 Doctor dashboard: rejection reason banner
4. 🔵 Patient profile edit (name, blood group, emergency contacts)
5. 🔵 Organ donor verification workflow (admin → patient card)
6. 🔵 Lab Tech registration flow + Lab dashboard features
7. 🔵 Admin: manually create users / assign staff
8. 🔵 Ticketing system (lowest priority)