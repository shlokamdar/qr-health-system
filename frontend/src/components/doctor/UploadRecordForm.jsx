import React, { useState } from 'react';
import { Upload, FilePlus, Filter, CheckCircle, Plus, Trash2, FileText, Pill, ClipboardList, X } from 'lucide-react';

const RECORD_TYPES = [
    { value: 'PRESCRIPTION',  label: 'Prescription',      icon: '💊' },
    { value: 'DIAGNOSIS',     label: 'Diagnosis Report',  icon: '🔬' },
    { value: 'LAB_REPORT',    label: 'Lab Results',       icon: '🧪' },
    { value: 'VISIT_NOTE',    label: 'Consultation Note', icon: '📋' },
];

const DESCRIPTION_PLACEHOLDER = {
    PRESCRIPTION: 'Describe symptoms, reason for prescription, dosage instructions, precautions...',
    DIAGNOSIS:    'Include chief complaint, clinical findings, differential diagnosis, final diagnosis...',
    LAB_REPORT:   'Summarise test findings, reference ranges, abnormal values, clinical significance...',
    VISIT_NOTE:   'Chief complaint, history of presenting illness, examination findings, plan of action...',
};

const emptyMedicine = () => ({ name: '', dosage: '', duration: '' });

const UploadRecordForm = ({ newRecord, setNewRecord, handleUpload, patientHealthId }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const isPrescription = newRecord.record_type === 'PRESCRIPTION';
    const medicines = newRecord.medicines || [];

    const addMedicine = () => setNewRecord({ ...newRecord, medicines: [...medicines, emptyMedicine()] });

    const updateMedicine = (idx, field, value) => {
        const updated = medicines.map((m, i) => i === idx ? { ...m, [field]: value } : m);
        setNewRecord({ ...newRecord, medicines: updated });
    };

    const removeMedicine = (idx) => {
        setNewRecord({ ...newRecord, medicines: medicines.filter((_, i) => i !== idx) });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setNewRecord({ ...newRecord, file });
    };

    const labelStyle = "text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2";
    const inputStyle = "w-full border border-[#E2E8F0] bg-white px-4 py-3 rounded-xl text-sm focus:border-[#3B9EE2] focus:ring-2 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-slate-300";

    return (
        <div className="bg-white rounded-[14px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center gap-3">
                <div className="w-9 h-9 bg-[#3B9EE2]/10 rounded-xl flex items-center justify-center text-[#3B9EE2]">
                    <FilePlus className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-black text-[#0D1B2A] text-[15px]">Add Medical Record</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Fill in the details and attach a file if required</p>
                </div>
            </div>

            <form onSubmit={handleUpload} className="px-6 py-6 space-y-5">

                {/* Record Type */}
                <div>
                    <label className={labelStyle}>Record Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                        {RECORD_TYPES.map(rt => (
                            <button
                                key={rt.value}
                                type="button"
                                onClick={() => setNewRecord({ ...newRecord, record_type: rt.value })}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-sm font-bold ${
                                    newRecord.record_type === rt.value
                                        ? 'bg-[#3B9EE2]/10 border-[#3B9EE2] text-[#3B9EE2]'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white'
                                }`}
                            >
                                <span className="text-base">{rt.icon}</span>
                                <span className="text-[12px] leading-tight">{rt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Patient Health ID (read-only) */}
                {patientHealthId && (
                    <div>
                        <label className={labelStyle}>Patient Health ID</label>
                        <input
                            type="text"
                            value={patientHealthId}
                            readOnly
                            className={`${inputStyle} bg-slate-50 text-slate-400 cursor-not-allowed font-mono`}
                        />
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className={labelStyle}>Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        placeholder={isPrescription ? 'e.g. Follow-up Prescription' : 'e.g. Blood Test Results'}
                        className={inputStyle}
                        value={newRecord.title}
                        onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className={labelStyle}>Description <span className="text-red-500">*</span></label>
                    <textarea
                        required
                        rows={4}
                        placeholder={DESCRIPTION_PLACEHOLDER[newRecord.record_type]}
                        className={`${inputStyle} resize-none`}
                        value={newRecord.description}
                        onChange={e => setNewRecord({ ...newRecord, description: e.target.value })}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className={labelStyle}>Clinical Notes <span className="text-slate-300 font-medium normal-case">(optional)</span></label>
                    <textarea
                        rows={2}
                        placeholder="Additional notes, follow-up instructions, referrals..."
                        className={`${inputStyle} resize-none`}
                        value={newRecord.notes}
                        onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })}
                    />
                </div>

                {/* Medicines (only for Prescription) */}
                {isPrescription && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className={labelStyle + ' mb-0'}>Medicines</label>
                            <button
                                type="button"
                                onClick={addMedicine}
                                className="flex items-center gap-1.5 text-[#3B9EE2] text-xs font-black hover:text-[#2d8ac9] transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Row
                            </button>
                        </div>

                        {medicines.length === 0 ? (
                            <button
                                type="button"
                                onClick={addMedicine}
                                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 text-slate-400 text-sm font-bold hover:border-[#3B9EE2] hover:text-[#3B9EE2] transition-all flex items-center justify-center gap-2"
                            >
                                <Pill className="w-4 h-4" /> Add Medicine
                            </button>
                        ) : (
                            <div className="space-y-2">
                                {/* Header Row */}
                                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                                    {['Medicine Name', 'Dosage', 'Duration', ''].map((h, i) => (
                                        <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
                                    ))}
                                </div>
                                {medicines.map((med, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="e.g. Amoxicillin"
                                            className={inputStyle}
                                            value={med.name}
                                            onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="e.g. 500mg"
                                            className={inputStyle}
                                            value={med.dosage}
                                            onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="e.g. 7 days"
                                            className={inputStyle}
                                            value={med.duration}
                                            onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeMedicine(idx)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addMedicine}
                                    className="w-full border border-dashed border-slate-200 rounded-xl py-2 text-slate-400 text-xs font-bold hover:border-[#3B9EE2] hover:text-[#3B9EE2] transition-all flex items-center justify-center gap-2 mt-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Another
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* File Attachment */}
                <div>
                    <label className={labelStyle}>Attachment <span className="text-slate-300 font-medium normal-case">(optional)</span></label>
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                            newRecord.file
                                ? 'bg-[#2EC4A9]/5 border-[#2EC4A9]'
                                : isDragOver
                                    ? 'bg-[#3B9EE2]/5 border-[#3B9EE2] scale-[0.99]'
                                    : 'bg-slate-50 border-slate-200 hover:border-[#3B9EE2] hover:bg-blue-50/30'
                        }`}
                        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={e => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                        />
                        {newRecord.file ? (
                            <>
                                <CheckCircle className="w-7 h-7 text-[#2EC4A9]" />
                                <span className="text-sm font-bold text-[#0D1B2A] truncate max-w-[220px]">{newRecord.file.name}</span>
                                <span className="text-[10px] text-[#2EC4A9] font-black uppercase tracking-widest">File attached</span>
                            </>
                        ) : (
                            <>
                                <Upload className={`w-7 h-7 transition-colors ${isDragOver ? 'text-[#3B9EE2]' : 'text-slate-300'}`} />
                                <span className="text-sm font-bold text-slate-400">Drag & drop or click to upload</span>
                                <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">PDF, PNG, JPG accepted</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={() => setNewRecord({ title: '', description: '', notes: '', medicines: [], record_type: 'PRESCRIPTION', file: null })}
                        className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-[2] py-3 bg-[#3B9EE2] text-white rounded-xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-[#2d8ac9] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Save Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadRecordForm;
