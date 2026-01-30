import React, { useState } from 'react';
import api from '../utils/api';

const DoctorDashboard = () => {
    const [searchId, setSearchId] = useState('');
    const [patientResult, setPatientResult] = useState(null);
    const [records, setRecords] = useState([]);
    
    // Upload Form State
    const [newRecord, setNewRecord] = useState({
        title: '',
        description: '',
        record_type: 'PRESCRIPTION',
        file: null
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`patients/${searchId}/`);
            setPatientResult(res.data);
            
            // If success, fetch records for this patient
            // Note: Our current API might need adjustment to list records FOR a patient ID as a doctor
            // The list endpoint default returns empty for doctors unless filtered?
            const recRes = await api.get(`records/?patient=${searchId}`);
            setRecords(recRes.data);
        } catch (err) {
            alert('Patient not found or Access Denied');
            setPatientResult(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if(!patientResult) return;

        const formData = new FormData();
        formData.append('patient', patientResult.id); // Model needs ID, not health_id usually in FK, but lets check serializer
        // PatientSerializer returns ID.
        // Wait, the Record model needs Patient ID (PK).
        // My patientResult has ID.
        
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
            // Refresh records
            const recRes = await api.get(`records/?patient=${searchId}`);
            setRecords(recRes.data);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Access Patient Records</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Scan or Enter Health ID" 
                        className="flex-1 border p-2 rounded"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Fetch</button>
                </form>
            </div>

            {patientResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4">Patient Profile</h3>
                        <p><strong>Health ID:</strong> {patientResult.health_id}</p>
                        <p><strong>Phone:</strong> {patientResult.contact_number}</p>
                        
                        <h4 className="font-bold mt-6 mb-2">Previous Records</h4>
                         <ul className="divide-y divide-gray-200 h-64 overflow-y-auto">
                            {records.map(rec => (
                                <li key={rec.id} className="py-2">
                                     <p className="font-semibold">{rec.title}</p>
                                     <p className="text-xs text-gray-500">{new Date(rec.created_at).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4">Add New Record</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <select 
                                className="w-full border p-2 rounded"
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
                                className="w-full border p-2 rounded"
                                value={newRecord.title}
                                onChange={e => setNewRecord({...newRecord, title: e.target.value})}
                            />
                            <textarea 
                                placeholder="Description" 
                                className="w-full border p-2 rounded"
                                value={newRecord.description}
                                onChange={e => setNewRecord({...newRecord, description: e.target.value})}
                            />
                            <input 
                                type="file" 
                                className="w-full"
                                onChange={e => setNewRecord({...newRecord, file: e.target.files[0]})}
                            />
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Upload Record</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
