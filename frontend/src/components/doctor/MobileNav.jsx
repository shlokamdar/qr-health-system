import React from 'react';
import { Search, ClipboardList, Calendar, UserPlus, Home } from 'lucide-react';

const MobileNav = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'consultations', icon: ClipboardList, label: 'History' },
        { id: 'appointments', icon: Calendar, label: 'Appts' },
        { id: 'register', icon: UserPlus, label: 'Add' },
    ];

    return (
        <div className="fixed bottom-6 left-6 right-6 md:hidden z-50">
            <div className="bg-[#0D1B2A]/90 backdrop-blur-2xl px-4 py-3 rounded-[2rem] border border-white/20 shadow-2xl flex justify-around items-center">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-500 relative group ${isActive
                                ? 'text-[#3B9EE2]'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-[#3B9EE2]/10 rounded-2xl blur-md scale-110" />
                            )}
                            <tab.icon className={`w-5 h-5 mb-1.5 transition-all duration-500 relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-[0.1em] relative z-10 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#3B9EE2] rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
