import React, { useState } from 'react';
import { ShieldAlert, X, ChevronRight, Phone, Mail, LayoutDashboard, User } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const OTPRequestModal = ({ patient, isPublic, onClose, onSuccess }) => {
    const [verifierType, setVerifierType] = useState(isPublic ? 'EMERGENCY_CONTACT' : 'PATIENT');
    const [selectedContactId, setSelectedContactId] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('DASHBOARD');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (verifierType === 'EMERGENCY_CONTACT' && !selectedContactId) {
            toast.error("Please select an emergency contact");
            return;
        }

        try {
            setLoading(true);
            let response;
            if (isPublic) {
                const payload = {
                    qr_token: patient.health_id,
                    contact_id: selectedContactId,
                    verifier_type: verifierType
                };
                response = await api.post('patients/emergency/request-otp/', payload);
                toast.success("Access request sent!");
                onSuccess(response.data.session_id, response.data.delivery_method);
            } else {
                const payload = {
                    health_id: patient.health_id,
                    delivery_method: deliveryMethod,
                    verifier_type: verifierType,
                    verifier_contact_id: selectedContactId || null
                };
                response = await api.post('patients/otp/request/', payload);
                toast.success("Access request sent!");
                onSuccess(response.data.request_id, deliveryMethod);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to request OTP.");
        } finally {
            setLoading(false);
        }
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
                        <ShieldAlert size={28} className="text-[#3B9EE2]" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Request Medical Access</h2>
                    <p className="text-xs text-white/60 font-medium">Verify via one-time PIN to unlock full profile</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
                    <form id="otp-request-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Verifier Selection */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                                Who will verify this request?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${verifierType === 'PATIENT' ? 'border-[#3B9EE2] bg-[#3B9EE2]/5 ring-4 ring-[#3B9EE2]/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <input type="radio" className="hidden" name="verifier" value="PATIENT" checked={verifierType === 'PATIENT'} onChange={() => setVerifierType('PATIENT')} />
                                    <User size={24} className={`mb-2 ${verifierType === 'PATIENT' ? 'text-[#3B9EE2]' : 'text-slate-400'}`} />
                                    <span className={`text-[13px] font-bold ${verifierType === 'PATIENT' ? 'text-[#0D1B2A]' : 'text-slate-500'}`}>Patient</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${verifierType === 'EMERGENCY_CONTACT' ? 'border-[#3B9EE2] bg-[#3B9EE2]/5 ring-4 ring-[#3B9EE2]/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <input type="radio" className="hidden" name="verifier" value="EMERGENCY_CONTACT" checked={verifierType === 'EMERGENCY_CONTACT'} onChange={() => setVerifierType('EMERGENCY_CONTACT')} />
                                    <Phone size={24} className={`mb-2 ${verifierType === 'EMERGENCY_CONTACT' ? 'text-[#3B9EE2]' : 'text-slate-400'}`} />
                                    <span className={`text-[13px] font-bold ${verifierType === 'EMERGENCY_CONTACT' ? 'text-[#0D1B2A]' : 'text-slate-500'}`}>Contact</span>
                                </label>
                            </div>
                        </div>

                        {/* Emergency Contact Dropdown */}
                        {verifierType === 'EMERGENCY_CONTACT' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 relative z-10">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Select Contact</label>
                                <div className="relative">
                                    <select 
                                        required
                                        value={selectedContactId}
                                        onChange={(e) => setSelectedContactId(e.target.value)}
                                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-[#0D1B2A] focus:outline-none focus:border-[#3B9EE2] focus:ring-4 focus:ring-[#3B9EE2]/10 shadow-sm transition-all"
                                    >
                                        <option value="" disabled>Choose emergency contact...</option>
                                        {patient?.emergency_contacts?.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.relationship})</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-slate-200/60 w-full" />

                        {/* Delivery Method */}
                        {!isPublic && (
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block ml-1">
                                Delivery Method
                            </label>
                            <div className="space-y-2">
                                {[
                                    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard Notification', detail: 'Sent to patient\'s PulseID portal' },
                                    { id: 'EMAIL', icon: Mail, label: 'Email', detail: 'Secure delivery to inbox' }
                                ].map((method) => (
                                    <label key={method.id} className={`flex items-start p-3.5 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === method.id ? 'border-[#3B9EE2] bg-white ring-4 ring-[#3B9EE2]/10' : 'border-transparent bg-white hover:border-slate-200'}`}>
                                        <input type="radio" name="delivery" value={method.id} checked={deliveryMethod === method.id} onChange={() => setDeliveryMethod(method.id)} className="sr-only" />
                                        <div className={`mt-0.5 p-1.5 rounded-lg mr-3 ${deliveryMethod === method.id ? 'bg-[#3B9EE2]/10 text-[#3B9EE2]' : 'bg-slate-100 text-slate-400'}`}>
                                            <method.icon size={16} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${deliveryMethod === method.id ? 'text-[#0D1B2A]' : 'text-slate-600'}`}>{method.label}</p>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{method.detail}</p>
                                        </div>
                                        <div className={`ml-auto mt-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === method.id ? 'border-[#3B9EE2]' : 'border-slate-300'}`}>
                                            {deliveryMethod === method.id && <div className="w-2 h-2 rounded-full bg-[#3B9EE2]" />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        )}
                    </form>
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <button 
                        type="submit" 
                        form="otp-request-form"
                        disabled={loading}
                        className="w-full py-4 bg-[#0D1B2A] text-white rounded-xl font-bold shadow-lg shadow-[#0D1B2A]/20 flex items-center justify-center disabled:opacity-70 transition-all hover:bg-[#1A365D]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Request PIN Securely
                                <ChevronRight size={18} className="ml-2 opacity-60" />
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Standard messaging limits apply</p>
                </div>
            </div>
        </div>
    );
};

export default OTPRequestModal;
