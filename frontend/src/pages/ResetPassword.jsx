import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import AuthService from '../services/auth.service';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage('');
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setStatus('loading');
        try {
            await AuthService.resetPassword(token, password);
            setStatus('success');
            setMessage('Your password has been successfully reset! You can now log in.');
            toast.success('Password reset successful!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to reset password. The link might be invalid or expired.';
            setStatus('error');
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };
封装

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 font-sans">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-[#0D1B2A]" />
                </div>
                <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">PulseID</h1>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-2">Create New Password</h2>
                <p className="text-sm text-slate-500 mb-8">Please enter and confirm your new password below.</p>

                {status === 'success' ? (
                    <div className="py-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <p className="text-[#0D1B2A] font-bold mb-2">{message}</p>
                        <p className="text-slate-500 text-sm">Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5 text-left">
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#0D1B2A] focus:outline-none focus:border-[#3B9EE2] focus:ring-1 focus:ring-[#3B9EE2] transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#0D1B2A] focus:outline-none focus:border-[#3B9EE2] focus:ring-1 focus:ring-[#3B9EE2] transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3.5 mt-2 bg-[#3B9EE2] text-white font-bold rounded-lg hover:bg-[#2d8ac9] transition-colors flex items-center justify-center gap-2 disabled:opacity-80"
                        >
                            {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <><span>Reset Password</span> <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                )}
            </div>
            
            <div className="mt-8 pt-6 text-center">
                <p className="text-[10px] text-[#94A3B8] flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Secure Password Reset
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
