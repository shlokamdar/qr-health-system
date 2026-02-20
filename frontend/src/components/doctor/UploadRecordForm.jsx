import React from 'react';
import { Upload, FilePlus, Filter, CheckCircle } from 'lucide-react';

const UploadRecordForm = ({ newRecord, setNewRecord, handleUpload }) => {
    const selectStyle = "w-full border-2 border-slate-100 bg-white/50 p-3 rounded-2xl text-sm focus:border-[#3B9EE2] focus:bg-white focus:outline-none transition-all font-black text-[#0D1B2A] appearance-none cursor-pointer";
    const inputStyle = "w-full border-2 border-slate-100 bg-white/50 p-3 rounded-2xl text-sm focus:border-[#3B9EE2] focus:bg-white focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-slate-400";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

    return (
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5">
            <h3 className="text-2xl font-black mb-8 text-[#0D1B2A] flex items-center gap-3">
                <div className="p-2 bg-[#3B9EE2]/10 rounded-xl text-[#3B9EE2]">
                    <Upload className="w-6 h-6" />
                </div>
                <span>Upload Document</span>
            </h3>
            <form onSubmit={handleUpload} className="space-y-6">
                <div>
                    <label className={labelStyle}>Record Category</label>
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#3B9EE2] transition-colors pointer-events-none" />
                        <select
                            className={`${selectStyle} pl-12`}
                            value={newRecord.record_type}
                            onChange={e => setNewRecord({ ...newRecord, record_type: e.target.value })}
                        >
                            <option value="PRESCRIPTION">Prescription</option>
                            <option value="DIAGNOSIS">Diagnosis Report</option>
                            <option value="LAB_REPORT">Lab Results</option>
                            <option value="VISIT_NOTE">Clinical Note</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Document Title</label>
                    <div className="relative group">
                        <FilePlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#3B9EE2] transition-colors" />
                        <input
                            type="text"
                            placeholder="e.g. Blood Test Results"
                            className={`${inputStyle} pl-12`}
                            value={newRecord.title}
                            onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Select File</label>
                    <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${newRecord.file ? 'bg-[#2EC4A9]/5 border-[#2EC4A9]' : 'bg-slate-50 border-slate-200 hover:border-[#3B9EE2] hover:bg-blue-50'}`}>
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={e => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                        />
                        {newRecord.file ? (
                            <>
                                <CheckCircle className="w-8 h-8 text-[#2EC4A9]" />
                                <span className="text-sm font-bold text-[#0D1B2A] truncate max-w-[200px]">{newRecord.file.name}</span>
                                <span className="text-[10px] text-[#2EC4A9] font-black uppercase tracking-widest">Selected</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#3B9EE2] transition-colors" />
                                <span className="text-sm font-bold text-slate-400 group-hover:text-[#3B9EE2] transition-colors">Choose file to upload</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">PDF, PNG, JPG</span>
                            </>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#0D1B2A] text-white py-4 rounded-2xl hover:bg-[#1a2e41] font-black shadow-xl shadow-[#0D1B2A]/10 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                    <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    <span>Upload to PulseID</span>
                </button>
            </form>
        </div>
    );
};

export default UploadRecordForm;
