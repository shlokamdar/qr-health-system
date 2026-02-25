import React from 'react';
import { Users, Calendar, Bell, BadgeCheck, Clock } from 'lucide-react';

const DashboardStats = ({ doctorProfile, appointments, myConsultations }) => {
    if (!doctorProfile) return <div className="animate-pulse h-32 bg-slate-200 rounded-xl"></div>;

    const stats = [
        {
            label: 'Total Patients',
            value: doctorProfile.total_patients || '0',
            icon: Users,
            color: '#3B9EE2'
        },
        {
            label: "Today's Visits",
            value: appointments?.filter(a => {
                const today = new Date().toISOString().split('T')[0];
                return a.appointment_date?.startsWith(today);
            }).length || '0',
            icon: Calendar,
            color: '#3B9EE2'
        },
        {
            label: 'Notifications',
            value: appointments?.filter(a => a.status === 'PENDING').length || '0',
            icon: Bell,
            color: '#3B9EE2'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Dark Navy Hero Banner */}
            <div className="bg-[#0D1B2A] rounded-[12px] p-8 text-white relative overflow-hidden group">
                {/* Dot grid texture logic */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="text-[#6B7280] text-[11px] font-bold tracking-[0.1em] uppercase">
                            DOCTOR DASHBOARD
                        </div>
                        <h2 className="text-[28px] font-bold text-white leading-tight">
                            Dr. {doctorProfile.user?.first_name} {doctorProfile.user?.last_name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-[#1a2e3a] text-[#3B9EE2] px-3 py-1 rounded-full text-[12px] font-medium">
                                {doctorProfile.specialization}
                            </span>
                            {doctorProfile.is_verified ? (
                                <span className="bg-[#0d2e2a] text-[#2EC4A9] px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    Verified
                                </span>
                            ) : (
                                <span className="bg-[#2a1f0d] text-[#F59E0B] px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Pending Verification
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Real Stats Row */}
                    <div className="flex flex-wrap items-center gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3.5 px-4.5 min-w-[160px] flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <stat.icon className="w-4 h-4 text-[#3B9EE2]" />
                                    <span className="text-[#9CA3AF] text-[12px]">{stat.label}</span>
                                </div>
                                <span className="text-white text-[24px] font-bold">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
