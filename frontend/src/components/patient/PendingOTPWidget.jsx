import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Copy, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PendingOTPWidget = () => {
    const [requests, setRequests] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    const fetchRequests = async () => {
        try {
            const res = await api.get('otp/pending/');
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
            await api.delete(`otp/revoke/${id}/`);
            toast.success("Request revoked.");
            fetchRequests();
        } catch (err) {
            toast.error("Failed to revoke request");
        }
    };

    if (requests.length === 0) return null;

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-red-900/5 border border-red-50 mt-8 mb-8 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-10 -mt-20 opacity-60 z-0"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-extrabold text-[#0D1B2A]">Pending Access Requests</h3>
                        <p className="text-[11px] font-medium text-slate-500">A doctor is requesting full profile access</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {requests.map((req) => {
                        // Calculate progress bar relative to 10 mins (600s)
                        const totalMs = 600000;
                        const elapsedMs = new Date() - new Date(req.created_at);
                        const progress = Math.max(0, 100 - (elapsedMs / totalMs) * 100);
                        
                        return (
                            <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                <div className="flex-1 w-full relative">
                                    <p className="text-sm font-bold text-[#0D1B2A]">{req.doctor_name}</p>
                                    <div className="flex items-center gap-2 mt-1 mb-3">
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md uppercase tracking-wider">
                                            {req.verifier_type.replace('_', ' ')}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                            <Clock size={10} /> Expires in {Math.max(0, Math.ceil((new Date(req.expires_at) - new Date())/60000))} mins
                                        </span>
                                    </div>
                                    
                                    {/* Expiry Bar */}
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${progress < 20 ? 'bg-red-500' : 'bg-[#3B9EE2]'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {req.delivery_method === 'DASHBOARD' ? (
                                        <div className="bg-[#0D1B2A] text-white px-4 py-2 rounded-xl flex items-center gap-3 w-full md:w-auto justify-between">
                                            <span className="font-mono text-lg font-bold tracking-widest">{req.otp_code}</span>
                                            <button 
                                                onClick={() => handleCopy(req.otp_code, req.id)}
                                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all ml-2"
                                                title="Copy PIN"
                                            >
                                                {copiedId === req.id ? <CheckCircle2 size={16} className="text-[#10B981]" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-200/50 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm text-center flex-1 md:flex-none">
                                            {req.otp_code}
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => handleRevoke(req.id)}
                                        className="h-11 w-11 shrink-0 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all hover:scale-105"
                                        title="Revoke Request"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
