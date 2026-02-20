import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Camera, RefreshCw, AlertCircle, ScanLine } from 'lucide-react';

const ScannerModal = ({ isOpen, onClose, onScan, error, onError, setScannerError, setIsCameraLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0D1B2A]/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#2EC4A9]" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-[#0D1B2A] bg-slate-50 p-2 rounded-xl transition-all active:scale-95 z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10">
                    <div className="w-16 h-16 bg-[#2EC4A9]/10 rounded-2xl flex items-center justify-center text-[#2EC4A9] mb-6">
                        <ScanLine className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-black mb-2 text-[#0D1B2A] tracking-tight">QR Scanner</h3>
                    <p className="text-sm text-slate-400 font-bold mb-8 leading-relaxed">
                        Securely scan the patient's Health ID to import their medical profile.
                    </p>

                    <div className="relative group">
                        {error ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="aspect-square bg-rose-50 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-rose-100">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm mb-4">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-rose-600 font-bold text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setScannerError(null);
                                        setIsCameraLoading(true);
                                    }}
                                    className="w-full bg-[#0D1B2A] text-white py-4 rounded-2xl hover:bg-[#1a2e41] font-black shadow-xl shadow-[#0D1B2A]/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Try Again</span>
                                </button>
                            </div>
                        ) : (
                            <div className="aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden relative border-4 border-[#2EC4A9]/20 shadow-2xl">
                                <Scanner
                                    onScan={onScan}
                                    onError={onError}
                                    components={{
                                        audio: false,
                                        finder: true
                                    }}
                                    constraints={{
                                        facingMode: 'environment',
                                        aspectRatio: 1
                                    }}
                                    formats={['qr_code', 'data_matrix']}
                                    scanDelay={300}
                                />
                                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#2EC4A9] rounded-3xl opacity-40 animate-pulse" />
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-50 py-3 rounded-2xl">
                        <Camera className="w-3 h-3" />
                        <span>{error ? 'Camera Permission Required' : 'PulseID Active Vision'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
