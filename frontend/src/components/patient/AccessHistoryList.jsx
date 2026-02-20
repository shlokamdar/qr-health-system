import React from 'react';

const AccessHistoryList = ({ accessHistory }) => {
  if (accessHistory.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>No access history yet.</p>
      </div>
    );
  }

  const actionColor = (action = '') => {
    if (action.includes('VIEW'))   return { bg: '#DBEAFE', color: '#2563EB' };
    if (action.includes('ADD'))    return { bg: '#D1FAE5', color: '#059669' };
    if (action.includes('REVOKE')) return { bg: '#FEE2E2', color: '#DC2626' };
    return { bg: '#F3F4F6', color: '#6B7280' };
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFB', borderBottom: '1px solid #E2E8F0' }}>
              {['Doctor / Actor', 'Action', 'Details', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accessHistory.map((log, idx) => {
              const ac = actionColor(log.action);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0D1B2A' }}>{log.actor}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: ac.bg, color: ac.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#4A5568', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                  <td style={{ padding: '10px 14px', color: '#9CA3AF', whiteSpace: 'nowrap', fontSize: 12 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessHistoryList;
