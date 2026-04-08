import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFieldValidation } from '../hooks/useFieldValidation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const PatientRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const validationRules = {
        username: (val) => {
            if (!val) return 'Username is required';
            if (val.length < 3) return 'Username must be at least 3 characters';
            if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Only letters, numbers and underscores allowed';
            return '';
        },
        email: (val) => {
            if (!val) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email address is invalid';
            return '';
        },
        password: (val) => {
            if (!val) return 'Password is required';
            if (val.length < 8) return 'Password must be at least 8 characters';
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(val)) 
                return 'Password must contain uppercase, lowercase, number, and special character';
            return '';
        }
    };

    const { errors, valid, isValidating, validateField, formIsValid } = useFieldValidation(
        validationRules,
        ['username', 'email']
    );

    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        validateField(name, value, updatedData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formIsValid(['username', 'email', 'password', 'confirmPassword'])) {
            toast.error('Please fix the errors in the form before submitting.');
            return;
        }

        setLoading(true);
        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'PATIENT'
            });
            toast.success('Registration successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };
封装

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex flex-col items-center justify-center px-6 py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Back to Home */}
            <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
            </Link>

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-teal-500/20 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Patient Registration</h2>
                        <p className="text-slate-400 mt-2">Create your health record account</p>
                    </div>


                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-semibold ${
                                        errors.username ? 'border-red-500/50 pt-3 pb-3' : 
                                        valid.username ? 'border-emerald-500/50' : 'border-slate-700/50'
                                    }`}
                                    placeholder="Choose a username"
                                    onChange={handleChange}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isValidating.username && <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />}
                                    {!isValidating.username && valid.username && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                    {!isValidating.username && errors.username && <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                            </div>
                            {errors.username && <p className="text-[10px] text-red-400 font-bold ml-1 animate-in fade-in slide-in-from-top-1">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-semibold ${
                                        errors.email ? 'border-red-500/50' : 
                                        valid.email ? 'border-emerald-500/50' : 'border-slate-700/50'
                                    }`}
                                    placeholder="Enter your email"
                                    onChange={handleChange}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isValidating.email && <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />}
                                    {!isValidating.email && valid.email && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                    {!isValidating.email && errors.email && <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                            </div>
                            {errors.email && <p className="text-[10px] text-red-400 font-bold ml-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-semibold ${
                                        errors.password ? 'border-red-500/50' : 
                                        valid.password ? 'border-emerald-500/50' : 'border-slate-700/50'
                                    }`}
                                    placeholder="Create a password"
                                    onChange={handleChange}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {valid.password && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                    {errors.password && <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-400 font-bold ml-1 leading-tight animate-in fade-in slide-in-from-top-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-semibold ${
                                        errors.confirmPassword ? 'border-red-500/50' : 
                                        valid.confirmPassword ? 'border-emerald-500/50' : 'border-slate-700/50'
                                    }`}
                                    placeholder="Confirm your password"
                                    onChange={handleChange}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {valid.confirmPassword && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                    {errors.confirmPassword && <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                            </div>
                            {errors.confirmPassword && <p className="text-[10px] text-red-400 font-bold ml-1 animate-in fade-in slide-in-from-top-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formIsValid(['username', 'email', 'password', 'confirmPassword'])}
                            className="w-full py-4 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 mt-4 active:scale-95 transform"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-400">
                            Already have an account?{' '}
                            <Link to="/patient/login" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientRegister;
