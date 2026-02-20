import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PatientService from '../services/patient.service';
import DoctorService from '../services/doctor.service';

import MedicalRecordList from '../components/patient/MedicalRecordList';
import AppointmentList from '../components/patient/AppointmentList';
import AppointmentBooking from '../components/patient/AppointmentBooking';
import DocumentsList from '../components/patient/DocumentsList';
import UploadDocumentForm from '../components/patient/UploadDocumentForm';
import PrescriptionsList from '../components/patient/PrescriptionsList';
import UploadPrescriptionForm from '../components/patient/UploadPrescriptionForm';
import LabReportsList from '../components/patient/LabReportsList';
import SharingPermissionsList from '../components/patient/SharingPermissionsList';
import AccessHistoryList from '../components/patient/AccessHistoryList';
import EmergencyContactsList from '../components/patient/EmergencyContactsList';
import AddEmergencyContactForm from '../components/patient/AddEmergencyContactForm';
import ProfileEditModal from '../components/patient/ProfileEditModal';

// ── Lucide-style inline SVG icons ────────────────────────────────────────────
const Icon = ({ d, size = 20, strokeWidth = 1.75, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  Calendar: ['M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z'],
  FolderOpen: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  Pill: ['M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4.5', 'M12 12l-3.5 3.5', 'M18 15a3 3 0 100 6 3 3 0 000-6z'],
  Flask: ['M9 3h6M5.07 11A7 7 0 0019 15H5.07zM9 3v8l-4 6h14l-4-6V3'],
  Share2: ['M18 8a3 3 0 100 6 3 3 0 000-6zM6 12a3 3 0 100 6 3 3 0 000-6zM18 4a3 3 0 100 6 3 3 0 000-6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98'],
  Clock: ['M12 2a10 10 0 100 20 10 10 0 000-20z', 'M12 6v6l4 2'],
  Users: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Settings: ['M12 2a10 10 0 100 20 10 10 0 000-20z', 'M12 8a4 4 0 100 8 4 4 0 000-8z'],
  LogOut: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  Download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  QrCode: ['M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2M19 15v2M15 19h2M19 19h2'],
  Stethoscope: ['M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6 6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 100 .3', 'M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4'],
  UserCheck: ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M22 11l-4 4-2-2'],
  Bell: ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  ShieldOff: ['M19.69 14a6.9 6.9 0 00.31-2V5l-8-3-3.16 1.18', 'M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 005.62-4.38', 'M1 1l22 22'],
  FileX: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M9 13l6 6M15 13l-6 6'],
  CalendarX: ['M8 2v4M16 2v4M3 10h18', 'M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z', 'M9 14l6 6M15 14l-6 6'],
  User: ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 7a4 4 0 100 8 4 4 0 000-8z'],
  Pencil: ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  Trash2: ['M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M10 11v6M14 11v6'],
  X: 'M18 6L6 18M6 6l12 12',
  Check: 'M20 6L9 17l-5-5',
};

const navItems = [
  { id: 'overview',       label: 'Overview',          icon: 'LayoutDashboard' },
  { id: 'appointments',   label: 'Appointments',       icon: 'Calendar' },
  { id: 'documents',      label: 'Documents',          icon: 'FolderOpen' },
  { id: 'prescriptions',  label: 'Prescriptions',      icon: 'Pill' },
  { id: 'reports',        label: 'Lab Reports',        icon: 'Flask' },
  { id: 'sharing',        label: 'Sharing',            icon: 'Share2' },
  { id: 'history',        label: 'History',            icon: 'Clock' },
  { id: 'emergency',      label: 'Emergency Contacts', icon: 'Users' },
];

// ── Tiny QR SVG placeholder (grid pattern) ────────────────────────────────────
const QrSvg = ({ dataUrl, size = 96 }) => {
  if (dataUrl) {
    return <img src={dataUrl} alt="QR" className="rounded" style={{ width: size, height: size, background: '#fff', padding: 4 }} />;
  }
  // Decorative placeholder grid
  const cells = [];
  const cols = 7;
  const cell = size / cols;
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      const filled = (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3) ||
        (r === 3 && c === 3) || Math.random() > 0.5;
      cells.push(
        <rect key={`${r}-${c}`} x={c * cell + 1} y={r * cell + 1}
          width={cell - 2} height={cell - 2}
          fill={filled ? '#fff' : 'transparent'} rx={1} />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ background: '#0D1B2A', borderRadius: 4, padding: 4 }}>
      {cells}
    </svg>
  );
};

