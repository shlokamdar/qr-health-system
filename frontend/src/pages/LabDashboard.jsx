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
            // Filter only reports uploaded by this technician if the API returns all
            // Ideally backend filters it, but let's be safe if we reuse the endpoint
            setRecentUploads(response.data.results || response.data);
        } catch (err) {
            console.error("Failed to fetch recent uploads", err);
        } finally {
            setLoadingRecent(false);
        }
    };

    const verifyPatient = async () => {
        if (!patientHealthId) return;
        setVerifyingPatient(true);
        setPatientName('');
        setPatientVerified(false);
        setUploadStatus({ type: '', message: '' });

        try {
            const response = await labService.searchPatient(patientHealthId);
            const p = response.data;
            // Assuming the patient serializer returns user.first_name + last_name or similar
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
            // We need the patient's ID (primary key) for the upload, 
            // but the search might have given us the full object.
            // Let's assume we re-fetch or use the ID from the verification step if we stored it.
            // Actually, verifyPatient just verified existence. 
            // We can chain the call: search -> get ID -> upload.
            // Or cleaner: store the patient object in state.

            // Let's re-fetch to be safe or improve the flow. 
            // Better: verifyPatient stores the patient ID.

            // Re-fetching user ID for simplicity in this flow implementation
            const patientRes = await labService.searchPatient(patientHealthId);
            const patientId = patientRes.data.id;

            const formData = new FormData();
            formData.append('patient', patientId);
            formData.append('test_type', selectedTest);
            if (file) formData.append('file', file);
            formData.append('comments', comments);

            await labService.uploadReport(formData);

            setUploadStatus({ type: 'success', message: 'Report uploaded successfully!' });
            // Reset form
            setPatientHealthId('');
            setPatientName('');
            setPatientVerified(false);
            setFile(null);
            setComments('');
            setSelectedTest('');

            // Refresh recent list
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

                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Lab Technician Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage lab reports and uploads.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Upload Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden border border-white/20">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <DocumentArrowUpIcon className="h-6 w-6 text-purple-600" />
                                    Upload New Report
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
                                        <div className="text-sm font-medium">{uploadStatus.message}</div>
                                    </div>
                                )}

                                <form onSubmit={handleUpload} className="space-y-6">
                                    {/* Patient Lookup */}
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Health ID</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 py-2.5"
                                                    placeholder="e.g. HID-123456"
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
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                                            >
                                                {verifyingPatient ? 'Checking...' : 'Verify'}
                                            </button>
                                        </div>
                                        {patientName && (
                                            <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                                                <CheckCircleIcon className="h-4 w-4" />
                                                Verified: {patientName}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Test Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
                                            <select
                                                required
                                                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg"
                                                value={selectedTest}
                                                onChange={(e) => setSelectedTest(e.target.value)}
                                            >
                                                <option value="">Select a test...</option>
                                                {labTests.map(test => (
                                                    <option key={test.id} value={test.id}>{test.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Report File</label>
                                            <div className="flex items-center justify-center w-full">
                                                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-purple-400 transition-all">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                                                    </div>
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => setFile(e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                            {file && (
                                                <p className="mt-2 text-sm text-purple-600 font-medium truncate">
                                                    Selected: {file.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Results Summary / Comments</label>
                                        <textarea
                                            rows={3}
                                            className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                                            placeholder="Enter key findings..."
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={uploading || !patientVerified || !file || !selectedTest}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01]"
                                        >
                                            {uploading ? 'Uploading...' : 'Submit Report'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Uploads & Stats */}
                    <div className="space-y-8">
                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 p-4 rounded-xl">
                                    <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Uploads</p>
                                    <p className="text-2xl font-bold text-gray-900">{recentUploads.length}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">-</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Uploads List */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-medium text-gray-900">Recent Uploads</h3>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                {loadingRecent ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex flex-col gap-2">
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-4 w-16 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : recentUploads.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No uploads yet today.
                                    </div>
                                ) : (
                                    recentUploads.map((report) => (
                                        <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {report.test_type?.name || 'Lab Test'}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center">
                                                    <ClockIcon className="h-3 w-3 mr-1" />
                                                    {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">
                                                Patient: {report.patient_health_id || 'Top Secret'}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LabDashboard;
