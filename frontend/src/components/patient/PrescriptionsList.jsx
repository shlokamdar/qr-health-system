import React from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const PILL = ['M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4.5', 'M12 12l-3.5 3.5', 'M18 15a3 3 0 100 6 3 3 0 000-6z'];

const PrescriptionsList = ({ prescriptions }) => {
  if (prescriptions.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Icon d={PILL} size={32} />
        </div>
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No prescriptions yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {prescriptions.map(presc => (
        <div key={presc.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#0D1B2A', fontSize: 14 }}>
                {new Date(presc.prescription_date).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 13, color: '#4A5568', marginTop: 3 }}>
                <span style={{ fontWeight: 600 }}>{presc.doctor_name}</span>
                {presc.hospital_name && <span style={{ color: '#9CA3AF' }}> • {presc.hospital_name}</span>}
              </div>
              {presc.symptoms && (
                <span style={{ display: 'inline-block', marginTop: 8, background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#4A5568' }}>
                  Symptoms: {presc.symptoms}
                </span>
              )}
              {presc.diagnosis && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#4A5568' }}>
                  <span style={{ fontWeight: 600, color: '#0D1B2A' }}>Diagnosis: </span>{presc.diagnosis}
                </div>
              )}
            </div>
            {presc.file && (
              <a href={presc.file} target="_blank" rel="noopener noreferrer"
                style={{ background: '#EFF6FF', color: '#3B9EE2', border: '1px solid #BFDBFE', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 12 }}>
                View →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrescriptionsList;
