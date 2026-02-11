import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [sharingPermissions, setSharingPermissions] = useState([]);
    const [accessHistory, setAccessHistory] = useState([]);
    const [emergencyContacts, setEmergencyContacts] = useState([]);

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

    // Emergency Contact Form
    const [newContact, setNewContact] = useState({
        name: '',
        relationship: '',
        phone: '',
        can_grant_access: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientRes, recordsRes, docsRes, prescRes, sharingRes, historyRes, contactsRes] = await Promise.all([
                api.get('patients/me/'),
                api.get('records/'),
                api.get('patients/documents/').catch(() => ({ data: [] })),
                api.get('patients/prescriptions/').catch(() => ({ data: [] })),
                api.get('patients/sharing/').catch(() => ({ data: [] })),
                api.get('patients/sharing-history/').catch(() => ({ data: [] })),
                api.get('patients/emergency-contacts/').catch(() => ({ data: [] }))
            ]);

            setPatient(patientRes.data);
            setRecords(recordsRes.data);
            setDocuments(docsRes.data);
            setPrescriptions(prescRes.data);
            setSharingPermissions(sharingRes.data);
            setAccessHistory(historyRes.data);
            setEmergencyContacts(contactsRes.data);
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
            await api.post('patients/documents/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
            await api.post('patients/prescriptions/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
            await api.post('patients/emergency-contacts/', newContact);
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
            await api.post(`patients/sharing/${id}/revoke/`);
            alert('Access revoked!');
            fetchData();
        } catch (err) {
            alert('Failed to revoke access');
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

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        contact_number: '',
        address: '',
        blood_group: '',
        allergies: '',
        chronic_conditions: ''
    });

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
            await api.patch(`patients/${patient.health_id}/`, editForm);
            alert('Profile updated successfully!');
            setIsEditing(false);
            fetchData();
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (!patient) return <div className="p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Health ID Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
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
                    <div className="text-center">
                        <img src={patient.qr_code} alt="QR Code" className="w-32 h-32 bg-white p-1 rounded" />
                        <button
                            onClick={downloadQRCode}
                            className="text-xs mt-2 underline hover:no-underline"
                        >
                            Download QR
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded shadow">
                <div className="flex border-b overflow-x-auto">
                    {['overview', 'documents', 'prescriptions', 'sharing', 'history', 'emergency'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-4 text-center capitalize whitespace-nowrap ${activeTab === tab
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'emergency' ? 'Emergency Contacts' : tab}
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
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-bold mb-3">Recent Medical Records</h3>
                                {records.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No records yet.</p>
                                ) : (
                                    <ul className="divide-y max-h-48 overflow-y-auto">
                                        {records.slice(0, 5).map(rec => (
                                            <li key={rec.id} className="py-2">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="font-semibold text-sm">{rec.title}</p>
                                                        <p className="text-xs text-gray-500">{rec.record_type}</p>
                                                    </div>
                                                    {rec.file && (
                                                        <a href={rec.file} target="_blank" className="text-indigo-500 text-sm">View</a>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-3">My Documents</h3>
                                {documents.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No documents uploaded.</p>
                                ) : (
                                    <ul className="divide-y">
                                        {documents.map(doc => (
                                            <li key={doc.id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{doc.title}</p>
                                                    <p className="text-xs text-gray-500">{doc.document_type} - {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                                </div>
                                                {doc.file && (
                                                    <a href={doc.file} target="_blank" className="text-indigo-500 text-sm">View</a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-bold mb-3">Upload Document</h3>
                                <form onSubmit={handleUploadDocument} className="space-y-3">
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={newDocument.document_type}
                                        onChange={e => setNewDocument({ ...newDocument, document_type: e.target.value })}
                                    >
                                        <option value="REPORT">Medical Report</option>
                                        <option value="INSURANCE">Insurance Document</option>
                                        <option value="ID_PROOF">ID Proof</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Title *"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newDocument.title}
                                        onChange={e => setNewDocument({ ...newDocument, title: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Description"
                                        className="w-full border p-2 rounded"
                                        value={newDocument.description}
                                        onChange={e => setNewDocument({ ...newDocument, description: e.target.value })}
                                    />
                                    <input
                                        type="file"
                                        className="w-full"
                                        onChange={e => setNewDocument({ ...newDocument, file: e.target.files[0] })}
                                    />
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                                        Upload
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Prescriptions Tab */}
                    {activeTab === 'prescriptions' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-3">Old Prescriptions</h3>
                                {prescriptions.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No prescriptions added.</p>
                                ) : (
                                    <ul className="divide-y">
                                        {prescriptions.map(presc => (
                                            <li key={presc.id} className="py-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{new Date(presc.prescription_date).toLocaleDateString()}</p>
                                                        <p className="text-sm text-gray-600">{presc.doctor_name} - {presc.hospital_name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{presc.symptoms}</p>
                                                    </div>
                                                    {presc.file && (
                                                        <a href={presc.file} target="_blank" className="text-indigo-500 text-sm">View</a>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-bold mb-3">Add Old Prescription</h3>
                                <form onSubmit={handleUploadPrescription} className="space-y-3">
                                    <input
                                        type="date"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newPrescription.prescription_date}
                                        onChange={e => setNewPrescription({ ...newPrescription, prescription_date: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Doctor Name"
                                        className="w-full border p-2 rounded"
                                        value={newPrescription.doctor_name}
                                        onChange={e => setNewPrescription({ ...newPrescription, doctor_name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Hospital Name"
                                        className="w-full border p-2 rounded"
                                        value={newPrescription.hospital_name}
                                        onChange={e => setNewPrescription({ ...newPrescription, hospital_name: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Symptoms *"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newPrescription.symptoms}
                                        onChange={e => setNewPrescription({ ...newPrescription, symptoms: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Diagnosis"
                                        className="w-full border p-2 rounded"
                                        value={newPrescription.diagnosis}
                                        onChange={e => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Medicines (one per line: name, dosage, frequency)"
                                        className="w-full border p-2 rounded text-sm"
                                        value={newPrescription.medicines}
                                        onChange={e => setNewPrescription({ ...newPrescription, medicines: e.target.value })}
                                    />
                                    <input
                                        type="file"
                                        className="w-full"
                                        onChange={e => setNewPrescription({ ...newPrescription, file: e.target.files[0] })}
                                    />
                                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                                        Save Prescription
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Sharing Tab */}
                    {activeTab === 'sharing' && (
                        <div>
                            <h3 className="font-bold mb-3">Active Permissions</h3>
                            {sharingPermissions.filter(p => p.is_active).length === 0 ? (
                                <p className="text-gray-500 text-sm">No active permissions.</p>
                            ) : (
                                <ul className="divide-y">
                                    {sharingPermissions.filter(p => p.is_active).map(perm => (
                                        <li key={perm.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{perm.doctor_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {perm.access_type} - Granted {new Date(perm.granted_at).toLocaleDateString()}
                                                    {perm.expires_at && ` (Expires: ${new Date(perm.expires_at).toLocaleDateString()})`}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {perm.can_view_records && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Records</span>}
                                                    {perm.can_view_documents && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Documents</span>}
                                                    {perm.can_add_records && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Add Records</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeAccess(perm.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Revoke
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Access History Tab */}
                    {activeTab === 'history' && (
                        <div>
                            <h3 className="font-bold mb-3">Access History</h3>
                            {accessHistory.length === 0 ? (
                                <p className="text-gray-500 text-sm">No access history.</p>
                            ) : (
                                <ul className="divide-y max-h-96 overflow-y-auto">
                                    {accessHistory.map((log, idx) => (
                                        <li key={idx} className="py-2">
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-semibold text-sm">{log.actor}</p>
                                                    <p className="text-xs text-gray-500">{log.action}: {log.details}</p>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Emergency Contacts Tab */}
                    {activeTab === 'emergency' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-3">Emergency Contacts</h3>
                                {emergencyContacts.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No emergency contacts added.</p>
                                ) : (
                                    <ul className="divide-y">
                                        {emergencyContacts.map(contact => (
                                            <li key={contact.id} className="py-3">
                                                <p className="font-semibold">{contact.name}</p>
                                                <p className="text-sm text-gray-600">{contact.relationship} - {contact.phone}</p>
                                                {contact.can_grant_access && (
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Can grant access</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-bold mb-3">Add Emergency Contact</h3>
                                <form onSubmit={handleAddContact} className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Name *"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newContact.name}
                                        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Relationship *"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newContact.relationship}
                                        onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone *"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={newContact.phone}
                                        onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                    />
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={newContact.can_grant_access}
                                            onChange={e => setNewContact({ ...newContact, can_grant_access: e.target.checked })}
                                        />
                                        Can grant access on my behalf (emergencies)
                                    </label>
                                    <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                                        Add Contact
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={editForm.contact_number}
                                    onChange={e => setEditForm({ ...editForm, contact_number: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select
                                    className="w-full border rounded-lg p-2"
                                    value={editForm.blood_group}
                                    onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
                                >
                                    <option value="">Select Blood Group</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    rows="2"
                                    value={editForm.address}
                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (Optional)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    rows="2"
                                    value={editForm.allergies}
                                    onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                                    placeholder="e.g. Penicillin, Peanuts"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions (Optional)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    rows="2"
                                    value={editForm.chronic_conditions}
                                    onChange={e => setEditForm({ ...editForm, chronic_conditions: e.target.value })}
                                    placeholder="e.g. Diabetes, Hypertension"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
