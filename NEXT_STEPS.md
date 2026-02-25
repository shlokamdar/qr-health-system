# PulseID — Next Steps & Issue Tracker
Last updated: 
Legend: 🔴 Bug/Blocker | 🟡 In Progress | 🟢 Done | 🔵 New Feature | ⚠️ Decision Needed

---
## 1. WHAT IS PULSEID

A Unified Health Record System where patients receive a digital Health ID + QR code. Core feature: OTP-based two-tier access control. Doctors must request patient approval via OTP to view medical records.

**Tagline:** "Your health identity, always with you"
**Tech Stack:** React 18 + Vite + TailwindCSS + React Router v6 + Axios + Context API (frontend) / Django 4.2 + DRF + JWT auth (backend)
**Icons:** lucide-react only. No emojis in UI.

---

## 2. DESIGN SYSTEM (apply everywhere, no exceptions)

| Token | Value |
|---|---|
| Background | `#F8FAFB` |
| White card | `#FFFFFF` |
| Light blue section | `#EFF6FF` |
| Primary (sky blue) | `#3B9EE2` |
| Secondary (mint) | `#2EC4A9` |
| Headings | `#0D1B2A` |
| Body text | `#4A5568` |
| Muted text | `#9CA3AF` |
| Borders | `#E2E8F0` |
| Error | `#EF4444` |
| Warning/amber | `#F59E0B` |
| Font | Inter |

- Card style: `border: 1px solid #E2E8F0`, `border-radius: 10px`, `padding: 24px`
- Input focus: `border-color: #3B9EE2` + `box-shadow: 0 0 0 3px rgba(59,158,226,0.15)`
- Buttons: `border-radius: 6px`, filled primary = sky blue, ghost = white + border
- No purple anywhere. No dark navy backgrounds except the Health ID card.

---

## 3. BRANDING

- **Name:** PulseID (NOT HealthQR — old name, fully replaced)
- **Logo:** Pulse-line icon + "PulseID" wordmark in `#0D1B2A`
- **Card subtitle:** "Unified Health Record" (under PulseID wordmark on card)
- **Navbar:** Logo left, avatar circle + name + logout right. NO role badge in navbar.

---

## 4. USER ROLES

| Role | Registration | Dashboard |
|---|---|---|
| Patient | Self-register at `/register` | `/patient/dashboard` ✅ Built |
| Doctor | Self-register at `/register` (4 steps, needs admin approval) | `/doctor/dashboard` ✅ Built (needs PulseID reskin) |
| Lab Tech | Assigned by Hospital admin (not built yet) | Not built |
| Admin | Credentials issued, login at `/system/login` | `/system/dashboard` (partially built) |
| Hospital | Registration flow not built yet | Not built |
| Lab | Registration flow not built yet | Not built |

---

## 5. HEALTH ID CARD — CANONICAL DESIGN

One design used everywhere (registration preview, dashboard display, downloaded PNG). NO flip feature.

**Dimensions:** Dashboard = column width. Download = 1200x750px PNG via html2canvas.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [pulse icon] PulseID          [PATIENT pill badge]      │
│               Unified Health Record                      │
├─────────────────────────────────────────────────────────┤
│  HEALTH ID              ┌──────────────────┐            │
│  HID-XXXXXXXX           │  QR CODE         │            │
│  [Patient Name]         │  96px dashboard  │            │
│                         │  160px download  │            │
│                         └──────────────────┘            │
├─────────────────────────────────────────────────────────┤
│  BLOOD TYPE   ORGAN DONOR   GENDER   DATE OF BIRTH      │
│  O+           Yes           Female   13-12-1989          │
├─────────────────────────────────────────────────────────┤
│  EMERGENCY CONTACTS                                      │
│  Travis Kelce · Spouse · 9875462130                     │
│                         Valid across all providers →    │
└─────────────────────────────────────────────────────────┘
```

**Card color rules:**
- Background: `#0D1B2A` + dot-grid texture 4% opacity
- HID value: white bold (NOT sky blue — looks like a link)
- PATIENT badge: `#0d2e2a` bg, `#2EC4A9` text
- Organ Donor: Yes=`#2EC4A9` mint, No=`#6B7280` muted, Pending=`#F59E0B` amber
- Emergency contacts: white 12px. If none: "No emergency contacts added" italic muted
- Footer right: "Valid across all providers" `#4B5563` 10px
- NO "HEALTHCARE" text, NO "decentralized medical identity", NO "Issued by PulseID", NO Flip button



---

## 1. SYSTEM ADMIN 

**Test credentials:** `sysadmin / Admin@1234` at `/system/login` password: [admin1234@1234]
1. Add Hospital and Lab Onboarding and approval - Create their own login and password
2. Currently, admin can only see the list of doctors, hospitals and labs, add a way to see the details of each and approve or reject them. allow doctors to reupload as per rejection message 
3. remove donar feature 
4. overview dashboard is static, change it to dynamic 

5. Add a button to revoke access 

## 2. PATIENT FLOW 
**Test credentials:** - shloka / shloka921@gmail.com  password: [1234@shL0]
1. FIX - My profile layout 
2. FIX - Add Prescirption (Only images, and extract text from it - with a warning that it is a AI generated text, its best to verify from the image as well)
3. ADD - Download health card in a pdf format - with a password (Name's first 3 letters + DOB in DDMMYYYY format)
4. ADD - the page when the QR is scanned eg (http://localhost:8000/api/patients/HID-767DDA23/) -  should be /patients/id with no login required with basic details like name, age, gender, blood group, emergency contacts, allergies, conditions. and a button to get full access that triggers login and SMS to emergency contacts and the patient. 
5. Display OTP in notifcations 

## 3. DOCTOR FLOW


## 4. HOSPITAL & LAB Registration 
1. Check if system admin gets to approve 
2. the current UI is old one for registartion of lab and hospital, change it to new one 
3. registartion of hospital fails 



## 7. HOSPITAL DASHBOARD


## 8. LAB DASHBOARD


## 9. Miscellaneous
1. Landing page - add pages like about, privacy and terms of service 
2. Login Signup - remove admin completely from the tab. 
    in login, add a choosing option for patient, doctor, hospital and lab. 