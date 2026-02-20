import React from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const USERS   = ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'];
const USER    = ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 7a4 4 0 100 8 4 4 0 000-8z'];
const PENCIL  = ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'];
const TRASH   = ['M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M10 11v6M14 11v6'];

const EmergencyContactsList = ({ emergencyContacts }) => {
  if (emergencyContacts.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Icon d={USERS} size={32} />
        </div>
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No emergency contacts added yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {emergencyContacts.map(contact => (
        <div key={contact.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', color: '#3B9EE2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon d={USER} size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{contact.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ background: '#EFF6FF', color: '#3B9EE2', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{contact.relationship}</span>
              <span style={{ fontSize: 13, color: '#4A5568' }}>{contact.phone}</span>
            </div>
            {contact.can_grant_access && (
              <div style={{ fontSize: 11, color: '#2EC4A9', marginTop: 4, fontWeight: 500 }}>Can grant emergency access</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 7, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4A5568' }}
              title="Edit">
              <Icon d={PENCIL} size={14} />
            </button>
            <button style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}
              title="Remove">
              <Icon d={TRASH} size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmergencyContactsList;
