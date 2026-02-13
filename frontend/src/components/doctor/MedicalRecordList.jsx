import React, { useState } from 'react';

const MedicalRecordList = ({ records }) => {
    const [selectedRecord, setSelectedRecord] = useState(null);

    return (
        <div>
            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>📄</span>
                <span>Medical Records</span>
            </h4>
            <div className="bg-white rounded-lg max-h-60 overflow-y-auto custom-scrollbar">
                {records.length === 0 ? (
                    <p className="p-3 text-gray-400 text-sm text-center">No records found</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {records.map(rec => (
                            <li 
                                key={rec.id} 
                                onClick={() => setSelectedRecord(rec)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 group-hover:text-indigo-700">{rec.title}</p>
                                        <p className="text-xs text-gray-500">{rec.record_type} · {new Date(rec.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-gray-300 group-hover:text-indigo-400">👉</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span>📄</span> {selectedRecord.record_type}
                            </h3>
                            <button 
                                onClick={() => setSelectedRecord(null)}
                                className="hover:bg-indigo-700 p-1 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                                <p className="text-lg font-medium text-gray-800">{selectedRecord.title}</p>
                            </div>
                            
                            {selectedRecord.description && (
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                    <p className="text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                                        {selectedRecord.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                    <p className="text-gray-700">{new Date(selectedRecord.created_at).toLocaleDateString()}</p>
                                </div>
                                {selectedRecord.doctor_details && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uploaded By</label>
                                        <p className="text-gray-700">
                                            Dr. {selectedRecord.doctor_details.first_name} {selectedRecord.doctor_details.last_name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedRecord.file && (
                                <div className="pt-2">
                                    <a 
                                        href={selectedRecord.file} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block w-full text-center bg-indigo-50 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100"
                                    >
                                        📎 View Attached File
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 text-center">
                            <button 
                                onClick={() => setSelectedRecord(null)}
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

export default MedicalRecordList;
