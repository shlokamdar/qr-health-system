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
    Mail,
    LifeBuoy,
    Bell
} from 'lucide-react';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('search');
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [patientResult, setPatientResult] = useState(null);
    const [records, setRecords] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [myConsultations, setMyConsultations] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });

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
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get('support/tickets/');
            setTickets(res.data.results || res.data);
        } catch { console.warn('Failed to fetch tickets'); }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await api.post('support/tickets/create/', ticketForm);
            toast.success('Ticket submitted successfully!');
            setTicketForm({ subject: '', description: '', priority: 'MEDIUM' });
            setShowTicketModal(false);
            fetchTickets();
        } catch {
            toast.error('Failed to submit ticket');
        }
    };

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

    const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
    const tabs = [
        { id: 'search', label: 'Patient Lookup', icon: Search },
        { id: 'consultations', label: 'Recent History', icon: History },
        { id: 'appointments', label: 'Schedule', icon: Calendar },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: pendingCount },
        { id: 'register', label: 'New Registration', icon: UserPlus },
        { id: 'support', label: 'Support & Help', icon: LifeBuoy },
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
                                        className={`flex-1 py-4 px-4 rounded-2xl font-black transition-all duration-500 relative group overflow-hidden ${isActive
                                            ? 'bg-white shadow-lg text-[#0D1B2A]'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2 relative z-10">
                                            <div className="relative">
                                                <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-[#3B9EE2]/10 text-[#3B9EE2]' : 'bg-slate-100 text-slate-300'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                {tab.badge > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">{tab.badge}</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] tracking-[0.1em] uppercase hidden lg:inline">
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

                            {/* Support Tab */}
                            {activeTab === 'support' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                    <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a2e41] rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B9EE2]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                        <div className="relative z-10">
                                            <h3 className="text-3xl font-black mb-4">Need Assistance?</h3>
                                            <p className="text-slate-300 font-bold text-lg max-w-xl leading-relaxed">
                                                Our technical support team is available 24/7 to help you with any system issues or queries.
                                            </p>
                                            <button
                                                onClick={() => setShowTicketModal(true)}
                                                className="mt-8 bg-[#3B9EE2] hover:bg-[#2fa4e8] text-white px-10 py-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-[#3B9EE2]/20 active:scale-95"
                                            >
                                                Create Support Ticket
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-[#3B9EE2]/10 rounded-2xl text-[#3B9EE2]">
                                                <LifeBuoy className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-2xl font-black text-[#0D1B2A]">My Support Tickets</h3>
                                        </div>

                                        {tickets.length === 0 ? (
                                            <div className="bg-slate-50 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                                                <LifeBuoy className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No support tickets found</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-6">
                                                {tickets.map(ticket => (
                                                    <div key={ticket.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-3 rounded-2xl ${ticket.status === 'OPEN' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                                    {ticket.status === 'OPEN' ? <Clock size={20} /> : <CheckCircle size={20} />}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-xl text-[#0D1B2A]">{ticket.subject}</h4>
                                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] mt-1">
                                                                        Ticket #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${ticket.priority === 'URGENT' ? 'bg-red-50 text-red-500 border border-red-100' :
                                                                ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                                                                    'bg-blue-50 text-blue-500 border border-blue-100'
                                                                }`}>
                                                                {ticket.priority} Priority
                                                            </span>
                                                        </div>
                                                        <div className="bg-slate-50/50 rounded-2xl p-6 text-slate-600 font-bold leading-relaxed">
                                                            {ticket.description}
                                                        </div>
                                                        {ticket.admin_notes && (
                                                            <div className="mt-6 p-6 bg-[#2EC4A9]/5 border-l-4 border-[#2EC4A9] rounded-2xl animate-in fade-in slide-in-from-left-2 duration-700">
                                                                <p className="text-[10px] font-black text-[#2EC4A9] uppercase tracking-widest mb-2">Technical Resolution</p>
                                                                <p className="text-slate-700 font-bold italic">"{ticket.admin_notes}"</p>
                                                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                    <CheckCircle size={12} className="text-[#2EC4A9]" />
                                                                    <span>Resolved on {new Date(ticket.resolved_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Notifications Tab ─────────────────── */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    {/* Pending Appointments */}
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-[#0D1B2A]">Pending Appointments</h3>
                                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Requests awaiting your confirmation</p>
                                            </div>
                                            {pendingCount > 0 && (
                                                <span className="ml-auto px-3 py-1 bg-red-100 text-red-600 font-black text-xs rounded-full border border-red-200">
                                                    {pendingCount} pending
                                                </span>
                                            )}
                                        </div>

                                        {appointments.filter(a => a.status === 'PENDING').length === 0 ? (
                                            <div className="bg-slate-50 rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                                                <CheckCircle className="w-12 h-12 text-[#2EC4A9] mx-auto mb-4" />
                                                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">All caught up — no pending requests</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-5">
                                                {appointments.filter(a => a.status === 'PENDING').map(appt => (
                                                    <div key={appt.id} className="bg-white border border-amber-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row items-start md:items-center gap-6">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                                <Clock className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-[#0D1B2A] text-lg">
                                                                    {appt.patient_name || appt.patient?.user?.first_name || `Patient #${appt.patient}`}
                                                                </p>
                                                                <p className="text-slate-400 text-xs font-bold mt-0.5">
                                                                    {new Date(appt.appointment_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                {appt.reason && (
                                                                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{appt.reason}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <button
                                                                onClick={() => handleUpdateAppointment(appt.id, 'CONFIRMED')}
                                                                className="flex items-center gap-2 px-5 py-2.5 bg-[#2EC4A9] text-white text-xs font-black rounded-xl hover:bg-[#25a892] transition-all shadow-sm active:scale-95"
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateAppointment(appt.id, 'REJECTED')}
                                                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 border border-red-100 text-xs font-black rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Activity Feed */}
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-[#3B9EE2]/10 rounded-2xl text-[#3B9EE2]">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-[#0D1B2A]">Recent Consultations</h3>
                                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Your latest activity</p>
                                            </div>
                                        </div>

                                        {myConsultations.length === 0 ? (
                                            <div className="bg-slate-50 rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                                                <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No consultations yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {myConsultations.slice(0, 10).map((c, idx) => (
                                                    <div key={c.id} className="flex items-start gap-5 p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 group">
                                                        <div className="w-10 h-10 rounded-2xl bg-[#3B9EE2]/10 text-[#3B9EE2] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                            <Stethoscope className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <p className="font-black text-[#0D1B2A] text-sm truncate">
                                                                    {c.patient_name || c.patient?.health_id || `Patient ${idx + 1}`}
                                                                </p>
                                                                <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">
                                                                    {new Date(c.consultation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            {c.chief_complaint && (
                                                                <p className="text-slate-500 text-xs mt-1 truncate">{c.chief_complaint}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirmed / Upcoming Appointments */}
                                    {appointments.filter(a => a.status === 'CONFIRMED').length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="p-3 bg-[#2EC4A9]/10 rounded-2xl text-[#2EC4A9]">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-[#0D1B2A]">Upcoming Confirmed</h3>
                                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Scheduled appointments</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {appointments.filter(a => a.status === 'CONFIRMED').slice(0, 6).map(appt => (
                                                    <div key={appt.id} className="flex items-center gap-4 p-5 bg-[#2EC4A9]/5 border border-[#2EC4A9]/20 rounded-[1.5rem]">
                                                        <div className="w-10 h-10 bg-[#2EC4A9]/10 text-[#2EC4A9] rounded-2xl flex items-center justify-center shrink-0">
                                                            <Calendar className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0D1B2A] text-sm">
                                                                {appt.patient_name || `Patient #${appt.patient}`}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-[#2EC4A9]">
                                                                {new Date(appt.appointment_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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

            {/* Support Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D1B2A]/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-[#0D1B2A]">Submit Ticket</h3>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Get technical help from our team</p>
                            </div>
                            <button onClick={() => setShowTicketModal(false)} className="p-3 bg-white hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#3B9EE2] transition-colors">Subject</label>
                                    <input
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all placeholder:text-slate-300"
                                        value={ticketForm.subject}
                                        onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                        placeholder="Briefly describe the issue"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#3B9EE2] transition-colors">Priority Level</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                        value={ticketForm.priority}
                                        onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                    >
                                        <option value="LOW">Low - General Inquiry</option>
                                        <option value="MEDIUM">Medium - Technical Issue</option>
                                        <option value="HIGH">High - Service Interruption</option>
                                        <option value="URGENT">Urgent - Critical Blocker</option>
                                    </select>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#3B9EE2] transition-colors">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all placeholder:text-slate-300 resize-none"
                                        value={ticketForm.description}
                                        onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                                        placeholder="Please provide details about the problem..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTicketModal(false)}
                                    className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-sm transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-5 bg-[#0D1B2A] text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-[#0D1B2A]/10 hover:bg-[#1a2e41] active:scale-95"
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default DoctorDashboard;
