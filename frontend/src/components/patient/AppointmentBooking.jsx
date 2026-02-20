import React from 'react';

const AppointmentBooking = ({ newAppointment, setNewAppointment, doctorsList, handleBookAppointment }) => {
  const inputStyle = {
    width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
    padding: '9px 12px', fontSize: 13, color: '#0D1B2A', outline: 'none',
    background: '#fff', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>Book Appointment</h3>
      <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <select
          required value={newAppointment.doctor}
          onChange={e => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
          style={{ ...inputStyle, background: '#fff' }}>
          <option value="">Select Doctor</option>
          {doctorsList.map(doc => (
            <option key={doc.id} value={doc.id}>
              Dr. {doc.user.first_name} {doc.user.last_name} ({doc.specialization})
            </option>
          ))}
        </select>
        <input
          type="datetime-local" required value={newAppointment.appointment_date}
          onChange={e => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
          style={inputStyle} />
        <textarea
          placeholder="Reason for visit *" required rows={3}
          value={newAppointment.reason}
          onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical' }} />
        <button type="submit" style={{
          background: '#3B9EE2', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#2d8fd4'}
          onMouseLeave={e => e.currentTarget.style.background = '#3B9EE2'}>
          Request Appointment
        </button>
      </form>
    </div>
  );
};

export default AppointmentBooking;
