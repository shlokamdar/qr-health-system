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

  return (
    <div 
      className="pd-card-canonical"
      id="patient-health-card" 
      style={{
        width: '100%',
        aspectRatio: '85/54',
        background: 'rgba(13, 27, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
        color: 'white',
        cursor: 'default',
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      {/* Premium Gradient Overlay */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(135deg, rgba(59,158,226,0.15) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} 
      />

      {/* Dot grid texture at 5% opacity */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.05, 
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          zIndex: 0
        }} 
      />

      {/* TOP ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
            <Icon d={ICONS.Pulse} size={18} className="text-white" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', lineHeight: 1, letterSpacing: '-0.5px' }}>PulseID</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Unified Health</div>
          </div>
        </div>
        <div style={{ padding: '4px 12px', background: 'rgba(59,158,226,0.2)', borderRadius: '20px', border: '1px solid rgba(59,158,226,0.3)' }}>
          <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#3B9EE2', letterSpacing: '0.8px' }}>Verifying</span>
        </div>
      </div>

      {/* MIDDLE IDENTITY SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1.5px' }}>Patient Identifier</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'white', letterSpacing: '2px', fontFamily: 'monospace', marginTop: '4px' }}>
              {patient?.health_id || 'HID-XXXXXXXX'}
            </div>
          </div>
          <div style={{ fontSize: '20px', color: 'white', fontWeight: '700', marginTop: '8px', letterSpacing: '-0.3px' }}>
            {patient?.user?.first_name} {patient?.user?.last_name}
          </div>
        </div>
        
        {patient?.qr_code && (
          <div style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '16px', 
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.1)' 
          }}>
            <img src={patient.qr_code} alt="QR" style={{ width: '80px', height: '80px', display: 'block', borderRadius: '4px' }} />
          </div>
        )}
      </div>

      {/* STATS ROW - 3 evenly spaced columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        marginTop: 'auto', 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        paddingTop: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px' }}>Blood Type</div>
          <div style={{ fontSize: '15px', color: 'white', fontWeight: '800', marginTop: '2px' }}>{patient?.blood_group || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px' }}>Gender</div>
          <div style={{ fontSize: '15px', color: 'white', fontWeight: '800', marginTop: '2px' }}>{patient?.gender || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px' }}>Date of Birth</div>
          <div style={{ fontSize: '15px', color: 'white', fontWeight: '800', marginTop: '2px' }}>{patient?.date_of_birth || patient?.dob || '—'}</div>
        </div>
      </div>

      {/* EMERGENCY CONTACTS ROW */}
      <div style={{ 
        marginTop: '20px', 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        paddingTop: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px' }}>Linked Emergency Contacts</div>
        <div style={{ fontSize: '12px', color: 'white' }}>
          {contacts.length > 0 ? (
            contacts.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9, marginBottom: i < contacts.length - 1 ? '4px' : 0 }}>
                <span style={{ fontWeight: 800 }}>{c.name}</span>
                <span style={{ opacity: 0.3 }}>•</span>
                <span style={{ fontWeight: 500, letterSpacing: '0.2px' }}>{c.phone}</span>
              </div>
            ))
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontSize: '11px' }}>No emergency records found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthIdCard;
