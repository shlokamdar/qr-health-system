import React from 'react';

const AppointmentList = ({ appointments, handleUpdateStatus, handleViewPatient }) => {
    if (appointments.length === 0) {
        return (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-lg">No appointments found.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="grid gap-6">
            {appointments.map(apt => (
                <div key={apt.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(apt.status).replace('bg-', 'bg-').split(' ')[0].replace('100', '500')}`}></div>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                                    {apt.patient_name}
                                    <button 
                                        onClick={() => handleViewPatient(apt.patient_health_id)}
                                        className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors ml-2"
                                        title="View Patient Profile"
                                    >
                                        View Profile ↗
                                    </button>
                                </h4>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getStatusColor(apt.status)}`}>
                                    {apt.status}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                    📅 {new Date(apt.appointment_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                    ⏰ {new Date(apt.appointment_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-slate-700 text-sm italic">
                                    "{apt.reason}"
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[140px]">
                            {apt.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all font-medium text-sm shadow-sm hover:shadow-emerald-200"
                                    >
                                        Accept Request
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                                        className="bg-white text-rose-500 border border-rose-200 px-4 py-2 rounded-lg hover:bg-rose-50 transition-all font-medium text-sm"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {apt.status === 'CONFIRMED' && (
                                <button
                                    onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow-blue-200"
                                >
                                    Mark Completed
                                </button>
                            )}
                            {/* Always allow viewing profile from actions too */}
                             <button
                                onClick={() => handleViewPatient(apt.patient_health_id)}
                                className="text-slate-500 hover:text-indigo-600 text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1"
                            >
                                Full Profile &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppointmentList;
