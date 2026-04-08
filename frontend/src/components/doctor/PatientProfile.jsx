import React from 'react';
import { User, Phone, Shield, AlertCircle, Lock, Droplets, BadgeCheck, Activity, AlertTriangle, ShieldCheck, Clock, Calendar, MapPin, Contact } from 'lucide-react';

const PatientProfile = ({ patient, handleRequestOTP }) => {
    if (!patient) return null;

    const age = patient.age ?? (patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A');
    const formattedDOB = patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('en-GB') : 'Not provided';
    const hasFullAccess = !!patient.has_full_access;

    return (
        <div className="space-y-4">
            {/* ── ACCESS STATUS BANNER ── */}
            {hasFullAccess ? (
                <div className="bg-[#2EC4A9]/10 border border-[#2EC4A9]/30 rounded-2xl px-5 py-3.5 flex items-start gap-3 animate-in fade-in duration-500">
                    <div className="w-8 h-8 bg-[#2EC4A9]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-[#2EC4A9]" />
                    </div>
                    <div>
                        <p className="text-[#1a9e8a] font-bold text-sm">Access Verified – Full</p>
                        <p className="text-[#2EC4A9]/80 text-xs mt-0.5">Complete medical record access granted via OTP</p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-amber-700 text-sm font-bold">Restricted Access</p>
                </div>
            )}

            {/* ── MAIN PROFILE CARD ── */}
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">

                {/* Patient Header */}
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${hasFullAccess ? 'bg-[#2EC4A9]/10' : 'bg-[#EFF6FF]'}`}>
                            <span className={`font-black text-xl ${hasFullAccess ? 'text-[#2EC4A9]' : 'text-[#3B9EE2]'}`}>
                                {(patient.user?.first_name || patient.first_name)?.[0]}
                                {(patient.user?.last_name || patient.last_name)?.[0]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-[18px] font-bold text-[#0D1B2A] leading-tight truncate">
                                {patient.user?.first_name || patient.first_name} {patient.user?.last_name || patient.last_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[#9CA3AF] text-[12px] font-mono">{patient.health_id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${hasFullAccess ? 'bg-[#F0FDF8] text-[#2EC4A9]' : 'bg-[#F0FDF4] text-[#2EC4A9]'}`}>
                                    <BadgeCheck className="w-3 h-3" />
                                    Verified Patient
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-[#F1F5F9] w-full" />

                {/* Stats Grid */}
                <div className="px-5 py-4 grid grid-cols-2 gap-y-4">
                    <div>
                        <label className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider block mb-0.5">Age</label>
                        <span className="text-[#0D1B2A] font-bold text-[14px]">{age} yrs</span>
                    </div>
                    <div>
                        <label className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider block mb-0.5">Blood Type</label>
                        <span className="text-[#E53E3E] font-black text-[14px]">{patient.blood_group || '–'}</span>
                    </div>
                    <div>
                        <label className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider block mb-0.5">Gender</label>
                        <span className="text-[#0D1B2A] font-bold text-[14px]">{patient.gender || 'N/A'}</span>
                    </div>
                    <div>
                        <label className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider block mb-0.5">Date of Birth</label>
                        <span className="text-[#0D1B2A] font-bold text-[14px]">{formattedDOB}</span>
                    </div>
                </div>

                {/* Full-access contact section */}
                {hasFullAccess && (
                    <>
                        <div className="h-[1px] bg-[#F1F5F9] w-full" />
                        <div className="px-5 py-4 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</p>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                <span className="text-[#4A5568] text-[14px] font-medium">{patient.contact_number || 'Not provided'}</span>
                            </div>
                            {patient.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-0.5" />
                                    <span className="text-[#4A5568] text-[13px]">{patient.address}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="h-[1px] bg-[#F1F5F9] w-full" />

                {/* Medical Flags */}
                <div className="px-5 py-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <Activity className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
                        <div>
                            <label className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider block mb-0.5">Conditions</label>
                            <p className="text-[#4A5568] text-[13px]">
                                {patient.chronic_conditions === 'None' || !patient.chronic_conditions ? 'None recorded' : patient.chronic_conditions}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${patient.allergies && patient.allergies !== 'None' ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} />
                        <div>
                            <label className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider block mb-0.5">Allergies</label>
                            <p className={`text-[13px] ${patient.allergies && patient.allergies !== 'None' ? 'text-[#F59E0B] font-semibold' : 'text-[#4A5568]'}`}>
                                {patient.allergies === 'None' || !patient.allergies ? 'None' : patient.allergies}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contacts (full access only) */}
                {hasFullAccess && patient.emergency_contacts?.length > 0 && (
                    <>
                        <div className="h-[1px] bg-[#F1F5F9] w-full" />
                        <div className="px-5 py-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Emergency Contacts</p>
                            <div className="space-y-2">
                                {patient.emergency_contacts.map((ec, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                                        <div>
                                            <p className="text-[13px] font-bold text-[#0D1B2A]">{ec.name}</p>
                                            <p className="text-[11px] text-[#9CA3AF]">{ec.relationship}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[#3B9EE2]">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span className="text-[12px] font-bold">{ec.phone}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Request Access Button (restricted only) */}
                {!hasFullAccess && (
                    <div className="px-5 pb-5 pt-2">
                        <button
                            onClick={handleRequestOTP}
                            className="w-full bg-[#3B9EE2] text-white py-3 rounded-[8px] font-bold flex items-center justify-center gap-2 hover:bg-[#2e8dd1] transition-all shadow-sm"
                        >
                            <Shield className="w-4 h-4" />
                            <span>Request Full Access</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientProfile;
