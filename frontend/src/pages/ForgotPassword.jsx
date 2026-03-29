import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthService from '../services/auth.service';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await AuthService.forgotPassword(email);
            setStatus('success');
            // Backend provides a success message like "If an account with that email exists..."
            setMessage(response.message || 'If an account exists with that email, a password reset link has been sent.');
        } catch (err) {
            setStatus('error');
            setMessage(
                err.response?.data?.error || 
                err.response?.data?.detail || 
                'Failed to submit password reset request. Please try again later.'
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#3B9EE2]/20">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center mb-4 transform hover:scale-105 transition-transform">
                    <Activity className="w-8 h-8 text-[#0D1B2A]" />
                </div>
                <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">PulseID</h1>
            </div>

            <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300">
                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#0D1B2A] mb-2">Reset Password</h2>
                        <p className="text-sm text-slate-500">
                            Enter the email address associated with your account and we'll send you a secure link to reset your password.
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0D1B2A] mb-2">Check your inbox</h3>
                            <p className="text-sm text-slate-600 mb-8 px-4 leading-relaxed">
                                {message}
                            </p>
                            <Link 
                                to="/login"
                                className="inline-flex items-center justify-center w-full py-4 text-sm font-bold bg-white text-[#0D1B2A] border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            {status === 'error' && (
                                <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{message}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (status === 'error') setStatus('idle');
                                            }}
                                            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-[#0D1B2A] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#3B9EE2]/15 focus:border-[#3B9EE2] transition-all font-medium text-sm"
                                            placeholder="name@organization.com"
                                            disabled={status === 'loading'}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-4 bg-[#3B9EE2] hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>

                            <div className="mt-8 text-center border-t border-slate-100 pt-6">
                                <Link 
                                    to="/login"
                                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#3B9EE2] transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
