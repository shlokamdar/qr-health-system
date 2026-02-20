import React from 'react';
import { PlusCircle, Save, Calendar, FileText, ClipboardList, PenTool } from 'lucide-react';

const ConsultationForm = ({ newConsultation, setNewConsultation, handleSubmit }) => {
    const inputStyle = "w-full border-2 border-slate-100 bg-white/50 p-3 rounded-2xl text-sm focus:border-[#2EC4A9] focus:bg-white focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-slate-400";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

    return (
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-emerald-900/5">
            <h3 className="text-2xl font-black mb-8 text-[#0D1B2A] flex items-center gap-3">
                <div className="p-2 bg-[#2EC4A9]/10 rounded-xl text-[#2EC4A9]">
                    <PlusCircle className="w-6 h-6" />
                </div>
                <span>New Consultation</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelStyle}>Date & Time</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2EC4A9] transition-colors" />
                            <input
                                type="datetime-local"
                                className={`${inputStyle} pl-12`}
                                value={newConsultation.consultation_date}
                                onChange={e => setNewConsultation({ ...newConsultation, consultation_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelStyle}>Follow-up Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2EC4A9] transition-colors" />
                            <input
                                type="date"
                                className={`${inputStyle} pl-12`}
                                value={newConsultation.follow_up_date}
                                onChange={e => setNewConsultation({ ...newConsultation, follow_up_date: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Chief Complaint *</label>
                    <div className="relative group">
                        <ClipboardList className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#2EC4A9] transition-colors" />
                        <textarea
                            placeholder="Reason for visit..."
                            className={`${inputStyle} pl-12 min-h-[80px]`}
                            required
                            value={newConsultation.chief_complaint}
                            onChange={e => setNewConsultation({ ...newConsultation, chief_complaint: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Diagnosis</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#2EC4A9] transition-colors" />
                        <textarea
                            placeholder="Clinical diagnosis..."
                            className={`${inputStyle} pl-12 min-h-[80px]`}
                            value={newConsultation.diagnosis}
                            onChange={e => setNewConsultation({ ...newConsultation, diagnosis: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Prescription</label>
                    <div className="relative group">
                        <PenTool className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#2EC4A9] transition-colors" />
                        <textarea
                            placeholder="Medicines and dosage..."
                            className={`${inputStyle} pl-12 min-h-[100px]`}
                            value={newConsultation.prescription}
                            onChange={e => setNewConsultation({ ...newConsultation, prescription: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#2EC4A9] text-white py-4 rounded-2xl hover:bg-[#25ab93] font-black shadow-xl shadow-[#2EC4A9]/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Save Record</span>
                </button>
            </form>
        </div>
    );
};

export default ConsultationForm;
