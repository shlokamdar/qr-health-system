import React, { useState } from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const FLASK    = ['M9 3h6M5.07 11A7 7 0 0019 15H5.07zM9 3v8l-4 6h14l-4-6V3'];
const DOWNLOAD = ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'];
const EYE      = ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 100 6 3 3 0 000-6z'];

const filters = ['All', 'Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Other'];

const typeColors = {
  'Blood Test': { bg: '#DBEAFE', color: '#2563EB' },
  'X-Ray':      { bg: '#FEF3C7', color: '#D97706' },
  'MRI':        { bg: '#CCFBF1', color: '#0D9488' },
  'CT Scan':    { bg: '#EDE9FE', color: '#7C3AED' },
  'Other':      { bg: '#F3F4F6', color: '#6B7280' },
};

const getTypeColor = (name = '') => {
  for (const key of Object.keys(typeColors)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return typeColors[key];
  }
  return typeColors['Other'];
};

const LabReportsList = ({ labReports }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? labReports
    : labReports.filter(r => (r.test_type_data?.name || '').toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{
            padding: '5px 14px', borderRadius: 20, border: '1.5px solid',
            borderColor: activeFilter === f ? '#3B9EE2' : '#E2E8F0',
            background: activeFilter === f ? '#EFF6FF' : '#fff',
            color: activeFilter === f ? '#3B9EE2' : '#4A5568',
            fontSize: 12, fontWeight: activeFilter === f ? 700 : 400,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Icon d={FLASK} size={32} />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No lab reports yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(report => {
            const typeName = report.test_type_data?.name || 'Lab Report';
            const tc = getTypeColor(typeName);
            return (
              <div key={report.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div>
                  <span style={{ background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.3px' }}>
                    {typeName}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>{typeName}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {report.hospital_name && <span>{report.hospital_name} • </span>}
                    {report.technician_name && <span>Tech: {report.technician_name}</span>}
                  </div>
                  {report.comments && <div style={{ fontSize: 13, color: '#4A5568', marginTop: 4 }}>{report.comments}</div>}
                </div>
                {report.file && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={report.file} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#3B9EE2', border: '1px solid #BFDBFE', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      <Icon d={EYE} size={12} /> View
                    </a>
                    <a href={report.file} download
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFB', color: '#4A5568', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      <Icon d={DOWNLOAD} size={12} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LabReportsList;
