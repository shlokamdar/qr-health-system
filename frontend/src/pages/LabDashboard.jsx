import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import labService from '../services/lab.service';
import {
    ArrowLeftOnRectangleIcon,
    DocumentArrowUpIcon,
    BeakerIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Skeleton from '../components/Skeleton';

const LabDashboard = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('upload');
    const [patientHealthId, setPatientHealthId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientVerified, setPatientVerified] = useState(false);
    const [selectedTest, setSelectedTest] = useState('');
    const [file, setFile] = useState(null);
    const [comments, setComments] = useState('');
    const [labTests, setLabTests] = useState([]);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
    const [uploading, setUploading] = useState(false);
    const [verifyingPatient, setVerifyingPatient] = useState(false);
    const [recentUploads, setRecentUploads] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTests();
        fetchRecentUploads();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await labService.getTests();
            setLabTests(response.data);
        } catch (err) {
            console.warn("Could not fetch tests, using defaults");
            setLabTests([
                { id: 1, name: 'Complete Blood Count (CBC)' },
                { id: 2, name: 'Lipid Profile' },
                { id: 3, name: 'Thyroid Function Test' },
                { id: 4, name: 'Urinalysis' },
                { id: 5, name: 'COVID-19 RT-PCR' }
            ]);
        }
    };

    const fetchRecentUploads = async () => {
        setLoadingRecent(true);
        try {
            const response = await labService.getRecentUploads();
            setRecentUploads(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch recent uploads", err);
        } finally {
            setLoadingRecent(false);
        }
    };

    const filteredHistory = recentUploads.filter(report =>
        report.patient_health_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.test_type?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.comments?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const verifyPatient = async () => {
        if (!patientHealthId) return;
        setVerifyingPatient(true);
        setPatientName('');
        setPatientVerified(false);
        setUploadStatus({ type: '', message: '' });

        try {
            const response = await labService.searchPatient(patientHealthId);
            const p = response.data;
            const name = p.user?.first_name ? `${p.user.first_name} ${p.user.last_name}` : p.user?.username || 'Unknown';
            setPatientName(name);
            setPatientVerified(true);
            setUploadStatus({ type: 'success', message: `Patient Found: ${name}` });
        } catch (err) {
            console.error(err);
            setUploadStatus({ type: 'error', message: 'Patient not found. Check Health ID.' });
            setPatientVerified(false);
        }
        setVerifyingPatient(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!patientVerified) {
            setUploadStatus({ type: 'error', message: 'Please verify patient first.' });
            return;
        }

        setUploading(true);
        setUploadStatus({ type: '', message: '' });

        try {
            const patientRes = await labService.searchPatient(patientHealthId);
            const patientId = patientRes.data.id;

            const formData = new FormData();
            formData.append('patient', patientId);
            formData.append('test_type', selectedTest);
            if (file) formData.append('file', file);
            formData.append('comments', comments);

            await labService.uploadReport(formData);

            setUploadStatus({ type: 'success', message: 'Report uploaded successfully!' });
            setPatientHealthId('');
            setPatientName('');
            setPatientVerified(false);
            setFile(null);
            setComments('');
            setSelectedTest('');
            fetchRecentUploads();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.detail || 'Upload failed. Check inputs and try again.';
            setUploadStatus({ type: 'error', message: errMsg });
        }
        setUploading(false);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Lab Technician Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage patient lab reports and digital record uploads.</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm mb-8 p-1 flex w-fit border border-gray-200">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upload' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <DocumentArrowUpIcon className="h-5 w-5" />
                        New Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <ClockIcon className="h-5 w-5" />
                        Upload History
                    </button>
                </div>

                {activeTab === 'upload' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Upload Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <BeakerIcon className="h-6 w-6 text-purple-600" />
                                        Upload Lab Report
                                    </h2>
                                </div>

                                <div className="p-6">
                                    {uploadStatus.message && (
                                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                            {uploadStatus.type === 'success' ?
                                                <CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" /> :
                                                <XCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            }
                                            <div className="text-sm font-bold">{uploadStatus.message}</div>
                                        </div>
                                    )}

                                    <form onSubmit={handleUpload} className="space-y-6">
                                        <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Patient Health ID Verification</label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-grow">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 py-3 shadow-sm"
                                                        placeholder="Enter Health ID (e.g. HID-123456)"
                                                        value={patientHealthId}
                                                        onChange={(e) => {
                                                            setPatientHealthId(e.target.value);
                                                            setPatientVerified(false);
                                                            setPatientName('');
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={verifyPatient}
                                                    disabled={verifyingPatient || !patientHealthId}
                                                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
                                                >
                                                    {verifyingPatient ? 'Checking...' : 'Verify Patient'}
                                                </button>
                                            </div>
                                            {patientName && (
                                                <div className="mt-3 text-sm text-green-700 font-bold flex items-center gap-1.5 bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    Identity Confirmed: {patientName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Diagnostic Test Type</label>
                                                <select
                                                    required
                                                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-xl shadow-sm cursor-pointer"
                                                    value={selectedTest}
                                                    onChange={(e) => setSelectedTest(e.target.value)}
                                                >
                                                    <option value="">Choose a test category...</option>
                                                    {labTests.map(test => (
                                                        <option key={test.id} value={test.id}>{test.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Result (PDF/Image)</label>
                                                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all p-4 text-center">
                                                    <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mb-1" />
                                                    <p className="text-sm text-gray-600 font-semibold">{file ? file.name : 'Select or drop report file'}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">MAX 10MB • SECURE ENCRYPTION</p>
                                                    <input id="file-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Technician Comments / Key Findings</label>
                                            <textarea
                                                rows={3}
                                                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-xl p-4"
                                                placeholder="Enter a brief summary of the findings..."
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={uploading || !patientVerified || !file || !selectedTest}
                                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-95 uppercase tracking-wide"
                                        >
                                            {uploading ? 'Processing Secure Upload...' : 'Commit Report to Blockchain Record'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Quick Stats */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Statistics</h3>
                                <div className="space-y-4">
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-purple-600 font-bold uppercase">Total Uploads</p>
                                            <p className="text-2xl font-black text-gray-900">{recentUploads.length}</p>
                                        </div>
                                        <DocumentArrowUpIcon className="h-8 w-8 text-purple-200" />
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-green-600 font-bold uppercase">Patients Verified</p>
                                            <p className="text-2xl font-black text-gray-900">{new Set(recentUploads.map(r => r.patient)).size}</p>
                                        </div>
                                        <CheckCircleIcon className="h-8 w-8 text-green-200" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quick History</h3>
                                    <button onClick={() => setActiveTab('history')} className="text-xs text-purple-600 font-bold hover:underline">View All</button>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                                    {recentUploads.slice(0, 5).map((report) => (
                                        <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-gray-900">{report.test_type?.name}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">PID: {report.patient_health_id}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* History View */
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ClockIcon className="h-6 w-6 text-purple-600" />
                                Report History
                            </h2>
                            <div className="relative max-w-sm w-full">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Patient ID, Test, or Comments..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">Date & Time</th>
                                        <th className="px-6 py-4 text-left">Patient Health ID</th>
                                        <th className="px-6 py-4 text-left">Test Type</th>
                                        <th className="px-6 py-4 text-left">Findings</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredHistory.map((report) => (
                                        <tr key={report.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="font-semibold">{new Date(report.created_at).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-gray-400">{new Date(report.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                                                {report.patient_health_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {report.test_type?.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={report.comments}>
                                                {report.comments || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                                                    Recorded
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <a
                                                    href={report.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-600 hover:text-purple-900 font-bold bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
                                                >
                                                    View Report
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No matching reports found in your upload history.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LabDashboard;
