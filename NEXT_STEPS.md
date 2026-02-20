# PulseID — Next Steps & Issue Tracker
Last updated: 20th Feb 2026 1:30PM
Legend: 🔴 Bug/Blocker | 🟡 In Progress | 🟢 Done | 🔵 New Feature | ⚠️ Decision Needed

---

## 1. SYSTEM ADMIN (`/system/login` → `/system/dashboard`)

**Backend:**
- [ ] Wire `/system/login` authentication to existing `/system/dashboard`
- [ ] Admin: Approve / Reject doctor registrations with reason field
- [ ] Admin: View full doctor profile + uploaded license documents
- [ ] 🔵 Admin: Manually create users (Patient, Doctor, Lab Tech, Admin)
- [ ] 🔵 Admin: Register hospitals and labs, assign staff to them
- [ ] 🔵 Admin: Ticketing system — patients/doctors can raise complaints, admin resolves
- [ ] 🔵 Admin: Organ donation verification workflow
  - Admin reviews and approves/rejects organ donor status per patient
  - Approved status reflects on Health ID card
  - Rejected status shows "Pending Verification" on card instead of Yes/No

---

## 2. PATIENT REGISTRATION

**Bugs:**
- [ ] 🔴 Health ID card download fails on Step 3 — returns error
  - **Immediate Fix:** Remove download during registration entirely
  - Show card as a read-only preview with a "Looks good" / "Go back and edit" option
  - Card download only available post-registration from dashboard

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

- [ ] ⚠️ UI redesign required — see Antigravity design prompt (4-step flow already designed)
- [ ] Doctor must be linked to a registered Hospital (dropdown of approved hospitals)
- [ ] License document upload must connect to admin verification queue
- [ ] Post-submission: show verification pending screen, no dashboard access until approved
- [ ] Email notification to doctor when approved/rejected by admin

---

## 4. HOSPITAL & LAB ONBOARDING ⚠️ MAJOR GAP

Currently no onboarding flow exists for hospitals or labs. This needs to be designed end-to-end.

**Proposed flow:**
- [ ] Hospital Registration (`/register/hospital`):
  - Hospital name, type (Private/Government/Clinic), address, registration number
  - Admin approval required before hospital is active
  - Once approved, hospital gets a Hospital ID and can add staff

- [ ] Lab Registration (`/register/lab`):
  - Lab name, parent hospital (optional), address, accreditation number
  - Admin approval required

- [ ] Staff Assignment:
  - Doctors self-select their hospital during registration (dropdown of approved hospitals)
  - Lab Techs are assigned to a lab by the Lab/Hospital admin
  - Lab Tech registration currently has no UI or flow — needs full design + build

⚠️ **DECISION NEEDED:** Who manages hospital staff?
  Option A: Hospital has its own admin dashboard to manage its doctors/labs/staff
  Option B: System admin manages all staff assignments centrally
  **Recommendation:** Option A long-term, Option B for now (simpler to build)

---

## 5. PATIENT DASHBOARD

- [ ] ⚠️ UI mobile-first redesign — see Antigravity design prompt (already written)
- [ ] 🔴 Card download returns 404 (`/api/patients/me/download_pdf/`)
  - Backend fix: create the `download_pdf` endpoint in `patients/views.py`
  - Use ReportLab or WeasyPrint to generate PDF from patient data
  - Alternatively: generate PNG on frontend using html2canvas on the card component
  - **Quickest fix:** frontend PNG download using html2canvas — no backend changes needed
- [ ] Edit profile details (name, phone, address, blood group)
- [ ] Organ donor edit → triggers admin verification workflow, shows "Pending" until approved
- [ ] Emergency contacts: add/edit/remove (max 3), reflected on card
- [ ] "Complete Your Profile" checklist banner if profile < 100% complete
- [ ] Access Control: Accept/Deny doctor requests, revoke active access, view history

---

## 6. DOCTOR DASHBOARD

⚠️ UI design not yet started — needs Antigravity prompt before build

**Sections needed:**
- [ ] Verification status banner (if pending/rejected)
- [ ] Patient search (Health ID input + QR scan)
- [ ] Basic View → Request Full Access → OTP Entry → Full Access flow
- [ ] Active patient sessions with countdown timer + revoke
- [ ] Add consultation form (diagnosis, symptoms, treatment, prescription)
- [ ] View patient medical history (timeline)
- [ ] Upload lab report for patient
- [ ] Notifications: access approvals, appointment confirmations
- [ ] Appointment schedule view

---

## 7. HOSPITAL DASHBOARD

⚠️ Design + build not started. Blocked by Hospital onboarding (see Section 4).

**Sections needed (draft):**
- [ ] Overview: total doctors, total patients seen, active labs
- [ ] Staff management: view/add/remove doctors and lab techs
- [ ] Department management
- [ ] Patient visit logs (anonymised)

---

## 8. LAB DASHBOARD

⚠️ Design + build not started. Blocked by Lab onboarding (see Section 4).

**Sections needed (draft):**
- [ ] Patient lookup by Health ID
- [ ] Upload report: type, date, file (PDF/image), notes
- [ ] View uploaded reports history
- [ ] Link to parent hospital if applicable

---

## OPEN DECISIONS 

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | When to collect emergency contacts + address? | At registration vs dashboard prompt | Dashboard "Complete Profile" |
| 2 | Who manages hospital staff? | System admin vs Hospital admin | System admin for now |
| 3 | Card download method? | Backend PDF vs Frontend PNG | Frontend PNG (html2canvas) — faster |
| 4 | Organ donor verification — who approves? | System admin | System admin via verification queue |
| 5 | Lab Tech registration flow? | Self-register vs Hospital admin adds them | Hospital admin assigns (cleaner) |

---

## BUILD PRIORITY ORDER (suggested)

1. 🔴 Fix card download (patient dashboard) — quick win
2. 🔴 Fix patient registration card preview (remove broken download)
3. Doctor dashboard UI design + basic build
4. Hospital + Lab onboarding flow (design decision first)
5. Admin dashboard features (approve hospitals, labs, organ donor)
6. Lab Tech registration + Lab dashboard
7. Hospital dashboard
8. Ticketing system (lowest priority)