import React, { useState } from 'react';
import { Calendar, User, ClipboardList, Stethoscope, ChevronRight, X, Clock, Pill, FileText, AlertCircle, FileX } from 'lucide-react';

const ConsultationHistory = ({ consultations }) => {
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    return (
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-bold text-[#0D1B2A] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#3B9EE2]" />
                    <span>Clinical History</span>
                </h3>
                <span className="text-[#9CA3AF] text-[13px]">{consultations.length} visits traceable</span>
            </div>

            <div className="space-y-6">
                {consultations.length === 0 ? (
                    <div className="py-12 text-center">
                        <FileX className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                        <p className="text-[#9CA3AF] text-[14px]">No consultations found.</p>
                    </div>
                ) : (
                    <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F1F5F9]">
                        {consultations.map(con => (
                            <div key={con.id} className="relative group">
                                <div className="absolute -left-[23px] top-1.5 w-[10px] h-[10px] rounded-full bg-[#2EC4A9] border-2 border-white shadow-sm" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[#9CA3AF] text-[13px]">
                                                {new Date(con.consultation_date).toLocaleDateString()}
                                            </span>
                                            <span className="text-[#9CA3AF] text-[13px]">•</span>
                                            <span className="text-[#4A5568] text-[13px]">
                                                Dr. {con.doctor_details?.user?.first_name} {con.doctor_details?.user?.last_name}
                                            </span>
                                        </div>
                                        <h4 className="text-[#0D1B2A] font-bold text-[15px]">{con.diagnosis || 'General checkup'}</h4>
                                        <p className="text-[#4A5568] text-[13px] mt-1 italic">"{con.chief_complaint}"</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedConsultation(con)}
                                        className="text-[#3B9EE2] font-bold text-[13px] hover:underline flex items-center gap-1"
                                    >
                                        View Details
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Detail Modal */}
            {selectedConsultation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#0D1B2A]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 max-h-[90vh] flex flex-col">
                        <div className="bg-[#0D1B2A] p-8 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B9EE2]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#3B9EE2] rounded-2xl text-white shadow-xl shadow-[#3B9EE2]/20">
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl text-white tracking-tight">Record Details</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {new Date(selectedConsultation.consultation_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                                                {new Date(selectedConsultation.consultation_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedConsultation(null)}
                                    className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all group active:scale-95"
                                >
                                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {selectedConsultation.doctor_details?.user && (
                                        <div className="group/item">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Physician</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0D1B2A] font-bold border border-slate-100">
                                                    <User className="w-5 h-5 opacity-40" />
                                                </div>
                                                <p className="font-black text-[#0D1B2A]">
                                                    Dr. {selectedConsultation.doctor_details.user.first_name} {selectedConsultation.doctor_details.user.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="group/item">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chief Complaint</label>
                                        <div className="flex gap-3">
                                            <div className="w-1 h-auto bg-[#3B9EE2] rounded-full shrink-0" />
                                            <p className="text-xl font-bold text-[#0D1B2A] leading-tight">{selectedConsultation.chief_complaint}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-[#2EC4A9]/5 p-5 rounded-3xl border border-[#2EC4A9]/10">
                                        <label className="text-[10px] font-black text-[#2EC4A9] uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                            <FileText className="w-3 h-3" />
                                            Diagnosis
                                        </label>
                                        <p className="text-[#0D1B2A] font-black tracking-tight leading-relaxed">
                                            {selectedConsultation.diagnosis || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
                                        <Pill className="w-3 h-3 text-[#3B9EE2]" />
                                        Medical Prescription
                                    </label>
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[#0D1B2A] font-mono text-sm leading-loose whitespace-pre-wrap">
                                            {selectedConsultation.prescription || 'No medicines prescribed'}
                                        </p>
                                    </div>
                                </div>

                                {selectedConsultation.notes && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Observations</label>
                                        <p className="text-slate-600 bg-white p-5 rounded-2xl border border-slate-100 font-medium leading-relaxed">
                                            {selectedConsultation.notes}
                                        </p>
                                    </div>
                                )}

                                {selectedConsultation.follow_up_date && (
                                    <div className="flex items-center gap-4 bg-amber-50 p-5 rounded-3xl border border-amber-100/50">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shadow-amber-900/5">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Follow-up Required</span>
                                            <p className="font-black text-[#0D1B2A] text-lg">
                                                {new Date(selectedConsultation.follow_up_date).toLocaleDateString(undefined, {
                                                    weekday: 'long', month: 'long', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center shrink-0">
                            <button
                                onClick={() => setSelectedConsultation(null)}
                                className="px-12 py-3 bg-[#0D1B2A] text-white rounded-full font-black text-sm hover:bg-[#1a2e41] transition-all active:scale-95 shadow-xl shadow-[#0D1B2A]/10"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationHistory;
