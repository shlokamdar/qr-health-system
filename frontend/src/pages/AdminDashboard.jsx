import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchDoctors();
        fetchHospitals();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('admin/stats/');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get('admin/doctors/');
            setDoctors(res.data);
            if (activeTab === 'doctors') setLoading(false);
        } catch (err) {
            console.error("Failed to fetch doctors", err);
        }
    };

    const fetchHospitals = async () => {
        try {
            const res = await api.get('admin/hospitals/');
            setHospitals(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch hospitals", err);
            setLoading(false);
        }
    };

    const handleVerifyDoctor = async (id) => {
        try {
            await api.patch(`admin/doctors/${id}/manage/`, { verify: true });
            fetchDoctors();
            fetchStats();
            alert("Doctor verified successfully!");
        } catch (err) {
            alert("Failed to verify doctor");
        }
    };

    const handleVerifyHospital = async (id) => {
        try {
            await api.patch(`admin/hospitals/${id}/manage/`, { verify: true });
            fetchHospitals();
            fetchStats();
            alert("Hospital verified successfully!");
        } catch (err) {
            alert("Failed to verify hospital");
        }
    };

    const handleUpdateAuth = async (id, level) => {
        try {
            await api.patch(`admin/doctors/${id}/manage/`, { auth_level: level });
            fetchDoctors();
            alert(`Authorization updated to ${level}`);
        } catch (err) {
            alert("Failed to update authorization");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Superadmin Dashboard</h1>
                    <p className="text-gray-600">Overview of system health and verifications</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </header>

            {/* Stats Overview */}
            {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-semibold">Total Patients</h3>
                        <p className="text-3xl font-bold">{stats.total_patients}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-semibold">Total Doctors</h3>
                        <p className="text-3xl font-bold">{stats.total_doctors}</p>
                        <p className="text-xs text-orange-500 mt-1">{stats.pending_doctors} Pending</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                        <h3 className="text-gray-500 text-sm font-semibold">Total Hospitals</h3>
                        <p className="text-3xl font-bold">{stats.total_hospitals}</p>
                        <p className="text-xs text-orange-500 mt-1">{stats.pending_hospitals} Pending</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 text-sm font-semibold">Consultations</h3>
                        <p className="text-3xl font-bold">{stats.total_consultations}</p>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow mb-8">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('doctors')}
                        className={`px-6 py-3 font-medium ${activeTab === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                        Manage Doctors
                    </button>
                    <button
                        onClick={() => setActiveTab('hospitals')}
                        className={`px-6 py-3 font-medium ${activeTab === 'hospitals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                        Manage Hospitals
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'doctors' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">License</th>
                                        <th className="p-4 font-semibold">Hospital</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Auth Level</th>
                                        <th className="p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map((doc) => (
                                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-medium">Dr. {doc.user?.first_name} {doc.user?.last_name}</div>
                                                <div className="text-sm text-gray-500">{doc.user?.email}</div>
                                            </td>
                                            <td className="p-4">{doc.license_number}</td>
                                            <td className="p-4">{doc.hospital_details?.name || 'N/A'}</td>
                                            <td className="p-4">
                                                {doc.is_verified ? (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                                                ) : (
                                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={doc.authorization_level}
                                                    onChange={(e) => handleUpdateAuth(doc.id, e.target.value)}
                                                    className="border rounded p-1 text-sm bg-white"
                                                >
                                                    <option value="BASIC">BASIC</option>
                                                    <option value="STANDARD">STANDARD</option>
                                                    <option value="FULL">FULL</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                {!doc.is_verified && (
                                                    <button
                                                        onClick={() => handleVerifyDoctor(doc.id)}
                                                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'hospitals' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Reg. Number</th>
                                        <th className="p-4 font-semibold">Contact</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hospitals.map((hosp) => (
                                        <tr key={hosp.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-medium">{hosp.name}</div>
                                                <div className="text-sm text-gray-500">{hosp.address}</div>
                                            </td>
                                            <td className="p-4">{hosp.registration_number}</td>
                                            <td className="p-4">
                                                <div>{hosp.phone}</div>
                                                <div className="text-sm text-gray-500">{hosp.email}</div>
                                            </td>
                                            <td className="p-4">
                                                {hosp.is_verified ? (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                                                ) : (
                                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {!hosp.is_verified && (
                                                    <button
                                                        onClick={() => handleVerifyHospital(hosp.id)}
                                                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
