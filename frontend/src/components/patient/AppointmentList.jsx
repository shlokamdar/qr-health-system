import React from 'react';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const CALENDAR_X = ['M8 2v4M16 2v4M3 10h18', 'M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z', 'M9 14l6 6M15 14l-6 6'];
const CAL_DAYS   = ['M8 2v4M16 2v4M3 10h18', 'M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z'];

const statusColors = {
  CONFIRMED: { bg: '#D1FAE5', color: '#059669' },
  PENDING:   { bg: '#FEF3C7', color: '#D97706' },
  COMPLETED: { bg: '#DBEAFE', color: '#2563EB' },
  REJECTED:  { bg: '#FEE2E2', color: '#DC2626' },
};

const AppointmentList = ({ appointments }) => {
  if (appointments.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Icon d={CALENDAR_X} size={32} />
        </div>
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No appointments yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {appointments.map(apt => {
        const sc = statusColors[apt.status] || { bg: '#F3F4F6', color: '#6B7280' };
        return (
          <div key={apt.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 14 }}>Dr. {apt.doctor_name}</div>
                {apt.doctor_hospital && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{apt.doctor_hospital}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#4A5568', fontSize: 12 }}>
                  <Icon d={CAL_DAYS} size={13} />
                  {new Date(apt.appointment_date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {apt.reason && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' }}>"{apt.reason}"</div>}
              </div>
              <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>
                {apt.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AppointmentList;
