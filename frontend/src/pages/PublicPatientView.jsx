import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Heart, ShieldAlert, Phone, User, Activity, 
    AlertCircle, ChevronRight, Lock, MapPin,
    Droplets, Info
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import OTPRequestModal from '../components/patient/OTPRequestModal';
import OTPEntryModal from '../components/patient/OTPEntryModal';

const PublicPatientView = () => {
    const { healthId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modals state
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('');

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`patients/${healthId}/`);
                setPatient(response.data);
            } catch (err) {
                console.error("Public data fetch error:", err);
                setError("Information not available or invalid Health ID.");
            } finally {
                setLoading(false);
            }
        };

        if (healthId) fetchPublicData();
    }, [healthId]);

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-headings font-bold animate-pulse">Loading PulseID...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0D1B2A] mb-3">Access Unavailable</h2>
            <p className="text-body max-w-xs mb-8">{error}</p>
            <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-[#0D1B2A] text-white rounded-xl font-bold hover:opacity-90 transition-all"
            >
                Return Home
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter">
            {/* Header / Banner */}
            <div className="bg-[#0D1B2A] text-white pt-12 pb-24 px-6">
                <div className="max-w-xl mx-auto flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center mb-6">
                        <Heart size={32} className="text-[#3B9EE2] fill-[#3B9EE2]" />
                    </div>
                    <span className="text-[#3B9EE2] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Emergency Medical Access</span>
                    <h1 className="text-3xl font-black mb-2 tracking-tight">
                        {patient?.first_name} {patient?.last_name}
                    </h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">{patient?.health_id}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-xl mx-auto px-6 -mt-12 pb-20">
                <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-white p-8 md:p-10 space-y-10">
                    
                    {/* Basic Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-extrabold text-[#718096] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Activity size={12} className="text-[#3B9EE2]" /> Age
                            </p>
                            <p className="text-lg font-bold text-[#0D1B2A]">{patient?.age || 'N/A'} Yrs</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold text-[#718096] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <User size={12} className="text-[#3B9EE2]" /> Gender
                            </p>
                            <p className="text-lg font-bold text-[#0D1B2A]">{patient?.gender}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold text-[#718096] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Droplets size={12} className="text-red-500" /> Blood Group
                            </p>
                            <p className="text-lg font-bold text-[#0D1B2A]">{patient?.blood_group || 'Not Specified'}</p>
                        </div>
                    </div>

                    <div className="h-px bg-[#F1F5F9]"></div>

                    {/* Medical Section */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                <AlertCircle size={14} /> Critical Allergies
                            </h3>
                            <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-[13px] text-red-900 font-medium leading-relaxed">
                                {patient?.allergies || "No known allergies reported."}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-black text-[#0D1B2A] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                <Info size={14} className="text-[#3B9EE2]" /> Conditions & Notes
                            </h3>
                            <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl text-[13px] text-[#4A5568] font-medium leading-relaxed">
                                {patient?.chronic_conditions || "No chronic conditions reported."}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-[#F1F5F9]"></div>

                    {/* Emergency Contacts */}
                    <div>
                        <h3 className="text-[11px] font-black text-[#0D1B2A] uppercase tracking-[0.15em] mb-5">Emergency Contacts</h3>
                        <div className="space-y-4">
                            {patient?.emergency_contacts?.map((contact, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
                                    <div>
                                        <p className="text-sm font-bold text-[#0D1B2A]">{contact.name}</p>
                                        <p className="text-[11px] text-[#718096] font-medium">{contact.relationship}</p>
                                    </div>
                                    <a 
                                        href={`tel:${contact.phone}`}
                                        className="h-10 w-10 bg-white border border-[#E2E8F0] text-[#3B9EE2] rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Phone size={18} fill="currentColor" stroke="none" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Access CTA */}
                    <div className="pt-4">
                        <button 
                            onClick={() => setShowRequestModal(true)}
                            className="w-full bg-[#0D1B2A] hover:bg-[#1A365D] text-white p-5 rounded-[20px] font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20"
                        >
                            <Lock size={18} className="text-[#3B9EE2]" />
                            <span>Request Full Medical Access</span>
                            <ChevronRight size={20} className="ml-auto opacity-50" />
                        </button>
                        <p className="text-center text-[10px] text-[#94A3B8] mt-4 font-medium px-6">
                            Full access requires patient OTP verification and will notify emergency contacts.
                        </p>
                    </div>

                </div>
            </div>
            
            <footer className="text-center py-10 opacity-40">
                <div className="pd-logo justify-center grayscale scale-75">
                    <div className="pd-logo-mark"><span className="text-white font-black">P</span></div>
                    <div className="pd-logo-text text-[#0D1B2A]">PulseID</div>
                </div>
            </footer>

            {/* Modals */}
            {showRequestModal && (
                <OTPRequestModal 
                    patient={patient} 
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={(reqId, method) => {
                        setShowRequestModal(false);
                        setActiveRequestId(reqId);
                        setDeliveryMethod(method);
                        setShowEntryModal(true);
                    }}
                />
            )}
            
            {showEntryModal && (
                <OTPEntryModal
                    patient={patient}
                    requestId={activeRequestId}
                    deliveryMethod={deliveryMethod}
                    onClose={() => setShowEntryModal(false)}
                    onSuccess={() => {
                        setShowEntryModal(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default PublicPatientView;
