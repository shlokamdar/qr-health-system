import React, { useState, useEffect } from 'react';
import api from '../utils/api';
// Scanner is now simulated/handled inside ScannerModal or PatientSearch if needed, 
// but actually we moved Scanner logic to ScannerModal. 
// However, the dashboard logic still uses some scanner state.
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
            const res = await api.get('doctors/me/');
            setDoctorProfile(res.data);
        } catch (err) {
            console.error('Could not fetch doctor profile');
        }
    };

    const fetchMyConsultations = async () => {
        try {
            const res = await api.get('doctors/consultations/');
            setMyConsultations(res.data);
        } catch (err) {
            console.error('Could not fetch consultations');
        }
    };

    // Appointments State
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('doctors/appointments/');
            setAppointments(res.data);
        } catch (err) {
            console.error('Could not fetch appointments');
        }
    };

    const handleUpdateAppointment = async (id, status) => {
        try {
            await api.patch(`doctors/appointments/${id}/`, { status });
            alert(`Appointment ${status.toLowerCase()}!`);
            fetchAppointments();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    // OTP State
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    const handleRequestOTP = async () => {
        if (!patientResult) return;
        try {
            const res = await api.post('patients/otp/request/', {
                health_id: patientResult.health_id
            });
            alert(res.data.message + '\n' + (res.data.dev_note || ''));
            setIsOTPModalOpen(true);
        } catch (err) {
            console.error(err);
            alert('Failed to send OTP');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            await api.post('patients/otp/verify/', {
                health_id: patientResult.health_id,
                otp_code: otpCode
            });
            alert('Access Granted!');
            setIsOTPModalOpen(false);
            setOtpCode('');
            handleSearch({ preventDefault: () => { } });
        } catch (err) {
            console.error(err);
            alert('Invalid OTP or Expired');
        }
    };

    const handleScan = (result) => {
        if (result && result.length > 0) {
            const rawValue = result[0]?.rawValue;
            if (rawValue) {
                let healthId = rawValue;
                // Extract health ID from URL if needed
                if (rawValue.includes('/api/patients/')) {
                    const parts = rawValue.split('/api/patients/');
                    if (parts.length > 1) {
                        healthId = parts[1].replace('/', '');
                    }
                }

                // Validate health ID format (basic check)
                if (!healthId || healthId.trim() === '') {
                    setScannerError('Invalid QR code scanned');
                    return;
                }

                setSearchId(healthId);
                setIsScannerOpen(false);
                setScannerError(null);
                setIsCameraLoading(false);

                // Fetch patient data
                api.get(`patients/${healthId}/`)
                    .then(res => {
                        setPatientResult(res.data);
                        return Promise.all([
                            api.get(`records/?patient=${healthId}`),
                            api.get(`doctors/patient-history/${healthId}/`)
                        ]);
                    })
                    .then(([recRes, consRes]) => {
                        setRecords(recRes.data);
                        setConsultations(consRes.data);
                    })
                    .catch(() => {
                        alert('Patient not found or Access Denied');
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
            const res = await api.get(`patients/${idToSearch}/`);
            setPatientResult(res.data);

            const recRes = await api.get(`records/?patient=${idToSearch}`);
            setRecords(recRes.data);

            const consRes = await api.get(`doctors/patient-history/${idToSearch}/`);
            setConsultations(consRes.data);
            
            // If we are not already on search tab, switch to it
            if (activeTab !== 'search') {
                setActiveTab('search');
                setSearchId(idToSearch);
            }
        } catch (err) {
            alert('Patient not found or Access Denied');
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

        console.log("Uploading record for patient:", patientResult.id, newRecord);

        const formData = new FormData();
        formData.append('patient', patientResult.id); // Ensure this is the PK
        formData.append('title', newRecord.title);
        formData.append('description', newRecord.description || '');
        formData.append('record_type', newRecord.record_type);
        if (newRecord.file) {
            formData.append('file', newRecord.file);
        }

        try {
            // Let axios and browser handle Content-Type boundary for FormData
            await api.post('records/', formData);
            
            alert('Record Uploaded Successfully!');
            // Refresh records if we are viewing the same patient
            if (searchId === patientResult.health_id) {
                const recRes = await api.get(`records/?patient=${searchId}`);
                setRecords(recRes.data);
            }
            setNewRecord({ title: '', description: '', record_type: 'PRESCRIPTION', file: null });
        } catch (err) {
            console.error("Upload Error Details:", err.response?.data || err.message);
            const errMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Upload failed. Check console for details.';
            alert(`Upload Failed: ${errMsg}`);
        }
    };

    const handleCreateConsultation = async (e) => {
        e.preventDefault();
        if (!patientResult) return;

        try {
            await api.post('doctors/consultations/', {
                patient_health_id: patientResult.health_id,
                ...newConsultation
            });
            alert('Consultation Created!');
            const consRes = await api.get(`doctors/patient-history/${searchId}/`);
            setConsultations(consRes.data);
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
            alert('Failed to create consultation');
        }
    };

    const handleRegisterPatient = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('doctors/register-patient/', newPatient);
            alert(`Patient registered! Health ID: ${res.data.health_id}`);
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
            alert('Failed to register patient');
        }
    };



    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
             {/* Background decorative elements */}
             <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-slate-50 z-0 pointer-events-none" />
             <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <Header />
                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                    
                    <DashboardStats doctorProfile={doctorProfile} />

                    {/* Main Dashboard Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden ring-1 ring-slate-900/5">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-slate-100 bg-white/50 backdrop-blur-md overflow-x-auto scroller-none">
                            {['search', 'consultations', 'appointments', 'register'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-5 px-6 text-center font-medium transition-all duration-300 relative group min-w-[140px] ${activeTab === tab
                                        ? 'text-indigo-600'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center gap-1.5 relative z-10">
                                        <span className={`text-2xl transition-transform duration-300 ${activeTab === tab ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105 grayscale opacity-70'}`}>
                                            {tab === 'search' && '🔍'}
                                            {tab === 'consultations' && '📋'}
                                            {tab === 'appointments' && '📅'}
                                            {tab === 'register' && '➕'}
                                        </span>
                                        <span className={`text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {tab === 'search' ? 'Patient Search' :
                                                tab === 'consultations' ? 'My Consultations' :
                                                    tab === 'appointments' ? 'Appointments' :
                                                        'Register Patient'}
                                        </span>
                                    </div>
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full shadow-lg shadow-indigo-500/20" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 md:p-8 bg-gradient-to-b from-white/40 to-transparent">
                            {/* Patient Search Tab */}
                            {activeTab === 'search' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100 max-w-2xl mx-auto">
                                        <PatientSearch
                                            searchId={searchId}
                                            setSearchId={setSearchId}
                                            handleSearch={(e) => handleSearch(e)}
                                            openScanner={openScanner}
                                        />
                                    </div>

                                    {patientResult && (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Left Column: Profile & Quick Actions */}
                                            <div className="space-y-6 lg:col-span-1">
                                                <PatientProfile
                                                    patient={patientResult}
                                                    handleRequestOTP={handleRequestOTP}
                                                />
                                                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-all">
                                                     <UploadRecordForm
                                                        newRecord={newRecord}
                                                        setNewRecord={setNewRecord}
                                                        handleUpload={handleUpload}
                                                    />
                                                </div>
                                            </div>

                                            {/* Right Column: History & Forms */}
                                            <div className="space-y-8 lg:col-span-2">
                                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                            <span>📝</span> Clinical History
                                                        </h3>
                                                        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                                            {consultations.length} Visits
                                                        </span>
                                                    </div>
                                                    <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                        <ConsultationHistory consultations={consultations} />
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                                         <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                            <span>📂</span> Medical Records
                                                        </h3>
                                                        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                                                            {records.length} Files
                                                        </span>
                                                    </div>
                                                     <div className="p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        <MedicalRecordList records={records} />
                                                    </div>
                                                </div>

                                                <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6">
                                                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                                        <span>🩺</span> New Consultation
                                                    </h3>
                                                    <ConsultationForm
                                                        newConsultation={newConsultation}
                                                        setNewConsultation={setNewConsultation}
                                                        handleSubmit={handleCreateConsultation}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!patientResult && (
                                        <div className="text-center py-20 opacity-60">
                                            <div className="text-6xl mb-4">🔍</div>
                                            <h3 className="text-xl font-medium text-slate-600">Search for a patient to begin</h3>
                                            <p className="text-slate-400 mt-2">Enter a Health ID or scan a QR code</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* My Consultations Tab */}
                        {activeTab === 'consultations' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm">📋</span>
                                    <span>Recent Consultations</span>
                                </h3>
                                {myConsultations.length === 0 ? (
                                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 text-lg">No consultations yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {myConsultations.map(con => (
                                            <div key={con.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border border-indigo-100">
                                                                {con.patient_health_id}
                                                            </span>
                                                            <span className="text-slate-400 text-sm">•</span>
                                                            <span className="text-slate-500 text-sm font-medium">
                                                                {new Date(con.consultation_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xl font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                            {con.chief_complaint}
                                                        </p>
                                                        {con.diagnosis && (
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-1">Diagnosis:</span>
                                                                <span className="text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">{con.diagnosis}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                                        <button 
                                                            onClick={() => handleViewPatient(con.patient_health_id)}
                                                            className="text-indigo-600 font-medium text-sm hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors w-full justify-center group-hover:bg-indigo-600 group-hover:text-white"
                                                        >
                                                            View Profile <span>→</span>
                                                        </button>
                                                        {con.follow_up_date && (
                                                            <div className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 w-full text-center">
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
                                <h3 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm">📅</span>
                                    <span>Manage Appointments</span>
                                </h3>
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
                                 <h3 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm">➕</span>
                                    <span>Register New Patient</span>
                                </h3>
                                <PatientRegisterForm
                                    newPatient={newPatient}
                                    setNewPatient={setNewPatient}
                                    handleRegister={handleRegisterPatient}
                                />
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
        </div>
    );
};

export default DoctorDashboard;
