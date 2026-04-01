import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Copy, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PendingOTPWidget = () => {
    const [requests, setRequests] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    const fetchRequests = async () => {
        try {
            const res = await api.get('patients/otp/pending/');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success("PIN copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRevoke = async (id) => {
        try {
            await api.delete(`patients/otp/revoke/${id}/`);
            toast.success("Request revoked.");
            fetchRequests();
        } catch (err) {
            toast.error("Failed to revoke request");
        }
    };

    if (requests.length === 0) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 shadow-2xl shadow-indigo-900/5 border border-indigo-50/50 mt-6 mb-6 relative overflow-hidden group">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-40 z-0"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <ShieldAlert size={18} />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-black text-[#0D1B2A] tracking-tight">Active Access Request</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile verification pending</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {requests.map((req) => {
                        const totalMs = 600000;
                        const elapsedMs = new Date() - new Date(req.created_at);
                        const progress = Math.max(0, 100 - (elapsedMs / totalMs) * 100);
                        
                        return (
                            <div key={req.id} className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 hover:border-indigo-100 transition-all">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-black text-[#0D1B2A] truncate">
                                                {req.doctor_name}
                                            </p>
                                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded uppercase tracking-tighter">
                                                DOCTOR
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={10} /> {Math.max(0, Math.ceil((new Date(req.expires_at) - new Date())/60000))}m left
                                            </span>
                                            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden min-w-[60px]">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${progress < 20 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {req.delivery_method === 'DASHBOARD' ? (
                                            <div className="bg-[#0D1B2A] text-white pl-4 pr-1 py-1 rounded-xl flex items-center gap-3 flex-1 sm:flex-none justify-between border border-[#0D1B2A]">
                                                <span className="font-mono text-base font-black tracking-[0.2em]">{req.otp_code}</span>
                                                <button 
                                                    onClick={() => handleCopy(req.otp_code, req.id)}
                                                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                                                    title="Copy PIN"
                                                >
                                                    {copiedId === req.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-200/50 text-slate-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest text-center flex-1 sm:flex-none">
                                                Sent via Email
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => handleRevoke(req.id)}
                                            className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"
                                            title="Cancel Request"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PendingOTPWidget;
