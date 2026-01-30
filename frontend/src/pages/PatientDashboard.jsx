import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const PatientDashboard = () => {
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('patients/me/');
                setPatient(res.data);
                const recs = await api.get('records/'); 
                setRecords(recs.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (!patient) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-2">My Health ID</h2>
                    <p className="text-4xl text-indigo-600 font-mono tracking-wider">{patient.health_id}</p>
                </div>
                {patient.qr_code && (
                    <div className="text-center">
                         <img src={patient.qr_code} alt="QR Code" className="w-48 h-48 border-4 border-gray-200" />
                         <p className="text-sm text-gray-500 mt-1">Scan to share records</p>
                    </div>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">My Medical Records</h3>
                {records.length === 0 ? (
                    <p className="text-gray-500">No records found.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {records.map(rec => (
                            <li key={rec.id} className="py-4">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-indigo-600">{rec.record_type}</p>
                                        <p className="text-lg font-semibold">{rec.title}</p>
                                        <p className="text-gray-500">{rec.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">Dr. {rec.doctor_details?.username} - {new Date(rec.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {rec.file && (
                                        <a href={rec.file} target="_blank" className="text-indigo-500 hover:text-indigo-700">View File</a>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;
