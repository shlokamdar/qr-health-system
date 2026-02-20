import React, { useState } from 'react';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const FILE_X  = ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M9 13l6 6M15 13l-6 6'];
const X_ICON  = 'M18 6L6 18M6 6l12 12';
const ATTACH  = 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48';

const MedicalRecordList = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div>
      {records.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Icon d={FILE_X} size={32} />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No medical records yet. Records added by your doctors will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {records.map((rec, idx) => (
            <div key={rec.id} style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2EC4A9', flexShrink: 0, marginTop: 20 }} />
                {idx < records.length - 1 && <div style={{ width: 2, background: '#2EC4A9', flex: 1, opacity: 0.25, minHeight: 20 }} />}
              </div>
              <div
                onClick={() => setSelectedRecord(rec)}
                style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', flex: 1, marginBottom: 10, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(59,158,226,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{new Date(rec.created_at).toLocaleDateString()}</div>
                {rec.doctor_name && <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>Dr. {rec.doctor_name}</div>}
                <div style={{ fontSize: 13, color: '#4A5568', marginTop: 2 }}>{rec.title}</div>
                <span style={{ color: '#3B9EE2', fontSize: 12, fontWeight: 600, marginTop: 6, display: 'inline-block' }}>View Full Record →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* Modal Header */}
            <div style={{ background: '#0D1B2A', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{selectedRecord.record_type}</span>
              <button onClick={() => setSelectedRecord(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <Icon d={X_ICON} size={18} />
              </button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Title</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0D1B2A' }}>{selectedRecord.title}</div>
              </div>
              {selectedRecord.description && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Description</div>
                  <div style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', color: '#4A5568', fontSize: 14 }}>{selectedRecord.description}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Date</div>
                  <div style={{ color: '#4A5568', fontSize: 14 }}>{new Date(selectedRecord.created_at).toLocaleDateString()}</div>
                </div>
                {selectedRecord.doctor_name && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Uploaded By</div>
                    <div style={{ color: '#4A5568', fontSize: 14 }}>Dr. {selectedRecord.doctor_name}</div>
                  </div>
                )}
              </div>
              {selectedRecord.file && (
                <a href={selectedRecord.file} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#EFF6FF', color: '#3B9EE2', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                  <Icon d={ATTACH} size={16} /> View Attached File
                </a>
              )}
            </div>
            <div style={{ borderTop: '1px solid #E2E8F0', padding: '12px 20px', textAlign: 'center' }}>
              <button onClick={() => setSelectedRecord(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordList;
