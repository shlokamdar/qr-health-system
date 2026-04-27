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
  QrCode: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  ExternalLink: ['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6', 'M15 3h6v6', 'M10 14L21 3'],
};

const HealthIdCard = ({ patient, emergencyContacts = [], onDownloadQR, onDownloadCard, setActiveTab }) => {
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
        borderRadius: '2cqw',
        padding: '5cqw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        color: 'white',
        cursor: 'default',
        border: '0.2cqw solid #E2E8F0'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2cqw' }}>
            <Icon d={ICONS.Pulse} size="4.5cqw" className="text-white" />
            <div>
              <div style={{ fontSize: '4cqw', fontWeight: '800', color: 'white', lineHeight: 1 }}>PulseID</div>
              <div style={{ fontSize: '2.2cqw', color: 'rgba(255,255,255,0.6)', marginTop: '0.5cqw' }}>Unified Health Record</div>
            </div>
          </div>
        <div style={{ padding: '0.8cqw 2cqw', background: '#0d2e2a', borderRadius: '1cqw', border: '0.2cqw solid #2EC4A9' }}>
          <span style={{ fontSize: '2cqw', fontWeight: '800', textTransform: 'uppercase', color: '#2EC4A9', letterSpacing: '0.15cqw' }}>Patient</span>
        </div>
      </div>

      <div style={{ height: '0.2cqw', background: 'rgba(255,255,255,0.1)', margin: '3.5cqw 0', position: 'relative', zIndex: 10 }}></div>

      {/* MIDDLE IDENTITY SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1cqw' }}>
          <div>
            <div style={{ fontSize: '2.2cqw', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.2cqw' }}>Health ID</div>
            <div style={{ fontSize: '4.4cqw', fontWeight: '800', color: 'white', letterSpacing: '0.2cqw', marginTop: '0.5cqw' }}>
              {patient?.health_id || 'HID-XXXXXXXX'}
            </div>
          </div>
          <div style={{ fontSize: '4cqw', color: 'white', fontWeight: '700', marginTop: '1cqw' }}>
            {patient?.user?.first_name} {patient?.user?.last_name}
          </div>
        </div>
        
        {patient?.qr_code && (
          <div style={{ 
            background: '#fff', 
            padding: '1.2cqw', 
            borderRadius: '1.2cqw',
          }}>
            <img src={patient.qr_code} alt="QR" style={{ width: '20cqw', height: '20cqw', display: 'block' }} />
          </div>
        )}
      </div>

      <div style={{ height: '0.2cqw', background: 'rgba(255,255,255,0.1)', margin: '3.5cqw 0', position: 'relative', zIndex: 10 }}></div>

      {/* STATS GRID - 3 columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        position: 'relative',
        gap: '4.5cqw',
        zIndex: 10
      }}>
        <div>
          <div style={{ fontSize: '2cqw', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Blood Type</div>
          <div style={{ fontSize: '2.8cqw', color: 'white', fontWeight: '700', marginTop: '0.5cqw' }}>{patient?.blood_group || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '2cqw', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Gender</div>
          <div style={{ fontSize: '2.8cqw', color: 'white', fontWeight: '700', marginTop: '0.5cqw' }}>{patient?.gender || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '2cqw', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</div>
          <div style={{ fontSize: '2.8cqw', color: 'white', fontWeight: '700', marginTop: '0.5cqw' }}>{patient?.date_of_birth || patient?.dob || '—'}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '0.3cqw', background: 'rgba(255,255,255,0.15)', margin: '3.5cqw 0', position: 'relative', zIndex: 10 }}></div>

      {/* EMERGENCY CONTACTS ROW */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '2cqw', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.8cqw' }}>Emergency Contacts</div>
          <div style={{ fontSize: '2.4cqw', color: 'white' }}>
            {contacts.length > 0 ? (
              contacts.slice(0, 1).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.2cqw', opacity: 0.9 }}>
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
        {/* Utility & Action Area */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          data-html2canvas-ignore="true"
        >
          {/* Functional Link */}
          <button 
            onClick={() => setActiveTab?.('sharing')}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8cqw',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '2.2cqw',
              fontWeight: 600,
              transition: 'color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = '#3B9EE2'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            Valid across all providers <Icon d={ICONS.ExternalLink} size="2.2cqw" />
          </button>

          {/* Download Group */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {onDownloadCard && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDownloadCard(); }}
                style={{
                  padding: '0.8cqw 2cqw',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '0.2cqw solid rgba(255,255,255,0.1)',
                  borderRadius: '3cqw',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '2cqw',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8cqw',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = '#3B9EE2'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                title="Download Full Card"
              >
                <Icon d={ICONS.Download} size="2cqw" /> CARD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthIdCard;
