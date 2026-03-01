import React from 'react';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  Activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  Pulse: 'M22 12h-4l-3 9L9 3l-3 9H2', // Same as activity but matching prompt label
  Download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  Lock: ['M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z', 'M7 11V7a5 5 0 0110 0v4'],
};

const HealthIdCard = ({ patient, emergencyContacts = [] }) => {
  // Use emergencyContacts prop if provided (for previews), else fallback to patient data
  const contacts = (emergencyContacts && emergencyContacts.length > 0) 
    ? emergencyContacts 
    : (patient?.emergency_contacts || []);

  const getDonorColor = (status) => {
    if (status?.toLowerCase() === 'yes') return '#2EC4A9';
    if (status?.toLowerCase() === 'no') return '#6B7280';
    return '#F59E0B';
  };

  return (
    <div 
      className="pd-card-canonical"
      id="patient-health-card" 
      style={{
        width: '100%',
        aspectRatio: '85/54',
        background: '#0D1B2A',
        borderRadius: '10px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        color: 'white',
        cursor: 'default',
        border: '1px solid #E2E8F0'
      }}
    >
      {/* Dot grid texture at 4% opacity */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.04, 
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          zIndex: 0
        }} 
      />

      {/* TOP ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon d={ICONS.Pulse} size={20} className="text-white" />
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'white', lineHeight: 1 }}>PulseID</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Unified Health Record</div>
          </div>
        </div>
        <div style={{ padding: '4px 10px', background: '#0d2e2a', borderRadius: '4px', border: '1px solid #2EC4A9' }}>
          <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#2EC4A9', letterSpacing: '0.8px' }}>Patient</span>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0', position: 'relative', zIndex: 10 }}></div>

      {/* MIDDLE IDENTITY SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>Health ID</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', letterSpacing: '1px', marginTop: '2px' }}>
              {patient?.health_id || 'HID-XXXXXXXX'}
            </div>
          </div>
          <div style={{ fontSize: '18px', color: 'white', fontWeight: '700', marginTop: '4px' }}>
            {patient?.user?.first_name} {patient?.user?.last_name}
          </div>
        </div>
        
        {patient?.qr_code && (
          <div style={{ 
            background: '#fff', 
            padding: '6px', 
            borderRadius: '6px',
          }}>
            <img src={patient.qr_code} alt="QR" style={{ width: '96px', height: '96px', display: 'block' }} />
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0', position: 'relative', zIndex: 10 }}></div>

      {/* STATS GRID - 3 columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        position: 'relative',
        gap: '20px',
        zIndex: 10
      }}>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Blood Type</div>
          <div style={{ fontSize: '13px', color: 'white', fontWeight: '700', marginTop: '2px' }}>{patient?.blood_group || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Gender</div>
          <div style={{ fontSize: '13px', color: 'white', fontWeight: '700', marginTop: '2px' }}>{patient?.gender || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</div>
          <div style={{ fontSize: '13px', color: 'white', fontWeight: '700', marginTop: '2px' }}>{patient?.date_of_birth || patient?.dob || '—'}</div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0', position: 'relative', zIndex: 10 }}></div>

      {/* EMERGENCY CONTACTS ROW */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Emergency Contacts</div>
          <div style={{ fontSize: '11px', color: 'white' }}>
            {contacts.length > 0 ? (
              contacts.slice(0, 1).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9 }}>
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                   <span style={{ fontWeight: 500 }}>{c.relationship}</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span style={{ fontWeight: 500 }}>{c.phone}</span>
                </div>
              ))
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No emergency contacts added</div>
            )}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#4B5563', fontWeight: 500 }}>
          Valid across all providers →
        </div>
      </div>
    </div>
  );
};

export default HealthIdCard;
