import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useIsMobile from '../../utils/useIsMobile';
import '../../pages/patient-dashboard.css';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" 
    strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// Lucide Icons
const ICONS = {
  LayoutDashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  ClipboardList:   ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z'],
  Shield:          ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  FolderOpen:      'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  Menu:            ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  Calendar:        ['M19 4H5a2 2 0 01-2 2v14a2 2 0 012 2h14a2 2 0 012-2V6a2 2 0 01-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  Pill:            ['M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4.5', 'M12 12l-3.5 3.5', 'M18 15a3 3 0 100 6 3 3 0 000-6z'],
  FlaskConical:    ['M10 2v7.31', 'M14 9.3V1.99', 'M8.5 2h7', 'M14 9.3a6.5 6.5 0 11-4 0', 'M5.52 16h12.96'],
  History:         ['M3 3v5h5', 'M3.05 13A9 9 0 106 5.3L3 8'],
  Users:           ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 100 8 4 4 0 000-8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  Settings:        ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.51a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z', 'M12 15a3 3 0 100-6 3 3 0 000 6z'],
  LogOut:          ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
};

const MobileNav = ({ activeTab, setActiveTab, unreadCount, logout }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // If not mobile, don't render anything
  if (!isMobile) return null;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'Pill' },
    { id: 'lab_reports', label: 'Lab Reports', icon: 'FlaskConical' },
    { id: 'history', label: 'History', icon: 'History' },
    { id: 'emergency_contacts', label: 'Emergency Contacts', icon: 'Users' },
  ];

  const mainTabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'records', label: 'Records', icon: 'ClipboardList' },
    { id: 'sharing', label: 'Sharing', icon: 'Shield' },
    { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
  ];

  return (
    <>
      <nav className="pd-tabbar">
        {mainTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`pd-tabbar-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <Icon d={ICONS[tab.icon]} size={20} />
            <span className="pd-tabbar-label">{tab.label}</span>
          </button>
        ))}

        <button 
          onClick={() => setIsDrawerOpen(true)}
          className={`pd-tabbar-btn ${menuItems.some(i => i.id === activeTab) ? 'active' : ''}`}
        >
          <Icon d={ICONS.Menu} size={20} />
          <span className="pd-tabbar-label">More</span>
        </button>
      </nav>

      {/* Drawer Overlay */}
      <div 
        className={`pd-drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Content */}
      <div className={`pd-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="pd-drawer-handle" />
        
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`pd-drawer-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <Icon d={ICONS[item.icon]} size={18} />
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0' }} />

        <button onClick={() => { setActiveTab('overview'); setIsDrawerOpen(false); }} className="pd-drawer-item">
          <Icon d={ICONS.Settings} size={18} />
          Settings
        </button>
        
        <button onClick={handleLogout} className="pd-drawer-item" style={{ color: '#EF4444' }}>
          <Icon d={ICONS.LogOut} size={18} />
          Start Logout
        </button>
      </div>
    </>
  );
};

export default MobileNav;
