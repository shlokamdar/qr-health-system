import React from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const X_ICON = 'M18 6L6 18M6 6l12 12';

const inputStyle = {
  width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#0D1B2A', outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700, color: '#9CA3AF',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
};

const ProfileEditModal = ({ isEditing, setIsEditing, editForm, setEditForm, handleUpdateProfile }) => {
  if (!isEditing) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0D1B2A' }}>Edit Profile</h3>
          <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 4 }}>
            <Icon d={X_ICON} size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdateProfile}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input type="text" style={inputStyle}
                  value={editForm.first_name ?? ''}
                  onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" style={inputStyle}
                  value={editForm.last_name ?? ''}
                  onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="text" style={inputStyle}
                  value={editForm.contact_number ?? ''}
                  onChange={e => setEditForm({ ...editForm, contact_number: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={inputStyle}
                  value={editForm.gender ?? ''}
                  onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Blood Group</label>
              <select style={{ ...inputStyle, background: '#fff' }}
                value={editForm.blood_group}
                onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}>
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                value={editForm.address}
                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#3B9EE2'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div>
              <label style={labelStyle}>Allergies (Optional)</label>
              <textarea rows={2} placeholder="e.g. Penicillin, Peanuts" style={{ ...inputStyle, resize: 'vertical' }}
                value={editForm.allergies}
                onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#3B9EE2'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div>
              <label style={labelStyle}>Chronic Conditions (Optional)</label>
              <textarea rows={2} placeholder="e.g. Diabetes, Hypertension" style={{ ...inputStyle, resize: 'vertical' }}
                value={editForm.chronic_conditions ?? ''}
                onChange={e => setEditForm({ ...editForm, chronic_conditions: e.target.value })} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="modal_organ_donor"
                  checked={editForm.organ_donor ?? false}
                  onChange={e => setEditForm({ ...editForm, organ_donor: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="modal_organ_donor" style={{ fontSize: 13, fontWeight: 600, color: '#2D3748', cursor: 'pointer' }}>
                  I am willing to donate organs
                </label>

                {editForm.organ_donor && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: editForm.is_organ_donor_verified ? '#D1FAE5' : (editForm.organ_donor_rejection_reason ? '#FEE2E2' : '#FEF3C7'),
                    color: editForm.is_organ_donor_verified ? '#065F46' : (editForm.organ_donor_rejection_reason ? '#991B1B' : '#92400E'),
                    marginLeft: 'auto'
                  }}>
                    {editForm.is_organ_donor_verified ? 'VERIFIED' : (editForm.organ_donor_rejection_reason ? 'REJECTED' : 'PENDING')}
                  </span>
                )}
              </div>

              {editForm.organ_donor_rejection_reason && !editForm.is_organ_donor_verified && (
                <div style={{ padding: '8px 12px', background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8, fontSize: 11, color: '#C53030' }}>
                  <strong>Rejection Reason:</strong> {editForm.organ_donor_rejection_reason}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{
              padding: '9px 20px', borderRadius: 8, border: '1px solid #E2E8F0',
              background: 'transparent', color: '#4A5568', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: '#3B9EE2', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d8fd4'}
              onMouseLeave={e => e.currentTarget.style.background = '#3B9EE2'}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
