import React from 'react';

const inputStyle = {
  width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#0D1B2A', outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#4A5568', marginBottom: 5,
};

const UploadPrescriptionForm = ({ newPrescription, setNewPrescription, handleUpload }) => {
  const up = (field, val) => setNewPrescription({ ...newPrescription, [field]: val });

  return (
    <div style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>Add Prescription</h3>
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Date *</label>
          <input type="date" required value={newPrescription.prescription_date}
            onChange={e => up('prescription_date', e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Doctor Name *</label>
          <input type="text" placeholder="Dr. Name" required value={newPrescription.doctor_name}
            onChange={e => up('doctor_name', e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Hospital</label>
          <input type="text" placeholder="Hospital name" value={newPrescription.hospital_name}
            onChange={e => up('hospital_name', e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Symptoms</label>
          <textarea rows={2} placeholder="e.g. Fever, headache" value={newPrescription.symptoms}
            onChange={e => up('symptoms', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Diagnosis</label>
          <textarea rows={2} placeholder="Diagnosis" value={newPrescription.diagnosis}
            onChange={e => up('diagnosis', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Medicines (one per line: name, dosage, frequency)</label>
          <textarea rows={3} placeholder="Paracetamol, 500mg, twice daily" value={newPrescription.medicines}
            onChange={e => up('medicines', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Additional Notes</label>
          <textarea rows={2} placeholder="Insights or notes" value={newPrescription.insights}
            onChange={e => up('insights', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = '#3B9EE2'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
        </div>
        <div>
          <label style={labelStyle}>Attach File</label>
          <input type="file" onChange={e => up('file', e.target.files[0])}
            style={{ ...inputStyle, padding: '7px 12px', fontSize: 12 }} />
        </div>
        <button type="submit" style={{
          background: '#3B9EE2', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#2d8fd4'}
          onMouseLeave={e => e.currentTarget.style.background = '#3B9EE2'}>
          Save Prescription
        </button>
      </form>
    </div>
  );
};

export default UploadPrescriptionForm;
