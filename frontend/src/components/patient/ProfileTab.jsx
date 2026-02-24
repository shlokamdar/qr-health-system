import React, { useState, useEffect } from 'react';
import { 
    Download, Upload, FileCheck, Clock, Check, 
    XCircle, CheckCircle2, ChevronRight, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import HealthIdCard from './HealthIdCard';

const ProfileTab = ({ patient, emergencyContacts = [], onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        contact_number: '',
        date_of_birth: '',
        blood_group: '',
        gender: 'Male',
        address: '',
        allergies: '',
        chronic_conditions: ''
    });

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (patient) {
            setFormData({
                first_name: patient.user?.first_name || '',
                last_name: patient.user?.last_name || '',
                contact_number: patient.contact_number || '',
                date_of_birth: patient.date_of_birth || '',
                blood_group: patient.blood_group || '',
                gender: patient.gender || 'Male',
                address: patient.address || '',
                allergies: patient.allergies || '',
                chronic_conditions: patient.chronic_conditions || ''
            });
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const prepareFormData = (data) => {
        const fd = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                fd.append(key, value);
            }
        });
        return fd;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsUpdating(true);
        try {
            const dataToSubmit = prepareFormData(formData);
            await onUpdate(dataToSubmit);
            toast.success('Changes saved successfully');
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReset = () => {
        if (patient) {
            setFormData({
                first_name: patient.user?.first_name || '',
                last_name: patient.user?.last_name || '',
                contact_number: patient.contact_number || '',
                date_of_birth: patient.date_of_birth || '',
                blood_group: patient.blood_group || '',
                gender: patient.gender || 'Male',
                address: patient.address || '',
                allergies: patient.allergies || '',
                chronic_conditions: patient.chronic_conditions || ''
            });
        }
    };

    const inputClasses = "w-full border border-[#E2E8F0] rounded-[10px] px-5 py-3.5 text-[15px] transition-all focus:outline-none focus:border-[#3B9EE2] focus:ring-[5px] focus:ring-[#3B9EE2]/10 text-[#0D1B2A] placeholder-[#9CA3AF] bg-[#F8FAFC] hover:bg-[#FFFFFF] hover:border-[#CBD5E1] shadow-sm font-medium";
    const labelClasses = "block text-[#718096] text-[11px] font-extrabold mb-2.5 uppercase tracking-[0.12em]";

    const previewPatient = {
        ...patient,
        user: { ...patient?.user, first_name: formData.first_name, last_name: formData.last_name },
        blood_group: formData.blood_group,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        emergency_contacts: emergencyContacts.length > 0 ? emergencyContacts : patient?.emergency_contacts
    };

    return (
        <div className="max-w-[1400px] py-6 animate-in fade-in duration-700">
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-12 items-start">
                
                {/* LEFT COLUMN: 70% Form Area */}
                <div className="w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-10">
                            {/* PERSONAL INFORMATION CARD */}
                            <div className="bg-white rounded-[20px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F1F5F9] mb-8 relative">
                                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-[#F1F5F9]">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#2EC4A9]/10 to-[#2EC4A9]/20 text-[#2EC4A9]">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-[#0D1B2A] text-[18px] font-bold tracking-tight">Identity & Profile</h3>
                                        <p className="text-[#718096] text-[12px]">Your official identity and contact records</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                    <div>
                                        <label className={labelClasses}>First Name</label>
                                        <input name="first_name" value={formData.first_name} onChange={handleChange} className={inputClasses} placeholder="First Name" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Last Name</label>
                                        <input name="last_name" value={formData.last_name} onChange={handleChange} className={inputClasses} placeholder="Last Name" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Contact Number</label>
                                        <input name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputClasses} placeholder="+91..." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Date of Birth</label>
                                        <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Blood Group</label>
                                        <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClasses} style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}>
                                            <option value="">Select Group</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses} style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClasses} placeholder="Full Address" />
                                    </div>
                                </div>
                            </div>

                            {/* MEDICAL INFORMATION CARD */}
                            <div className="bg-white rounded-[20px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F1F5F9] relative">
                                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-[#F1F5F9]">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B9EE2]/10 to-[#3B9EE2]/20 text-[#3B9EE2]">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-[#0D1B2A] text-[18px] font-bold tracking-tight">Clinical Background</h3>
                                        <p className="text-[#718096] text-[12px]">Essential medical history and parameters</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-10">
                                    <div>
                                        <label className={labelClasses}>Known Allergies</label>
                                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} className={inputClasses} placeholder="e.g. Penicillin, Pollen..." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Chronic Conditions</label>
                                        <textarea name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} rows={2} className={inputClasses} placeholder="e.g. Type 2 Diabetes..." />
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTONS ROW */}
                            <div className="flex items-center justify-end gap-10 mt-12 pb-16">
                                <button 
                                    type="button" 
                                    onClick={handleReset} 
                                    className="px-6 py-3 text-[#718096] bg-transparent hover:bg-slate-50 border-none transition-all font-semibold text-[15px] opacity-70 hover:opacity-100 ring-0 active:scale-95"
                                >
                                    Cancel and Reset
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isUpdating} 
                                    className="px-12 py-4.5 bg-[#3B9EE2] text-white rounded-full hover:bg-[#2F81B9] transition-all font-bold text-[15px] shadow-[0_15px_30px_rgba(59,158,226,0.25)] hover:shadow-[0_20px_40px_rgba(59,158,226,0.35)] disabled:opacity-50 active:scale-95 hover:-translate-y-0.5"
                                >
                                    {isUpdating ? 'Updating Records...' : 'Save Profile Details'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: 45% (Sticky) */}
                <div className="w-full lg:w-[45%] lg:sticky lg:top-24 space-y-4">
                    <div className="text-[#9CA3AF] text-[11px] font-bold tracking-wider uppercase">YOUR HEALTH ID CARD</div>
                    
                    <div className="relative group">
                        <HealthIdCard patient={previewPatient} />
                        <div className="mt-3 text-[11px] text-[#9CA3AF] text-center">
                            Changes appear on your downloaded card after saving.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileTab;
