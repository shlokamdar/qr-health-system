import React, { useState, useEffect } from 'react';
import api from '../utils/api';

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

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`patients/${searchId}/`);
            setPatientResult(res.data);
            
            // Fetch records for this patient
            const recRes = await api.get(`records/?patient=${searchId}`);
            setRecords(recRes.data);

            // Fetch consultations for this patient
            const consRes = await api.get(`doctors/patient-history/${searchId}/`);
            setConsultations(consRes.data);
        } catch (err) {
            alert('Patient not found or Access Denied');
            setPatientResult(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if(!patientResult) return;

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
        if(!patientResult) return;

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
        switch(level) {
            case 'FULL': return 'bg-green-500';
            case 'STANDARD': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Doctor Info Header */}
            {doctorProfile && (
                <div className="bg-white p-4 rounded shadow flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">
                            Dr. {doctorProfile.user?.first_name} {doctorProfile.user?.last_name}
                        </h2>
                        <p className="text-gray-600">{doctorProfile.specialization}</p>
                        {doctorProfile.hospital_details && (
                            <p className="text-sm text-gray-500">{doctorProfile.hospital_details.name}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded text-white text-sm ${getAuthBadgeColor(doctorProfile.authorization_level)}`}>
                            {doctorProfile.authorization_level} Access
                        </span>
                        {!doctorProfile.is_verified && (
                            <p className="text-orange-500 text-xs mt-1">⏳ Pending Verification</p>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded shadow">
                <div className="flex border-b">
                    {['search', 'consultations', 'register'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 text-center capitalize ${
                                activeTab === tab 
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'search' ? 'Patient Search' : tab === 'consultations' ? 'My Consultations' : 'Register Patient'}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Patient Search Tab */}
                    {activeTab === 'search' && (
                        <div className="space-y-6">
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Scan or Enter Health ID" 
                                    className="flex-1 border p-2 rounded"
                                    value={searchId}
                                    onChange={e => setSearchId(e.target.value)}
                                />
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                                    Fetch
                                </button>
                            </form>

                            {patientResult && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Patient Info */}
                                    <div className="bg-gray-50 p-4 rounded">
                                        <h3 className="text-lg font-bold mb-3">Patient Profile</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Health ID:</strong> {patientResult.health_id}</p>
                                            <p><strong>Name:</strong> {patientResult.user?.first_name} {patientResult.user?.last_name}</p>
                                            <p><strong>Phone:</strong> {patientResult.contact_number || 'N/A'}</p>
                                            <p><strong>Blood Group:</strong> {patientResult.blood_group || 'N/A'}</p>
                                            {patientResult.allergies && (
                                                <p><strong>Allergies:</strong> {patientResult.allergies}</p>
                                            )}
                                        </div>

                                        {/* Previous Records */}
                                        <h4 className="font-bold mt-4 mb-2">Medical Records</h4>
                                        <ul className="divide-y divide-gray-200 max-h-40 overflow-y-auto">
                                            {records.length === 0 ? (
                                                <li className="py-2 text-gray-500 text-sm">No records found</li>
                                            ) : records.map(rec => (
                                                <li key={rec.id} className="py-2">
                                                    <p className="font-semibold text-sm">{rec.title}</p>
                                                    <p className="text-xs text-gray-500">{rec.record_type} - {new Date(rec.created_at).toLocaleDateString()}</p>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Consultation History */}
                                        <h4 className="font-bold mt-4 mb-2">Consultation History</h4>
                                        <ul className="divide-y divide-gray-200 max-h-40 overflow-y-auto">
                                            {consultations.length === 0 ? (
                                                <li className="py-2 text-gray-500 text-sm">No consultations found</li>
                                            ) : consultations.map(con => (
                                                <li key={con.id} className="py-2">
                                                    <p className="font-semibold text-sm">{con.chief_complaint}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(con.consultation_date).toLocaleDateString()} - {con.diagnosis || 'Pending'}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Forms Column */}
                                    <div className="space-y-6">
                                        {/* New Consultation */}
                                        <div className="bg-gray-50 p-4 rounded">
                                            <h3 className="text-lg font-bold mb-3">New Consultation</h3>
                                            <form onSubmit={handleCreateConsultation} className="space-y-3">
                                                <input 
                                                    type="datetime-local"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={newConsultation.consultation_date}
                                                    onChange={e => setNewConsultation({...newConsultation, consultation_date: e.target.value})}
                                                />
                                                <textarea 
                                                    placeholder="Chief Complaint *"
                                                    className="w-full border p-2 rounded text-sm"
                                                    required
                                                    value={newConsultation.chief_complaint}
                                                    onChange={e => setNewConsultation({...newConsultation, chief_complaint: e.target.value})}
                                                />
                                                <textarea 
                                                    placeholder="Diagnosis"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={newConsultation.diagnosis}
                                                    onChange={e => setNewConsultation({...newConsultation, diagnosis: e.target.value})}
                                                />
                                                <textarea 
                                                    placeholder="Prescription"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={newConsultation.prescription}
                                                    onChange={e => setNewConsultation({...newConsultation, prescription: e.target.value})}
                                                />
                                                <input 
                                                    type="date"
                                                    placeholder="Follow-up Date"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={newConsultation.follow_up_date}
                                                    onChange={e => setNewConsultation({...newConsultation, follow_up_date: e.target.value})}
                                                />
                                                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                                                    Save Consultation
                                                </button>
                                            </form>
                                        </div>

                                        {/* Upload Record */}
                                        <div className="bg-gray-50 p-4 rounded">
                                            <h3 className="text-lg font-bold mb-3">Add Record</h3>
                                            <form onSubmit={handleUpload} className="space-y-3">
                                                <select 
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={newRecord.record_type}
                                                    onChange={e => setNewRecord({...newRecord, record_type: e.target.value})}
                                                >
                                                    <option value="PRESCRIPTION">Prescription</option>
                                                    <option value="DIAGNOSIS">Diagnosis</option>
                                                    <option value="LAB_REPORT">Lab Report</option>
                                                    <option value="VISIT_NOTE">Visit Note</option>
                                                </select>
                                                <input 
                                                    type="text" 
                                                    placeholder="Title" 
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={newRecord.title}
                                                    onChange={e => setNewRecord({...newRecord, title: e.target.value})}
                                                />
                                                <input 
                                                    type="file" 
                                                    className="w-full text-sm"
                                                    onChange={e => setNewRecord({...newRecord, file: e.target.files[0]})}
                                                />
                                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                                    Upload Record
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
                            <h3 className="text-lg font-bold mb-4">Recent Consultations</h3>
                            {myConsultations.length === 0 ? (
                                <p className="text-gray-500">No consultations yet.</p>
                            ) : (
                                <div className="divide-y">
                                    {myConsultations.map(con => (
                                        <div key={con.id} className="py-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{con.patient_health_id}</p>
                                                    <p className="text-sm text-gray-600">{con.chief_complaint}</p>
                                                    {con.diagnosis && <p className="text-sm"><strong>Dx:</strong> {con.diagnosis}</p>}
                                                </div>
                                                <div className="text-right text-sm text-gray-500">
                                                    <p>{new Date(con.consultation_date).toLocaleDateString()}</p>
                                                    {con.follow_up_date && (
                                                        <p className="text-orange-500">F/U: {new Date(con.follow_up_date).toLocaleDateString()}</p>
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
                            <h3 className="text-lg font-bold mb-4">Register New Patient</h3>
                            <form onSubmit={handleRegisterPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                <input 
                                    type="text" 
                                    placeholder="Username *" 
                                    required
                                    className="border p-2 rounded"
                                    value={newPatient.username}
                                    onChange={e => setNewPatient({...newPatient, username: e.target.value})}
                                />
                                <input 
                                    type="password" 
                                    placeholder="Password *" 
                                    required
                                    className="border p-2 rounded"
                                    value={newPatient.password}
                                    onChange={e => setNewPatient({...newPatient, password: e.target.value})}
                                />
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    className="border p-2 rounded"
                                    value={newPatient.email}
                                    onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Phone Number" 
                                    className="border p-2 rounded"
                                    value={newPatient.contact_number}
                                    onChange={e => setNewPatient({...newPatient, contact_number: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="First Name" 
                                    className="border p-2 rounded"
                                    value={newPatient.first_name}
                                    onChange={e => setNewPatient({...newPatient, first_name: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Last Name" 
                                    className="border p-2 rounded"
                                    value={newPatient.last_name}
                                    onChange={e => setNewPatient({...newPatient, last_name: e.target.value})}
                                />
                                <input 
                                    type="date" 
                                    placeholder="Date of Birth" 
                                    className="border p-2 rounded"
                                    value={newPatient.date_of_birth}
                                    onChange={e => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                                />
                                <select 
                                    className="border p-2 rounded"
                                    value={newPatient.blood_group}
                                    onChange={e => setNewPatient({...newPatient, blood_group: e.target.value})}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                                <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                                    Register & Generate Health ID
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
