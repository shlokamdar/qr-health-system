import React from 'react';
import { ShieldCheck, X, Lock } from 'lucide-react';

const OTPModal = ({ isOpen, onClose, otpCode, setOtpCode, handleVerifyOTP }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0D1B2A]/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#3B9EE2]" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-[#0D1B2A] bg-slate-50 p-2 rounded-xl transition-all active:scale-95 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10">
                    <div className="w-16 h-16 bg-[#3B9EE2]/10 rounded-2xl flex items-center justify-center text-[#3B9EE2] mb-6">
                        <Lock className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-black mb-2 text-[#0D1B2A] tracking-tight">Security Check</h3>
                    <p className="text-sm text-slate-400 font-bold mb-8 leading-relaxed">
                        Enter the 6-digit authorization code sent to the patient's mobile device.
                    </p>

                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="000 000"
                                className="w-full border-2 border-slate-100 bg-slate-50 p-5 rounded-2xl text-center text-4xl font-black tracking-[0.3em] focus:border-[#3B9EE2] focus:bg-white focus:outline-none transition-all text-[#0D1B2A] placeholder:text-slate-200"
                                maxLength={6}
                                value={otpCode}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 6) setOtpCode(val);
                                }}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#0D1B2A] text-white py-4 rounded-2xl hover:bg-[#1a2e41] font-black shadow-xl shadow-[#0D1B2A]/10 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                        >
                            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Verify Access</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Cancel Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;
