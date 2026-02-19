import React from 'react';

const MobileNav = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'search', icon: '🔍', label: 'Search' },
        { id: 'consultations', icon: '📋', label: 'History' },
        { id: 'appointments', icon: '📅', label: 'Appts' },
        { id: 'register', icon: '➕', label: 'Add' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-lg md:hidden z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === tab.id
                                ? 'text-indigo-600'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <span className={`text-xl mb-1 ${activeTab === tab.id ? 'transform scale-110' : ''}`}>
                            {tab.icon}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MobileNav;
