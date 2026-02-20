import React, { useState } from 'react';
import { FileText, ChevronRight, X, Calendar, User, ExternalLink, Download, FileCheck, Info } from 'lucide-react';

const MedicalRecordList = ({ records }) => {
    const [selectedRecord, setSelectedRecord] = useState(null);

    return (
        <div className="space-y-4">
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100/50 overflow-hidden">
                {records.length === 0 ? (
                    <div className="p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No records found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {records.map(rec => (
                            <div
                                key={rec.id}
                                onClick={() => setSelectedRecord(rec)}
                                className="p-5 hover:bg-white cursor-pointer transition-all duration-300 group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#3B9EE2]/10 group-hover:text-[#3B9EE2] transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#0D1B2A] group-hover:text-[#3B9EE2] transition-colors">{rec.title}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3B9EE2] bg-[#3B9EE2]/5 px-2 py-0.5 rounded-full">
                                                {rec.record_type}
                                            </div>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0D1B2A] group-hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Details Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#0D1B2A]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 flex flex-col">
                        <div className="bg-[#3B9EE2] p-8 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10 flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{selectedRecord.record_type}</span>
                                        <h3 className="font-black text-2xl tracking-tight leading-none mt-1">Record Overview</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-xl flex items-center justify-center transition-all group active:scale-95"
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Document Title</label>
                                    <p className="text-2xl font-black text-[#0D1B2A] leading-tight group-hover:text-[#3B9EE2] transition-colors">
                                        {selectedRecord.title}
                                    </p>
                                </div>

                                {selectedRecord.description && (
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
                                            <Info className="w-3 h-3" />
                                            Notes & Summary
                                        </label>
                                        <p className="text-slate-600 font-medium leading-relaxed">
                                            {selectedRecord.description}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white border border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Upload Date</label>
                                        <div className="flex items-center gap-2 text-[#0D1B2A] font-bold">
                                            <Calendar className="w-4 h-4 text-[#3B9EE2]" />
                                            <span>{new Date(selectedRecord.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white border border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Provider</label>
                                        <div className="flex items-center gap-2 text-[#0D1B2A] font-bold">
                                            <User className="w-4 h-4 text-[#2EC4A9]" />
                                            <span className="truncate">
                                                {selectedRecord.doctor_name || 'Medical Team'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedRecord.file && (
                                    <div className="pt-4">
                                        <a
                                            href={selectedRecord.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between bg-[#0D1B2A] text-white p-6 rounded-[2rem] hover:bg-[#1a2e41] transition-all shadow-xl shadow-[#0D1B2A]/10 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                                                    <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div>
                                                    <p className="font-black leading-none">View Document</p>
                                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1.5">PulseID Secure Portal</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-5 h-5 text-white/40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="flex-1 py-4 bg-white text-[#0D1B2A] rounded-2xl font-black text-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecordList;
