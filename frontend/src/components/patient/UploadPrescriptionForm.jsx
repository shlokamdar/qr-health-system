import React, { useState } from 'react';
import { Calendar, User2, Building2, Stethoscope, ClipboardList, Pill, FileText, UploadCloud, Plus } from 'lucide-react';

const UploadPrescriptionForm = ({ newPrescription, setNewPrescription, handleUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const up = (field, val) => setNewPrescription({ ...newPrescription, [field]: val });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    up('file', file);

    if (file.type.startsWith('image/')) {
        setIsProcessing(true);
        // Simulate AI OCR Extraction
        setTimeout(() => {
            const mockExtracted = {
                doctor_name: "Dr. Arvind Kumar",
                hospital_name: "Apollo Hospitals",
                symptoms: "Persistent cough, mild fever for 3 days",
                diagnosis: "Acute Bronchitis",
                medicines: "1. Azithromycin 500mg - 1 tab OD x 3 days\n2. Levocetirizine 5mg - 1 tab HS x 5 days\n3. Syrup Ascoril LS - 10ml TID",
                insights: "Strict bed rest recommended. Plenty of fluids."
            };
            
            setNewPrescription(prev => ({
                ...prev,
                ...mockExtracted,
                file: file
            }));
            setIsProcessing(false);
        }, 2500);
    }
  };

  const inputClasses = "w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[13px] transition-all focus:outline-none focus:border-[#3B9EE2] text-[#0D1B2A] placeholder-[#9CA3AF] bg-white font-medium";
  const labelClasses = "flex items-center gap-2 text-[#718096] text-[11px] font-bold mb-1.5 uppercase tracking-wider";

  return (
    <div className="bg-white border border-borders rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Plus size={20} />
        </div>
        <div>
            <h3 className="text-headings text-lg font-bold tracking-tight">Add Prescription</h3>
            <p className="text-body text-xs font-medium">Record new medical advice or treatment</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className={labelClasses}><Calendar size={14} className="text-primary" /> Date *</label>
                <input 
                    type="date" 
                    required 
                    value={newPrescription.prescription_date}
                    onChange={e => up('prescription_date', e.target.value)} 
                    className={inputClasses}
                />
            </div>
            <div>
                <label className={labelClasses}><User2 size={14} className="text-primary" /> Doctor Name *</label>
                <input 
                    type="text" 
                    placeholder="Dr. John Doe" 
                    required 
                    value={newPrescription.doctor_name}
                    onChange={e => up('doctor_name', e.target.value)} 
                    className={inputClasses}
                />
            </div>
        </div>

        <div>
            <label className={labelClasses}><Building2 size={14} className="text-primary" /> Hospital / Clinic</label>
            <input 
                type="text" 
                placeholder="Central Medical Center" 
                value={newPrescription.hospital_name}
                onChange={e => up('hospital_name', e.target.value)} 
                className={inputClasses}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className={labelClasses}><Stethoscope size={14} className="text-primary" /> Symptoms</label>
                <textarea 
                    rows={2} 
                    placeholder="Describe symptoms..." 
                    value={newPrescription.symptoms}
                    onChange={e => up('symptoms', e.target.value)} 
                    className={`${inputClasses} resize-none`}
                />
            </div>
            <div>
                <label className={labelClasses}><ClipboardList size={14} className="text-primary" /> Diagnosis</label>
                <textarea 
                    rows={2} 
                    placeholder="Medical diagnosis..." 
                    value={newPrescription.diagnosis}
                    onChange={e => up('diagnosis', e.target.value)} 
                    className={`${inputClasses} resize-none`}
                />
            </div>
        </div>

        <div>
            <label className={labelClasses}><Pill size={14} className="text-primary" /> Medicines</label>
            <textarea 
                rows={3} 
                placeholder="Paracetamol, 500mg, twice daily" 
                value={newPrescription.medicines}
                onChange={e => up('medicines', e.target.value)} 
                className={`${inputClasses} resize-none`}
            />
        </div>

        <div>
            <label className={labelClasses}><FileText size={14} className="text-primary" /> Insights & Notes</label>
            <textarea 
                rows={2} 
                placeholder="Any additional notes..." 
                value={newPrescription.insights}
                onChange={e => up('insights', e.target.value)} 
                className={`${inputClasses} resize-none`}
            />
        </div>

        <div className="pt-2">
            <label className={labelClasses}><UploadCloud size={14} className="text-primary" /> Prescription Image *</label>
            <div className="relative group">
                <input 
                    type="file" 
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-[#F8FAFB] group-hover:border-[#3B9EE2]/50 group-hover:bg-[#3B9EE2]/5 transition-all ${isProcessing ? 'animate-pulse bg-[#3B9EE2]/5 border-[#3B9EE2]/30' : ''}`}>
                    <UploadCloud className={`${isProcessing ? 'text-primary' : 'text-muted'} group-hover:text-primary transition-colors`} size={28} />
                    <div className="text-center">
                        <span className="text-xs font-bold text-muted group-hover:text-primary uppercase tracking-widest block">
                            {isProcessing ? "Extracting Data with AI..." : (newPrescription.file ? newPrescription.file.name : "Select Prescription Image")}
                        </span>
                        {!isProcessing && !newPrescription.file && <span className="text-[10px] text-muted opacity-60">High quality images work best</span>}
                    </div>
                </div>
            </div>
            
            {/* AI WARNING */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 shrink-0 h-fit">
                    <Pill size={16} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-tight mb-1">AI-Powered Extraction</p>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Text is automatically extracted using AI. <strong>Please verify all medicines and dosages</strong> against the original image before saving.
                    </p>
                </div>
            </div>
        </div>

        <button 
            type="submit" 
            className="pulse-btn-primary w-full py-3.5 mt-2"
        >
            Add to Records
        </button>
      </form>
    </div>
  );
};

export default UploadPrescriptionForm;
