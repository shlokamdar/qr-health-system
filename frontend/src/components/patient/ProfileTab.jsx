import React, { useState, useEffect } from 'react';
import { 
    Download, Upload, FileCheck, Clock, Check, 
    XCircle, CheckCircle2, ChevronRight, Lock,
    User2, Activity
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

    const selectChevron =
        'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")';

    const inputClasses =
        'w-full min-h-[46px] border border-[#e5e7eb] rounded-lg bg-white px-4 py-3 text-sm font-normal text-[#0D1B2A] placeholder:text-slate-400/90 transition-colors box-border ' +
        'hover:border-slate-300 focus:outline-none focus:border-[#3B9EE2] focus:ring-[3px] focus:ring-[#3B9EE2]/18';

    const labelClasses = 'block text-[12px] font-normal text-[#718096] mb-2';

    const textareaClasses = `${inputClasses} min-h-[100px] resize-y leading-relaxed`;

    const cardClass =
        'bg-white rounded-xl border border-[#e5e7eb] p-8 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)]';

    const sectionHeadClass = 'flex items-center gap-3 mb-6 pb-4 border-b border-[#E2E8F0]';

    const previewPatient = {
        ...patient,
        user: { ...patient?.user, first_name: formData.first_name, last_name: formData.last_name },
        blood_group: formData.blood_group,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        emergency_contacts: emergencyContacts.length > 0 ? emergencyContacts : patient?.emergency_contacts
    };

    return (
        <div className="max-w-7xl mx-auto pt-1 pb-6 sm:pb-8 animate-in fade-in duration-700 font-inter px-4 sm:px-6">
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-6 lg:gap-8 items-start">
                
                {/* LEFT COLUMN: Form Area */}
                <div className="w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            {/* PERSONAL INFORMATION CARD */}
                            <div className={cardClass}>
                                <div className={sectionHeadClass}>
                                    <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#EFF6FF] text-[#3B9EE2] shrink-0">
                                        <User2 size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-[#0D1B2A] text-lg font-bold tracking-tight">Identity &amp; Profile</h3>
                                        <p className="text-[#718096] text-sm font-normal mt-0.5">Your official identity and contact records</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                                        <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClasses} style={{ appearance: 'none', backgroundImage: selectChevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '1.1em' }}>
                                            <option value="">Select Group</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses} style={{ appearance: 'none', backgroundImage: selectChevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '1.1em' }}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={4} className={textareaClasses} placeholder="Full Address" />
                                    </div>
                                </div>
                            </div>

                            {/* MEDICAL INFORMATION CARD */}
                            <div className={cardClass}>
                                <div className={sectionHeadClass}>
                                    <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#ECFDF5] text-[#2EC4A9] shrink-0">
                                        <Activity size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-[#0D1B2A] text-lg font-bold tracking-tight">Clinical Background</h3>
                                        <p className="text-[#718096] text-sm font-normal mt-0.5">Essential medical history and parameters</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <div>
                                        <label className={labelClasses}>Known Allergies</label>
                                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={4} className={textareaClasses} placeholder="e.g. Penicillin, Pollen..." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Chronic Conditions</label>
                                        <textarea name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} rows={4} className={textareaClasses} placeholder="e.g. Type 2 Diabetes..." />
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-1">
                                <button 
                                    type="button" 
                                    onClick={handleReset} 
                                    className="w-full sm:w-auto min-h-[46px] px-6 rounded-md border border-[#E2E8F0] bg-white text-[#4A5568] text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Reset Changes
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isUpdating} 
                                    className="w-full sm:w-auto sm:min-w-[200px] min-h-[46px] rounded-md bg-[#3B9EE2] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#2d8fd4] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                >
                                    {isUpdating ? 'Updating Records...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: Health ID Card (Sticky) */}
                <div className="w-full lg:sticky lg:top-24 space-y-6 lg:pl-6">
                    <div className="text-muted text-[11px] font-bold tracking-widest uppercase ml-1">Live Preview: Health ID</div>
                    
                    <div className="relative">
                        <HealthIdCard patient={previewPatient} />
                        <div className="mt-4 p-4 bg-light-blue border border-primary/10 rounded-2xl">
                            <div className="flex gap-3">
                                <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-[11px] text-body leading-relaxed font-medium">
                                    The preview card updates instantly. Click "Save Profile" to update your official digital record permanently.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileTab;
