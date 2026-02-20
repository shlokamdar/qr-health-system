import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PatientService from '../services/patient.service';
import DoctorService from '../services/doctor.service';
import useIsMobile from '../utils/useIsMobile';
import './patient-dashboard.css';

// Components
import MobileNav from '../components/patient/MobileNav';
import OverviewTab from '../components/patient/OverviewTab';
import MedicalRecordList from '../components/patient/MedicalRecordList';
import AppointmentList from '../components/patient/AppointmentList';
import PrescriptionsList from '../components/patient/PrescriptionsList';
import LabReportsList from '../components/patient/LabReportsList';
import DocumentsList from '../components/patient/DocumentsList';
import SharingPermissionsList from '../components/patient/SharingPermissionsList';
import AccessHistoryList from '../components/patient/AccessHistoryList';
import EmergencyContactsList from '../components/patient/EmergencyContactsList';

// Forms/Modals
import AppointmentBooking from '../components/patient/AppointmentBooking';
import UploadDocumentForm from '../components/patient/UploadDocumentForm';
import UploadPrescriptionForm from '../components/patient/UploadPrescriptionForm';
import AddEmergencyContactForm from '../components/patient/AddEmergencyContactForm';
import ProfileEditModal from '../components/patient/ProfileEditModal';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  ClipboardList: ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z'],
  Calendar: ['M19 4H5a2 2 0 01-2 2v14a2 2 0 012 2h14a2 2 0 012-2V6a2 2 0 01-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  Pill: ['M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4.5', 'M12 12l-3.5 3.5', 'M18 15a3 3 0 100 6 3 3 0 000-6z'],
  FlaskConical: ['M10 2v7.31', 'M14 9.3V1.99', 'M8.5 2h7', 'M14 9.3a6.5 6.5 0 11-4 0', 'M5.52 16h12.96'],
  Shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  History: ['M3 3v5h5', 'M3.05 13A9 9 0 106 5.3L3 8'],
  FolderOpen: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  Users: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Bell: ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  LogOut: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  Settings: ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.51a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z', 'M12 15a3 3 0 100-6 3 3 0 000 6z'],
};

