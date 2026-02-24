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

  const getDonorDisplay = () => {
    const status = patient?.organ_donor_status || (patient?.organ_donor ? 'VERIFIED' : 'OFF');
    if (status === 'VERIFIED') return { text: 'Yes', color: '#2EC4A9' };
    if (status === 'PENDING_VERIFICATION' || status === 'PENDING_UPLOAD') return { text: 'Pending', color: '#F59E0B' };
    return { text: 'No', color: '#6B7280' };
  };

  const donor = getDonorDisplay();

  return (
    <div 
      className="pd-card-canonical"
      id="patient-health-card" 
      style={{
        width: '100%',
        aspectRatio: '85/54',
        background: '#0D1B2A',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        color: 'white',
        cursor: 'default'
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
          backgroundSize: '20px 20px'
        }} 
      />

      {/* TOP ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon d={ICONS.Pulse} size={18} className="text-white" />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>PulseID</div>
            <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>Unified Health Record</div>
          </div>
        </div>
      </div>

      {/* MIDDLE IDENTITY SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>Health ID</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', letterSpacing: '1px', fontFamily: 'monospace' }}>
              {patient?.health_id || 'HID-XXXXXXXX'}
            </div>
          </div>
          <div style={{ fontSize: '15px', color: 'white', fontWeight: 'normal', marginTop: '4px' }}>
            {patient?.user?.first_name} {patient?.user?.last_name}
          </div>
        </div>
        
        {patient?.qr_code && (
          <div style={{ background: '#fff', padding: '4px', borderRadius: '4px' }}>
            <img src={patient.qr_code} alt="QR" style={{ width: '96px', height: '96px', display: 'block' }} />
          </div>
        )}
      </div>

      {/* STATS ROW - 4 evenly spaced columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        marginTop: 'auto', 
        borderTop: '1px solid #1e3a4a', 
        paddingTop: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Blood Type</div>
          <div style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>{patient?.blood_group || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Organ Donor</div>
          <div style={{ fontSize: '13px', color: donor.color, fontWeight: 'bold' }}>{donor.text}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Gender</div>
          <div style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>{patient?.gender || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</div>
          <div style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>{patient?.date_of_birth || patient?.dob || '—'}</div>
        </div>
      </div>

      {/* EMERGENCY CONTACTS ROW */}
      <div style={{ 
        marginTop: '12px', 
        borderTop: '1px solid #1e3a4a', 
        paddingTop: '12px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Emergency Contacts</div>
        <div style={{ fontSize: '12px', color: 'white' }}>
          {contacts.length > 0 ? (
            contacts.map((c, i) => (
              <div key={i} style={{ display: 'block', marginBottom: i < contacts.length - 1 ? '2px' : 0 }}>
                {c.name} · {c.relationship} · {c.phone}
              </div>
            ))
          ) : (
            <div style={{ color: '#6B7280', fontStyle: 'italic' }}>No emergency contacts added</div>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, fontSize: '10px', color: '#4B5563' }}>
          Valid across all providers
        </div>
      </div>
    </div>
  );
};

export default HealthIdCard;
