import React, { useState } from 'react';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  QrCode: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  Download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  RefreshCw: ['M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16', 'M3 21v-5h5'],
  MapPin: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', 'M12 13a3 3 0 100-6 3 3 0 000 6z'],
  Phone: ['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z'],
  Shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
};

const HealthIdCard = ({ patient, onDownloadQR, onDownloadCard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{ width: '100%' }}>
      <div className={`pd-card-perspective ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="pd-card-inner">
          {/* --- FRONT SIDE --- */}
          <div className="pd-card-front" id="patient-health-card" style={{
            background: '#0D1B2A', padding: '24px 28px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            {/* Dot grid texture */}
            <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, width: '100%', height: '100%' }}>
              <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dot-grid)" />
            </svg>

            {/* Top Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#0D1B2A', fontWeight: 800, fontSize: 18 }}>P</span>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>PulseID</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.5px' }}>HEALTHCARE</div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                className="pd-flip-btn"
              >
                <Icon d={ICONS.RefreshCw} size={10} /> Flip
              </button>
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
                      <span style={{
                        color: patient.is_organ_donor_verified ? '#2EC4A9' : '#FCAD1D',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        Donor {patient.is_organ_donor_verified ? '' : '(Pending)'}
                      </span>
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

          {/* --- BACK SIDE --- */}
          <div className="pd-card-back">
            <div className="pd-card-back-header">
              <div className="pd-card-back-title">Emergency Information</div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="pd-flip-btn"
              >
                <Icon d={ICONS.RefreshCw} size={10} /> Back
              </button>
            </div>

            <div className="pd-card-back-content">
              <div className="pd-card-info-item">
                <div className="pd-card-info-label">
                  <Icon d={ICONS.MapPin} size={10} className="inline mr-1" /> Primary Address
                </div>
                <div className="pd-card-info-value" style={{ height: '3em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {patient?.address || 'No address provided'}
                  {patient?.city && `, ${patient.city}`}
                  {patient?.state && `, ${patient.state}`}
                </div>
              </div>

              <div className="pd-card-info-item">
                <div className="pd-card-info-label">
                  <Icon d={ICONS.Phone} size={10} className="inline mr-1" /> Emergency Contacts
                </div>
                <div className="pd-card-info-value" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                  {patient?.emergency_contacts?.length > 0 ? (
                    patient.emergency_contacts.slice(0, 2).map((c, i) => (
                      <div key={i} className="flex justify-between gap-2 mb-1">
                        <span style={{ opacity: 0.8 }}>{c.name}:</span>
                        <span className="font-bold">{c.phone}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '10px' }}>No contacts listed</div>
                  )}
                </div>
              </div>


              <div className="pd-card-info-item" style={{ gridColumn: 'span 2' }}>
                <div className="pd-card-info-label">
                  <Icon d={ICONS.Shield} size={10} className="inline mr-1" /> Organ Donor Verification
                </div>
                <div className="pd-card-info-value" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div className={`badge ${patient?.is_organ_donor_verified ? 'badge-mint' : (patient?.organ_donor_rejection_reason ? 'badge-red' : 'badge-yellow')}`} style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    {patient?.organ_donor
                      ? (patient?.is_organ_donor_verified ? 'VERIFIED DONOR' : (patient?.organ_donor_rejection_reason ? 'VERIFICATION REJECTED' : 'PENDING VERIFICATION'))
                      : 'NOT REGISTERED'}
                  </div>
                  {patient?.organ_donor && !patient?.is_organ_donor_verified && !patient?.organ_donor_rejection_reason && (
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Awaiting clinical verification by Admin</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px', maxWidth: '60%' }}>
                In case of emergency, scan the front QR code for full medical history.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 14, height: 14, background: 'rgba(255,255,255,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 10 }}>P</span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>Issued by PulseID</span>
              </div>
            </div>
          </div>
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
