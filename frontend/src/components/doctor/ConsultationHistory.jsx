import React, { useState } from 'react';

const ConsultationHistory = ({ consultations }) => {
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    return (
        <div>
            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>🩺</span>
                <span>Consultation History</span>
            </h4>
            <div className="bg-white rounded-lg max-h-60 overflow-y-auto custom-scrollbar">
                {consultations.length === 0 ? (
                    <p className="p-3 text-gray-400 text-sm text-center">No consultations found</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {consultations.map(con => (
                            <li 
                                key={con.id} 
                                onClick={() => setSelectedConsultation(con)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 group-hover:text-indigo-700">{con.chief_complaint}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(con.consultation_date).toLocaleDateString()} · {con.diagnosis || 'Pending'}
                                        </p>
                                    </div>
                                    <span className="text-gray-300 group-hover:text-indigo-400">👉</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal */}
            {selectedConsultation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span>🩺</span> Consultation Details
                            </h3>
                            <button 
                                onClick={() => setSelectedConsultation(null)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                    <p className="font-medium text-gray-800">
                                        {new Date(selectedConsultation.consultation_date).toLocaleDateString(undefined, {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {selectedConsultation.doctor_details && selectedConsultation.doctor_details.user && (
                                     <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor</label>
                                        <p className="font-medium text-gray-800">
                                            Dr. {selectedConsultation.doctor_details.user.first_name} {selectedConsultation.doctor_details.user.last_name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chief Complaint</label>
                                <p className="text-lg font-medium text-gray-900">{selectedConsultation.chief_complaint}</p>
                            </div>

                            {selectedConsultation.diagnosis && (
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Diagnosis</label>
                                    <p className="text-indigo-900 font-medium">{selectedConsultation.diagnosis}</p>
                                </div>
                            )}

                            {selectedConsultation.prescription && (
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prescription</label>
                                    <p className="text-gray-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1 whitespace-pre-wrap font-mono text-sm">
                                        {selectedConsultation.prescription}
                                    </p>
                                </div>
                            )}

                             {selectedConsultation.notes && (
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clinical Notes</label>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {selectedConsultation.notes}
                                    </p>
                                </div>
                            )}

                            {selectedConsultation.follow_up_date && (
                                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <span>📅</span>
                                    <span className="font-bold text-sm">Follow-up Required: {new Date(selectedConsultation.follow_up_date).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 text-center">
                            <button 
                                onClick={() => setSelectedConsultation(null)}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationHistory;
