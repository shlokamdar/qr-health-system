import React from 'react';

const AppointmentList = ({ appointments }) => {
    if (appointments.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No appointments scheduled.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <ul className="divide-y">
            {appointments.map(apt => (
                <li key={apt.id} className="py-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-800">Dr. {apt.doctor_name}</p>
                            <p className="text-xs text-gray-500">{apt.doctor_hospital}</p>
                            <p className="text-sm mt-1 text-slate-600">
                                📅 {new Date(apt.appointment_date).toLocaleString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                            {apt.reason && (
                                <p className="text-xs text-gray-400 mt-1 italic">"{apt.reason}"</p>
                            )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${getStatusColor(apt.status)}`}>
                            {apt.status}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default AppointmentList;
