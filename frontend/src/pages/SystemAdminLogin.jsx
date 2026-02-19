import React, { useState } from 'react';
import { Activity, ShieldAlert, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login
        setTimeout(() => {
            setLoading(false);
            // In reality, check auth and then navigate
            navigate('/admin/dashboard'); 
        }, 1500);
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Panel - Navy */}
            <div className="hidden lg:flex flex-1 bg-[#0D1B2A] flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B9EE2] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2EC4A9] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-8 h-8 text-white" />
                        <span className="text-2xl font-bold text-white tracking-tight">PulseID</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">System Administration<br/>Portal</h2>
                    <p className="text-[#94A3B8] max-w-sm leading-relaxed">
                        Secure access for network administrators. Monitor system health, verify medical personnel, and manage access logs.
                    </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-xs text-red-200">
                        <span className="font-bold block text-red-400 mb-0.5">Restricted Access</span>
                        Authorized personnel only. All access attempts are logged and monitored.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <Activity className="w-8 h-8 text-[#0D1B2A]" />
                         <span className="text-2xl font-bold text-[#0D1B2A] tracking-tight">PulseID</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-2xl font-bold text-[#0D1B2A] mb-2">Admin Login</h1>
                        <p className="text-sm text-[#64748B]">Please enter your root credentials.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wider mb-2">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#0D1B2A] focus:outline-none focus:border-[#0D1B2A] focus:ring-1 focus:ring-[#0D1B2A] transition-all"
                                placeholder="admin@pulseid.system"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0D1B2A] uppercase tracking-wider mb-2">Password</label>
                            <input 
                                type="password" 
                                required
                                value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#0D1B2A] focus:outline-none focus:border-[#0D1B2A] focus:ring-1 focus:ring-[#0D1B2A] transition-all"
                                placeholder="••••••••••••"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 bg-[#0D1B2A] text-white font-bold rounded-lg hover:bg-[#1a2e44] transition-colors flex items-center justify-center gap-2 disabled:opacity-80"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <><span>Access Dashboard</span> <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
                        <p className="text-[10px] text-[#94A3B8] flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Encrypted Connection • v2.4.0-stable
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemAdminLogin;
