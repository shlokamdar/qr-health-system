import React, { useState, useEffect, useContext } from 'react';
import DoctorService from '../services/doctor.service';
import PatientService from '../services/patient.service';
import Header from '../components/Header';
import DashboardStats from '../components/doctor/DashboardStats';
import PatientSearch from '../components/doctor/PatientSearch';
import ScannerModal from '../components/doctor/ScannerModal';
import OTPModal from '../components/doctor/OTPModal';
import PatientProfile from '../components/doctor/PatientProfile';
import MedicalRecordList from '../components/doctor/MedicalRecordList';
import ConsultationHistory from '../components/doctor/ConsultationHistory';
import ConsultationForm from '../components/doctor/ConsultationForm';
import UploadRecordForm from '../components/doctor/UploadRecordForm';
import AppointmentList from '../components/doctor/AppointmentList';
import PatientRegisterForm from '../components/doctor/PatientRegisterForm';
import MobileNav from '../components/doctor/MobileNav';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ClipboardList,
    Calendar,
    UserPlus,
    History,
    FileText,
    Stethoscope,
    Activity,
    ChevronRight,
    ArrowRight,
    Clock,
    XCircle,
    AlertTriangle,
    LogOut,
    CheckCircle,
    Mail
} from 'lucide-react';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('search');
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [patientResult, setPatientResult] = useState(null);
    const [records, setRecords] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [myConsultations, setMyConsultations] = useState([]);

    // Upload Form State
    const [newRecord, setNewRecord] = useState({
        title: '',
        description: '',
        record_type: 'PRESCRIPTION',
        file: null
    });

    // Consultation Form State
    const [newConsultation, setNewConsultation] = useState({
        consultation_date: new Date().toISOString().slice(0, 16),
        chief_complaint: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        follow_up_date: ''
    });

    // Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannerError, setScannerError] = useState(null);
    const [isCameraLoading, setIsCameraLoading] = useState(false);

    // Register Patient Form State
    const [newPatient, setNewPatient] = useState({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        contact_number: '',
        blood_group: ''
    });

    useEffect(() => {
        fetchDoctorProfile();
        fetchMyConsultations();
        fetchAppointments();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const data = await DoctorService.getProfile();
            setDoctorProfile(data);
        } catch (err) {
            console.error('Could not fetch doctor profile');
        }
    };

    const fetchMyConsultations = async () => {
        try {
            const data = await DoctorService.getConsultations();
            setMyConsultations(data);
        } catch (err) {
            console.error('Could not fetch consultations');
        }
    };

    // Appointments State
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const data = await DoctorService.getAppointments();
            setAppointments(data);
        } catch (err) {
            console.error('Could not fetch appointments');
        }
    };

    const handleUpdateAppointment = async (id, status) => {
        try {
            await DoctorService.updateAppointmentStatus(id, status);
            toast.success(`Appointment ${status.toLowerCase()}!`);
            fetchAppointments();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    // OTP State
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    const handleRequestOTP = async () => {
        if (!patientResult) return;
        try {
            const res = await PatientService.requestOTP(patientResult.health_id);
            toast.success(res.message);
            if (res.dev_note) console.info(res.dev_note);
            setIsOTPModalOpen(true);
        } catch (err) {
            console.error(err);
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            await PatientService.verifyOTP(patientResult.health_id, otpCode);
            toast.success('Access Granted!');
            setIsOTPModalOpen(false);
            setOtpCode('');
            handleSearch({ preventDefault: () => { } });
        } catch (err) {
            console.error(err);
            toast.error('Invalid OTP or Expired');
        }
    };

    const handleScan = (result) => {
        if (result && result.length > 0) {
            const rawValue = result[0]?.rawValue;
            if (rawValue) {
                let healthId = rawValue;
                if (rawValue.includes('/api/patients/')) {
                    const parts = rawValue.split('/api/patients/');
                    if (parts.length > 1) {
                        healthId = parts[1].replace('/', '');
                    }
                }

                if (!healthId || healthId.trim() === '') {
                    setScannerError('Invalid QR code scanned');
                    return;
                }

                setSearchId(healthId);
                setIsScannerOpen(false);
                setScannerError(null);
                setIsCameraLoading(false);

                PatientService.getByHealthId(healthId)
                    .then(data => {
                        setPatientResult(data);
                        return Promise.all([
                            PatientService.getRecords(healthId),
                            DoctorService.getPatientHistory(healthId)
                        ]);
                    })
                    .then(([recData, consData]) => {
                        setRecords(recData);
                        setConsultations(consData);
                    })
                    .catch(() => {
                        toast.error('Patient not found or Access Denied');
                        setPatientResult(null);
                    });
            }
        }
    };

    const handleScannerError = (error) => {
        console.error('Scanner error:', error);
        setIsCameraLoading(false);

        if (error?.message) {
            const errorMsg = error.message.toLowerCase();
            if (errorMsg.includes('permission') || errorMsg.includes('notallowederror')) {
                setScannerError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (errorMsg.includes('notfound') || errorMsg.includes('notfounderror')) {
                setScannerError('No camera found on this device.');
            } else if (errorMsg.includes('notreadable') || errorMsg.includes('notreadableerror')) {
                setScannerError('Camera is in use by another application.');
            } else {
                setScannerError('Failed to access camera. Please try again.');
            }
        } else {
            setScannerError('Failed to access camera. Please try again.');
        }
    };

    const openScanner = () => {
        setIsScannerOpen(true);
        setScannerError(null);
        setIsCameraLoading(true);
    };

    const closeScanner = () => {
        setIsScannerOpen(false);
        setScannerError(null);
        setIsCameraLoading(false);
    };

    const handleSearch = async (e, overrideId = null) => {
        if (e && e.preventDefault) e.preventDefault();
        const idToSearch = overrideId || searchId;
        if (!idToSearch) return;

        try {
            const data = await PatientService.getByHealthId(idToSearch);
            setPatientResult(data);

            const recData = await PatientService.getRecords(idToSearch);
            setRecords(recData);

            const consData = await DoctorService.getPatientHistory(idToSearch);
            setConsultations(consData);

            if (activeTab !== 'search') {
                setActiveTab('search');
                setSearchId(idToSearch);
            }
        } catch (err) {
            toast.error('Patient not found or Access Denied');
            setPatientResult(null);
        }
    };

    const handleViewPatient = (healthId) => {
        setSearchId(healthId);
        setActiveTab('search');
        handleSearch(null, healthId);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!patientResult) return;

        const formData = new FormData();
        formData.append('patient', patientResult.id);
        formData.append('title', newRecord.title);
        formData.append('description', newRecord.description || '');
        formData.append('record_type', newRecord.record_type);
        if (newRecord.file) {
            formData.append('file', newRecord.file);
        }

        try {
            await PatientService.uploadRecord(formData);
            toast.success('Record Uploaded Successfully!');
            if (searchId === patientResult.health_id) {
                const recData = await PatientService.getRecords(searchId);
                setRecords(recData);
            }
            setNewRecord({ title: '', description: '', record_type: 'PRESCRIPTION', file: null });
        } catch (err) {
            console.error("Upload Error Details:", err.response?.data || err.message);
            toast.error('Upload failed. Please check file format.');
        }
    };

    const handleCreateConsultation = async (e) => {
        e.preventDefault();
        if (!patientResult) return;

        try {
            await DoctorService.createConsultation({
                patient_health_id: patientResult.health_id,
                ...newConsultation
            });
            toast.success('Consultation Created!');
            const consData = await DoctorService.getPatientHistory(searchId);
            setConsultations(consData);
            fetchMyConsultations();
            setNewConsultation({
                consultation_date: new Date().toISOString().slice(0, 16),
                chief_complaint: '',
                diagnosis: '',
                prescription: '',
                notes: '',
                follow_up_date: ''
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to create consultation');
        }
    };

    const handleRegisterPatient = async (e) => {
        e.preventDefault();
        try {
            const data = await DoctorService.registerPatient(newPatient);
            toast.success(`Patient registered! Health ID: ${data.health_id}`);
            setNewPatient({
                username: '',
                password: '',
                email: '',
                first_name: '',
                last_name: '',
                date_of_birth: '',
                contact_number: '',
                blood_group: ''
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to register patient');
        }
    };

    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/doctor/login');
    };

    const tabs = [
        { id: 'search', label: 'Patient Lookup', icon: Search },
        { id: 'consultations', label: 'Recent History', icon: History },
        { id: 'appointments', label: 'Schedule', icon: Calendar },
        { id: 'register', label: 'New Registration', icon: UserPlus },
    ];

    // ── Verification Gate ──────────────────────────────────────────────────────
    if (doctorProfile && !doctorProfile.is_verified) {
        const isRejected = !!doctorProfile.rejection_reason;
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
                {/* Subtle background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#3B9EE2]/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-[#2EC4A9]/5 rounded-full blur-[100px]" />
                </div>

                {/* Logo strip */}
                <div className="relative z-10 flex items-center gap-2 mb-10">
                    <Activity className="w-7 h-7 text-[#0D1B2A]" />
                    <span className="text-xl font-bold text-[#0D1B2A] tracking-tight">PulseID</span>
                </div>

                <div className="relative z-10 w-full max-w-lg">
                    {isRejected ? (
                        /* ─── REJECTED STATE ─────────────────────────────── */
                        <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
                            <div className="bg-red-50 px-8 py-6 border-b border-red-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-red-800">Registration Rejected</h1>
                                    <p className="text-sm text-red-600 mt-0.5">Your application was not approved</p>
                                </div>
                            </div>
                            <div className="px-8 py-6 space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason from Admin</p>
                                    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                                        <p className="text-sm text-red-800 leading-relaxed">{doctorProfile.rejection_reason}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl px-5 py-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Submission</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-medium text-gray-800">Dr. {doctorProfile.user?.first_name} {doctorProfile.user?.last_name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">License No.</span>
                                        <span className="font-mono font-medium text-gray-800">{doctorProfile.license_number}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Specialization</span>
                                        <span className="font-medium text-gray-800">{doctorProfile.specialization}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        Please contact support at <span className="font-semibold">support@pulseid.health</span> or re-register with corrected information.
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ─── PENDING STATE ──────────────────────────────── */
                        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
                            <div className="bg-amber-50 px-8 py-6 border-b border-amber-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-amber-800">Verification Pending</h1>
                                    <p className="text-sm text-amber-600 mt-0.5">Your registration is under review</p>
                                </div>
                            </div>
                            <div className="px-8 py-6 space-y-5">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Our admin team is reviewing your submitted credentials. This usually takes <strong>1–2 business days</strong>. You'll receive an email notification once your account is approved.
                                </p>

                                {/* Submitted details */}
                                <div className="bg-gray-50 rounded-2xl px-5 py-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Submission</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-medium text-gray-800">Dr. {doctorProfile.user?.first_name} {doctorProfile.user?.last_name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">License No.</span>
                                        <span className="font-mono font-medium text-gray-800">{doctorProfile.license_number}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Specialization</span>
                                        <span className="font-medium text-gray-800">{doctorProfile.specialization}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Status</span>
                                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs">
                                            <Clock className="w-3 h-3" /> Awaiting Review
                                        </span>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="space-y-2">
                                    {[
                                        { label: 'Registration submitted', done: true },
                                        { label: 'Document verification by admin', done: false, active: true },
                                        { label: 'Account activation', done: false },
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-100' : step.active ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                                {step.done
                                                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    : <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`} />
                                                }
                                            </div>
                                            <span className={`text-sm ${step.done ? 'text-emerald-700 font-medium' : step.active ? 'text-amber-700 font-medium' : 'text-gray-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3">
                                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                    <p className="text-xs text-blue-700">
                                        Notification will be sent to <span className="font-semibold">{doctorProfile.user?.email}</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden font-sans text-[#0D1B2A]">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-[#0D1B2A] z-0 pointer-events-none skew-y-[-2deg] origin-top-left translate-y-[-100px]" />
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#3B9EE2]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-[#2EC4A9]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 flex-1 w-full">

                    <DashboardStats doctorProfile={doctorProfile} />

                    {/* Main Dashboard Card */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-[#0D1B2A]/5 border border-white/60 overflow-hidden mb-24 md:mb-0 transition-all duration-500">
                        {/* Tab Navigation */}
                        <div className="hidden md:flex bg-slate-50/50 border-b border-slate-100 p-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all duration-500 relative group overflow-hidden ${isActive
                                            ? 'bg-white shadow-lg text-[#0D1B2A]'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-3 relative z-10">
                                            <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-[#3B9EE2]/10 text-[#3B9EE2]' : 'bg-slate-100 text-slate-300'}`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-[10px] tracking-[0.1em] uppercase">
                                                {tab.label}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B9EE2] to-[#2EC4A9]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-8 md:p-12">
                            {/* Patient Search Tab */}
                            {activeTab === 'search' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="max-w-3xl mx-auto">
                                        <div className="text-center mb-8">
                                            <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight mb-2">Patient Lookup</h3>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Import digital health profile via ID or Scan</p>
                                        </div>
                                        <PatientSearch
                                            searchId={searchId}
                                            setSearchId={setSearchId}
                                            handleSearch={(e) => handleSearch(e)}
                                            openScanner={openScanner}
                                        />
                                    </div>

                                    {patientResult ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                            {/* Left Column: Profile & Quick Actions */}
                                            <div className="lg:col-span-4 space-y-8">
                                                <PatientProfile
                                                    patient={patientResult}
                                                    handleRequestOTP={handleRequestOTP}
                                                />
                                                <UploadRecordForm
                                                    newRecord={newRecord}
                                                    setNewRecord={setNewRecord}
                                                    handleUpload={handleUpload}
                                                />
                                            </div>

                                            {/* Right Column: History & Forms */}
                                            <div className="lg:col-span-8 space-y-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2.5 bg-[#3B9EE2]/10 rounded-2xl text-[#3B9EE2]">
                                                                <History className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-black text-[#0D1B2A] tracking-tight">Clinical History</h3>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                                            <Activity className="w-3 h-3 text-[#2EC4A9]" />
                                                            <span>{consultations.length} Visits Traceable</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 p-2">
                                                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                                                            <ConsultationHistory consultations={consultations} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2.5 bg-[#2EC4A9]/10 rounded-2xl text-[#2EC4A9]">
                                                                <FileText className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-black text-[#0D1B2A] tracking-tight">Medical Ledger</h3>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                                            <span>{records.length} Documents Encrypted</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 p-2">
                                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                                            <MedicalRecordList records={records} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-[#0D1B2A] rounded-2xl text-white">
                                                            <Stethoscope className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="text-2xl font-black text-[#0D1B2A] tracking-tight">New Consultation</h3>
                                                    </div>
                                                    <div className="bg-[#0D1B2A] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-[#0D1B2A]/20 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B9EE2]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                                                        <ConsultationForm
                                                            newConsultation={newConsultation}
                                                            setNewConsultation={setNewConsultation}
                                                            handleSubmit={handleCreateConsultation}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-32 animate-in fade-in duration-700">
                                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Search className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-400 tracking-tight">Enter Health ID to Begin</h3>
                                            <p className="text-sm text-slate-300 font-bold uppercase tracking-widest mt-2 px-12">Secure patient search powered by PulseID Network</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* My Consultations Tab */}
                            {activeTab === 'consultations' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-[#3B9EE2]/10 rounded-[1.5rem] text-[#3B9EE2] shadow-sm">
                                                <ClipboardList className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Provider History</h3>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Your recent clinical activities</p>
                                            </div>
                                        </div>
                                    </div>

                                    {myConsultations.length === 0 ? (
                                        <div className="text-center py-24 bg-slate-50/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-200">
                                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <History className="w-8 h-8 text-slate-100" />
                                            </div>
                                            <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No clinical logs detected</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6">
                                            {myConsultations.map(con => (
                                                <div key={con.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.01] transition-all duration-500 group">
                                                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex items-center gap-4 flex-wrap">
                                                                <span className="bg-[#3B9EE2]/10 text-[#3B9EE2] px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border border-[#3B9EE2]/20">
                                                                    ID: {con.patient_health_id}
                                                                </span>
                                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span>{new Date(con.consultation_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-2xl font-black text-[#0D1B2A] group-hover:text-[#3B9EE2] transition-colors leading-tight">
                                                                {con.chief_complaint}
                                                            </p>
                                                            {con.diagnosis && (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2EC4A9] bg-[#2EC4A9]/5 px-3 py-1 rounded-full">
                                                                        <Activity className="w-3 h-3" />
                                                                        <span>Diagnosis</span>
                                                                    </div>
                                                                    <span className="text-slate-600 font-bold text-sm tracking-tight">{con.diagnosis}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
                                                            <button
                                                                onClick={() => handleViewPatient(con.patient_health_id)}
                                                                className="flex-1 bg-[#0D1B2A] text-white px-6 py-4 rounded-2xl hover:bg-[#1a2e41] transition-all font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0D1B2A]/10 active:scale-95 group/btn"
                                                            >
                                                                <span>Access Profile</span>
                                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                            {con.follow_up_date && (
                                                                <div className="text-[10px] font-black uppercase tracking-widest text-white bg-[#2EC4A9] px-4 py-4 rounded-2xl text-center shadow-xl shadow-[#2EC4A9]/20">
                                                                    Follow-up: {new Date(con.follow_up_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Appointments Tab */}
                            {activeTab === 'appointments' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="p-4 bg-[#2EC4A9]/10 rounded-[1.5rem] text-[#2EC4A9] shadow-sm">
                                            <Calendar className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Clinical Schedule</h3>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Manage patient queues & meetings</p>
                                        </div>
                                    </div>
                                    <AppointmentList
                                        appointments={appointments}
                                        handleUpdateStatus={handleUpdateAppointment}
                                        handleViewPatient={handleViewPatient}
                                    />
                                </div>
                            )}

                            {/* Register Patient Tab */}
                            {activeTab === 'register' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="p-4 bg-[#3B9EE2] rounded-[1.5rem] text-white shadow-xl shadow-[#3B9EE2]/20">
                                            <UserPlus className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Network Enrollment</h3>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Onboard new patient to PulseID ecosystem</p>
                                        </div>
                                    </div>
                                    <div className="max-w-4xl">
                                        <PatientRegisterForm
                                            newPatient={newPatient}
                                            setNewPatient={setNewPatient}
                                            handleRegister={handleRegisterPatient}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={closeScanner}
                onScan={handleScan}
                error={scannerError}
                onError={handleScannerError}
                setScannerError={setScannerError}
                setIsCameraLoading={setIsCameraLoading}
            />

            <OTPModal
                isOpen={isOTPModalOpen}
                onClose={() => setIsOTPModalOpen(false)}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                handleVerifyOTP={handleVerifyOTP}
            />

            <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default DoctorDashboard;
