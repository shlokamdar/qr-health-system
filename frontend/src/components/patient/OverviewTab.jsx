import React, { useState } from 'react';
import useIsMobile from '../../utils/useIsMobile';
import HealthIdCard from './HealthIdCard';
import StatCard from './StatCard';
import AccessHistoryList from './AccessHistoryList';
import SharingPermissionsList from './SharingPermissionsList';
import MedicalRecordList from './MedicalRecordList';
import '../../pages/patient-dashboard.css';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  Activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  Calendar: ['M19 4H5a2 2 0 01-2 2v14a2 2 0 012 2h14a2 2 0 012-2V6a2 2 0 01-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  Users: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Bell: ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  Clock: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  Download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  QrCode: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  ChevronRight: 'M9 18l6-6-6-6',
  CheckCircle: ['M22 11.08V12a10 10 0 11-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  AlertCircle: ['M12 8v4', 'M12 16h.01', 'M22 12a10 10 0 11-20 0 10 10 0 0120 0z'],
};

const ProfileCompletionBanner = ({ patient, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const checklist = [
    { label: 'Blood Group', key: 'blood_group', done: !!patient?.blood_group, tab: 'profile' },
    { label: 'Date of Birth', key: 'date_of_birth', done: !!patient?.date_of_birth, tab: 'profile' },
    { label: 'Gender', key: 'gender', done: !!patient?.gender, tab: 'profile' },
    { label: 'Organ Donor Status', key: 'organ_donor', done: patient?.organ_donor !== undefined && patient?.organ_donor !== null, tab: 'profile' },
    { label: 'Primary Address', key: 'address', done: !!patient?.address, tab: 'profile' },
    { label: 'Emergency Contact 1', key: 'emergency_contact_1', done: !!patient?.emergency_contacts?.[0], tab: 'emergency_contacts' },
    { label: 'Emergency Contact 2', key: 'emergency_contact_2', done: !!patient?.emergency_contacts?.[1], tab: 'emergency_contacts' },
  ];

  const completed = checklist.filter(i => i.done).length;
  const percentage = Math.round((completed / checklist.length) * 100);

  if (percentage === 100 && patient?.emergency_contacts?.length >= 1) return null;

  const handleChipClick = (item) => {
    if (!item.done && setActiveTab) setActiveTab(item.tab);
  };

  return (
    <div className={`pd-completion-banner ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="pd-completion-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
        <div className="pd-completion-title">
          <Icon d={ICONS.AlertCircle} size={18} className="text-[#3B9EE2]" />
          Complete Your Profile
        </div>
        <div className="flex items-center gap-3">
          <div className="pd-completion-pct">{percentage}% Complete</div>
          <Icon d={isCollapsed ? ICONS.ChevronRight : ['M18 15l-6-6-6 6']} size={16} className="text-gray-400 rotate-90" />
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="pd-progress-bg">
            <div className="pd-progress-fill" style={{ width: `${percentage}%` }} />
          </div>

          <div className="pd-completion-items">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className={`pd-completion-chip ${item.done ? 'done' : 'clickable'}`}
                style={{ cursor: item.done ? 'default' : 'pointer' }}
                onClick={() => handleChipClick(item)}
                title={item.done ? '' : `Click to go to ${item.tab === 'emergency_contacts' ? 'Emergency Contacts' : 'Profile'}`}
              >
                {item.done ? <Icon d={ICONS.CheckCircle} size={10} /> : <div style={{ width: 10 }} />}
                {item.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const OverviewTab = ({
  patient, stats, recentRecords, accessHistory,
  sharingPermissions, handleRevokeAccess, handleDownloadQR, handleDownloadCard,
  setActiveTab
}) => {
  const isMobile = useIsMobile();
  const pendingRequests = sharingPermissions.filter(p => !p.is_active && !p.revoked_at); // Assuming logic for pending
  const activeDoctors = sharingPermissions.filter(p => p.is_active);

  // ── DESKTOP VIEW ─────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="pd-fade-in">
        <ProfileCompletionBanner patient={patient} setActiveTab={setActiveTab} />
        <div className="pd-overview-top">
          {/* Health ID Card */}
          <HealthIdCard
            patient={patient}
            onDownloadQR={handleDownloadQR}
            onDownloadCard={handleDownloadCard}
          />

          {/* Quick Stats Grid */}
          <div className="pd-stats-grid">
            <StatCard iconKey="Activity" label="Total Visits" value={stats.totalVisits} />
            <StatCard iconKey="Calendar" label="Last Visit" value={stats.lastVisit} />
            <StatCard iconKey="Users" label="Active Doctors" value={stats.activeDoctors} accent="#3B9EE2" />
            <StatCard iconKey="Bell" label="Pending Requests" value={stats.pendingRequests} accent={stats.pendingRequests > 0 ? '#2EC4A9' : '#9CA3AF'} />
          </div>
        </div>

        <div className="pd-overview-bottom">
          {/* Recent Activity */}
          <div className="pd-card">
            <div className="pd-section-heading">
              <Icon d={ICONS.Activity} /> Recent Medical Records
            </div>
            <MedicalRecordList records={recentRecords.slice(0, 3)} />
          </div>

          {/* Access Control */}
          <div className="pd-card">
            <div className="pd-section-heading">
              <Icon d={ICONS.Users} /> Active Doctor Access
            </div>
            <SharingPermissionsList
              sharingPermissions={sharingPermissions}
              handleRevokeAccess={handleRevokeAccess}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="pd-fade-in">
      <ProfileCompletionBanner patient={patient} setActiveTab={setActiveTab} />
      {/* 1. Compact Identity Row */}
      <div className="pd-identity-row">
        {/* Left: Mini Health ID Card */}
        <div className="pd-hid-mini">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="pd-logo-mark" style={{ width: 24, height: 24 }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>P</span>
            </div>
            <span style={{ background: '#2EC4A9', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>PATIENT</span>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.5px' }}>HEALTH ID</div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, letterSpacing: '0.5px', marginTop: 2 }}>
              {patient?.health_id?.replace('HID-', '') || '...'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{patient?.user?.first_name} {patient?.user?.last_name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{patient?.blood_group} • {patient?.organ_donor ? (patient?.is_organ_donor_verified ? 'Donor' : 'Donor (Pending)') : 'Non-Donor'}</div>
            </div>
            {patient?.qr_code && (
              <img src={patient.qr_code} alt="QR" style={{ width: 44, height: 44, borderRadius: 4, background: '#fff', padding: 2 }} />
            )}
          </div>
        </div>

        {/* Right: Stats Stack */}
        <div className="pd-stats-stack">
          <div className="pd-stat-row">
            <div className="pd-stat-icon" style={{ width: 20, height: 20 }}><Icon d={ICONS.Activity} size={12} /></div>
            <div><div className="pd-stat-val">{stats.totalVisits}</div><div className="pd-stat-lbl">Visits</div></div>
          </div>
          <div className="pd-stat-row">
            <div className="pd-stat-icon" style={{ width: 20, height: 20 }}><Icon d={ICONS.Calendar} size={12} /></div>
            <div><div className="pd-stat-val">{stats.lastVisit?.split(',')[0]}</div><div className="pd-stat-lbl">Last</div></div>
          </div>
          <div className="pd-stat-row">
            <div className="pd-stat-icon" style={{ width: 20, height: 20 }}><Icon d={ICONS.Users} size={12} /></div>
            <div><div className="pd-stat-val">{stats.activeDoctors}</div><div className="pd-stat-lbl">Active</div></div>
          </div>
          <div className="pd-stat-row">
            <div className="pd-stat-icon" style={{ width: 20, height: 20, color: stats.pendingRequests > 0 ? '#2EC4A9' : '#9CA3AF', background: stats.pendingRequests > 0 ? '#D1FAE5' : '#F3F4F6' }}>
              <Icon d={ICONS.Bell} size={12} />
            </div>
            <div><div className="pd-stat-val" style={{ color: stats.pendingRequests > 0 ? '#2EC4A9' : '#9CA3AF' }}>{stats.pendingRequests}</div><div className="pd-stat-lbl">Requests</div></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pd-action-row">
        <button onClick={handleDownloadCard} className="btn-sky-outline" style={{ justifyContent: 'center' }}>
          <Icon d={ICONS.Download} size={14} /> Card
        </button>
        <button onClick={handleDownloadQR} className="btn-sky-outline" style={{ justifyContent: 'center' }}>
          <Icon d={ICONS.QrCode} size={14} /> QR Code
        </button>
      </div>

      {/* 2. Pending Requests Strip (if any) */}
      {pendingRequests.length > 0 && (
        <div className="pd-pending-strip">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9A3412' }}>{pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 11, color: '#C2410C' }}>Doctors requesting access</div>
          </div>
          <button onClick={() => window.location.hash = '#sharing'} className="btn-ghost-red" style={{ color: '#EA580C', fontSize: 12 }}>Review</button>
        </div>
      )}

      {/* 3. Who Has Access Now */}
      <div style={{ padding: '0 16px', background: '#fff', marginBottom: 12, paddingBottom: 16 }}>
        <div className="pd-section-heading" style={{ paddingLeft: 0 }}>
          Who Has Access Now <span className="badge badge-sky">{activeDoctors.length}</span>
        </div>
        {activeDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', padding: '10px 0' }}>No active doctors</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeDoctors.slice(0, 3).map(perm => (
              <div key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                <div className="pd-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{(perm.doctor_name || 'D').charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>{perm.doctor_name}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Expires in {Math.max(0, Math.ceil((new Date(perm.expires_at) - new Date()) / (1000 * 60 * 60)))}h</div>
                </div>
                <button onClick={() => handleRevokeAccess(perm.id)} className="btn-ghost-red">Revoke</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Recent Activity */}
      <div style={{ padding: '0 16px', background: '#fff', paddingBottom: 16 }}>
        <div className="pd-section-heading" style={{ paddingLeft: 0, justifyContent: 'space-between' }}>
          <span>Recent Activity</span>
          <button style={{ fontSize: 11, color: '#3B9EE2', background: 'none', border: 'none', fontWeight: 600 }}>View All →</button>
        </div>
        {recentRecords.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', padding: '10px 0' }}>No recent activity</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentRecords.slice(0, 3).map((rec, i) => (
              <div key={rec.id} className="pd-compact-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <div className={rec.record_type === 'PRESCRIPTION' ? 'pd-dot-orange' : rec.record_type === 'LAB_REPORT' ? 'pd-dot-blue' : 'pd-dot-mint'} />
                <div style={{ width: 60, fontSize: 11, color: '#9CA3AF' }}>{new Date(rec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A' }}>Dr. {rec.doctor_name || 'System'}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{rec.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
