import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Lock, Shield, Building2,
    Stethoscope, FileText, ChevronRight, ChevronLeft,
    CheckCircle2, ArrowRight, UserCircle2
} from 'lucide-react';
import DoctorService from '../services/doctor.service';

const DoctorRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        license_number: '',
        specialization: '',
        hospital: ''
    });
    const [hospitals, setHospitals] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        DoctorService.getHospitals()
            .then(data => setHospitals(data))
            .catch(() => setHospitals([]));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.username || !formData.email || !formData.password) {
                setError('Please fill in all account details');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }
        if (step === 2) {
            if (!formData.first_name || !formData.last_name) {
                setError('First and last name are required');
                return;
            }
        }
        if (step === 3) {
            if (!formData.license_number || !formData.specialization) {
                setError('License and specialization are required');
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
            await DoctorService.registerDoctor({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                license_number: formData.license_number,
                specialization: formData.specialization,
                hospital: formData.hospital || null
            });
            setStep(5); // Success step
        } catch (error) {
            setError(error.response?.data?.license_number?.[0] || error.response?.data?.username?.[0] || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700/50 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />

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
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />

            <HeaderSimple />

            <div className="w-full max-w-xl relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 md:p-14 shadow-2xl">
                    {step < 5 && (
                        <>
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-white tracking-tight">Doctor Onboarding</h2>
                                <p className="text-slate-400 mt-2 font-medium">Step {step}: {
                                    step === 1 ? 'Configure Account' :
                                        step === 2 ? 'Personal Details' :
                                            step === 3 ? 'Professional Credentials' :
                                                'Institutional Affiliation'
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
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="johndoe_md" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="dr.john@pulseid.com" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                    <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="••••••••" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verify</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="••••••••" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-24 h-24 bg-slate-800 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-2 cursor-pointer hover:bg-slate-700/50 transition-all">
                                                <UserCircle2 size={32} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Photo</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                                <input name="first_name" type="text" value={formData.first_name} onChange={handleChange} className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="John" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                                <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="Doe" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 text-center px-4 leading-relaxed">Ensure your name matches your official medical registration documents for faster verification.</p>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Medical License Number</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                <input name="license_number" type="text" value={formData.license_number} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-mono" placeholder="LIC12345678" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Specialization</label>
                                            <div className="relative group">
                                                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                <input name="specialization" type="text" value={formData.specialization} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold" placeholder="e.g. Cardiology" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Affiliated Hospital</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                                <select name="hospital" value={formData.hospital} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-semibold appearance-none">
                                                    <option value="" className="bg-slate-900">Independent Practitioner</option>
                                                    {hospitals.map(h => (
                                                        <option key={h.id} value={h.id} className="bg-slate-900">{h.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-3 items-start">
                                            <Shield size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-indigo-300 leading-relaxed font-medium">Once submitted, your hospital admin or the system admin will verify your profile before you can access patient records.</p>
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
                                    className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : step === 4 ? 'Complete Registration' : 'Continue'}
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
                                Your professional profile has been submitted for review. You'll receive an email once our medical board verifies your documents.
                            </p>
                            <Link to="/doctor/login" className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#0A0F1D] rounded-2xl font-black hover:bg-slate-100 transition-all shadow-xl shadow-white/5">
                                Proceed to Login <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-bold text-sm">
                        Already have a verified account?{' '}
                        <Link to="/doctor/login" className="text-[#3B9EE2] hover:text-white transition-colors">Sign in here</Link>
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

export default DoctorRegister;

