import React from 'react';

const DashboardStats = ({ doctorProfile }) => {
    if (!doctorProfile) return <div className="animate-pulse h-32 bg-slate-200 rounded-xl"></div>;

    const stats = [
        { 
            label: 'Total Patients', 
            value: '1,245', 
            icon: '👥', 
            bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
            text: 'text-white' 
        },
        { 
            label: 'Today\'s Visits', 
            value: '8', 
            icon: '📅', 
            bg: 'bg-white', 
            text: 'text-slate-800',
            border: 'border-slate-100'
        },
        { 
            label: 'Pending Reports', 
            value: '3', 
            icon: '📝', 
            bg: 'bg-white', 
            text: 'text-slate-800',
            border: 'border-slate-100'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-white/20"></div>
                <div className="relative z-10">
                    <p className="text-indigo-100 font-medium mb-1">Welcome back,</p>
                    <h2 className="text-3xl font-bold mb-4">Dr. {doctorProfile.user.first_name} {doctorProfile.user.last_name}</h2>
                    <div className="flex items-center gap-3">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/20">
                            {doctorProfile.specialization}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/20">
                            {doctorProfile.hospital?.name || 'General Hospital'}
                        </span>
                    </div>
                </div>
            </div>

            {stats.slice(1).map((stat, idx) => (
                <div key={idx} className={`rounded-3xl p-6 shadow-sm border ${stat.border} ${stat.bg} flex flex-col justify-between hover:shadow-md transition-all duration-300`}>
                    <div className="flex justify-between items-start">
                        <span className="text-4xl p-2 bg-slate-50 rounded-2xl">{stat.icon}</span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                        <h4 className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</h4>
                        <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