const RevokeModal = ({ onConfirm, onCancel }) => (
  <div className="pd-modal-overlay">
    <div className="pd-modal">
      <div className="pd-modal-header">
        <h3 style={{ margin: 0 }}>Revoke Access?</h3>
      </div>
      <div className="pd-modal-body">
        <p style={{ margin: 0, color: '#4A5568' }}>This doctor will immediately lose access to your medical records.</p>
      </div>
      <div className="pd-modal-footer">
        <button onClick={onCancel} className="btn-red-outline" style={{ color: '#4A5568', borderColor: '#E2E8F0' }}>Cancel</button>
        <button onClick={onConfirm} className="btn-mint" style={{ background: '#EF4444' }}>Revoke Access</button>
      </div>
    </div>
  </div>
);

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [accessHistory, setAccessHistory] = useState([]);
  const [sharingPermissions, setSharingPermissions] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeId, setRevokeId] = useState(null);

  // Forms & Modals state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [doctorsList, setDoctorsList] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ doctor: '', appointment_date: '', reason: '' });
  const [newDocument, setNewDocument] = useState({ title: '', document_type: 'REPORT', description: '', file: null });
  const [newPrescription, setNewPrescription] = useState({ prescription_date: '', doctor_name: '', hospital_name: '', symptoms: '', diagnosis: '', medicines: '', insights: '', file: null });
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', can_grant_access: false });
  const [editContactId, setEditContactId] = useState(null);
  const [editContactForm, setEditContactForm] = useState({});

  // ── DATA FETCHING ────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const safe = (promise) => promise.catch(e => { console.warn('API call failed:', e); return []; });
      const [pData, rData, aData, dData, lData, hData, sData, eData, odData, docData] = await Promise.all([
        PatientService.getProfile().catch(e => { console.warn('Profile failed:', e); return null; }),
        safe(PatientService.getRecords()),
        safe(PatientService.getMyAppointments()),
        safe(PatientService.getDocuments()),
        safe(PatientService.getLabReports()),
        safe(PatientService.getAccessHistory()),
        safe(PatientService.getSharingPermissions()),
        safe(PatientService.getEmergencyContacts()),
        safe(PatientService.getPrescriptions()),
        safe(DoctorService.getVerifiedDoctors())
      ]);

      if (pData) setPatient(pData);
      setRecentRecords(Array.isArray(rData) ? rData : []);
      setAppointments(Array.isArray(aData) ? aData : []);
      setDocuments(Array.isArray(dData) ? dData : []);
      setLabReports(Array.isArray(lData) ? lData : []);
      setAccessHistory(Array.isArray(hData) ? hData : []);
      setSharingPermissions(Array.isArray(sData) ? sData : []);
      setEmergencyContacts(Array.isArray(eData) ? eData : []);
      setPrescriptions(Array.isArray(odData) ? odData : []);
      setDoctorsList(Array.isArray(docData) ? docData : []);
      if (pData) setEditForm(pData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await PatientService.bookAppointment(newAppointment);
      alert('Appointment request sent!');
      setNewAppointment({ doctor: '', appointment_date: '', reason: '' });
      fetchAllData();
    } catch (err) { alert('Failed to book appointment.'); }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(newDocument).forEach(k => fd.append(k, newDocument[k]));
    try {
      await PatientService.uploadDocument(fd);
      alert('Document uploaded!');
      setNewDocument({ title: '', document_type: 'REPORT', description: '', file: null });
      fetchAllData();
    } catch (err) { alert('Upload failed.'); }
  };

  const handleUploadPrescription = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(newPrescription).forEach(k => fd.append(k, newPrescription[k]));
    try {
      await PatientService.uploadOldPrescription(fd);
      alert('Prescription uploaded!');
      // Reset form...
      fetchAllData();
    } catch (err) { alert('Upload failed.'); }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await PatientService.addEmergencyContact(newContact);
      alert('Emergency contact added!');
      setNewContact({ name: '', relationship: '', phone: '', can_grant_access: false });
      fetchAllData();
    } catch (err) { alert('Failed to add contact.'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await PatientService.updateProfile(patient.health_id, editForm);
      setIsEditingProfile(false);
      fetchAllData();
    } catch (err) { alert('Update failed.'); }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      await PatientService.deleteEmergencyContact(id);
      fetchAllData();
    } catch { alert('Failed to remove contact.'); }
  };

  const handleUpdateContact = async (id) => {
    try {
      await PatientService.updateEmergencyContact(id, editContactForm);
      setEditContactId(null);
      fetchAllData();
    } catch { alert('Failed to update contact.'); }
  };

  const handleRevokeAccess = (id) => setRevokeId(id);
  const confirmRevoke = async () => {
    try {
      await PatientService.revokeAccess(revokeId);
      setRevokeId(null);
      fetchAllData();
    } catch (err) { alert('Revoke failed.'); }
  };

  const handleDownloadQR = () => { if (patient?.qr_code) { const link = document.createElement('a'); link.href = patient.qr_code; link.download = 'HealthID_QR.png'; link.click(); } };
  const handleDownloadCard = async () => {
    // Try PDF Download first
    try {
      const response = await PatientService.downloadPdf();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `PulseID_${patient?.health_id || 'Health_Card'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return;
    } catch (err) {
      console.warn("PDF download failed, falling back to PNG capture", err);
    }

    // Fallback: Capture card as Image
    const cardElement = document.getElementById('patient-health-card');
    if (!cardElement) {
      alert("Could not locate card element for download.");
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0D1B2A',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `PulseID_${patient?.health_id || 'Health_Card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("PNG capture failed", err);
      alert("Download failed. Please try again later.");
    }
  };

  // ── CALCULATED STATS ─────────────────────────────────────────────────────
  const stats = {
    totalVisits: recentRecords.length + appointments.filter(a => a.status === 'COMPLETED').length,
    lastVisit: recentRecords[0] ? new Date(recentRecords[0].created_at).toLocaleDateString() : 'None',
    activeDoctors: sharingPermissions.filter(p => p.is_active).length,
    pendingRequests: sharingPermissions.filter(p => !p.is_active && !p.revoked_at).length,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#3B9EE2' }}>Loading PulseID...</div>;

  return (
    <div className="pd-app">
      {/* ── DESKTOP NAVBAR ── */}
      <header className="pd-navbar">
        <div className="pd-logo">
          <div className="pd-logo-mark"><span style={{ color: '#fff', fontWeight: 800 }}>P</span></div>
          <div className="pd-logo-text">PulseID</div>
        </div>
        <div className="pd-nav-right">
          <div className="pd-role-badge">PATIENT</div>
          <div className="pd-avatar">{(patient?.user?.first_name || user?.first_name || user?.username || 'P').charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>
            {patient?.user?.first_name ? `${patient.user.first_name} ${patient.user.last_name || ''}`.trim() : (user?.first_name || user?.username || 'Patient')}
          </span>
          <button onClick={handleLogout} className="pd-logout-btn">
            <Icon d={ICONS.LogOut} size={16} /> Logout
          </button>
        </div>
      </header>

      {/* ── MOBILE HEADER ── */}
      <header className="pd-mobile-header">
        <div className="pd-logo">
          <div className="pd-logo-mark" style={{ width: 28, height: 28 }}><span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>P</span></div>
          <div className="pd-logo-text" style={{ fontSize: 16 }}>PulseID</div>
        </div>
        <div className="pd-nav-right" style={{ gap: 10 }}>
          <div className="pd-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{(user?.first_name || 'P').charAt(0)}</div>
          <div style={{ position: 'relative' }}>
            <Icon d={ICONS.Bell} size={20} style={{ color: '#4A5568' }} />
            {stats.pendingRequests > 0 && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1px solid #fff' }} />}
          </div>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="pd-sidebar">
        <div className="pd-sidebar-header">
          <div className="pd-sidebar-name">{user?.first_name} {user?.last_name}</div>
          <div className="pd-sidebar-hid">{patient?.health_id}</div>
        </div>
        <div className="pd-nav-items">
          {[
            { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
            { id: 'profile', label: 'My Profile', icon: 'Settings' },
            { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
            { id: 'records', label: 'Medical Records', icon: 'ClipboardList' },
            { id: 'prescriptions', label: 'Prescriptions', icon: 'Pill' },
            { id: 'lab_reports', label: 'Lab Reports', icon: 'FlaskConical' },
            { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
            { id: 'sharing', label: 'Sharing & Access', icon: 'Shield', dot: stats.pendingRequests > 0 ? '#F97316' : null },
            { id: 'history', label: 'Full History', icon: 'History' },
            { id: 'emergency_contacts', label: 'Emergency Contacts', icon: 'Users', dot: emergencyContacts.length === 0 ? '#3B9EE2' : null },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`pd-nav-btn ${activeTab === item.id ? 'active' : ''}`}>
              <Icon d={ICONS[item.icon]} size={18} />
              {item.label}
              {item.dot && <div className="pd-nav-dot" style={{ background: item.dot }} />}
            </button>
          ))}
        </div>
        <div className="pd-settings-area">
          <button className="pd-nav-btn">
            <Icon d={ICONS.Settings} size={18} /> Settings
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="pd-content fade-in">
        {/* Tab Heading (Desktop only typically, but kept for context) */}
        {!isMobile && <h2 className="pd-tab-heading">{activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>}

        {activeTab === 'overview' && (
          <OverviewTab
            patient={patient} stats={stats}
            recentRecords={recentRecords} accessHistory={accessHistory}
            sharingPermissions={sharingPermissions}
            handleRevokeAccess={handleRevokeAccess}
            handleDownloadQR={handleDownloadQR}
            handleDownloadCard={handleDownloadCard}
          />
        )}

        {/* ── OTHER TABS (Simplified for brevity as they just wrap components) ── */}
        {activeTab === 'records' && (
          <div className="pd-card"><MedicalRecordList records={recentRecords} /></div>
        )}

        {activeTab === 'appointments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AppointmentBooking newAppointment={newAppointment} setNewAppointment={setNewAppointment} doctorsList={doctorsList} handleBookAppointment={handleBookAppointment} />
            <div className="pd-card">
              <div className="pd-section-heading"><Icon d={ICONS.Calendar} /> Your Appointments</div>
              <AppointmentList appointments={appointments} />
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UploadDocumentForm newDocument={newDocument} setNewDocument={setNewDocument} handleUpload={handleUploadDocument} />
            <div className="pd-card">
              <div className="pd-section-heading"><Icon d={ICONS.FolderOpen} /> My Documents</div>
              <DocumentsList documents={documents} />
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <UploadPrescriptionForm newPrescription={newPrescription} setNewPrescription={setNewPrescription} handleUpload={handleUploadPrescription} />
            <div className="pd-card">
              <div className="pd-section-heading"><Icon d={ICONS.Pill} /> Prescriptions</div>
              <PrescriptionsList prescriptions={prescriptions} />
            </div>
          </div>
        )}

        {activeTab === 'lab_reports' && (
          <div className="pd-card">
            <div className="pd-section-heading"><Icon d={ICONS.FlaskConical} /> Lab Reports</div>
            <LabReportsList labReports={labReports} />
          </div>
        )}

        {activeTab === 'sharing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pd-card">
              <div className="pd-section-heading"><Icon d={ICONS.Shield} /> Active Sharing</div>
              <SharingPermissionsList sharingPermissions={sharingPermissions} handleRevokeAccess={handleRevokeAccess} />
            </div>
            <div className="pd-card">
              <div className="pd-section-heading"><Icon d={ICONS.History} /> Access History</div>
              <AccessHistoryList accessHistory={accessHistory} />
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="pd-card" style={{ maxWidth: 600 }}>
            <div className="pd-section-heading" style={{ marginBottom: 20 }}>
              <Icon d={ICONS.Settings} /> My Profile
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>First Name</label>
                  <input className="pd-input" value={editForm.first_name ?? patient?.user?.first_name ?? ''} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Last Name</label>
                  <input className="pd-input" value={editForm.last_name ?? patient?.user?.last_name ?? ''} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Contact Number</label>
                  <input className="pd-input" value={editForm.contact_number ?? patient?.contact_number ?? ''} onChange={e => setEditForm(f => ({ ...f, contact_number: e.target.value }))} placeholder="Phone number" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Date of Birth</label>
                  <input className="pd-input" type="date" value={editForm.date_of_birth ?? patient?.date_of_birth ?? ''} onChange={e => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Blood Group</label>
                  <select className="pd-input" value={editForm.blood_group ?? patient?.blood_group ?? ''} onChange={e => setEditForm(f => ({ ...f, blood_group: e.target.value }))} style={{ width: '100%' }}>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Gender</label>
                  <select className="pd-input" value={editForm.gender ?? patient?.gender ?? 'Male'} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} style={{ width: '100%' }}>
                    {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Address</label>
                <textarea className="pd-input" rows={2} value={editForm.address ?? patient?.address ?? ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} placeholder="Home address" style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Known Allergies</label>
                <textarea className="pd-input" rows={2} value={editForm.allergies ?? patient?.allergies ?? ''} onChange={e => setEditForm(f => ({ ...f, allergies: e.target.value }))} placeholder="e.g. Penicillin, dust" style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Chronic Conditions</label>
                <textarea className="pd-input" rows={2} value={editForm.chronic_conditions ?? patient?.chronic_conditions ?? ''} onChange={e => setEditForm(f => ({ ...f, chronic_conditions: e.target.value }))} placeholder="e.g. Diabetes, Hypertension" style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="organ_donor" checked={editForm.organ_donor ?? patient?.organ_donor ?? false} onChange={e => setEditForm(f => ({ ...f, organ_donor: e.target.checked }))} style={{ width: 16, height: 16 }} />
                <label htmlFor="organ_donor" style={{ fontSize: 14, fontWeight: 500, color: '#2D3748' }}>I am willing to donate organs</label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="pd-primary-btn" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditForm({})} className="pd-secondary-btn" style={{ flex: 1 }}>Reset</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'emergency_contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Current contacts */}
            <div className="pd-card">
              <div className="pd-section-heading" style={{ marginBottom: 16 }}>
                <Icon d={ICONS.Users} /> Emergency Contacts
                <span style={{ marginLeft: 'auto', fontSize: 12, color: emergencyContacts.length >= 3 ? '#EF4444' : '#718096', fontWeight: 600 }}>
                  {emergencyContacts.length}/3
                </span>
              </div>
              {emergencyContacts.length === 0 && (
                <p style={{ color: '#A0AEC0', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No emergency contacts added yet.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {emergencyContacts.map(c => (
                  <div key={c.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', background: '#FAFBFC' }}>
                    {editContactId === c.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <input className="pd-input" value={editContactForm.name ?? ''} onChange={e => setEditContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                          <input className="pd-input" value={editContactForm.relationship ?? ''} onChange={e => setEditContactForm(f => ({ ...f, relationship: e.target.value }))} placeholder="Relationship" />
                          <input className="pd-input" value={editContactForm.phone ?? ''} onChange={e => setEditContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleUpdateContact(c.id)} className="pd-primary-btn" style={{ flex: 1, fontSize: 13, padding: '8px' }}>Save</button>
                          <button onClick={() => setEditContactId(null)} className="pd-secondary-btn" style={{ flex: 1, fontSize: 13, padding: '8px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: '#1A202C', fontSize: 15 }}>{c.name}</p>
                          <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{c.relationship} · {c.phone}</p>
                          {c.can_grant_access && <span style={{ fontSize: 11, background: '#EBF8FF', color: '#2B6CB0', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Can grant access</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditContactId(c.id); setEditContactForm({ name: c.name, relationship: c.relationship, phone: c.phone, can_grant_access: c.can_grant_access }); }} style={{ background: '#EBF8FF', color: '#2B6CB0', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteContact(c.id)} style={{ background: '#FFF5F5', color: '#E53E3E', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add new contact form */}
            {emergencyContacts.length < 3 ? (
              <div className="pd-card">
                <div className="pd-section-heading" style={{ marginBottom: 14 }}><Icon d={ICONS.Users} /> Add Emergency Contact</div>
                <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input required className="pd-input" value={newContact.name} onChange={e => setNewContact(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                    <input required className="pd-input" value={newContact.relationship} onChange={e => setNewContact(f => ({ ...f, relationship: e.target.value }))} placeholder="Relationship (e.g. Spouse)" />
                    <input required className="pd-input" value={newContact.phone} onChange={e => setNewContact(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="can_grant" checked={newContact.can_grant_access} onChange={e => setNewContact(f => ({ ...f, can_grant_access: e.target.checked }))} />
                      <label htmlFor="can_grant" style={{ fontSize: 13, color: '#4A5568' }}>Can grant OTP access</label>
                    </div>
                  </div>
                  <button type="submit" className="pd-primary-btn">Add Contact</button>
                </form>
              </div>
            ) : (
              <div className="pd-card" style={{ textAlign: 'center', color: '#718096', fontSize: 14 }}>
                Maximum of 3 emergency contacts reached.
              </div>
            )}
          </div>
        )}

        {/* History tab reuses StartCard logic for now or custom view */}
        {activeTab === 'history' && (
          <div className="pd-card">
            <div className="pd-section-heading"><Icon d={ICONS.History} /> Full Medical Timeline</div>
            <MedicalRecordList records={recentRecords} />
          </div>
        )}
      </main>

      {/* ── MOBILE NAV ── */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={stats.pendingRequests} logout={handleLogout} />

      {/* ── MODALS ── */}
      {revokeId && <RevokeModal onConfirm={confirmRevoke} onCancel={() => setRevokeId(null)} />}
      <ProfileEditModal
        isEditing={isEditingProfile} setIsEditing={setIsEditingProfile}
        editForm={editForm} setEditForm={setEditForm}
        handleUpdateProfile={handleUpdateProfile}
      />

      {/* Mobile Fab for Edit Profile (if in overview) */}
      {activeTab === 'overview' && (
        <button
          onClick={() => setIsEditingProfile(true)}
          style={{ position: 'fixed', bottom: isMobile ? 80 : 30, right: 30, width: 50, height: 50, borderRadius: 25, background: '#3B9EE2', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(59,158,226,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 150 }}
        >
          <Icon d={['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z']} size={24} />
        </button>
      )}
    </div>
  );
};

export default PatientDashboard;
