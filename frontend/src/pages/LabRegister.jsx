import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Lock, Shield, Beaker, Activity,
    CheckCircle2, ArrowRight, ChevronRight, ChevronLeft, MapPin, Phone, FileText
} from 'lucide-react';
import api from '../utils/api';

const LabRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        admin_username: '',
        email: '',
        admin_password: '',
        confirmPassword: '',
        name: '',
        accreditation_number: '',
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
            if (!formData.name || !formData.accreditation_number || !formData.phone) {
                setError('Lab name, accreditation number, and phone are required');
                return;
            }
        }
        if (step === 3) {
            if (!formData.address) {
                setError('Lab address is required');
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
            await api.post('labs/organizations/', {
                admin_username: formData.admin_username,
                email: formData.email,
                admin_password: formData.admin_password,
                name: formData.name,
                accreditation_number: formData.accreditation_number,
                phone: formData.phone,
                address: formData.address
            });
            setStep(5); // Success step
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.accreditation_number?.[0] || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-borders -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-[1px] bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />

            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`relative z-10 flex flex-col items-center gap-2`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${s < step ? 'bg-primary text-white shadow-lg shadow-primary/30' :
                            s === step ? 'bg-white text-primary border-2 border-primary shadow-xl scale-110' :
                                'bg-white text-muted border border-borders'
                        }`}>
                        {s < step ? <CheckCircle2 size={16} /> : s}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
            <HeaderSimple />

            <div className="w-full max-w-xl relative z-10">
                <div className="bg-white border border-borders rounded-[32px] p-10 md:p-14 shadow-xl">
                    {step < 5 && (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold text-headings tracking-tight">Lab Onboarding</h1>
                                <p className="text-body mt-2 font-medium">Step {step}: {
                                    step === 1 ? 'Admin Account' :
                                        step === 2 ? 'Lab Identity' :
                                            step === 3 ? 'Location Details' :
                                                'Verification'
                                }</p>
                            </div>

                            <StepIndicator />

                            {error && (
                                <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <Shield size={18} />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Admin Username</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input name="admin_username" type="text" value={formData.admin_username} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold" placeholder="lab_admin" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Official Lab Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold" placeholder="admin@diagnosticlab.com" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Admin Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                    <input name="admin_password" type="password" value={formData.admin_password} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold" placeholder="••••••••" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Verify</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold" placeholder="••••••••" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Laboratory Name</label>
                                            <div className="relative group">
                                                <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold" placeholder="Global Diagnostics Center" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Accreditation Number</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input name="accreditation_number" type="text" value={formData.accreditation_number} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-mono" placeholder="LAB-ACC-12345" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Official Contact Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold" placeholder="+1 234 567 890" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Full Address</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-6 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                                <textarea name="address" value={formData.address} onChange={handleChange} rows={4} className="w-full pl-12 pr-6 py-4 bg-background border border-borders rounded-2xl text-headings outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-semibold resize-none" placeholder="456 Lab Rd, Biotech Park, City, State, ZIP" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="p-8 bg-light-blue border border-primary/20 rounded-[24px] space-y-4">
                                            <div className="flex gap-4">
                                                <Shield className="text-primary shrink-0 mt-1" size={24} />
                                                <div>
                                                    <h4 className="text-headings font-bold mb-1 border-none bg-transparent p-0">One Final Review</h4>
                                                    <p className="text-body text-sm leading-relaxed font-medium">Verify your lab registration details carefully. Once submitted, our system admin will review your application within 24-48 business hours.</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted font-bold">Laboratory:</span>
                                                    <span className="text-headings font-bold">{formData.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted font-bold">Acc No:</span>
                                                    <span className="text-headings font-mono font-bold">{formData.accreditation_number}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted font-bold">Admin Email:</span>
                                                    <span className="text-headings font-bold">{formData.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-12 pt-8 border-t border-borders">
                                {step > 1 && (
                                    <button onClick={prevStep} className="pulse-btn-ghost flex-1 flex items-center justify-center gap-2">
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                )}
                                <button
                                    onClick={step === 4 ? handleSubmit : nextStep}
                                    disabled={loading}
                                    className="pulse-btn-primary flex-[2] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : step === 4 ? 'Submit Application' : 'Continue'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </>
                    )}

                    {step === 5 && (
                        <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-headings mb-4">Application Received!</h2>
                            <p className="text-body font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                                Your diagnostic lab profile has been submitted for review. You'll receive an email once our admin verifies your accreditation details.
                            </p>
                            <Link to="/login" className="pulse-btn-primary inline-flex items-center gap-3 px-10">
                                Proceed to Login <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-muted font-bold text-sm">
                        Already have a verified account?{' '}
                        <Link to="/login" className="text-primary hover:underline transition-all">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const HeaderSimple = () => (
    <div className="absolute top-10 flex items-center gap-2">
        <Activity className="w-8 h-8 text-primary" />
        <span className="text-headings font-bold tracking-tight text-2xl">PulseID</span>
    </div>
);

export default LabRegister;
