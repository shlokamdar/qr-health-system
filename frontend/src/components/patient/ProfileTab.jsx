import React, { useState, useEffect } from 'react';
import { 
    UserCircle, Info, CheckCircle2, Circle, Download, 
    Upload, FileCheck, Clock, Check, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import HealthIdCard from './HealthIdCard';

const ORGAN_DONOR_STATUS = {
    OFF: 'OFF',
    PENDING_UPLOAD: 'PENDING_UPLOAD',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED'
};

const Toggle = ({ enabled, onChange, disabled, label, subtext, statusBadge }) => (
    <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-xl border border-[#F1F5F9]">
        <div className="flex flex-col">
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#0D1B2A]">{label}</span>
                {statusBadge}
            </div>
            {subtext && <span className="text-[11px] text-[#64748B] mt-0.5">{subtext}</span>}
        </div>
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-[#2EC4A9]' : 'bg-[#E2E8F0]'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            title={disabled ? "Contact support to change status" : ""}
        >
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    </div>
);

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
        organ_donor_status: 'OFF'
    });

    const [uploadFile, setUploadFile] = useState(null);
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
                chronic_conditions: patient.chronic_conditions || '',
                organ_donor: patient.organ_donor || false,
                organ_donor_status: patient.organ_donor_status || 'OFF'
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

    const handleToggleDonor = (val) => {
        if (formData.organ_donor_status === ORGAN_DONOR_STATUS.VERIFIED) return;
        setFormData(prev => ({
            ...prev,
            organ_donor: val,
            organ_donor_status: val ? ORGAN_DONOR_STATUS.PENDING_UPLOAD : ORGAN_DONOR_STATUS.OFF
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit');
                return;
            }
            setUploadFile(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsUpdating(true);
        try {
            await onUpdate(formData);
            toast.success('Profile updated', {
                icon: <CheckCircle2 color="#2EC4A9" />,
                style: { borderRadius: '10px', background: '#fff', color: '#0D1B2A' },
            });
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmitForVerification = async () => {
        if (!uploadFile) return;
        setIsUpdating(true);
        try {
            // In a real app, logic to upload "uploadFile" would go here
            const updatedData = { 
                ...formData, 
                organ_donor_status: ORGAN_DONOR_STATUS.PENDING_VERIFICATION,
                // document: uploadFile  // Handled by parent onUpdate if multipart
            };
            setFormData(updatedData);
            await onUpdate(updatedData);
            setUploadFile(null);
            toast.success('Submitted for verification');
        } catch (error) {
            toast.error('Submission failed');
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
                chronic_conditions: patient.chronic_conditions || '',
                organ_donor: patient.organ_donor || false,
                organ_donor_status: patient.organ_donor_status || 'OFF'
            });
            setUploadFile(null);
        }
    };

    const checklist = [
        { label: 'Phone number', done: !!formData.contact_number, key: 'contact_number' },
        { label: 'Address', done: !!formData.address, key: 'address' },
        { label: 'Blood group', done: !!formData.blood_group, key: 'blood_group' },
        { label: 'Date of birth', done: !!formData.date_of_birth, key: 'date_of_birth' },
        { label: 'Organ donor status set', done: formData.organ_donor_status === ORGAN_DONOR_STATUS.VERIFIED || formData.organ_donor_status === ORGAN_DONOR_STATUS.PENDING_VERIFICATION, key: 'organ_donor' },
        { label: 'At least 1 emergency contact', done: (emergencyContacts && emergencyContacts.length > 0) || (patient?.emergency_contacts?.length > 0), key: 'emergency_contact' },
    ];

    const doneCount = checklist.filter(i => i.done).length;
    const totalCount = checklist.length;
    const percentage = Math.round((doneCount / totalCount) * 100);

    const inputClasses = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B9EE2] focus:ring-opacity-15 focus:border-[#3B9EE2] transition-all text-[#0D1B2A] placeholder-[#9CA3AF] text-sm";
    const labelClasses = "block text-[#9CA3AF] text-[12px] font-medium mb-1.5 uppercase tracking-wide";

    // Data for live preview
    const previewPatient = {
        ...patient,
        user: { ...patient?.user, first_name: formData.first_name, last_name: formData.last_name },
        health_id: patient?.health_id,
        blood_group: formData.blood_group,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        organ_donor: formData.organ_donor,
        organ_donor_status: formData.organ_donor_status,
        emergency_contacts: emergencyContacts.length > 0 ? emergencyContacts : patient?.emergency_contacts,
        qr_code: patient?.qr_code
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                
                {/* LEFT COLUMN: 55% */}
                <div className="w-full lg:w-[55%] space-y-8">
                    
                    {/* Completion Card */}
                    <div className={`p-6 rounded-[10px] border shadow-sm transition-all duration-500 ${percentage === 100 ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-white border-[#F1F5F9]'}`}>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative w-[72px] h-[72px]">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-[#E2E8F0]" strokeWidth="8" fill="transparent" r="32" cx="36" cy="36" />
                                    <circle
                                        className={`${percentage === 100 ? 'text-[#2EC4A9]' : 'text-[#3B9EE2]'} transition-all duration-1000 ease-out`}
                                        stroke="currentColor" strokeWidth="8" strokeDasharray={2 * Math.PI * 32}
                                        strokeDashoffset={2 * Math.PI * 32 * (1 - percentage / 100)}
                                        strokeLinecap="round" fill="transparent" r="32" cx="36" cy="36"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[18px] font-black text-[#0D1B2A]">{percentage}%</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-[#0D1B2A]">{percentage === 100 ? 'Profile Complete ✓' : 'Profile Completion'}</h3>
                                <p className="text-[13px] text-[#64748B] mt-0.5">{doneCount} of {totalCount} fields complete</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                            {checklist.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[13px]">
                                    {item.done ? <CheckCircle2 size={14} className="text-[#2EC4A9]" /> : <Circle size={14} className="text-[#E2E8F0]" />}
                                    <span className={item.done ? 'text-[#0D1B2A] font-medium' : 'text-[#9CA3AF]'}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section: PERSONAL INFORMATION */}
                        <div className="bg-white rounded-[10px] p-8 shadow-sm border border-[#F1F5F9]">
                            <div className="text-[#2EC4A9] text-[11px] font-bold tracking-widest mb-6 uppercase">PERSONAL INFORMATION</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>First Name</label>
                                    <input name="first_name" value={formData.first_name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Last Name</label>
                                    <input name="last_name" value={formData.last_name} onChange={handleChange} className={inputClasses} />
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
                                    <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClasses}>
                                        <option value="">Select Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClasses} />
                                </div>
                            </div>
                        </div>

                        {/* Section: MEDICAL INFORMATION */}
                        <div className="bg-white rounded-[10px] p-8 shadow-sm border border-[#F1F5F9] space-y-6">
                            <div className="text-[#2EC4A9] text-[11px] font-bold tracking-widest mb-6 uppercase">MEDICAL INFORMATION</div>
                            <div>
                                <label className={labelClasses}>Known Allergies</label>
                                <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} className={inputClasses} placeholder="e.g. Penicillin, Pollen..." />
                            </div>
                            <div>
                                <label className={labelClasses}>Chronic Conditions</label>
                                <textarea name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} rows={2} className={inputClasses} placeholder="e.g. Type 2 Diabetes..." />
                            </div>

                            {/* ORGAN DONOR STATE MACHINE */}
                            <div className="space-y-4">
                                <Toggle 
                                    label="Organ Donor Status"
                                    subtext={formData.organ_donor_status === ORGAN_DONOR_STATUS.OFF ? "Register your intent to donate organs. Requires a signed declaration." : null}
                                    enabled={formData.organ_donor}
                                    onChange={handleToggleDonor}
                                    disabled={formData.organ_donor_status === ORGAN_DONOR_STATUS.VERIFIED}
                                    statusBadge={formData.organ_donor_status === ORGAN_DONOR_STATUS.PENDING_VERIFICATION && <span className="text-[9px] font-black bg-[#FFFBEB] text-[#F59E0B] px-2 py-0.5 rounded border border-[#F59E0B]/20 uppercase tracking-tighter">PENDING VERIFICATION</span>}
                                />

                                {/* State: PENDING_UPLOAD */}
                                {formData.organ_donor_status === ORGAN_DONOR_STATUS.PENDING_UPLOAD && (
                                    <div className="bg-[#EFF6FF] border border-[#3B9EE2] rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="text-[#3B9EE2] font-bold text-sm">Complete Your Organ Donor Registration</div>
                                        <div className="text-[#64748B] text-[13px]">To register as an organ donor on PulseID, please download the declaration form, sign it, and upload the scanned copy.</div>
                                        
                                        <div className="flex flex-col gap-3">
                                            <a href="/PulseID_OrganDonor_Declaration.pdf" download className="flex items-center gap-2 text-[13px] text-[#3B9EE2] font-medium hover:underline">
                                                <Download size={16} /> Step 1: Download Declaration Form
                                            </a>
                                            
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[13px] font-medium text-[#0D1B2A] flex items-center gap-2">
                                                    <Upload size={16} className="text-[#3B9EE2]" /> Step 2: Upload Signed Form
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.jpg,.jpeg,.png" 
                                                    onChange={handleFileChange} 
                                                    className="hidden" 
                                                    id="donor-upload" 
                                                />
                                                <label htmlFor="donor-upload" className="cursor-pointer border-2 border-dashed border-[#E2E8F0] hover:border-[#3B9EE2] rounded-lg p-4 flex flex-col items-center gap-1 transition-all">
                                                    {uploadFile ? (
                                                        <>
                                                            <div className="flex items-center gap-2 text-[#2EC4A9] font-bold">
                                                                <FileCheck size={20} /> {uploadFile.name}
                                                            </div>
                                                            <div className="text-[11px] text-[#9CA3AF]">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB • <button type="button" onClick={(e) => { e.preventDefault(); setUploadFile(null); }} className="text-[#EF4444] hover:underline">Remove</button></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-[13px] text-[#64748B]">Click to select signed document</div>
                                                            <div className="text-[11px] text-[#9CA3AF]">PDF, JPG, PNG (Max 5MB)</div>
                                                        </>
                                                    )}
                                                </label>
                                            </div>

                                            <button 
                                                type="button" 
                                                onClick={handleSubmitForVerification}
                                                disabled={!uploadFile || isUpdating}
                                                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${uploadFile ? 'bg-[#3B9EE2] text-white' : 'bg-[#E2E8F0] text-[#9CA3AF] cursor-not-allowed'}`}
                                            >
                                                Submit for Verification
                                            </button>
                                            <div className="text-[11px] text-[#9CA3AF] text-center italic">Your declaration will be reviewed by a PulseID administrator within 2–3 business days.</div>
                                        </div>
                                    </div>
                                )}

                                {/* State: PENDING_VERIFICATION */}
                                {formData.organ_donor_status === ORGAN_DONOR_STATUS.PENDING_VERIFICATION && (
                                    <div className="bg-[#FFFBEB] border border-[#F59E0B] rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-sm mb-1">
                                            <Clock size={16} /> Verification Pending
                                        </div>
                                        <div className="text-[#64748B] text-[13px] mb-3">Your signed declaration has been submitted. We'll notify you once an administrator reviews it.</div>
                                        <div className="flex items-center justify-between text-[12px]">
                                            <div className="flex items-center gap-1 text-[#64748B]">Submitted document: <span className="text-[#3B9EE2] cursor-pointer hover:underline">declaration_upload.pdf</span></div>
                                            <button type="button" onClick={() => setFormData({...formData, organ_donor_status: ORGAN_DONOR_STATUS.PENDING_UPLOAD})} className="text-[#3B9EE2] font-medium hover:underline">Replace document</button>
                                        </div>
                                    </div>
                                )}

                                {/* State: VERIFIED */}
                                {formData.organ_donor_status === ORGAN_DONOR_STATUS.VERIFIED && (
                                    <div className="bg-[#F0FDF4] border border-[#2EC4A9] rounded-lg p-4 animate-in slide-in-from-top-2 duration-300 shadow-sm">
                                        <div className="flex items-center gap-2 text-[#2EC4A9] font-bold text-sm mb-1">
                                            <CheckCircle2 size={16} /> Organ Donor Verified
                                        </div>
                                        <div className="text-[#64748B] text-[13px]">Your organ donor status has been verified and is now displayed on your Health ID card.</div>
                                        <div className="text-[12px] text-[#9CA3AF] mt-2 font-medium">Verified on {patient?.organ_donor_verified_at ? new Date(patient.organ_donor_verified_at).toLocaleDateString() : '—'}</div>
                                    </div>
                                )}

                                {/* State: REJECTED */}
                                {formData.organ_donor_status === ORGAN_DONOR_STATUS.REJECTED && (
                                    <div className="bg-[#FEF2F2] border border-[#EF4444] rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-2 text-[#EF4444] font-bold text-sm mb-1">
                                            <XCircle size={16} /> Verification Unsuccessful
                                        </div>
                                        <div className="text-[#64748B] text-[13px] mb-4">Your organ donor declaration could not be verified. Please ensure the form is correctly filled and signed.</div>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, organ_donor_status: ORGAN_DONOR_STATUS.PENDING_UPLOAD})}
                                            className="w-full py-2 border-2 border-[#EF4444] text-[#EF4444] rounded-lg text-sm font-bold hover:bg-[#FEF2F2] transition-all"
                                        >
                                            Re-upload Document
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SUBMIT BUTTONS */}
                        <div className="flex items-center justify-between pt-4">
                            <button type="button" onClick={handleReset} className="px-6 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#F8FAFC] transition-colors font-bold text-sm">
                                Reset Changes
                            </button>
                            <button type="submit" disabled={isUpdating} className="px-10 py-2.5 bg-[#0D1B2A] text-white rounded-xl hover:bg-[#1A2E44] transition-all font-bold text-sm shadow-xl shadow-[#0D1B2A]/20 disabled:opacity-50">
                                {isUpdating ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: 45% (Sticky) */}
                <div className="w-full lg:w-[45%] lg:sticky lg:top-24 space-y-6">
                    <div className="text-[#9CA3AF] text-[11px] font-black tracking-widest uppercase">YOUR HEALTH ID CARD</div>
                    
                    <div className="bg-white rounded-[24px] p-2 shadow-2xl shadow-[#0D1B2A]/5 border border-[#F1F5F9]">
                        <HealthIdCard patient={previewPatient} />
                    </div>

                    <div className="px-4 space-y-4">
                        <div className="text-[11px] text-[#9CA3AF] text-center italic">
                            Your downloaded card updates after saving changes.
                        </div>
                        <div className="flex justify-center">
                            <button 
                                onClick={() => {
                                    const cardDownloadBtn = document.querySelector('.pd-download-action-btn');
                                    if (cardDownloadBtn) cardDownloadBtn.click();
                                }}
                                className="flex items-center gap-2 px-8 py-3 border-2 border-[#3B9EE2] text-[#3B9EE2] text-[11px] font-black rounded-xl hover:bg-[#3B9EE2] hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider"
                            >
                                <Download size={16} strokeWidth={2.5} />
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
