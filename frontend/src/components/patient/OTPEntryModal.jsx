import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, X, ChevronRight, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const OTPEntryModal = ({ patient, isPublic, requestId, deliveryMethod, onClose, onSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins
    const [isExpired, setIsExpired] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const inputRefs = useRef([]);

    useEffect(() => {
        // Auto-focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // Timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setErrorMsg(''); // clear error on typing

        // Auto focus next
        if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (index > 0 && otp[index] === '' && inputRefs.current[index - 1]) {
                // Focus previous if current is empty
                inputRefs.current[index - 1].focus();
            } else {
                // Clear current
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                setErrorMsg('');
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();
        if (/^[0-9]{1,6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            const newOtp = [...otp];
            for (let i = 0; i < digits.length && i < 6; i++) {
                newOtp[i] = digits[i];
            }
            setOtp(newOtp);
            // Focus on next empty or last one
            const focusIndex = Math.min(digits.length, 5);
            inputRefs.current[focusIndex].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return;

        try {
            setLoading(true);
            if (isPublic) {
                const res = await api.post('patients/emergency/verify-otp/', {
                    session_id: requestId,
                    otp: code
                });
                toast.success("Identity Verified. Temporary access granted.");
                onSuccess(res.data.emergency_access_token, res.data.expires_in);
            } else {
                await api.post('patients/otp/verify/', {
                    health_id: patient.health_id,
                    otp_code: code,
                    request_id: requestId
                });
                toast.success("Identity Verified. Full access granted.");
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            const errData = err.response?.data;
            if (errData?.attempts_remaining !== undefined) {
                setAttemptsLeft(errData.attempts_remaining);
                if (errData.attempts_remaining <= 0) {
                    setIsExpired(true);
                    setErrorMsg("Maximum attempts reached. Access revoked.");
                } else {
                    setErrorMsg(`Invalid PIN. ${errData.attempts_remaining} attempt(s) remaining.`);
                    setOtp(['', '', '', '', '', '']); // clear inputs
                    inputRefs.current[0].focus();
                }
            } else {
                setErrorMsg(errData?.error || "Verification failed");
                if (errData?.error?.includes('expired') || errData?.error?.includes('revoked')) {
                    setIsExpired(true);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1B2A]/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="relative bg-[#0D1B2A] text-white p-6 pb-8 text-center">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <ShieldAlert size={28} className="text-[#10B981]" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Verify Identity</h2>
                    <p className="text-xs text-white/60 font-medium">
                        Enter the 6-digit PIN sent to the {deliveryMethod?.toLowerCase()}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
                    
                    {/* Timer Alert */}
                    <div className={`mb-6 flex items-center justify-center py-2 px-4 rounded-full w-max mx-auto border-2 ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'}`}>
                        <Clock size={16} className="mr-2" />
                        <span className="text-sm font-bold font-mono tracking-widest">{formatTime(timeLeft)}</span>
                    </div>

                    <form id="otp-entry-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* PIN Pad */}
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={digit}
                                    disabled={isExpired || loading}
                                    ref={el => inputRefs.current[index] = el}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className={`w-10 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 shadow-sm transition-all focus:outline-none ${
                                        errorMsg 
                                        ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-400/20 text-red-700' 
                                        : digit 
                                        ? 'border-[#0D1B2A] bg-white text-[#0D1B2A]' 
                                        : 'border-slate-200 bg-white focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/20'
                                    } disabled:opacity-50 disabled:bg-slate-100`}
                                />
                            ))}
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                            </div>
                        )}
                        
                        {isExpired && (
                            <div className="text-center pt-2">
                                <button 
                                    type="button" 
                                    onClick={onClose}
                                    className="text-sm font-bold text-[#3B9EE2] hover:underline flex flex-col items-center justify-center mx-auto"
                                >
                                    <RefreshCw size={16} className="mb-1" />
                                    Request New PIN
                                </button>
                            </div>
                        )}

                    </form>
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <button 
                        type="submit" 
                        form="otp-entry-form"
                        disabled={loading || isExpired || otp.join('').length < 6}
                        className="w-full py-4 bg-[#0D1B2A] text-white rounded-xl font-bold shadow-lg shadow-[#0D1B2A]/20 flex items-center justify-center disabled:opacity-50 disabled:shadow-none transition-all hover:bg-[#1A365D]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Verify Identity
                                <ChevronRight size={18} className="ml-2 opacity-60" />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Never share your PIN with anyone</p>
                </div>
            </div>
        </div>
    );
};

export default OTPEntryModal;
