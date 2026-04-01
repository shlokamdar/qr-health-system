import React from 'react';
import { User, Phone, ShieldPlus, AlertCircle, Lock, Droplets, BadgeCheck, Activity, AlertTriangle, Shield } from 'lucide-react';

const PatientProfile = ({ patient, handleRequestOTP }) => {
    if (!patient) return null;

    const age = patient.age ?? (patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A');
    const formattedDOB = patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not provided';

    return (
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-5 shadow-sm space-y-5">
            {/* Top Patient Header */}
            <div className="flex items-center gap-4">
                <div className="w-[48px] h-[48px] bg-[#EFF6FF] rounded-full flex items-center justify-center">
                    <span className="text-[#3B9EE2] font-bold text-[18px]">
                        {(patient.user?.first_name || patient.first_name)?.[0]}
                        {(patient.user?.last_name || patient.last_name)?.[0]}
                    </span>
                </div>
                <div className="flex-1">
                    <h2 className="text-[18px] font-bold text-[#0D1B2A] leading-tight">
                        {patient.user?.first_name || patient.first_name} {patient.user?.last_name || patient.last_name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[#9CA3AF] text-[13px]">{patient.health_id}</span>
                        <span className="bg-[#F0FDF4] text-[#2EC4A9] px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Verified Patient
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-[1px] bg-[#F1F5F9] w-full" />

            {/* Stats 2x2 Grid */}
            <div className="grid grid-cols-2 gap-y-4">
                <div>
                    <label className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block">Age</label>
                    <span className="text-[#0D1B2A] font-bold text-[14px]">{age} Years</span>
                </div>
                <div>
                    <label className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block">Blood Type</label>
                    <span className="text-[#3B9EE2] font-bold text-[14px]">{patient.blood_group || 'Not set'}</span>
                </div>
                <div>
                    <label className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block">Gender</label>
                    <span className="text-[#0D1B2A] font-bold text-[14px]">{patient.gender || 'Not Specified'}</span>
                </div>
                <div>
                    <label className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block">DOB</label>
                    <span className="text-[#0D1B2A] font-bold text-[14px]">
                        {formattedDOB}
                    </span>
                </div>
            </div>

            <div className="h-[1px] bg-[#F1F5F9] w-full" />

            {/* Contact & Medical Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#4A5568] text-[14px]">{patient.contact_number || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-3">
                    <Activity className="w-4 h-4 text-[#9CA3AF] mt-1" />
                    <div>
                        <label className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block">Conditions</label>
                        <p className="text-[#4A5568] text-[14px]">
                            {patient.chronic_conditions === 'None' || !patient.chronic_conditions ? 'None recorded' : patient.chronic_conditions}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-4 h-4 mt-1 ${patient.allergies && patient.allergies !== 'None' ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} />
                    <div>
                        <label className="text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider block">Allergies</label>
                        <p className={`text-[14px] ${patient.allergies && patient.allergies !== 'None' ? 'text-[#F59E0B] font-medium' : 'text-[#4A5568]'}`}>
                            {patient.allergies === 'None' || !patient.allergies ? 'None' : patient.allergies}
                        </p>
                    </div>
                </div>
            </div>

            {/* Access Button */}
            {!patient.has_full_access && (
                <div className="pt-2">
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
    );
};

export default PatientProfile;
