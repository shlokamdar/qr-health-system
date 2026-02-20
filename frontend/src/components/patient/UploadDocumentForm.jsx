import React from 'react';

const inputStyle = {
  width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#0D1B2A', outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#4A5568', marginBottom: 5,
};

const UploadDocumentForm = ({ newDocument, setNewDocument, handleUpload }) => (
  <div style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>Upload Document</h3>
    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={labelStyle}>Document Type</label>
        <select value={newDocument.document_type}
          onChange={e => setNewDocument({ ...newDocument, document_type: e.target.value })}
          style={{ ...inputStyle, background: '#fff' }}>
          <option value="REPORT">Report</option>
          <option value="INSURANCE">Insurance</option>
          <option value="VACCINATION">Vaccination</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Title *</label>
        <input type="text" placeholder="Document title" required
          value={newDocument.title}
          onChange={e => setNewDocument({ ...newDocument, title: e.target.value })}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#3B9EE2'}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea placeholder="Optional description" rows={3}
          value={newDocument.description}
          onChange={e => setNewDocument({ ...newDocument, description: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#3B9EE2'}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
      </div>
      <div>
        <label style={labelStyle}>File</label>
        <input type="file" onChange={e => setNewDocument({ ...newDocument, file: e.target.files[0] })}
          style={{ ...inputStyle, padding: '7px 12px', fontSize: 12 }} />
      </div>
      <button type="submit" style={{
        background: '#3B9EE2', color: '#fff', border: 'none', borderRadius: 8,
        padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#2d8fd4'}
        onMouseLeave={e => e.currentTarget.style.background = '#3B9EE2'}>
        Upload Document
      </button>
    </form>
  </div>
);

export default UploadDocumentForm;
