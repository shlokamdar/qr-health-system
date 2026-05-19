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

  // In "live preview" contexts we often render the card without actions.
  // Hiding the utility area prevents footer cropping in compact previews.
  const showUtilityArea = !!setActiveTab || !!onDownloadCard || !!onDownloadQR;

  return (
    <div 
      className="pd-card-canonical"
      id="patient-health-card" 
      style={{
        width: '100%',
        background: '#0D1B2A',
        borderRadius: 'clamp(16px, 2.15cqw, 26px)',
        padding: 'clamp(12px, 2.7cqw, 20px) clamp(16px, 4cqw, 30px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 22px 60px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        color: 'white',
        cursor: 'default',
        border: 'none',
        outline: 'none',
      }}
    >

      {/* Subtle highlight — kept away from edges to avoid blue fringe in exports */}
      <div
        className="health-card-decor"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 55% at 72% 28%, rgba(46, 196, 169, 0.14), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Dot grid texture */}
      <div
        className="health-card-decor"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.032,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          zIndex: 0,
        }}
      />

      {/* TOP ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.2cqw, 16px)' }}>
            <Icon d={ICONS.Pulse} size="clamp(18px, 4.6cqw, 28px)" className="text-white" />
            <div>
              <div style={{ fontSize: 'clamp(16px, 4.4cqw, 22px)', fontWeight: '850', color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>PulseID</div>
              <div style={{ fontSize: 'clamp(10px, 2cqw, 12px)', color: 'rgba(255,255,255,0.62)', marginTop: 'clamp(2px, 0.4cqw, 4px)' }}>Unified Health Record</div>
            </div>
          </div>
        <div
          data-card-download-hide="true"
          style={{ padding: 'clamp(6px, 0.95cqw, 10px) clamp(10px, 2.2cqw, 14px)', background: 'rgba(46, 196, 169, 0.10)', borderRadius: 'clamp(8px, 1cqw, 12px)', border: '1px solid rgba(46, 196, 169, 0.35)' }}
        >
          <span style={{ fontSize: 'clamp(10px, 2cqw, 12px)', fontWeight: '850', textTransform: 'uppercase', color: '#2EC4A9', letterSpacing: '0.12em' }}>Patient</span>
        </div>
      </div>



      {/* MIDDLE IDENTITY SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10, marginTop: 'clamp(12px, 3.2cqw, 20px)', marginBottom: 'clamp(10px, 3.0cqw, 18px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5cqw' }}>
          <div>
            <div style={{ fontSize: 'clamp(10px, 2cqw, 12px)', color: 'rgba(255,255,255,0.52)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.14em' }}>Health ID</div>
            <div style={{ fontSize: 'clamp(18px, 4.9cqw, 26px)', fontWeight: '880', color: 'white', letterSpacing: '0.02em', marginTop: 'clamp(2px, 0.5cqw, 6px)' }}>
              {patient?.health_id || 'HID-XXXXXXXX'}
            </div>
          </div>
          <div style={{ fontSize: 'clamp(16px, 4.3cqw, 22px)', color: 'white', fontWeight: '800', marginTop: 'clamp(6px, 1.2cqw, 10px)', letterSpacing: '-0.01em' }}>
            {patient?.user?.first_name} {patient?.user?.last_name}
          </div>
        </div>
        
        {patient?.qr_code && (
          <div style={{ 
            background: '#fff', 
            padding: 'clamp(6px, 1cqw, 10px)', 
            borderRadius: 'clamp(10px, 1.2cqw, 14px)',
            boxShadow: '0 16px 40px rgba(2, 6, 23, 0.28)',
            border: '1px solid rgba(15, 23, 42, 0.10)'
          }}>
            <img src={patient.qr_code} alt="QR" style={{ width: 'clamp(80px, 18.2cqw, 112px)', height: 'clamp(80px, 18.2cqw, 112px)', display: 'block' }} />
          </div>
        )}
      </div>
      {/* STATS GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        position: 'relative',
        gap: 'clamp(10px, 2.6cqw, 18px)',
        zIndex: 10,
        marginBottom: 'clamp(8px, 2.6cqw, 16px)'
      }}>
        <div>
          <div style={{ fontSize: 'clamp(9px, 1.7cqw, 11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.12em' }}>Blood Type</div>
          <div style={{ fontSize: 'clamp(12px, 2.5cqw, 14px)', color: 'white', fontWeight: '800', marginTop: 'clamp(3px, 0.5cqw, 6px)' }}>{patient?.blood_group || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 'clamp(9px, 1.7cqw, 11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.12em' }}>Gender</div>
          <div style={{ fontSize: 'clamp(12px, 2.5cqw, 14px)', color: 'white', fontWeight: '800', marginTop: 'clamp(3px, 0.5cqw, 6px)' }}>{patient?.gender || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 'clamp(9px, 1.7cqw, 11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.12em' }}>Date of Birth</div>
          <div style={{ fontSize: 'clamp(12px, 2.5cqw, 14px)', color: 'white', fontWeight: '800', marginTop: 'clamp(3px, 0.5cqw, 6px)' }}>{patient?.date_of_birth || patient?.dob || '—'}</div>
        </div>
      </div>

      {/* EMERGENCY CONTACTS ROW */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'clamp(9px, 1.85cqw, 11px)', color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 'clamp(4px, 0.8cqw, 8px)', letterSpacing: '0.12em' }}>Emergency Contacts</div>
          <div style={{ fontSize: 'clamp(12px, 2.45cqw, 14px)', color: 'white' }}>
            {contacts.length > 0 ? (
              contacts.slice(0, 1).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.2cqw, 10px)', flexWrap: 'wrap', rowGap: 'clamp(2px, 0.4cqw, 4px)' }}>
                  <span style={{ fontWeight: 800 }}>{c.name}</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                   <span style={{ fontWeight: 600, opacity: 0.8 }}>{c.relationship}</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span style={{ fontWeight: 700, opacity: 0.9 }}>{c.phone}</span>
                </div>
              ))
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '2.4cqw' }}>No contacts added</div>
            )}
          </div>
        </div>
        {showUtilityArea && (
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            data-card-download-hide="true"
            data-html2canvas-ignore="true"
          >
            {!!setActiveTab && (
              <button 
                onClick={() => setActiveTab?.('sharing')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(4px, 1cqw, 8px)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 'clamp(10px, 2.1cqw, 12px)',
                  fontWeight: 750,
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = '#3B9EE2'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                Valid across all providers <Icon d={ICONS.ExternalLink} size="clamp(12px, 2.1cqw, 14px)" />
              </button>
            )}

            {(onDownloadCard || onDownloadQR) && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {onDownloadCard && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDownloadCard(); }}
                    style={{
                      padding: 'clamp(6px, 1cqw, 10px) clamp(10px, 2.2cqw, 14px)',
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 'clamp(14px, 3cqw, 18px)',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 'clamp(10px, 2cqw, 12px)',
                      fontWeight: '850',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(4px, 1cqw, 8px)',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = '#3B9EE2'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                    title="Download Full Card"
                  >
                    <Icon d={ICONS.Download} size="clamp(12px, 2cqw, 14px)" /> Card
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthIdCard;
