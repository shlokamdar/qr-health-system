import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PatientService from '../services/patient.service';
import DoctorService from '../services/doctor.service';
import api from '../utils/api';
import useIsMobile from '../utils/useIsMobile';
import './patient-dashboard.css';

// Components
import MobileNav from '../components/patient/MobileNav';
import OverviewTab from '../components/patient/OverviewTab';
import MedicalRecordList from '../components/patient/MedicalRecordList';
import AppointmentList from '../components/patient/AppointmentList';
import PrescriptionsList from '../components/patient/PrescriptionsList';
import LabReportsList from '../components/patient/LabReportsList';
import SharingPermissionsList from '../components/patient/SharingPermissionsList';
import AccessHistoryList from '../components/patient/AccessHistoryList';
import EmergencyContactsList from '../components/patient/EmergencyContactsList';

// Forms/Modals
import AppointmentBooking from '../components/patient/AppointmentBooking';
import UploadPrescriptionForm from '../components/patient/UploadPrescriptionForm';
import AddEmergencyContactForm from '../components/patient/AddEmergencyContactForm';
import ProfileEditModal from '../components/patient/ProfileEditModal';
import ProfileTab from '../components/patient/ProfileTab';
import PendingOTPWidget from '../components/patient/PendingOTPWidget';
import toast from 'react-hot-toast';

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
  Users: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Bell: ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  LogOut: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  Settings: ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.51a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z', 'M12 15a3 3 0 100-6 3 3 0 000 6z'],
  LifeBuoy: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M4.93 4.93l2.83 2.83', 'M16.24 16.24l2.83 2.83', 'M4.93 19.07l2.83 -2.83', 'M16.24 7.76l2.83 -2.83'],
  Activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
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

  const [activeTab, setActiveTab] = useState(localStorage.getItem('patientActiveTab') || 'overview');
  const [patient, setPatient] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [accessHistory, setAccessHistory] = useState([]);
  const [sharingPermissions, setSharingPermissions] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeId, setRevokeId] = useState(null);

  // Forms & Modals state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [doctorsList, setDoctorsList] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ doctor: '', appointment_date: '', reason: '' });
  const [newPrescription, setNewPrescription] = useState({ prescription_date: '', doctor_name: '', hospital_name: '', symptoms: '', diagnosis: '', medicines: '', insights: '', file: null });
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', email: '', can_grant_access: false });
  const [editContactId, setEditContactId] = useState(null);
  const [editContactForm, setEditContactForm] = useState({});
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [showTicketModal, setShowTicketModal] = useState(false);

  // ── DATA FETCHING ────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const safe = (promise, label) => promise.catch(e => { 
        console.error(`API call failed [${label}]:`, e); 
        return []; 
      });
      const [pData, rData, aData, lData, hData, sData, eData, odData, docData, tData, notificationsData] = await Promise.all([
        PatientService.getProfile().catch(e => { console.error('Profile failed:', e); return null; }),
        safe(PatientService.getRecords(), 'records'),
        safe(PatientService.getMyAppointments(), 'appointments'),
        safe(PatientService.getLabReports(), 'labReports'),
        safe(PatientService.getAccessHistory(), 'accessHistory'),
        safe(PatientService.getSharingPermissions(), 'sharing'),
        safe(PatientService.getEmergencyContacts(), 'contacts'),
        safe(PatientService.getPrescriptions(), 'prescriptions'),
        safe(DoctorService.getVerifiedDoctors(), 'doctors'),
        safe(api.get('support/tickets/').then(res => res.data.results || res.data), 'tickets'),
        safe(api.get('auth/notifications/').then(res => res.data.results || res.data), 'notifications')
      ]);

      if (pData) setPatient(pData);
      setRecentRecords(Array.isArray(rData) ? rData : []);
      setAppointments(Array.isArray(aData) ? aData : []);
      setLabReports(Array.isArray(lData) ? lData : []);
      setAccessHistory(Array.isArray(hData) ? hData : []);
      setSharingPermissions(Array.isArray(sData) ? sData : []);
      setEmergencyContacts(Array.isArray(eData) ? eData : []);
      setPrescriptions(Array.isArray(odData) ? odData : []);
      setDoctorsList(Array.isArray(docData) ? docData : []);
      setTickets(Array.isArray(tData) ? tData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      if (pData) setEditForm(pData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    localStorage.setItem('patientActiveTab', activeTab);
  }, [activeTab]);

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleUpdateProfile = async (formData) => {
    try {
      await PatientService.updateProfile(patient.health_id, formData);
      toast.success('Profile updated successfully!');
      fetchAllData();
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error('Update failed. Please check your network.');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await PatientService.bookAppointment(newAppointment);
      toast.success('Appointment request sent!');
      setNewAppointment({ doctor: '', appointment_date: '', reason: '' });
      fetchAllData();
    } catch (err) { toast.error('Failed to book appointment.'); }
  };

  const handleUploadPrescription = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(newPrescription).forEach(k => {
      if (newPrescription[k] !== null) {
        fd.append(k, newPrescription[k]);
      }
    });
    
    try {
      await PatientService.uploadPrescription(fd);
      toast.success('Prescription uploaded successfully!');
      setNewPrescription({ 
        prescription_date: '', 
        doctor_name: '', 
        hospital_name: '', 
        symptoms: '', 
        diagnosis: '', 
        medicines: '', 
        insights: '', 
        file: null 
      });
      fetchAllData();
    } catch (err) { 
      console.error("Prescription upload error:", err);
      toast.error('Upload failed. Please try again.'); 
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await PatientService.addEmergencyContact(newContact);
      toast.success('Emergency contact added!');
      setNewContact({ name: '', relationship: '', phone: '', email: '', can_grant_access: false });
      fetchAllData();
    } catch (err) { toast.error('Failed to add contact.'); }
  };


  const handleMarkAllRead = async () => {
    try {
      await api.post('auth/notifications/mark_all_as_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) { toast.error('Action failed'); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('support/tickets/', ticketForm);
      toast.success('Support ticket created successfully!');
      setShowTicketModal(false);
      setTicketForm({ subject: '', description: '', priority: 'MEDIUM' });
      fetchAllData();
    } catch (err) {
      toast.error('Failed to create support ticket.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      await PatientService.deleteEmergencyContact(id);
      toast.success('Emergency contact removed.');
      fetchAllData();
    } catch { toast.error('Failed to remove contact.'); }
  };

  const handleUpdateContact = async (id) => {
    try {
      await PatientService.updateEmergencyContact(id, editContactForm);
      toast.success('Contact updated.');
      setEditContactId(null);
      fetchAllData();
    } catch { toast.error('Failed to update contact.'); }
  };

  const handleRevokeAccess = (id) => setRevokeId(id);
  const confirmRevoke = async () => {
    try {
      await PatientService.revokeAccess(revokeId);
      toast.success('Access revoked.');
      setRevokeId(null);
      fetchAllData();
    } catch (err) { toast.error('Revoke failed.'); }
  };

  const handleDownloadQR = () => { if (patient?.qr_code) { const link = document.createElement('a'); link.href = patient.qr_code; link.download = 'HealthID_QR.png'; link.click(); } };
  const handleDownloadCard = async () => {
    const cardElement = document.getElementById('patient-health-card');
    if (!cardElement) {
      toast.error("Could not locate card element for download.");
      return;
    }

    // Capture original styles
    const originalWidth = cardElement.style.width;
    const originalHeight = cardElement.style.height;
    const originalMaxW = cardElement.style.maxWidth;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the card with high fidelity
      const canvas = await html2canvas(cardElement, {
        scale: 4, // Higher scale for clinical-grade clarity
        useCORS: true,
        logging: false,
        backgroundColor: '#0D1B2A',
        onclone: (clonedDoc) => {
          // Additional safety: Ensure the hide-in-download elements are really gone
          const hiddenElements = clonedDoc.querySelectorAll('[data-html2canvas-ignore="true"]');
          hiddenElements.forEach(el => el.style.display = 'none');
        }
      });

      // Restore original styles
      cardElement.style.width = originalWidth;
      cardElement.style.height = originalHeight;
      cardElement.style.maxWidth = originalMaxW;

      const link = document.createElement('a');
      link.download = `PulseID_${patient?.health_id || 'Health_Card'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("PNG capture failed", err);
      // Restore styles even on failure
      cardElement.style.width = originalWidth;
      cardElement.style.height = originalHeight;
      cardElement.style.maxWidth = originalMaxW;
      toast.error("Download failed. Please try again.");
    }
  };


  // ── UNIFIED MEDICAL RECORDS ─────────────────────────────────────────────
  const allMedicalRecords = [
    ...recentRecords.map(r => ({
      ...r,
      type: 'OFFICIAL',
      date: r.created_at,
      doctor_name: r.doctor_details?.first_name ? `Dr. ${r.doctor_details.first_name} ${r.doctor_details.last_name || ''}` : r.doctor_name
    })),
    ...prescriptions.map(p => ({
      ...p,
      type: 'PERSONAL_PRE',
      date: p.prescription_date || p.uploaded_at,
      title: `Prescription: ${p.hospital_name || 'Personal Archive'}`,
      doctor_name: p.doctor_name
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = {
    totalVisits: allMedicalRecords.length,
    lastVisit: allMedicalRecords[0] ? new Date(allMedicalRecords[0].date).toLocaleDateString() : 'None',
    activeDoctors: sharingPermissions.filter(p => p.is_active).length,
    pendingRequests: sharingPermissions.filter(p => !p.is_active && !p.revoked_at).length,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#3B9EE2' }}>Loading PulseID...</div>;

  return (
    <div className="pd-app">
      <button className="pd-download-action-btn hidden" onClick={handleDownloadCard} style={{ display: 'none' }} />
      {/* ── DESKTOP NAVBAR ── */}
      <header className="pd-navbar">
        <div className="pd-logo">
          <Icon d={ICONS.Activity} size={24} style={{ color: '#0D1B2A' }} />
          <div className="pd-logo-text">PulseID</div>
        </div>
        <div className="pd-nav-right">
          <div className="pd-avatar" style={{ width: 36, height: 36, background: '#EFF6FF', color: '#3B9EE2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
            {(patient?.user?.first_name || user?.first_name || user?.username || 'P').charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>
            {patient?.user?.first_name ? `${patient.user.first_name} ${patient.user.last_name || ''}`.trim() : (user?.first_name || user?.username || 'Patient')}
          </span>
          <button onClick={handleLogout} className="pd-logout-btn">
            <Icon d={ICONS.LogOut} size={16} /> Logout
          </button>
          
          {/* Notification Bell Desktop */}
          <div className="pd-notification-wrapper" style={{ position: 'relative', marginLeft: 10 }}>
            <button 
              className="pd-icon-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', position: 'relative', display: 'flex', alignItems: 'center' }}
            >
              <Icon d={ICONS.Bell} size={22} />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 900, minWidth: 14, height: 14, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="pd-notification-dropdown fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: 320, background: '#fff', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC' }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0D1B2A' }}>Notifications</h4>
                  <button onClick={handleMarkAllRead} style={{ fontSize: 11, color: '#3B9EE2', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
                </div>
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                      <Icon d={ICONS.Bell} size={32} className="mx-auto mb-2 opacity-20" />
                      <p style={{ fontSize: 13, margin: 0 }}>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: n.is_read ? '#fff' : '#F0F9FF', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ marginTop: 2 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : '#3B9EE2' }} />
                          </div>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: '#1A202C' }}>{n.title}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>{n.message}</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: 10, color: '#A0AEC0', fontWeight: 600 }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE HEADER ── */}
      <header className="pd-mobile-header">
        <div className="pd-logo">
          <Icon d={ICONS.Activity} size={24} style={{ color: '#0D1B2A' }} />
          <div className="pd-logo-text" style={{ fontSize: 16 }}>PulseID</div>
        </div>
        <div className="pd-nav-right" style={{ gap: 10 }}>
          <div className="pd-avatar" style={{ width: 28, height: 28, background: '#EFF6FF', color: '#3B9EE2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
            {(user?.first_name || 'P').charAt(0).toUpperCase()}
          </div>
          <div style={{ position: 'relative' }} onClick={() => { setActiveTab('overview'); setShowNotifications(!showNotifications); }}>
            <Icon d={ICONS.Bell} size={20} style={{ color: '#4A5568' }} />
            {notifications.filter(n => !n.is_read).length > 0 && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1px solid #fff' }} />}
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
            { id: 'sharing', label: 'Sharing & Access', icon: 'Shield', dot: stats.pendingRequests > 0 ? '#F97316' : null },
            { id: 'history', label: 'Full History', icon: 'History' },
            { id: 'emergency_contacts', label: 'Emergency Contacts', icon: 'Users', dot: emergencyContacts.length === 0 ? '#3B9EE2' : null },
            { id: 'support', label: 'Support & Help', icon: 'LifeBuoy' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`pd-nav-btn ${activeTab === item.id ? 'active' : ''}`}>
              <Icon d={ICONS[item.icon]} size={18} />
              <span>{item.label}</span>
              {item.dot && <div className="pd-nav-dot" style={{ background: item.dot }} />}
            </button>
          ))}
        </div>
        <div className="pd-settings-area">
          <button className="pd-nav-btn" onClick={() => setActiveTab('profile')}>
            <Icon d={ICONS.Settings} size={18} /> <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="pd-content fade-in">
        {/* Tab Heading (Desktop only typically, but kept for context) */}
        {!isMobile && (
          <h2
            className={`pd-tab-heading${activeTab === 'profile' ? ' pd-tab-heading--tight' : ''}`}
          >
            {activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
        )}

        <PendingOTPWidget />

        {activeTab === 'overview' && (
          <OverviewTab
            patient={patient} stats={stats}
            recentRecords={recentRecords} accessHistory={accessHistory}
            sharingPermissions={sharingPermissions}
            handleRevokeAccess={handleRevokeAccess}
            handleDownloadQR={handleDownloadQR}
            handleDownloadCard={handleDownloadCard}
            setActiveTab={setActiveTab}
          />
        )}


        {/* ── OTHER TABS (Simplified for brevity as they just wrap components) ── */}
        {activeTab === 'records' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pd-card">
              <div className="pd-section-heading">
                <Icon d={ICONS.ClipboardList} /> Official & Personal Records
              </div>
              <MedicalRecordList records={allMedicalRecords} />
            </div>
          </div>
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
          <ProfileTab 
            patient={patient} 
            emergencyContacts={emergencyContacts} 
            onUpdate={handleUpdateProfile} 
          />
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
                        <div className="pd-grid-2" style={{ gap: 10 }}>
                          <input className="pd-input" value={editContactForm.name ?? ''} onChange={e => setEditContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
                          <input className="pd-input" value={editContactForm.relationship ?? ''} onChange={e => setEditContactForm(f => ({ ...f, relationship: e.target.value }))} placeholder="Relationship" />
                          <input className="pd-input" value={editContactForm.phone ?? ''} onChange={e => setEditContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
                          <input className="pd-input" value={editContactForm.email ?? ''} onChange={e => setEditContactForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
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
                          <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{c.relationship} · {c.phone} {c.email ? `· ${c.email}` : ''}</p>
                          {c.can_grant_access && <span style={{ fontSize: 11, background: '#EBF8FF', color: '#2B6CB0', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Can grant access</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditContactId(c.id); setEditContactForm({ name: c.name, relationship: c.relationship, phone: c.phone, email: c.email, can_grant_access: c.can_grant_access }); }} style={{ background: '#EBF8FF', color: '#2B6CB0', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
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
                  <div className="pd-grid" style={{ gap: 12 }}>
                    <div className="pd-grid-2" style={{ gap: 12 }}>
                      <input required className="pd-input" value={newContact.name} onChange={e => setNewContact(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                      <input required className="pd-input" value={newContact.relationship} onChange={e => setNewContact(f => ({ ...f, relationship: e.target.value }))} placeholder="Relationship (e.g. Spouse)" />
                    </div>
                    <div className="pd-grid-2" style={{ gap: 12 }}>
                      <input required className="pd-input" value={newContact.phone} onChange={e => setNewContact(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
                      <input required type="email" className="pd-input" value={newContact.email || ''} onChange={e => setNewContact(f => ({ ...f, email: e.target.value }))} placeholder="Email address" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <input type="checkbox" id="can_grant" checked={newContact.can_grant_access} onChange={e => setNewContact(f => ({ ...f, can_grant_access: e.target.checked }))} />
                      <label htmlFor="can_grant" style={{ fontSize: 13, color: '#4A5568', fontWeight: 600 }}>Enable this contact to grant access using OTP</label>
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
            <MedicalRecordList records={allMedicalRecords} />
          </div>
        )}

        {/* ── SUPPORT TAB ── */}
        {activeTab === 'support' && (
          <div className="pd-support-area" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pd-card" style={{ background: 'linear-gradient(135deg, #3B9EE2 0%, #1A365D 100%)', color: '#fff', border: 'none' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Need Assistance?</h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>Our support team is here to help you with any technical issues or questions.</p>
              <button
                type="button"
                onClick={() => setShowTicketModal(true)}
                className="pd-primary-btn"
                style={{
                  marginTop: 20,
                  background: '#fff',
                  color: '#1A365D',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 20px',
                  cursor: 'pointer',
                }}
              >
                Create New Support Ticket
              </button>
            </div>

            <div className="pd-card">
              <div className="pd-section-heading"><Icon d={ICONS.LifeBuoy} /> My Support Tickets</div>
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', py: 40, color: '#718096' }}>
                  <p>You haven't created any support tickets yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {tickets.map(ticket => (
                    <div key={ticket.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 15 }}>{ticket.subject}</h4>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
                          background: ticket.status === 'OPEN' ? '#FEF3C7' : '#D1FAE5',
                          color: ticket.status === 'OPEN' ? '#92400E' : '#065F46'
                        }}>
                          {ticket.status}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#4A5568', lineHeight: 1.5 }}>{ticket.description}</p>
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F7FAFC', fontSize: 11, color: '#A0AEC0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        {ticket.resolved_at && <span>Resolved: {new Date(ticket.resolved_at).toLocaleDateString()}</span>}
                      </div>
                      {ticket.admin_notes && (
                        <div style={{ marginTop: 12, padding: 12, background: '#F0FFF4', borderRadius: 8, borderLeft: '3px solid #48BB78' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: 11, fontWeight: 700, color: '#2F855A' }}>Response from Admin:</p>
                          <p style={{ margin: 0, fontSize: 13, color: '#276749' }}>{ticket.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal" style={{ maxWidth: 500 }}>
            <div className="pd-modal-header">
              <h3 style={{ margin: 0 }}>Create Support Ticket</h3>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="pd-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Subject</label>
                  <input
                    required
                    className="pd-input"
                    value={ticketForm.subject}
                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief summary of the issue"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Priority</label>
                  <select
                    className="pd-input"
                    value={ticketForm.priority}
                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea
                    required
                    className="pd-input"
                    rows={4}
                    value={ticketForm.description}
                    onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Describe your issue in detail..."
                  />
                </div>
              </div>
              <div className="pd-modal-footer">
                <button type="button" onClick={() => setShowTicketModal(false)} className="btn-red-outline" style={{ color: '#4A5568', borderColor: '#E2E8F0' }}>Cancel</button>
                <button type="submit" className="btn-mint">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
