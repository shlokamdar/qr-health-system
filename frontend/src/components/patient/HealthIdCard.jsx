import React from 'react';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  QrCode:   ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  Download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
};

const HealthIdCard = ({ patient, onDownloadQR, onDownloadCard }) => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        background: '#0D1B2A', borderRadius: 16, padding: '24px 28px',
        position: 'relative', overflow: 'hidden', aspectRatio: '1.7 / 1',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        boxShadow: '0 20px 40px rgba(13,27,42,0.4)',
      }}>
        {/* Dot grid texture */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, width: '100%', height: '100%' }}>
          <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Top Row */}
        <div style={{ display: 'flex', justifyEvents: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0D1B2A', fontWeight: 800, fontSize: 18 }}>P</span>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>PulseID</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.5px' }}>HEALTHCARE</div>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ color: '#2EC4A9', fontWeight: 700, fontSize: 10, letterSpacing: '0.8px' }}>Active Patient</span>
          </div>
        </div>

        {/* Middle Row */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Health ID Number</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '1px', fontFamily: 'monospace' }}>
            {patient?.health_id?.replace('HID-', '') || 'HID-....-....'}
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{patient?.user?.first_name} {patient?.user?.last_name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{patient?.blood_group}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>•</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{patient?.gender}</span>
              {patient?.organ_donor && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>•</span>
                  <span style={{ color: '#2EC4A9', fontSize: 12, fontWeight: 600 }}>Donor</span>
                </>
              )}
            </div>
          </div>
          {patient?.qr_code && (
            <div style={{ background: '#fff', padding: 4, borderRadius: 8 }}>
              <img src={patient.qr_code} alt="QR" style={{ width: 56, height: 56, display: 'block' }} />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={onDownloadCard} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#0D1B2A', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, transition: 'all 0.2s' }}>
          <Icon d={ICONS.Download} size={16} /> Download Card
        </button>
        <button onClick={onDownloadQR} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #3B9EE2', background: 'transparent', color: '#3B9EE2', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, transition: 'all 0.2s' }}>
          <Icon d={ICONS.QrCode} size={16} /> Download QR
        </button>
      </div>
    </div>
  );
};

export default HealthIdCard;
