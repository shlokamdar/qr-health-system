import React from 'react';

const inputStyle = {
  width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#0D1B2A', outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
};

const AddEmergencyContactForm = ({ newContact, setNewContact, handleAddContact }) => (
  <div style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>Add Emergency Contact</h3>
    <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text" placeholder="Full Name *" required
        value={newContact.name}
        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
        style={inputStyle} />
      <select
        required value={newContact.relationship}
        onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
        style={{ ...inputStyle, background: '#fff' }}>
        <option value="">Select Relationship *</option>
        {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Guardian', 'Other'].map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <input
        type="tel" placeholder="Phone Number *" required
        value={newContact.phone}
        onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
        style={inputStyle} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4A5568', cursor: 'pointer' }}>
        <input
          type="checkbox" checked={newContact.can_grant_access}
          onChange={e => setNewContact({ ...newContact, can_grant_access: e.target.checked })}
          style={{ accentColor: '#3B9EE2', width: 15, height: 15 }} />
        Can grant access on my behalf in emergencies
      </label>
      <button type="submit" style={{
        background: '#3B9EE2', color: '#fff', border: 'none', borderRadius: 8,
        padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#2d8fd4'}
        onMouseLeave={e => e.currentTarget.style.background = '#3B9EE2'}>
        Add Contact
      </button>
    </form>
  </div>
);

export default AddEmergencyContactForm;
