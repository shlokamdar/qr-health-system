import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Lock, Shield, Building2,
    CheckCircle2, ArrowRight, ChevronRight, ChevronLeft, MapPin, Phone, FileText
} from 'lucide-react';
import api from '../utils/api';

const HospitalRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        admin_username: '',
        email: '',
        admin_password: '',
        confirmPassword: '',
        name: '',
        registration_number: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.admin_username || !formData.email || !formData.admin_password) {
                setError('Please fill in all account details');
                return;
            }
            if (formData.admin_password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }
        if (step === 2) {
            if (!formData.name || !formData.registration_number || !formData.phone) {
                setError('Hospital name, registration number, and phone are required');
                return;
            }
        }
        if (step === 3) {
            if (!formData.address) {
                setError('Hospital address is required');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('doctors/hospitals/', {
                admin_username: formData.admin_username,
                email: formData.email,
                admin_password: formData.admin_password,
                name: formData.name,
                registration_number: formData.registration_number,
                phone: formData.phone,
                address: formData.address
            });
            setStep(5); // Success step
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.registration_number?.[0] || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700/50 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />

            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`relative z-10 flex flex-col items-center gap-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s < step ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' :
                            s === step ? 'bg-white text-indigo-600 shadow-xl scale-110' :
                                'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                        {s < step ? <CheckCircle2 size={18} /> : s}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0F1D] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />

            <HeaderSimple />

            <div className="w-full max-w-xl relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 md:p-14 shadow-2xl">
                    {step < 5 && (
                        <>
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-white tracking-tight">Hospital Onboarding</h2>
                                <p className="text-slate-400 mt-2 font-medium">Step {step}: {
                                    step === 1 ? 'Admin Account' :
                                        step === 2 ? 'Hospital Identity' :
                                            step === 3 ? 'Location Details' :
                                                'Verification'
                                }</p>
                            </div>

                            <StepIndicator />

                            {error && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <Shield size={18} />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Username</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input name="admin_username" type="text" value={formData.admin_username} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold" placeholder="hospital_admin" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Hospital Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold" placeholder="admin@hospital.com" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                    <input name="admin_password" type="password" value={formData.admin_password} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold" placeholder="••••••••" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verify</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold" placeholder="••••••••" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hospital Name</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold" placeholder="St. Lukes Medical Center" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration Number</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input name="registration_number" type="text" value={formData.registration_number} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-mono" placeholder="HOSP123456" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Contact Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold" placeholder="+1 234 567 890" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Address</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <textarea name="address" value={formData.address} onChange={handleChange} rows={4} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-semibold resize-none" placeholder="123 Health Ave, Medical District, City, State, ZIP" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl space-y-4">
                                            <div className="flex gap-4">
                                                <Shield className="text-indigo-400 shrink-0 mt-1" size={24} />
                                                <div>
                                                    <h4 className="text-white font-bold mb-1">One Final Review</h4>
                                                    <p className="text-indigo-300/80 text-sm leading-relaxed font-medium">Verify your registration details carefully. Once submitted, our system admin will review your application within 24-48 business hours.</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Hospital:</span>
                                                    <span className="text-white font-bold">{formData.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Reg No:</span>
                                                    <span className="text-white font-mono">{formData.registration_number}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Admin Email:</span>
                                                    <span className="text-white font-bold">{formData.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-12 pt-8 border-t border-slate-800/50">
                                {step > 1 && (
                                    <button onClick={prevStep} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                )}
                                <button
                                    onClick={step === 4 ? handleSubmit : nextStep}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : step === 4 ? 'Submit Application' : 'Continue'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </>
                    )}

                    {step === 5 && (
                        <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">Application Received!</h2>
                            <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                                Your hospital profile has been submitted for review. You'll receive an email once our admin verifies your registration documents.
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#0A0F1D] rounded-2xl font-black hover:bg-slate-100 transition-all shadow-xl shadow-white/5">
                                Proceed to Login <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-bold text-sm">
                        Already have a verified account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-white transition-colors">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const HeaderSimple = () => (
    <div className="absolute top-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-2xl text-[#0D1B2A] shadow-xl shadow-white/10">P</div>
        <span className="text-white font-black tracking-widest text-lg">PULSE<span className="text-blue-500">ID</span></span>
    </div>
);

export default HospitalRegister;
