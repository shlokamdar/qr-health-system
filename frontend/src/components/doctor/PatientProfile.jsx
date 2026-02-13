import React from 'react';

const PatientProfile = ({ patient, handleRequestOTP }) => {
    if (!patient) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                <div className="absolute -bottom-10 left-6 p-1 bg-white rounded-2xl shadow-md">
                     <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-4xl border border-slate-200">
                        👤
                    </div>
                </div>
            </div>
            
            <div className="pt-12 px-6 pb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {patient.user.first_name} {patient.user.last_name}
                        </h2>
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono mt-1">
                             ID: {patient.health_id}
                        </span>
                    </div>
                    {/* OTP Action */}
                    <button
                        onClick={handleRequestOTP}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2 rounded-lg transition-colors border border-indigo-100 shadow-sm"
                        title="Request Full Access"
                    >
                        🔐
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Age</p>
                            <p className="font-semibold text-slate-700">
                                {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} Yrs
                            </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Blood</p>
                            <p className="font-semibold text-rose-600">{patient.blood_group}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div className="flex items-center gap-3 text-sm">
                            <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">📞</span>
                            <span className="text-slate-600 font-medium">{patient.contact_number}</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm">
                            <span className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">🏥</span>
                            <span className="text-slate-600 font-medium truncate">
                                {patient.chronic_conditions === 'None' ? 'No Chronic Conditions' : patient.chronic_conditions}
                            </span>
                        </div>
                         <div className="flex items-center gap-3 text-sm">
                            <span className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">⚠️</span>
                            <span className="text-slate-600 font-medium truncate">
                                {patient.allergies === 'None' ? 'No Allergies' : patient.allergies}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
