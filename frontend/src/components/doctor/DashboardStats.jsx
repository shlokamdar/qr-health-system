import React from 'react';
import { Users, Calendar, FileText, ArrowUpRight, Activity } from 'lucide-react';

const DashboardStats = ({ doctorProfile }) => {
    if (!doctorProfile) return <div className="animate-pulse h-32 bg-slate-200 rounded-[2rem]"></div>;

    const stats = [
        {
            label: 'Total Patients',
            value: '1,245',
            icon: Users,
            color: '#3B9EE2',
            bg: 'bg-blue-50'
        },
        {
            label: 'Today\'s Visits',
            value: '8',
            icon: Calendar,
            color: '#2EC4A9',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Pending Reports',
            value: '3',
            icon: FileText,
            color: '#F59E0B',
            bg: 'bg-amber-50'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-[#0D1B2A] rounded-[2rem] p-8 text-white shadow-2xl shadow-[#0D1B2A]/20 relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B9EE2]/20 rounded-full blur-[100px] -mr-20 -mt-20 transition-all duration-700 group-hover:bg-[#3B9EE2]/30"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#3B9EE2] font-bold text-sm tracking-widest uppercase mb-2">
                            <Activity className="w-4 h-4" />
                            <span>Doctor Dashboard</span>
                        </div>
                        <h2 className="text-4xl font-black mb-4 tracking-tight">
                            Dr. {doctorProfile.user.first_name} <span className="text-[#3B9EE2]">{doctorProfile.user.last_name}</span>
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-bold border border-white/20 uppercase tracking-tighter">
                            {doctorProfile.specialization}
                        </span>
                        <span className="bg-[#2EC4A9]/20 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-bold border border-[#2EC4A9]/30 text-[#2EC4A9] uppercase tracking-tighter">
                            {doctorProfile.hospital_name || 'PulseID Network'}
                        </span>
                    </div>
                </div>
            </div>

            {stats.map((stat, idx) => (
                <div key={idx} className={`bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between hover:scale-[1.02] transition-all duration-500 overflow-hidden relative group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                        <stat.icon size={80} />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className={`p-3 rounded-2xl ${stat.bg}`} style={{ color: stat.color }}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#2EC4A9] bg-[#2EC4A9]/10 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>12%</span>
                        </div>
                    </div>
                    <div className="mt-6 relative z-10">
                        <h4 className="text-3xl font-black text-[#0D1B2A] mb-1">{stat.value}</h4>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
