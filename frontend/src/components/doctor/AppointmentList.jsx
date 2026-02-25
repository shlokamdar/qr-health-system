import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, ChevronRight, UserCircle, Activity } from 'lucide-react';

const AppointmentList = ({ appointments, handleUpdateStatus, handleViewPatient }) => {
    if (appointments.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[10px] border border-[#E2E8F0]">
                <Calendar className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-[#9CA3AF] font-bold">Your schedule is clear for today.</p>
            </div>
        );
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'CONFIRMED': return "bg-[#F0FDF4] text-[#2EC4A9]";
            case 'PENDING': return "bg-[#FFF7ED] text-[#F59E0B]";
            case 'COMPLETED': return "bg-[#EFF6FF] text-[#3B9EE2]";
            case 'REJECTED': return "bg-[#FEF2F2] text-[#EF4444]";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="space-y-4">
            {appointments.map(apt => (
                <div key={apt.id} className="bg-white p-6 rounded-[10px] border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-[#3B9EE2]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-[16px] font-bold text-[#0D1B2A]">{apt.patient_name}</h4>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusStyles(apt.status)}`}>
                                    {apt.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-[#9CA3AF] text-[13px]">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(apt.appointment_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 md:max-w-xs">
                        <p className="text-[#4A5568] text-[13px] line-clamp-1 italic">"{apt.reason}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {apt.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                    className="p-2.5 text-[#2EC4A9] hover:bg-[#F0FDF4] rounded-[6px] transition-all"
                                    title="Approve"
                                >
                                    <CheckCircle size={20} />
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                                    className="p-2.5 text-[#EF4444] hover:bg-[#FEF2F2] rounded-[6px] transition-all"
                                    title="Decline"
                                >
                                    <XCircle size={20} />
                                </button>
                            </>
                        )}
                        {apt.status === 'CONFIRMED' && (
                            <button
                                onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                className="bg-[#3B9EE2] text-white px-4 py-2 rounded-[6px] text-[13px] font-bold hover:bg-[#2e8dd1] transition-all"
                            >
                                Mark Finished
                            </button>
                        )}
                        <button
                            onClick={() => handleViewPatient(apt.patient_health_id)}
                            className="border border-[#3B9EE2] text-[#3B9EE2] px-4 py-2 rounded-[6px] text-[13px] font-bold hover:bg-[#3B9EE2]/5 transition-all flex items-center gap-2"
                        >
                            <span>Open Profile</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppointmentList;
