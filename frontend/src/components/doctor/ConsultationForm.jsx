import { PlusCircle, Save, Calendar, FileText, ClipboardList, PenTool, FilePlus, Activity } from 'lucide-react';

const ConsultationForm = ({ newConsultation, setNewConsultation, handleSubmit }) => {
    const inputStyle = "w-full border border-[#E2E8F0] bg-white p-3 rounded-[6px] text-[14px] focus:border-[#3B9EE2] focus:ring-4 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]";
    const labelStyle = "text-[14px] font-bold text-[#0D1B2A] mb-1.5 block";

    return (
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="text-[16px] font-bold mb-6 text-[#0D1B2A] flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-[#3B9EE2]" />
                <span>New Consultation</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelStyle}>Date</label>
                        <input
                            type="datetime-local"
                            className={inputStyle}
                            value={newConsultation.consultation_date}
                            onChange={e => setNewConsultation({ ...newConsultation, consultation_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Follow-up Date</label>
                        <input
                            type="date"
                            className={inputStyle}
                            value={newConsultation.follow_up_date}
                            onChange={e => setNewConsultation({ ...newConsultation, follow_up_date: e.target.value })}
                        />
                    </div>
                </div>

                {/* Dedicated Vitals Section */}
                <div className="bg-slate-50 p-5 rounded-[10px] border border-[#E2E8F0] space-y-4">
                    <h4 className="text-[14px] font-bold text-[#0D1B2A] flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                        <Activity className="w-4 h-4 text-[#3B9EE2]" />
                        <span>Vitals (Optional)</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <label className="text-[12px] font-bold text-[#4A5568] mb-1 block">Temp (°F)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="98.6"
                                className="w-full border border-[#E2E8F0] bg-white p-2.5 rounded-[6px] text-[13px] focus:border-[#3B9EE2] focus:ring-2 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]"
                                value={newConsultation.temperature || ''}
                                onChange={e => setNewConsultation({ ...newConsultation, temperature: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[#4A5568] mb-1 block">BP (mmHg)</label>
                            <input
                                type="text"
                                placeholder="120/80"
                                className="w-full border border-[#E2E8F0] bg-white p-2.5 rounded-[6px] text-[13px] focus:border-[#3B9EE2] focus:ring-2 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]"
                                value={newConsultation.blood_pressure || ''}
                                onChange={e => setNewConsultation({ ...newConsultation, blood_pressure: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[#4A5568] mb-1 block">Pulse (bpm)</label>
                            <input
                                type="number"
                                placeholder="72"
                                className="w-full border border-[#E2E8F0] bg-white p-2.5 rounded-[6px] text-[13px] focus:border-[#3B9EE2] focus:ring-2 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]"
                                value={newConsultation.pulse || ''}
                                onChange={e => setNewConsultation({ ...newConsultation, pulse: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[#4A5568] mb-1 block">SpO₂ (%)</label>
                            <input
                                type="number"
                                placeholder="98"
                                className="w-full border border-[#E2E8F0] bg-white p-2.5 rounded-[6px] text-[13px] focus:border-[#3B9EE2] focus:ring-2 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]"
                                value={newConsultation.spo2 || ''}
                                onChange={e => setNewConsultation({ ...newConsultation, spo2: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[#4A5568] mb-1 block">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="70"
                                className="w-full border border-[#E2E8F0] bg-white p-2.5 rounded-[6px] text-[13px] focus:border-[#3B9EE2] focus:ring-2 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]"
                                value={newConsultation.weight || ''}
                                onChange={e => setNewConsultation({ ...newConsultation, weight: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Chief Complaint</label>
                    <input
                        type="text"
                        placeholder="Reason for visit..."
                        className={inputStyle}
                        required
                        value={newConsultation.chief_complaint}
                        onChange={e => setNewConsultation({ ...newConsultation, chief_complaint: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Diagnosis</label>
                    <textarea
                        placeholder="Clinical diagnosis..."
                        className={`${inputStyle} min-h-[80px]`}
                        rows={3}
                        value={newConsultation.diagnosis}
                        onChange={e => setNewConsultation({ ...newConsultation, diagnosis: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Treatment Plan</label>
                    <textarea
                        placeholder="Clinical plan..."
                        className={`${inputStyle} min-h-[80px]`}
                        rows={3}
                        value={newConsultation.notes}
                        onChange={e => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Medicines / Prescription</label>
                    <textarea
                        placeholder="e.g. Paracetamol 500mg twice daily"
                        className={`${inputStyle} min-h-[80px]`}
                        rows={3}
                        value={newConsultation.prescription}
                        onChange={e => setNewConsultation({ ...newConsultation, prescription: e.target.value })}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Additional Notes</label>
                    <textarea
                        placeholder="Any extra observations..."
                        className={`${inputStyle} min-h-[60px]`}
                        rows={2}
                        value={newConsultation.notes}
                        onChange={e => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#3B9EE2] text-white py-3.5 rounded-[8px] hover:bg-[#2e8dd1] font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    <span>Save Consultation</span>
                </button>
            </form>
        </div>
    );
};

export default ConsultationForm;
