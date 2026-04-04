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
