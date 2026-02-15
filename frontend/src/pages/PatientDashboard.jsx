import React, { useEffect, useState } from 'react';
import PatientService from '../services/patient.service';
import DoctorService from '../services/doctor.service';
import Header from '../components/Header';

import MedicalRecordList from '../components/patient/MedicalRecordList';
import AppointmentList from '../components/patient/AppointmentList';
import AppointmentBooking from '../components/patient/AppointmentBooking';
import DocumentsList from '../components/patient/DocumentsList';
import UploadDocumentForm from '../components/patient/UploadDocumentForm';
import PrescriptionsList from '../components/patient/PrescriptionsList';
import UploadPrescriptionForm from '../components/patient/UploadPrescriptionForm';
import LabReportsList from '../components/patient/LabReportsList';
import SharingPermissionsList from '../components/patient/SharingPermissionsList';
import AccessHistoryList from '../components/patient/AccessHistoryList';
import EmergencyContactsList from '../components/patient/EmergencyContactsList';
import AddEmergencyContactForm from '../components/patient/AddEmergencyContactForm';
import ProfileEditModal from '../components/patient/ProfileEditModal';

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [sharingPermissions, setSharingPermissions] = useState([]);
    const [accessHistory, setAccessHistory] = useState([]);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [labReports, setLabReports] = useState([]);

    // Upload Document Form
    const [newDocument, setNewDocument] = useState({
        document_type: 'REPORT',
        title: '',
        description: '',
        file: null
    });

    // Upload Prescription Form
    const [newPrescription, setNewPrescription] = useState({
        prescription_date: '',
        doctor_name: '',
        hospital_name: '',
        symptoms: '',
        diagnosis: '',
        medicines: '',
        insights: '',
        file: null
    });

    // Appointments State
    const [appointments, setAppointments] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [newAppointment, setNewAppointment] = useState({
        doctor: '',
        appointment_date: '',
        reason: ''
    });

    // Emergency Contact Form
    const [newContact, setNewContact] = useState({
        name: '',
        relationship: '',
        phone: '',
        can_grant_access: true
    });

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        contact_number: '',
        address: '',
        blood_group: '',
        allergies: '',
        chronic_conditions: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientData, recordsData, docsData, prescData, sharingData, historyData, contactsData, labData, aptData, docData] = await Promise.all([
                PatientService.getProfile(),
                PatientService.getRecords(),
                PatientService.getDocuments().catch(() => []),
                PatientService.getPrescriptions().catch(() => []),
                PatientService.getSharingPermissions().catch(() => []),
                PatientService.getAccessHistory().catch(() => []),
                PatientService.getEmergencyContacts().catch(() => []),
                PatientService.getLabReports().catch(() => []),
                PatientService.getMyAppointments().catch(() => []),
                DoctorService.getVerifiedDoctors().catch(() => [])
            ]);

            setPatient(patientData);
            setRecords(recordsData);
            setDocuments(docsData);
            setPrescriptions(prescData);
            setSharingPermissions(sharingData);
            setAccessHistory(historyData);
            setEmergencyContacts(contactsData);
            setLabReports(labData);
            setAppointments(aptData);
            setDoctorsList(docData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('document_type', newDocument.document_type);
        formData.append('title', newDocument.title);
        formData.append('description', newDocument.description);
        if (newDocument.file) formData.append('file', newDocument.file);

        try {
            await PatientService.uploadDocument(formData);
            alert('Document uploaded!');
            setNewDocument({ document_type: 'REPORT', title: '', description: '', file: null });
            fetchData();
        } catch (err) {
            alert('Upload failed');
        }
    };

    const handleUploadPrescription = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('prescription_date', newPrescription.prescription_date);
        formData.append('doctor_name', newPrescription.doctor_name);
        formData.append('hospital_name', newPrescription.hospital_name);
        formData.append('symptoms', newPrescription.symptoms);
        formData.append('diagnosis', newPrescription.diagnosis);
        formData.append('insights', newPrescription.insights);

        // Parse medicines as JSON array
        try {
            const medicines = newPrescription.medicines.split('\n').filter(m => m.trim()).map(m => {
                const parts = m.split(',');
                return { name: parts[0]?.trim() || '', dosage: parts[1]?.trim() || '', frequency: parts[2]?.trim() || '' };
            });
            formData.append('medicines', JSON.stringify(medicines));
        } catch {
            formData.append('medicines', '[]');
        }

        if (newPrescription.file) formData.append('file', newPrescription.file);

        try {
            await PatientService.uploadPrescription(formData);
            alert('Prescription saved!');
            setNewPrescription({
                prescription_date: '', doctor_name: '', hospital_name: '',
                symptoms: '', diagnosis: '', medicines: '', insights: '', file: null
            });
            fetchData();
        } catch (err) {
            alert('Failed to save prescription');
        }
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        try {
            await PatientService.addEmergencyContact(newContact);
            alert('Emergency contact added!');
            setNewContact({ name: '', relationship: '', phone: '', can_grant_access: true });
            fetchData();
        } catch (err) {
            alert('Failed to add contact');
        }
    };

    const handleRevokeAccess = async (id) => {
        if (!confirm('Are you sure you want to revoke this access?')) return;
        try {
            await PatientService.revokeAccess(id);
            alert('Access revoked!');
            fetchData();
        } catch (err) {
            alert('Failed to revoke access');
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await PatientService.bookAppointment(newAppointment);
            alert('Appointment request sent!');
            setNewAppointment({ doctor: '', appointment_date: '', reason: '' });
            fetchData();
        } catch (err) {
            alert('Failed to book appointment');
        }
    };

    const downloadQRCode = () => {
        if (patient?.qr_code) {
            const link = document.createElement('a');
            link.href = patient.qr_code;
            link.download = `QR_${patient.health_id}.png`;
            link.click();
        }
    };

    const handleEditClick = () => {
        setEditForm({
            contact_number: patient.contact_number || '',
            address: patient.address || '',
            blood_group: patient.blood_group || '',
            allergies: patient.allergies || '',
            chronic_conditions: patient.chronic_conditions || ''
        });
        setIsEditing(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await PatientService.updateProfile(patient.health_id, editForm);
            alert('Profile updated successfully!');
            setIsEditing(false);
            fetchData();
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (!patient) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Health ID Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-sm opacity-80">My Health ID</p>
                        <h2 className="text-3xl font-mono font-bold tracking-wider">{patient.health_id}</h2>
                        <p className="text-sm mt-2 opacity-80">
                            {patient.user?.first_name} {patient.user?.last_name}
                        </p>
                        {patient.blood_group && (
                            <span className="inline-block bg-white/20 px-2 py-1 rounded text-xs mt-2">
                                Blood: {patient.blood_group}
                            </span>
                        )}
                    </div>
                    {patient.qr_code && (
                        <div className="text-center flex flex-col items-center gap-2">
                            <img src={patient.qr_code} alt="QR Code" className="w-32 h-32 bg-white p-1 rounded" />
                            <button
                                onClick={downloadQRCode}
                                className="text-xs underline hover:no-underline"
                            >
                                Download QR
                            </button>
                            <button
                                onClick={() => window.open(PatientService.getDownloadPdfUrl(), '_blank')}
                                className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1 rounded transition mt-1"
                            >
                                Download Record (PDF)
                            </button>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded shadow">
                    <div className="flex border-b overflow-x-auto">
                        {['overview', 'appointments', 'documents', 'prescriptions', 'reports', 'sharing', 'history', 'emergency'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 px-4 text-center capitalize whitespace-nowrap ${activeTab === tab
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'emergency' ? 'Emergency Contacts' : tab === 'reports' ? 'Lab Reports' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profile Info */}
                                <div className="bg-gray-50 p-4 rounded relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold">My Profile</h3>
                                        <button
                                            onClick={handleEditClick}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> {patient.user?.email || 'N/A'}</p>
                                        <p><strong>Phone:</strong> {patient.contact_number || 'N/A'}</p>
                                        <p><strong>DOB:</strong> {patient.date_of_birth || 'N/A'}</p>
                                        <p><strong>Address:</strong> {patient.address || 'N/A'}</p>
                                        {patient.allergies && <p><strong>Allergies:</strong> {patient.allergies}</p>}
                                        {patient.chronic_conditions && <p><strong>Conditions:</strong> {patient.chronic_conditions}</p>}
                                    </div>
                                </div>

                                {/* Medical Records */}
                                 <MedicalRecordList records={records.slice(0, 5)} />
                            </div>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === 'appointments' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold mb-3">My Appointments</h3>
                                    <AppointmentList appointments={appointments} />
                                </div>
                                <AppointmentBooking 
                                    newAppointment={newAppointment}
                                    setNewAppointment={setNewAppointment}
                                    doctorsList={doctorsList}
                                    handleBookAppointment={handleBookAppointment}
                                />
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold mb-3">My Documents</h3>
                                    <DocumentsList documents={documents} />
                                </div>
                                <UploadDocumentForm 
                                    newDocument={newDocument}
                                    setNewDocument={setNewDocument}
                                    handleUpload={handleUploadDocument}
                                />
                            </div>
                        )}

                        {/* Prescriptions Tab */}
                        {activeTab === 'prescriptions' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold mb-3">Old Prescriptions</h3>
                                    <PrescriptionsList prescriptions={prescriptions} />
                                </div>
                                <UploadPrescriptionForm 
                                    newPrescription={newPrescription}
                                    setNewPrescription={setNewPrescription}
                                    handleUpload={handleUploadPrescription}
                                />
                            </div>
                        )}

                        {/* Lab Reports Tab */}
                        {activeTab === 'reports' && (
                            <div>
                                <h3 className="font-bold mb-3">Lab Reports</h3>
                                <LabReportsList labReports={labReports} />
                            </div>
                        )}

                        {/* Sharing Tab */}
                        {activeTab === 'sharing' && (
                            <div>
                                <h3 className="font-bold mb-3">Active Permissions</h3>
                                <SharingPermissionsList 
                                    sharingPermissions={sharingPermissions}
                                    handleRevokeAccess={handleRevokeAccess}
                                />
                            </div>
                        )}

                        {/* Access History Tab */}
                        {activeTab === 'history' && (
                            <div>
                                <h3 className="font-bold mb-3">Access History</h3>
                                <AccessHistoryList accessHistory={accessHistory} />
                            </div>
                        )}

                        {/* Emergency Contacts Tab */}
                        {activeTab === 'emergency' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold mb-3">Emergency Contacts</h3>
                                    <EmergencyContactsList emergencyContacts={emergencyContacts} />
                                </div>
                                <AddEmergencyContactForm 
                                    newContact={newContact}
                                    setNewContact={setNewContact}
                                    handleAddContact={handleAddContact}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <ProfileEditModal 
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    handleUpdateProfile={handleUpdateProfile}
                />
            </div>
        </div >
    );
};

export default PatientDashboard;
