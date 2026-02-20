import React from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const SHIELD_OFF = ['M19.69 14a6.9 6.9 0 00.31-2V5l-8-3-3.16 1.18', 'M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 005.62-4.38', 'M1 1l22 22'];

const SharingPermissionsList = ({ sharingPermissions, handleRevokeAccess }) => {
  const activePermissions = sharingPermissions.filter(p => p.is_active);

  if (activePermissions.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Icon d={SHIELD_OFF} size={32} />
        </div>
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No doctors currently have access to your records.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activePermissions.map(perm => (
        <div key={perm.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', color: '#3B9EE2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {(perm.doctor_name || 'D').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{perm.doctor_name}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
              {perm.access_type} • Granted: {new Date(perm.granted_at).toLocaleDateString()}
              {perm.expires_at && ` • Expires: ${new Date(perm.expires_at).toLocaleDateString()}`}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {perm.can_view_records   && <span style={{ background: '#DBEAFE', color: '#2563EB', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>View Records</span>}
              {perm.can_view_documents && <span style={{ background: '#D1FAE5', color: '#059669', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>View Documents</span>}
              {perm.can_add_records    && <span style={{ background: '#CCFBF1', color: '#0D9488', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>Add Records</span>}
            </div>
          </div>
          <button onClick={() => handleRevokeAccess(perm.id)} style={{
            background: 'transparent', color: '#EF4444', border: '1.5px solid #EF4444',
            borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            Revoke Access
          </button>
        </div>
      ))}
    </div>
  );
};

export default SharingPermissionsList;
