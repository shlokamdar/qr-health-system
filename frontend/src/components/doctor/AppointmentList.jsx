import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, ChevronRight, UserCircle, Activity } from 'lucide-react';

const AppointmentList = ({ appointments, handleUpdateStatus, handleViewPatient }) => {
    if (appointments.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50/50 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Calendar className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold tracking-tight">Your schedule is clear for now.</p>
            </div>
        );
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'CONFIRMED': return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                border: 'border-emerald-100',
                accent: 'bg-emerald-500'
            };
            case 'PENDING': return {
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                border: 'border-amber-100',
                accent: 'bg-amber-500'
            };
            case 'COMPLETED': return {
                bg: 'bg-blue-50',
                text: 'text-[#3B9EE2]',
                border: 'border-blue-100',
                accent: 'bg-[#3B9EE2]'
            };
            case 'REJECTED': return {
                bg: 'bg-rose-50',
                text: 'text-rose-600',
                border: 'border-rose-100',
                accent: 'bg-rose-500'
            };
            default: return {
                bg: 'bg-slate-50',
                text: 'text-slate-600',
                border: 'border-slate-100',
                accent: 'bg-slate-400'
            };
        }
    };

    return (
        <div className="grid gap-6">
            {appointments.map(apt => {
                const styles = getStatusStyles(apt.status);
                return (
                    <div key={apt.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.01] transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${styles.accent} opacity-80 group-hover:w-3 transition-all`} />

                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pl-4">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0D1B2A] border border-slate-100 group-hover:bg-[#3B9EE2]/5 group-hover:text-[#3B9EE2] transition-colors">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-2xl text-[#0D1B2A] tracking-tight">
                                                {apt.patient_name}
                                            </h4>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${styles.bg} ${styles.text} ${styles.border}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                                            </div>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 relative group/reason">
                                    <Activity className="absolute right-4 top-4 w-4 h-4 text-slate-200 group-hover/reason:text-[#3B9EE2] transition-colors" />
                                    <p className="text-[#0D1B2A] font-bold text-sm leading-relaxed pr-8">
                                        {apt.reason}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
                                {apt.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                            className="flex-1 bg-[#2EC4A9] text-white px-6 py-3.5 rounded-2xl hover:bg-[#25ab93] transition-all font-black text-sm shadow-xl shadow-[#2EC4A9]/20 flex items-center justify-center gap-2 group/btn"
                                        >
                                            <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                                            className="flex-1 bg-white text-rose-500 border-2 border-rose-100 px-6 py-3.5 rounded-2xl hover:bg-rose-50 transition-all font-black text-sm flex items-center justify-center gap-2 group/btn"
                                        >
                                            <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            <span>Decline</span>
                                        </button>
                                    </>
                                )}
                                {apt.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                        className="flex-1 bg-[#3B9EE2] text-white px-6 py-3.5 rounded-2xl hover:bg-[#2e8dd1] transition-all font-black text-sm shadow-xl shadow-[#3B9EE2]/20 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                        <span>Mark Finished</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => handleViewPatient(apt.patient_health_id)}
                                    className="flex-1 bg-[#0D1B2A] text-white px-6 py-3.5 rounded-2xl hover:bg-[#1a2e41] transition-all font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0D1B2A]/10 group/btn"
                                >
                                    <UserCircle className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                    <span>Patient Profile</span>
                                    <ChevronRight className="w-4 h-4 opacity-40 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AppointmentList;
