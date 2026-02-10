import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Scanner } from '@yudiel/react-qr-scanner';

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
        if (result) {
            const rawValue = result[0]?.rawValue;
            if (rawValue) {
                let healthId = rawValue;
                if (rawValue.includes('/api/patients/')) {
                    const parts = rawValue.split('/api/patients/');
                    if (parts.length > 1) {
                        healthId = parts[1].replace('/', '');
                    }
                }
                setSearchId(healthId);
                setIsScannerOpen(false);

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

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`patients/${searchId}/`);
            setPatientResult(res.data);

            const recRes = await api.get(`records/?patient=${searchId}`);
            setRecords(recRes.data);

            const consRes = await api.get(`doctors/patient-history/${searchId}/`);
            setConsultations(consRes.data);
        } catch (err) {
            alert('Patient not found or Access Denied');
            setPatientResult(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!patientResult) return;

        const formData = new FormData();
        formData.append('patient', patientResult.id);
        formData.append('title', newRecord.title);
        formData.append('description', newRecord.description);
        formData.append('record_type', newRecord.record_type);
        if (newRecord.file) {
            formData.append('file', newRecord.file);
        }

        try {
            await api.post('records/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Record Uploaded!');
            const recRes = await api.get(`records/?patient=${searchId}`);
            setRecords(recRes.data);
            setNewRecord({ title: '', description: '', record_type: 'PRESCRIPTION', file: null });
        } catch (err) {
            console.error(err);
            alert('Upload failed');
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

    const getAuthBadgeColor = (level) => {
        switch (level) {
            case 'FULL': return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
            case 'STANDARD': return 'bg-gradient-to-r from-blue-500 to-blue-600';
            default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Doctor Info Header */}
                {doctorProfile && (
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                                    {doctorProfile.user?.first_name?.[0]}{doctorProfile.user?.last_name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold">
                                        Dr. {doctorProfile.user?.first_name} {doctorProfile.user?.last_name}
                                    </h2>
                                    <p className="text-white/90 text-lg">{doctorProfile.specialization}</p>
                                    {doctorProfile.hospital_details && (
                                        <p className="text-white/70 text-sm mt-1">📍 {doctorProfile.hospital_details.name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`${getAuthBadgeColor(doctorProfile.authorization_level)} px-4 py-2 rounded-lg text-white font-semibold shadow-lg`}>
                                    ✓ {doctorProfile.authorization_level} Access
                                </span>
                                {!doctorProfile.is_verified && (
                                    <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-100 px-3 py-1 rounded-lg text-sm">
                                        <span>⏳</span>
                                        <span>Pending Verification</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Dashboard Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        {['search', 'consultations', 'register'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'border-b-4 border-indigo-600 text-indigo-600 bg-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {tab === 'search' && <span>🔍</span>}
                                    {tab === 'consultations' && <span>📋</span>}
                                    {tab === 'register' && <span>➕</span>}
                                    <span>{tab === 'search' ? 'Patient Search' : tab === 'consultations' ? 'My Consultations' : 'Register Patient'}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Patient Search Tab */}
                        {activeTab === 'search' && (
                            <div className="space-y-6">
                                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="🔎 Enter Patient Health ID..."
                                        className="flex-1 border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={searchId}
                                        onChange={e => setSearchId(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsScannerOpen(true)}
                                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 font-medium shadow-lg hover:shadow-xl transition-all"
                                    >
                                        📷 Scan QR
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Search
                                    </button>
                                </form>

                                {/* Scanner Modal */}
                                {isScannerOpen && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
                                            <button
                                                onClick={() => setIsScannerOpen(false)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                                            >
                                                ✕
                                            </button>
                                            <h3 className="text-xl font-bold mb-4 text-gray-800">Scan Patient QR Code</h3>
                                            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                                <Scanner
                                                    onScan={handleScan}
                                                    onError={(error) => console.log(error?.message)}
                                                    components={{ audio: false }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-4 text-center">
                                                Point camera at patient's Health ID QR code
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* OTP Modal */}
                                {isOTPModalOpen && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
                                            <button
                                                onClick={() => setIsOTPModalOpen(false)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                                            >
                                                ✕
                                            </button>
                                            <h3 className="text-xl font-bold mb-2 text-gray-800">Enter OTP</h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Ask patient for the 6-digit code sent to their phone.
                                            </p>
                                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="• • • • • •"
                                                    className="w-full border-2 border-gray-200 p-3 rounded-xl text-center text-3xl tracking-widest focus:border-indigo-500 focus:outline-none"
                                                    maxLength={6}
                                                    value={otpCode}
                                                    onChange={e => setOtpCode(e.target.value)}
                                                    autoFocus
                                                />
                                                <button 
                                                    type="submit" 
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg transition-all"
                                                >
                                                    Verify & Grant Access
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {patientResult && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Patient Info Card */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-gray-800">👤 Patient Profile</h3>
                                                <button
                                                    onClick={handleRequestOTP}
                                                    className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-1"
                                                >
                                                    <span>🔓</span>
                                                    <span>Request Full Access</span>
                                                </button>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">Health ID:</span>
                                                    <span className="ml-2 font-mono text-indigo-600 font-bold">{patientResult.health_id}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">Name:</span>
                                                    <span className="ml-2">{patientResult.user?.first_name} {patientResult.user?.last_name}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">Phone:</span>
                                                    <span className="ml-2">{patientResult.contact_number || 'N/A'}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">Blood Group:</span>
                                                    <span className="ml-2 text-red-600 font-bold">{patientResult.blood_group || 'N/A'}</span>
                                                </div>
                                                {patientResult.allergies && (
                                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                                        <span className="font-semibold text-yellow-800">⚠️ Allergies:</span>
                                                        <span className="ml-2 text-yellow-900">{patientResult.allergies}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Records & History */}
                                            <div className="mt-6 space-y-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                        <span>📄</span>
                                                        <span>Medical Records</span>
                                                    </h4>
                                                    <div className="bg-white rounded-lg max-h-40 overflow-y-auto">
                                                        {records.length === 0 ? (
                                                            <p className="p-3 text-gray-400 text-sm text-center">No records found</p>
                                                        ) : (
                                                            <ul className="divide-y divide-gray-100">
                                                                {records.map(rec => (
                                                                    <li key={rec.id} className="p-3 hover:bg-gray-50">
                                                                        <p className="font-semibold text-sm text-gray-800">{rec.title}</p>
                                                                        <p className="text-xs text-gray-500">{rec.record_type} · {new Date(rec.created_at).toLocaleDateString()}</p>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                        <span>🩺</span>
                                                        <span>Consultation History</span>
                                                    </h4>
                                                    <div className="bg-white rounded-lg max-h-40 overflow-y-auto">
                                                        {consultations.length === 0 ? (
                                                            <p className="p-3 text-gray-400 text-sm text-center">No consultations found</p>
                                                        ) : (
                                                            <ul className="divide-y divide-gray-100">
                                                                {consultations.map(con => (
                                                                    <li key={con.id} className="p-3 hover:bg-gray-50">
                                                                        <p className="font-semibold text-sm text-gray-800">{con.chief_complaint}</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {new Date(con.consultation_date).toLocaleDateString()} · {con.diagnosis || 'Pending'}
                                                                        </p>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Forms Column */}
                                        <div className="space-y-6">
                                            {/* New Consultation Form */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                                                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                                    <span>➕</span>
                                                    <span>New Consultation</span>
                                                </h3>
                                                <form onSubmit={handleCreateConsultation} className="space-y-3">
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                                        value={newConsultation.consultation_date}
                                                        onChange={e => setNewConsultation({ ...newConsultation, consultation_date: e.target.value })}
                                                    />
                                                    <textarea
                                                        placeholder="Chief Complaint *"
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                                        rows="2"
                                                        required
                                                        value={newConsultation.chief_complaint}
                                                        onChange={e => setNewConsultation({ ...newConsultation, chief_complaint: e.target.value })}
                                                    />
                                                    <textarea
                                                        placeholder="Diagnosis"
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                                        rows="2"
                                                        value={newConsultation.diagnosis}
                                                        onChange={e => setNewConsultation({ ...newConsultation, diagnosis: e.target.value })}
                                                    />
                                                    <textarea
                                                        placeholder="Prescription"
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                                        rows="2"
                                                        value={newConsultation.prescription}
                                                        onChange={e => setNewConsultation({ ...newConsultation, prescription: e.target.value })}
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="Follow-up Date"
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                                        value={newConsultation.follow_up_date}
                                                        onChange={e => setNewConsultation({ ...newConsultation, follow_up_date: e.target.value })}
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg transition-all"
                                                    >
                                                        💾 Save Consultation
                                                    </button>
                                                </form>
                                            </div>

                                            {/* Upload Record Form */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                                                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                                    <span>📤</span>
                                                    <span>Add Record</span>
                                                </h3>
                                                <form onSubmit={handleUpload} className="space-y-3">
                                                    <select
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                                                        value={newRecord.record_type}
                                                        onChange={e => setNewRecord({ ...newRecord, record_type: e.target.value })}
                                                    >
                                                        <option value="PRESCRIPTION">💊 Prescription</option>
                                                        <option value="DIAGNOSIS">🔬 Diagnosis</option>
                                                        <option value="LAB_REPORT">🧪 Lab Report</option>
                                                        <option value="VISIT_NOTE">📝 Visit Note</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Record Title"
                                                        className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                                                        value={newRecord.title}
                                                        onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                                                    />
                                                    <input
                                                        type="file"
                                                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                                                        onChange={e => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium shadow-lg transition-all"
                                                    >
                                                        📤 Upload Record
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Consultations Tab */}
                        {activeTab === 'consultations' && (
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                    <span>📋</span>
                                    <span>Recent Consultations</span>
                                </h3>
                                {myConsultations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400 text-lg">No consultations yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {myConsultations.map(con => (
                                            <div key={con.id} className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-mono font-bold">
                                                                {con.patient_health_id}
                                                            </span>
                                                        </div>
                                                        <p className="text-lg font-semibold text-gray-800">{con.chief_complaint}</p>
                                                        {con.diagnosis && (
                                                            <div className="mt-2 bg-blue-50 border border-blue-100 p-2 rounded-lg">
                                                                <span className="text-sm text-gray-600 font-semibold">Diagnosis:</span>
                                                                <span className="text-sm text-gray-800 ml-2">{con.diagnosis}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right text-sm space-y-1">
                                                        <p className="text-gray-600">📅 {new Date(con.consultation_date).toLocaleDateString()}</p>
                                                        {con.follow_up_date && (
                                                            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg inline-block">
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

                        {/* Register Patient Tab */}
                        {activeTab === 'register' && (
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                    <span>➕</span>
                                    <span>Register New Patient</span>
                                </h3>
                                <form onSubmit={handleRegisterPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                                    <input
                                        type="text"
                                        placeholder="Username *"
                                        required
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.username}
                                        onChange={e => setNewPatient({ ...newPatient, username: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password *"
                                        required
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.password}
                                        onChange={e => setNewPatient({ ...newPatient, password: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        placeholder="📧 Email"
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.email}
                                        onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="📱 Phone Number"
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.contact_number}
                                        onChange={e => setNewPatient({ ...newPatient, contact_number: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.first_name}
                                        onChange={e => setNewPatient({ ...newPatient, first_name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.last_name}
                                        onChange={e => setNewPatient({ ...newPatient, last_name: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        placeholder="Date of Birth"
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.date_of_birth}
                                        onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                                    />
                                    <select
                                        className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                        value={newPatient.blood_group}
                                        onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })}
                                    >
                                        <option value="">🩸 Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                    <button 
                                        type="submit" 
                                        className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        ✨ Register & Generate Health ID
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
