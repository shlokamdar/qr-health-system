import React from 'react';
import { User, Phone, ShieldPlus, AlertCircle, Lock, Droplets } from 'lucide-react';

const PatientProfile = ({ patient, handleRequestOTP }) => {
    if (!patient) return null;

    const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();

    return (
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#0D1B2A]/5 border border-slate-100 overflow-hidden relative group">
            <div className="h-32 bg-[#0D1B2A] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3B9EE2 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <div className="w-24 h-24 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-[#0D1B2A] border-2 border-slate-100 relative overflow-hidden">
                        <User size={48} className="opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl opacity-80">
                            {patient.user.first_name?.[0]}{patient.user.last_name?.[0]}
                        </div>
                    </div>
                </div>
                <div className="absolute top-4 right-4 bg-[#2EC4A9]/20 backdrop-blur-md px-3 py-1 rounded-full border border-[#2EC4A9]/30">
                    <span className="text-[#2EC4A9] text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
            </div>

            <div className="pt-16 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-[#0D1B2A] tracking-tight">
                            {patient.user.first_name} {patient.user.last_name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase">
                                {patient.health_id}
                            </div>
                        </div>
                    </div>
                    {/* OTP Action */}
                    <button
                        onClick={handleRequestOTP}
                        className="bg-[#0D1B2A] text-white p-3 rounded-2xl hover:bg-[#3B9EE2] transition-all shadow-lg hover:shadow-[#3B9EE2]/20 active:scale-95 group/btn"
                        title="Request Authorization"
                    >
                        <Lock className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 group/stat">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">Vital Stats</p>
                            <div className="flex items-baseline gap-1">
                                <span className="font-black text-xl text-[#0D1B2A]">{age}</span>
                                <span className="text-xs font-bold text-slate-400">Yrs</span>
                            </div>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100/50">
                            <p className="text-[10px] text-rose-400 uppercase font-black tracking-[0.1em] mb-1">Blood Type</p>
                            <div className="flex items-center gap-2 text-rose-600">
                                <Droplets className="w-5 h-5" />
                                <span className="font-black text-xl">{patient.blood_group}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B9EE2] group-hover/item:scale-110 transition-transform">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Contact</p>
                                <p className="text-[#0D1B2A] font-bold">{patient.contact_number}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2EC4A9] group-hover/item:scale-110 transition-transform">
                                <ShieldPlus className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Conditions</p>
                                <p className="text-[#0D1B2A] font-bold">
                                    {patient.chronic_conditions === 'None' ? 'No Chronic Conditions' : patient.chronic_conditions}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover/item:scale-110 transition-transform">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Allergies</p>
                                <p className="text-[#0D1B2A] font-bold">
                                    {patient.allergies === 'None' ? 'No Known Allergies' : patient.allergies}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
