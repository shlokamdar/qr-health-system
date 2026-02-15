import React, { useState } from 'react';

const MedicalRecordList = ({ records }) => {
    const [selectedRecord, setSelectedRecord] = useState(null);

    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-3">Recent Medical Records</h3>
            {records.length === 0 ? (
                <p className="text-gray-500 text-sm">No records yet.</p>
            ) : (
                <>
                <ul className="divide-y max-h-60 overflow-y-auto custom-scrollbar">
                    {records.map(rec => (
                        <li 
                            key={rec.id} 
                            onClick={() => setSelectedRecord(rec)}
                            className="py-2 cursor-pointer hover:bg-gray-100 transition-colors rounded px-2"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm">{rec.title}</p>
                                    <p className="text-xs text-gray-500">{rec.record_type} · {new Date(rec.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-indigo-500 text-sm">View</span>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Modal */}
                {selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span>📄</span> {selectedRecord.record_type}
                                </h3>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedRecord(null); }}
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
                                    {selectedRecord.doctor_name && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uploaded By</label>
                                            <p className="text-gray-700">Dr. {selectedRecord.doctor_name}</p>
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
                </>
            )}
        </div>
    );
};

export default MedicalRecordList;
