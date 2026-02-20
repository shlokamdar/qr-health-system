import React from 'react';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  Users:           ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Calendar:        ['M19 4H5a2 2 0 01-2 2v14a2 2 0 012 2h14a2 2 0 012-2V6a2 2 0 01-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  Activity:        'M22 12h-4l-3 9L9 3l-3 9H2',
  Bell:            ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
};

const StatCard = ({ iconKey, label, value, accent }) => (
  <div style={{
    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10,
    padding: 16, display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{ width: 40, height: 40, background: '#EFF6FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3B9EE2' }}>
      <Icon d={ICONS[iconKey] || ICONS.LayoutDashboard} size={18} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || '#0D1B2A', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

export default StatCard;
