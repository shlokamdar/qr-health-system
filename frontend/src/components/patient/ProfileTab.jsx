import React, { useState, useEffect } from 'react';
import { UserCircle, Info, CheckCircle, Circle, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import HealthIdCard from './HealthIdCard';

const ProfileTab = ({ patient, emergencyContacts = [], onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        contact_number: '',
        date_of_birth: '',
        blood_group: '',
        gender: '',
        address: '',
        allergies: '',
        chronic_conditions: '',
        organ_donor: false,
    });

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
                chronic_conditions: patient.chronic_conditions || '',
                organ_donor: patient.organ_donor || false,
            });
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onUpdate(formData);
            toast.success('Profile updated successfully', {
                icon: <Check color="#2EC4A9" />,
                style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#0D1B2A',
                },
            });
        } catch (error) {
            toast.error('Failed to update profile');
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
                chronic_conditions: patient.chronic_conditions || '',
                organ_donor: patient.organ_donor || false,
            });
        }
    };

    const checklist = [
        { label: 'Phone number', key: 'contact_number', done: !!formData.contact_number },
        { label: 'Address', key: 'address', done: !!formData.address },
        { label: 'Blood group', key: 'blood_group', done: !!formData.blood_group },
        { label: 'Date of birth', key: 'date_of_birth', done: !!formData.date_of_birth },
        { label: 'Organ donor status set', key: 'organ_donor', done: !!formData.organ_donor },
        { label: 'At least 1 emergency contact', key: 'emergency_contact', done: emergencyContacts.length > 0 },
    ];

    const doneCount = checklist.filter(i => i.done).length;
    const totalCount = checklist.length;
    const percentage = Math.round((doneCount / totalCount) * 100);

    const scrollToField = (fieldKey) => {
        const element = document.getElementsByName(fieldKey)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
    };

    const inputClasses = "w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9EE2] focus:ring-opacity-20 focus:border-[#3B9EE2] transition-all text-[#0D1B2A] placeholder-[#9CA3AF]";
    const labelClasses = "block text-[#9CA3AF] text-[12px] font-medium mb-1 uppercase tracking-wide";

    // Data for live preview
    const previewPatient = {
        ...patient,
        user: { ...patient?.user, first_name: formData.first_name, last_name: formData.last_name },
        health_id: patient?.health_id,
        blood_group: formData.blood_group,
        dob: formData.date_of_birth,
        gender: formData.gender,
        is_organ_donor: formData.organ_donor,
        qr_code: patient?.qr_code
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
                <UserCircle className="text-[#3B9EE2]" size={32} />
                <h2 className="text-2xl font-bold text-[#0D1B2A]">My Profile</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
                
                {/* LEFT COLUMN: 55% */}
                <div className="w-full lg:w-[55%] space-y-8">
                    
                    {/* Completion Card */}
                    <div className={`p-6 rounded-[10px] border shadow-sm transition-colors duration-500 ${percentage === 100 ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-white border-[#F1F5F9]'}`}>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative w-[72px] h-[72px]">
                                <svg className="w-full h-full transform -rotate-90">
                                    <Circle 
                                        className="text-[#E2E8F0]" 
                                        style={{ strokeWidth: '10' }} 
                                        r="31" cx="36" cy="36" 
                                    />
                                    <circle
                                        className={`${percentage === 100 ? 'text-[#2EC4A9]' : 'text-[#3B9EE2]'} transition-all duration-1000 ease-out`}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 31}
                                        strokeDashoffset={2 * Math.PI * 31 * (1 - percentage / 100)}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="31" cx="36" cy="36"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[16px] font-black text-[#0D1B2A]">{percentage}%</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#0D1B2A]">{percentage === 100 ? 'Profile Complete!' : 'Profile Completion'}</h3>
                                <p className="text-xs text-[#64748B] mt-0.5">{doneCount} of {totalCount} fields complete</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                            {checklist.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => !item.done && item.key !== 'emergency_contact' && scrollToField(item.key)}
                                    className={`flex items-center gap-2 text-xs cursor-pointer hover:opacity-80 transition-opacity`}
                                >
                                    {item.done ? (
                                        <Check size={14} className="text-[#2EC4A9]" />
                                    ) : (
                                        <Circle size={14} className="text-[#CBD5E1]" />
                                    )}
                                    <span className={item.done ? 'text-[#0D1B2A] font-medium' : 'text-[#9CA3AF]'}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section A: Personal Information */}
                        <div className="bg-white rounded-[10px] p-8 shadow-sm border border-[#F1F5F9]">
                            <div className="text-[#2EC4A9] text-[11px] font-bold tracking-widest mb-6 uppercase">PERSONAL INFORMATION</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>First Name</label>
                                    <input 
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Last Name</label>
                                    <input 
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Phone Number</label>
                                    <input 
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Date of Birth</label>
                                    <input 
                                        name="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Blood Group</label>
                                    <select 
                                        name="blood_group"
                                        value={formData.blood_group}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    >
                                        <option value="">Select Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <select 
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className={labelClasses}>Address</label>
                                <textarea 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        {/* Section B: Medical Information */}
                        <div className="bg-white rounded-[10px] p-8 shadow-sm border border-[#F1F5F9]">
                            <div className="text-[#2EC4A9] text-[11px] font-bold tracking-widest mb-6 uppercase">MEDICAL INFORMATION</div>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClasses}>Known Allergies</label>
                                    <textarea 
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="e.g. Penicillin, Pollen..."
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Chronic Conditions</label>
                                    <textarea 
                                        name="chronic_conditions"
                                        value={formData.chronic_conditions}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="e.g. Type 2 Diabetes..."
                                    />
                                </div>
                                <div className="p-4 bg-[#F8FAFB] rounded-xl border border-[#F1F5F9]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-[#0D1B2A]">Organ Donor Status</div>
                                            <div className="text-[11px] text-[#64748B]">Register your intent for organ donation</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                name="organ_donor"
                                                checked={formData.organ_donor}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2EC4A9]"></div>
                                        </label>
                                    </div>
                                    {formData.organ_donor && (
                                        <div className="flex items-center gap-2 text-[#F59E0B] text-[11px] font-medium mt-3">
                                            <Info size={14} />
                                            <span>Requires admin verification. Card will show 'Pending' until approved.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button type="button" onClick={handleReset} className="px-6 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#F8FAFC] transition-colors font-bold text-sm">
                                Reset Changes
                            </button>
                            <button type="submit" className="px-10 py-2.5 bg-[#0D1B2A] text-white rounded-xl hover:bg-[#1A2E44] transition-all font-bold text-sm shadow-xl shadow-[#0D1B2A]/20">
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: 45% (Sticky) */}
                <div className="w-full lg:w-[45%] lg:sticky lg:top-24 space-y-6">
                    <div className="text-[#9CA3AF] text-[12px] font-black tracking-widest uppercase">Your Health ID Card</div>
                    
                    <div className="bg-white rounded-3xl p-2 shadow-2xl shadow-[#0D1B2A]/5 border border-[#F1F5F9]">
                        <HealthIdCard patient={previewPatient} emergencyContacts={emergencyContacts} />
                    </div>

                    <div className="px-4 space-y-4">
                        <div className="text-[11px] text-[#9CA3AF] text-center italic">
                            Changes will appear on your downloaded card after saving.
                        </div>
                        
                        <div className="flex justify-center">
                            <button 
                                onClick={() => {
                                    const cardDownloadBtn = document.querySelector('.download-btn-hover');
                                    if (cardDownloadBtn) cardDownloadBtn.click();
                                }}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-[#3B9EE2] text-[#3B9EE2] text-xs font-black rounded-xl hover:bg-[#3B9EE2] hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wider"
                            >
                                <Download size={16} strokeWidth={3} />
                                Download Card
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileTab;
