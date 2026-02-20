import React, { useState } from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const FOLDER_OPEN = 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z';
const FILE_TEXT   = ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6', 'M16 13H8M16 17H8M10 9H8'];
const DOWNLOAD    = ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'];

const filters = ['All', 'REPORT', 'INSURANCE', 'VACCINATION', 'OTHER'];
const filterLabels = { All: 'All', REPORT: 'Report', INSURANCE: 'Insurance', VACCINATION: 'Vaccination', OTHER: 'Other' };

const DocumentsList = ({ documents }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? documents : documents.filter(d => d.document_type === activeFilter);

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
          }}>{filterLabels[f]}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Icon d={FOLDER_OPEN} size={32} />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>Your document locker is empty.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {filtered.map(doc => (
            <div key={doc.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#3B9EE2', display: 'flex', justifyContent: 'center' }}>
                <Icon d={FILE_TEXT} size={28} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A', wordBreak: 'break-word', textAlign: 'center' }}>{doc.title}</div>
              <span style={{ background: '#EFF6FF', color: '#3B9EE2', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, alignSelf: 'center', textTransform: 'uppercase' }}>
                {filterLabels[doc.document_type] || doc.document_type}
              </span>
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</div>
              {doc.file && (
                <a href={doc.file} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#3B9EE2', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  <Icon d={DOWNLOAD} size={13} /> Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
