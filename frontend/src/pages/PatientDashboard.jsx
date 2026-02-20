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
  ClipboardList:   ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z'],
  Calendar:        ['M19 4H5a2 2 0 01-2 2v14a2 2 0 012 2h14a2 2 0 012-2V6a2 2 0 01-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  Pill:            ['M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4.5', 'M12 12l-3.5 3.5', 'M18 15a3 3 0 100 6 3 3 0 000-6z'],
  FlaskConical:    ['M10 2v7.31', 'M14 9.3V1.99', 'M8.5 2h7', 'M14 9.3a6.5 6.5 0 11-4 0', 'M5.52 16h12.96'],
  Shield:          ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  History:         ['M3 3v5h5', 'M3.05 13A9 9 0 106 5.3L3 8'],
  FolderOpen:      'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  Users:           ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Bell:            ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  LogOut:          ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  Settings:        ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.51a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z', 'M12 15a3 3 0 100-6 3 3 0 000 6z'],
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
      await PatientService.updateProfile(editForm);
      setIsEditingProfile(false);
      fetchAllData();
    } catch (err) { alert('Update failed.'); }
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
  const handleDownloadCard = () => alert("PDF download simulated.");

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
            { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
            { id: 'records', label: 'Medical Records', icon: 'ClipboardList' },
            { id: 'prescriptions', label: 'Prescriptions', icon: 'Pill' },
            { id: 'lab_reports', label: 'Lab Reports', icon: 'FlaskConical' },
            { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
            { id: 'sharing', label: 'Sharing & Access', icon: 'Shield', dot: stats.pendingRequests > 0 ? '#F97316' : null },
            { id: 'history', label: 'Full History', icon: 'History' },
            { id: 'emergency_contacts', label: 'Emergency Contacts', icon: 'Users', dot: emergencyContacts.length === 0 ? '#3B9EE2' : null},
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

        {activeTab === 'emergency_contacts' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <AddEmergencyContactForm newContact={newContact} setNewContact={setNewContact} handleAddContact={handleAddContact} />
             <div className="pd-card">
               <div className="pd-section-heading"><Icon d={ICONS.Users} /> Emergency Contacts</div>
               <EmergencyContactsList emergencyContacts={emergencyContacts} />
             </div>
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