// ── HEALTH ID CARD ─────────────────────────────────────────────────────────────
const HealthIdCard = ({ patient, onDownloadQR, onDownloadCard }) => {
  const firstName = patient?.user?.first_name || '';
  const lastName  = patient?.user?.last_name  || '';
  const fullName  = `${firstName} ${lastName}`.trim() || patient?.user?.username || 'Patient';
  const hid       = patient?.health_id || '—';
  const blood     = patient?.blood_group || '—';

  return (
    <div style={{ width: '100%' }}>
      {/* Card */}
      <div style={{
        background: '#0D1B2A', borderRadius: 16, padding: '24px 28px',
        position: 'relative', overflow: 'hidden', aspectRatio: '1.7 / 1',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        boxShadow: '0 20px 40px rgba(13,27,42,0.4)',
      }}>
        {/* Dot grid texture */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.05 }} width="100%" height="100%">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#3B9EE2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}>PulseID</span>
          </div>
          <span style={{ background: '#2EC4A9', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Patient</span>
        </div>

        {/* Middle row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Health ID</div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px', marginBottom: 8 }}>{hid}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{fullName}</div>
          </div>
          <QrSvg dataUrl={patient?.qr_code} size={80} />
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Blood Group</div>
              <div style={{ color: '#2EC4A9', fontSize: 15, fontWeight: 700, marginTop: 2 }}>{blood}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Organ Donor</div>
              <div style={{ color: patient?.is_organ_donor ? '#2EC4A9' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                {patient?.is_organ_donor ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textAlign: 'right' }}>Valid across<br />all providers</div>
        </div>
      </div>

      {/* Action buttons below card */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={onDownloadCard} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: '1.5px solid #3B9EE2', color: '#3B9EE2', background: 'transparent',
          borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <Icon d={icons.Download} size={14} /> Download Card
        </button>
        <button onClick={onDownloadQR} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: '1.5px solid #3B9EE2', color: '#3B9EE2', background: 'transparent',
          borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <Icon d={icons.QrCode} size={14} /> Download QR
        </button>
      </div>
    </div>
  );
};

// ── QUICK STAT CARD ─────────────────────────────────────────────────────────────
const StatCard = ({ iconKey, label, value, accent }) => (
  <div style={{
    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10,
    padding: 16, display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{ width: 40, height: 40, background: '#EFF6FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3B9EE2' }}>
      <Icon d={icons[iconKey]} size={18} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || '#0D1B2A', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

// ── REVOKE CONFIRM MODAL ────────────────────────────────────────────────────────
const RevokeModal = ({ onConfirm, onCancel }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <h3 style={{ margin: '0 0 8px', color: '#0D1B2A', fontWeight: 700, fontSize: 17 }}>Revoke Access?</h3>
      <p style={{ margin: '0 0 24px', color: '#4A5568', fontSize: 14 }}>This doctor will immediately lose access to your medical records. This action cannot be undone.</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'transparent', color: '#4A5568', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Revoke</button>
      </div>
    </div>
  </div>
);

// ── MAIN DASHBOARD ──────────────────────────────────────────────────────────────
const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [sharingPermissions, setSharingPermissions] = useState([]);
  const [accessHistory, setAccessHistory] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [revokeTarget, setRevokeTarget] = useState(null);

  const [newDocument, setNewDocument] = useState({ document_type: 'REPORT', title: '', description: '', file: null });
  const [newPrescription, setNewPrescription] = useState({ prescription_date: '', doctor_name: '', hospital_name: '', symptoms: '', diagnosis: '', medicines: '', insights: '', file: null });
  const [newAppointment, setNewAppointment] = useState({ doctor: '', appointment_date: '', reason: '' });
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', can_grant_access: true });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ contact_number: '', address: '', blood_group: '', allergies: '', chronic_conditions: '' });

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [patientData, recordsData, docsData, prescData, sharingData, historyData, contactsData, labData, aptData, docData] = await Promise.all([
        PatientService.getProfile(),
        PatientService.getRecords(),
        PatientService.getDocuments().catch(() => []),
        PatientService.getPrescriptions().catch(() => []),
        PatientService.getSharingPermissions().catch(() => []),
        PatientService.getAccessHistory().catch(() => []),
        PatientService.getEmergencyContacts().catch(() => []),
        PatientService.getLabReports().catch(() => []),
        PatientService.getMyAppointments().catch(() => []),
        DoctorService.getVerifiedDoctors().catch(() => []),
      ]);
      setPatient(patientData); setRecords(recordsData); setDocuments(docsData);
      setPrescriptions(prescData); setSharingPermissions(sharingData); setAccessHistory(historyData);
      setEmergencyContacts(contactsData); setLabReports(labData); setAppointments(aptData); setDoctorsList(docData);
    } catch (err) { console.error(err); }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('document_type', newDocument.document_type);
    fd.append('title', newDocument.title);
    fd.append('description', newDocument.description);
    if (newDocument.file) fd.append('file', newDocument.file);
    try { await PatientService.uploadDocument(fd); alert('Document uploaded!'); setNewDocument({ document_type: 'REPORT', title: '', description: '', file: null }); fetchData(); }
    catch { alert('Upload failed'); }
  };

  const handleUploadPrescription = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    ['prescription_date','doctor_name','hospital_name','symptoms','diagnosis','insights'].forEach(k => fd.append(k, newPrescription[k]));
    try {
      const meds = newPrescription.medicines.split('\n').filter(m => m.trim()).map(m => { const p = m.split(','); return { name: p[0]?.trim()||'', dosage: p[1]?.trim()||'', frequency: p[2]?.trim()||'' }; });
      fd.append('medicines', JSON.stringify(meds));
    } catch { fd.append('medicines', '[]'); }
    if (newPrescription.file) fd.append('file', newPrescription.file);
    try { await PatientService.uploadPrescription(fd); alert('Prescription saved!'); setNewPrescription({ prescription_date:'',doctor_name:'',hospital_name:'',symptoms:'',diagnosis:'',medicines:'',insights:'',file:null }); fetchData(); }
    catch { alert('Failed to save prescription'); }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try { await PatientService.addEmergencyContact(newContact); alert('Emergency contact added!'); setNewContact({ name:'',relationship:'',phone:'',can_grant_access:true }); fetchData(); }
    catch { alert('Failed to add contact'); }
  };

  const handleRevokeAccess = (id) => setRevokeTarget(id);
  const confirmRevoke = async () => {
    try { await PatientService.revokeAccess(revokeTarget); alert('Access revoked!'); fetchData(); }
    catch { alert('Failed to revoke access'); }
    finally { setRevokeTarget(null); }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try { await PatientService.bookAppointment(newAppointment); alert('Appointment request sent!'); setNewAppointment({ doctor:'',appointment_date:'',reason:'' }); fetchData(); }
    catch { alert('Failed to book appointment'); }
  };

  const downloadQR = () => {
    if (patient?.qr_code) { const a = document.createElement('a'); a.href = patient.qr_code; a.download = `QR_${patient.health_id}.png`; a.click(); }
  };

  const downloadCard = () => window.open(PatientService.getDownloadPdfUrl(), '_blank');

  const handleEditClick = () => {
    setEditForm({ contact_number: patient.contact_number||'', address: patient.address||'', blood_group: patient.blood_group||'', allergies: patient.allergies||'', chronic_conditions: patient.chronic_conditions||'' });
    setIsEditing(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try { await PatientService.updateProfile(patient.health_id, editForm); alert('Profile updated!'); setIsEditing(false); fetchData(); }
    catch { alert('Failed to update profile'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (!patient) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ color: '#9CA3AF', fontSize: 15 }}>Loading dashboard…</div>
    </div>
  );

  const firstName  = patient?.user?.first_name || '';
  const lastName   = patient?.user?.last_name  || '';
  const fullName   = `${firstName} ${lastName}`.trim() || patient?.user?.username || 'Patient';
  const initials   = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'P';
  const activePerms = sharingPermissions.filter(p => p.is_active);
  const pendingReqs = sharingPermissions.filter(p => !p.is_active && !p.revoked_at);
  const lastVisit   = records.length ? new Date(records[0].created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'No visits yet';

  const NAVBAR_H = 64;
  const SIDEBAR_W = 240;

  const s = {
    app:        { fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#F8FAFB' },
    navbar:     { position: 'fixed', top: 0, left: 0, right: 0, height: NAVBAR_H, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 200 },
    logo:       { display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' },
    logoMark:   { width: 32, height: 32, background: '#3B9EE2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logoText:   { fontWeight: 700, fontSize: 17, color: '#0D1B2A', letterSpacing: '-0.3px' },
    navRight:   { display: 'flex', alignItems: 'center', gap: 16 },
    avatar:     { width: 34, height: 34, borderRadius: '50%', background: '#EFF6FF', color: '#3B9EE2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 },
    sidebar:    { position: 'fixed', top: NAVBAR_H, left: 0, bottom: 0, width: SIDEBAR_W, background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto' },
    content:    { marginLeft: SIDEBAR_W, marginTop: NAVBAR_H, padding: 32, minHeight: `calc(100vh - ${NAVBAR_H}px)` },
  };

  return (
    <div style={s.app}>
      {/* ── NAVBAR ── */}
      <header style={s.navbar}>
        <div style={s.logo}>
          <div style={s.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span style={s.logoText}>PulseID</span>
        </div>

        <div style={s.navRight}>
          <div style={s.avatar}>{initials}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A', lineHeight: 1.2 }}>{fullName}</div>
            <span style={{ background: '#EFF6FF', color: '#3B9EE2', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 20, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Patient</span>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#4A5568', cursor: 'pointer', padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4A5568'; e.currentTarget.style.background = 'transparent'; }}>
            <Icon d={icons.LogOut} size={16} /> Logout
          </button>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <nav style={s.sidebar}>
        {/* Patient header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A' }}>{fullName}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Health ID: {patient.health_id}</div>
        </div>

        {/* Nav items */}
        <div style={{ padding: '10px 0', flex: 1 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const hasDot = (item.id === 'sharing' && pendingReqs.length > 0) ||
                           (item.id === 'emergency' && emergencyContacts.length === 0);
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#3B9EE2' : '#4A5568',
                  borderLeft: isActive ? '3px solid #3B9EE2' : '3px solid transparent',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s', position: 'relative',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFB'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <Icon d={icons[item.icon]} size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {hasDot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B9EE2', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Settings */}
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '10px 0' }}>
          <button onClick={handleEditClick} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
            background: 'transparent', color: '#9CA3AF', fontSize: 13, fontWeight: 400,
            transition: 'all 0.2s', borderLeft: '3px solid transparent',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFB'; e.currentTarget.style.color = '#4A5568'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}>
            <Icon d={icons.Settings} size={16} /> Settings
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={s.content}>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Section A — Health ID + Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 24 }}>
              <HealthIdCard patient={patient} onDownloadQR={downloadQR} onDownloadCard={downloadCard} />

              {/* Quick Stats 2×2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
                <StatCard iconKey="Stethoscope" label="Total Visits" value={records.length} />
                <StatCard iconKey="Calendar" label="Last Visit" value={lastVisit} />
                <StatCard iconKey="UserCheck" label="Active Doctors" value={activePerms.length} />
                <StatCard iconKey="Bell" label="Pending Requests" value={pendingReqs.length} accent={pendingReqs.length > 0 ? '#2EC4A9' : undefined} />
              </div>
            </div>

            {/* Section B — Pending Access Requests (hidden if none) */}
            {pendingReqs.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0D1B2A' }}>Pending Access Requests</h2>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B9EE2', display: 'inline-block' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingReqs.map(req => (
                    <div key={req.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', color: '#3B9EE2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {(req.doctor_name || 'D').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{req.doctor_name}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{req.hospital_name || 'Hospital not specified'}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Requested {new Date(req.granted_at).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: '#2EC4A9', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Accept</button>
                        <button style={{ background: 'transparent', color: '#EF4444', border: '1.5px solid #EF4444', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Deny</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section C — Active Doctor Access */}
            <div>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0D1B2A' }}>Who Has Access Now</h2>
              {activePerms.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ color: '#9CA3AF', marginBottom: 8 }}><Icon d={icons.ShieldOff} size={32} /></div>
                  <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No doctors currently have access to your records.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activePerms.map(perm => (
                    <div key={perm.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', color: '#3B9EE2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {(perm.doctor_name || 'D').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{perm.doctor_name}</div>
                        <div style={{ fontSize: 12, color: '#3B9EE2', marginTop: 2 }}>
                          {perm.expires_at ? `Access expires: ${new Date(perm.expires_at).toLocaleString()}` : 'Access active'}
                        </div>
                      </div>
                      <button onClick={() => handleRevokeAccess(perm.id)} style={{ background: 'transparent', color: '#EF4444', border: '1.5px solid #EF4444', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        Revoke Access
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section D — Recent Activity */}
            <div>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0D1B2A' }}>Recent Activity</h2>
              {records.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ color: '#9CA3AF', marginBottom: 8 }}><Icon d={icons.FileX} size={32} /></div>
                  <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No medical records yet. Records added by your doctors will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {records.slice(0, 3).map((rec, idx) => (
                    <div key={rec.id} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2EC4A9', flexShrink: 0, marginTop: 18 }} />
                        {idx < 2 && <div style={{ width: 2, background: '#2EC4A9', flex: 1, opacity: 0.3, minHeight: 24 }} />}
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', flex: 1, marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{new Date(rec.created_at).toLocaleDateString()}</div>
                        <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{rec.doctor_name ? `Dr. ${rec.doctor_name}` : 'Medical Record'}</div>
                        <div style={{ fontSize: 13, color: '#4A5568', marginTop: 3 }}>{rec.title}</div>
                        <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: '#3B9EE2', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: 6 }}>View Full Record →</button>
                      </div>
                    </div>
                  ))}
                  {records.length > 3 && (
                    <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: '#3B9EE2', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0', textAlign: 'left' }}>
                      View All in History →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ APPOINTMENTS TAB ══ */}
        {activeTab === 'appointments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Appointments</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>My Appointments</h3>
                <AppointmentList appointments={appointments} />
              </div>
              <AppointmentBooking newAppointment={newAppointment} setNewAppointment={setNewAppointment} doctorsList={doctorsList} handleBookAppointment={handleBookAppointment} />
            </div>
          </div>
        )}

        {/* ══ DOCUMENTS TAB ══ */}
        {activeTab === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Documents</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>My Documents</h3>
                <DocumentsList documents={documents} />
              </div>
              <UploadDocumentForm newDocument={newDocument} setNewDocument={setNewDocument} handleUpload={handleUploadDocument} />
            </div>
          </div>
        )}

        {/* ══ PRESCRIPTIONS TAB ══ */}
        {activeTab === 'prescriptions' && (
          <div>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Prescriptions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>My Prescriptions</h3>
                <PrescriptionsList prescriptions={prescriptions} />
              </div>
              <UploadPrescriptionForm newPrescription={newPrescription} setNewPrescription={setNewPrescription} handleUpload={handleUploadPrescription} />
            </div>
          </div>
        )}

        {/* ══ LAB REPORTS TAB ══ */}
        {activeTab === 'reports' && (
          <div>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Lab Reports</h2>
            <LabReportsList labReports={labReports} />
          </div>
        )}

        {/* ══ SHARING TAB ══ */}
        {activeTab === 'sharing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Access Control</h2>
              <p style={{ margin: '6px 0 0', color: '#4A5568', fontSize: 14 }}>Manage which doctors can view your medical records.</p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Active Access</h3>
              <SharingPermissionsList sharingPermissions={sharingPermissions} handleRevokeAccess={handleRevokeAccess} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Access History</h3>
              <AccessHistoryList accessHistory={accessHistory} />
            </div>
            {pendingReqs.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Pending Requests</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingReqs.map(req => (
                    <div key={req.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', color: '#3B9EE2', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {(req.doctor_name||'D').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{req.doctor_name}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{req.hospital_name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: '#2EC4A9', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Accept</button>
                        <button style={{ background: 'transparent', color: '#EF4444', border: '1.5px solid #EF4444', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Deny</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {activeTab === 'history' && (
          <div>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Medical History</h2>
            <MedicalRecordList records={records} />
          </div>
        )}

        {/* ══ EMERGENCY CONTACTS TAB ══ */}
        {activeTab === 'emergency' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>Emergency Contacts</h2>
                <p style={{ margin: '6px 0 0', color: '#4A5568', fontSize: 14 }}>These contacts will appear on your Health ID card and can be reached in emergencies.</p>
              </div>
            </div>
            {emergencyContacts.length >= 3 && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#3B9EE2', marginBottom: 16 }}>
                You can add up to 3 emergency contacts. Maximum reached.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <EmergencyContactsList emergencyContacts={emergencyContacts} />
              </div>
              {emergencyContacts.length < 3 && (
                <AddEmergencyContactForm newContact={newContact} setNewContact={setNewContact} handleAddContact={handleAddContact} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {revokeTarget !== null && <RevokeModal onConfirm={confirmRevoke} onCancel={() => setRevokeTarget(null)} />}
      <ProfileEditModal isEditing={isEditing} setIsEditing={setIsEditing} editForm={editForm} setEditForm={setEditForm} handleUpdateProfile={handleUpdateProfile} />
    </div>
  );
};

export default PatientDashboard;
