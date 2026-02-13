import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
    ArrowLeftOnRectangleIcon,
    DocumentArrowUpIcon,
    BeakerIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';

const LabDashboard = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('upload');
    const [patientHealthId, setPatientHealthId] = useState('');
    const [selectedTest, setSelectedTest] = useState('');
    const [file, setFile] = useState(null);
    const [comments, setComments] = useState('');
    const [labTests, setLabTests] = useState([]);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Mock fetch tests (or real if API ready)
        // For now, hardcode or fetch from an endpoint if we made one for listing tests
        const fetchTests = async () => {
            try {
                // If we created a List endpoint for LabTest, use it
                const response = await axios.get('http://localhost:8000/api/labs/tests/');
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
        fetchTests();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadStatus({ type: '', message: '' });

        // First find patient to get their ID (or just pass health_id if API supports it)
        // Our LabReportSerializer expects 'patient' object ID usually, or we can look it up.
        // Let's rely on finding the patient first.

        try {
            // Step 1: Lookup Patient
            const patientRes = await axios.get(`http://localhost:8000/api/patients/${patientHealthId}/`);
            const patientId = patientRes.data.id;

            // Step 2: Upload
            const formData = new FormData();
            formData.append('patient', patientId);
            formData.append('test_type', selectedTest);
            if (file) formData.append('file', file);
            formData.append('comments', comments);

            await axios.post('http://localhost:8000/api/labs/reports/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            setUploadStatus({ type: 'success', message: 'Report uploaded successfully!' });
            setPatientHealthId('');
            setFile(null);
            setComments('');
            setSelectedTest('');
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.detail || 'Upload failed. Check Health ID and try again.';
            setUploadStatus({ type: 'error', message: errMsg });
        }
        setUploading(false);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            {/* Navbar */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200 overflow-x-auto">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`${activeTab === 'upload'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <DocumentArrowUpIcon className="h-5 w-5" />
                                Upload Report
                            </button>
                            {/* Future: Add History Tab */}
                        </nav>
                    </div>

                    <div className="p-8">
                        {activeTab === 'upload' && (
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Patient Result</h2>

                                {uploadStatus.message && (
                                    <div className={`mb-6 p-4 rounded-md ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        <div className="flex items-center">
                                            {uploadStatus.type === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
                                            {uploadStatus.message}
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleUpload} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Patient Health ID</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                                placeholder="e.g. HID-123456"
                                                value={patientHealthId}
                                                onChange={(e) => setPatientHealthId(e.target.value)}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Enter the exact Health ID found on the patient's card/profile.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Test Type</label>
                                        <select
                                            required
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                                            value={selectedTest}
                                            onChange={(e) => setSelectedTest(e.target.value)}
                                        >
                                            <option value="">Select a test...</option>
                                            {labTests.map(test => (
                                                <option key={test.id} value={test.id}>{test.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Report File (PDF/Image)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={(e) => setFile(e.target.files[0])}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PDF, PNG, JPG up to 10MB
                                                </p>
                                                {file && (
                                                    <p className="text-sm text-purple-600 font-semibold">{file.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Comments / Result Summary</label>
                                        <div className="mt-1">
                                            <textarea
                                                rows={3}
                                                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                placeholder="Enter result summary or additional notes..."
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Submit Report'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LabDashboard;
