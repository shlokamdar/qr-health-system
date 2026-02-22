import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import labService from '../services/lab.service';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import {
    Search, Upload, Clock, User, Shield, Building2,
    FlaskConical, CheckCircle, XCircle,
    Activity, LogOut, AlertTriangle, ExternalLink
} from 'lucide-react';

const MEDIA_BASE = 'http://localhost:8000';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm flex items-center gap-4`}>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-[#0D1B2A]">{value}</p>
        </div>
    </div>
);

const LabDashboard = () => {
    const { logout } = useContext(AuthContext);

    // Core state
    const [activeTab, setActiveTab] = useState('upload');
    const [profile, setProfile] = useState(null);
    const [labTests, setLabTests] = useState([]);
    const [recentUploads, setRecentUploads] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);

    // Upload tab state
    const [patientHealthId, setPatientHealthId] = useState('');
    const [patientInfo, setPatientInfo] = useState(null);
    const [patientVerified, setPatientVerified] = useState(false);
    const [verifyingPatient, setVerifyingPatient] = useState(false);
    const [selectedTest, setSelectedTest] = useState('');
    const [file, setFile] = useState(null);
    const [comments, setComments] = useState('');
    const [uploading, setUploading] = useState(false);

    // Lookup tab state
    const [lookupId, setLookupId] = useState('');
    const [lookupResults, setLookupResults] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    // History tab state
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchTests();
        fetchRecentUploads();
    }, []);

    const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
            const data = await labService.getProfile();
            setProfile(data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchTests = async () => {
        try {
            const data = await labService.getTests();
            setLabTests(Array.isArray(data) ? data : data.results || []);
        } catch {
            setLabTests([
                { id: 1, name: 'Complete Blood Count (CBC)' },
                { id: 2, name: 'Lipid Profile' },
                { id: 3, name: 'Thyroid Function Test' },
                { id: 4, name: 'Urinalysis' },
                { id: 5, name: 'COVID-19 RT-PCR' },
            ]);
        }
    };

    const fetchRecentUploads = async () => {
        setLoadingRecent(true);
        try {
            const data = await labService.getRecentUploads();
            setRecentUploads(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error('Failed to fetch uploads', err);
        } finally {
            setLoadingRecent(false);
        }
    };

    // ── Upload tab handlers ──────────────────────────────────────────────
    const verifyPatient = async () => {
        if (!patientHealthId.trim()) return;
        setVerifyingPatient(true);
        setPatientInfo(null);
        setPatientVerified(false);
        try {
            const res = await labService.searchPatient(patientHealthId.trim());
            const p = res.data;
            setPatientInfo(p);
            setPatientVerified(true);
            toast.success(`Patient found: ${p.user?.first_name || p.user?.username}`);
        } catch {
            toast.error('Patient not found. Check Health ID.');
        } finally {
            setVerifyingPatient(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!patientVerified) { toast.error('Please verify patient first.'); return; }
        if (!file) { toast.error('Please attach a report file.'); return; }
        if (!selectedTest) { toast.error('Please select a test type.'); return; }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('patient', patientInfo.id);
            formData.append('test_type', selectedTest);
            formData.append('file', file);
            formData.append('comments', comments);
            await labService.uploadReport(formData);
            toast.success('Report uploaded successfully!');
            setPatientHealthId(''); setPatientInfo(null); setPatientVerified(false);
            setFile(null); setComments(''); setSelectedTest('');
            fetchRecentUploads();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // ── Patient Lookup tab handler ───────────────────────────────────────
    const handleLookup = async (e) => {
        e.preventDefault();
        if (!lookupId.trim()) return;
        setLookupLoading(true);
        setLookupResults(null);
        setLookupError('');
        try {
            const data = await labService.getPatientReports(lookupId.trim());
            setLookupResults(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            setLookupError(err.response?.status === 404
                ? 'No patient found with that Health ID.'
                : 'Failed to fetch patient reports. Please try again.');
        } finally {
            setLookupLoading(false);
        }
    };

    // ── Derived ──────────────────────────────────────────────────────────
    const filteredHistory = recentUploads.filter(r =>
        r.patient_health_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.test_type_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comments?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isVerified = profile?.is_verified;
    const firstName = profile?.user?.first_name || profile?.user?.username || 'Lab Tech';

    const tabs = [
        { id: 'upload', label: 'Upload Report', icon: Upload },
        { id: 'lookup', label: 'Patient Lookup', icon: Search },
        { id: 'history', label: 'Upload History', icon: Clock },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    // ── Loading ──────────────────────────────────────────────────────────
    if (loadingProfile) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-[#3B9EE2]/20 border-t-[#3B9EE2] animate-spin" />
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Loading Dashboard</p>
            </div>
        </div>
    );

    // ── Verification Gate ────────────────────────────────────────────────
    if (profile && !isVerified && activeTab !== 'profile') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] font-sans">
                <Header />
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-amber-100 border border-amber-100 p-12">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-[#0D1B2A] mb-2">Verification Pending</h2>
                        <p className="text-slate-500 font-bold mb-4">Hello, <span className="text-[#0D1B2A]">{firstName}</span>. Your account is under review by our admin team.</p>
                        <p className="text-slate-400 text-sm mb-8">License #<span className="font-mono font-bold text-[#0D1B2A]">{profile.license_number}</span> will be verified within 1–2 business days.</p>
                        {profile.rejection_reason && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 text-left">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Rejection Reason</p>
                                <p className="text-sm text-red-700 font-bold">{profile.rejection_reason}</p>
                            </div>
                        )}
                        <button onClick={() => setActiveTab('profile')} className="px-8 py-3 bg-[#0D1B2A] text-white font-black rounded-2xl hover:bg-[#1a2d42] transition-all">
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Ambient background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3B9EE2]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#2EC4A9]/5 rounded-full blur-[120px]" />
            </div>

            <Header />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <p className="text-[10px] font-black text-[#3B9EE2] uppercase tracking-[0.2em] mb-1">Lab Technician Portal</p>
                        <h1 className="text-4xl font-black text-[#0D1B2A] tracking-tight">
                            Hello, {firstName} 👋
                        </h1>
                        <p className="text-slate-400 font-bold mt-1 text-sm">{profile?.lab_name || 'Independent Practitioner'} • {isVerified ? '✓ Verified' : '⏳ Pending'}</p>
                    </div>
                    <button onClick={() => { logout(); }} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-500 font-black text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Uploads" value={recentUploads.length} icon={Upload} color="bg-[#3B9EE2]/10 text-[#3B9EE2]" />
                    <StatCard label="Unique Patients" value={new Set(recentUploads.map(r => r.patient)).size} icon={User} color="bg-[#2EC4A9]/10 text-[#2EC4A9]" />
                    <StatCard label="Today" value={recentUploads.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length} icon={Activity} color="bg-violet-100 text-violet-500" />
                    <StatCard label="Test Types" value={labTests.length} icon={FlaskConical} color="bg-amber-100 text-amber-600" />
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-[#0D1B2A]/5 border border-white/60 overflow-hidden">
                    {/* Tab Nav */}
                    <div className="hidden md:flex bg-slate-50/50 border-b border-slate-100 p-2 gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 px-4 rounded-2xl font-black transition-all duration-500 relative overflow-hidden ${isActive ? 'bg-white shadow-lg text-[#0D1B2A]' : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-[#3B9EE2]/10 text-[#3B9EE2]' : 'bg-slate-100 text-slate-300'}`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-[10px] tracking-[0.1em] uppercase hidden lg:inline">{tab.label}</span>
                                    </div>
                                    {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B9EE2] to-[#2EC4A9]" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile Tab Bar */}
                    <div className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-2xl z-50 px-2 py-2 gap-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all ${isActive ? 'text-[#3B9EE2]' : 'text-slate-400'}`}>
                                    <Icon size={20} />
                                    <span className="text-[8px] font-black uppercase tracking-wider">{tab.label.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-8 md:p-12">

                        {/* ── Upload Tab ─────────────────────────────────────── */}
                        {activeTab === 'upload' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Upload Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Upload Lab Report</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Securely commit diagnostic results to patient record</p>
                                    </div>

                                    <form onSubmit={handleUpload} className="space-y-6">
                                        {/* Patient Verify */}
                                        <div className="bg-[#3B9EE2]/5 border border-[#3B9EE2]/20 rounded-[1.5rem] p-6">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Patient Health ID Verification</label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-11 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-[#0D1B2A] focus:border-[#3B9EE2]/30 focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                                        placeholder="e.g. HID-123456"
                                                        value={patientHealthId}
                                                        onChange={e => { setPatientHealthId(e.target.value); setPatientVerified(false); setPatientInfo(null); }}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), verifyPatient())}
                                                    />
                                                </div>
                                                <button type="button" onClick={verifyPatient} disabled={verifyingPatient || !patientHealthId.trim()}
                                                    className="px-6 py-4 bg-[#3B9EE2] text-white font-black rounded-2xl hover:bg-[#2d7fc2] transition-all shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap text-sm">
                                                    {verifyingPatient ? 'Checking…' : 'Verify'}
                                                </button>
                                            </div>
                                            {patientInfo && (
                                                <div className="mt-3 flex items-center gap-3 bg-[#2EC4A9]/10 border border-[#2EC4A9]/20 rounded-xl px-4 py-3">
                                                    <CheckCircle className="w-5 h-5 text-[#2EC4A9] shrink-0" />
                                                    <div>
                                                        <p className="font-black text-[#0D1B2A] text-sm">{patientInfo.user?.first_name} {patientInfo.user?.last_name || ''}</p>
                                                        <p className="text-xs text-slate-500 font-bold">{patientInfo.health_id}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Test + File */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="group">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Test Type</label>
                                                <select
                                                    required
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                                    value={selectedTest}
                                                    onChange={e => setSelectedTest(e.target.value)}
                                                >
                                                    <option value="">Select test category…</option>
                                                    {labTests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="group">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Report File (PDF/Image)</label>
                                                <label htmlFor="report-file" className="flex flex-col items-center justify-center w-full h-[58px] border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-[#3B9EE2]/5 hover:border-[#3B9EE2]/30 transition-all px-4">
                                                    <div className="flex items-center gap-3 w-full">
                                                        <Upload className="w-5 h-5 text-slate-400 shrink-0" />
                                                        <span className="text-sm font-bold text-slate-400 truncate">{file ? file.name : 'Select file…'}</span>
                                                    </div>
                                                    <input id="report-file" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Comments */}
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Technician Notes / Key Findings</label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all placeholder:text-slate-300 resize-none"
                                                placeholder="Brief summary of findings…"
                                                value={comments}
                                                onChange={e => setComments(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={uploading || !patientVerified || !file || !selectedTest}
                                            className="w-full py-5 bg-gradient-to-r from-[#3B9EE2] to-[#2EC4A9] text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-[#3B9EE2]/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] uppercase tracking-widest text-sm"
                                        >
                                            {uploading ? 'Uploading…' : 'Commit Report to Patient Record'}
                                        </button>
                                    </form>
                                </div>

                                {/* Sidebar stats */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick History</h4>
                                        {recentUploads.length === 0 ? (
                                            <p className="text-slate-300 text-sm font-bold text-center py-4">No uploads yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {recentUploads.slice(0, 5).map(r => (
                                                    <div key={r.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                        <div className="w-8 h-8 bg-[#3B9EE2]/10 text-[#3B9EE2] rounded-xl flex items-center justify-center shrink-0">
                                                            <FlaskConical className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-black text-[#0D1B2A] text-xs truncate">{r.test_type_details?.name || '—'}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold font-mono">{r.patient_health_id}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button onClick={() => setActiveTab('history')} className="mt-4 w-full text-[10px] font-black text-[#3B9EE2] uppercase tracking-widest hover:underline">
                                            View All History →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Patient Lookup Tab ─────────────────────────────── */}
                        {activeTab === 'lookup' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Patient Lookup</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">View a patient's complete lab report history</p>
                                </div>

                                <form onSubmit={handleLookup} className="flex gap-3 max-w-xl">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Enter Patient Health ID…"
                                            value={lookupId}
                                            onChange={e => { setLookupId(e.target.value); setLookupResults(null); setLookupError(''); }}
                                        />
                                    </div>
                                    <button type="submit" disabled={lookupLoading || !lookupId.trim()}
                                        className="px-8 py-4 bg-[#0D1B2A] text-white font-black rounded-2xl hover:bg-[#1a2d42] transition-all disabled:opacity-50 active:scale-95 text-sm">
                                        {lookupLoading ? 'Searching…' : 'Search'}
                                    </button>
                                </form>

                                {lookupError && (
                                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 max-w-xl">
                                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        <p className="text-sm font-bold text-red-600">{lookupError}</p>
                                    </div>
                                )}

                                {lookupResults !== null && (
                                    lookupResults.length === 0 ? (
                                        <div className="bg-slate-50 rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200 max-w-2xl">
                                            <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No lab reports found for this patient</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lookupResults.length} report{lookupResults.length !== 1 ? 's' : ''} found</p>
                                            {lookupResults.map(r => (
                                                <div key={r.id} className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#3B9EE2]/10 text-[#3B9EE2] rounded-2xl flex items-center justify-center shrink-0">
                                                        <FlaskConical className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-[#0D1B2A] text-lg">{r.test_type_details?.name || '—'}</p>
                                                        <p className="text-xs text-slate-400 font-bold">{new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        {r.comments && <p className="text-sm text-slate-500 mt-1 truncate">{r.comments}</p>}
                                                    </div>
                                                    {r.file && (
                                                        <a href={r.file.startsWith('http') ? r.file : `${MEDIA_BASE}${r.file}`} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#3B9EE2]/10 text-[#3B9EE2] font-black text-xs rounded-xl hover:bg-[#3B9EE2] hover:text-white transition-all shrink-0">
                                                            <ExternalLink className="w-4 h-4" /> View Report
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* ── History Tab ────────────────────────────────────── */}
                        {activeTab === 'history' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black text-[#0D1B2A] tracking-tight">Upload History</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">All reports uploaded by you</p>
                                    </div>
                                    <div className="relative max-w-sm w-full">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search Health ID, test, notes…"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-[#0D1B2A] focus:bg-white focus:border-[#3B9EE2]/20 focus:outline-none transition-all placeholder:text-slate-300 text-sm"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {loadingRecent ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-10 h-10 rounded-full border-4 border-[#3B9EE2]/20 border-t-[#3B9EE2] animate-spin" />
                                    </div>
                                ) : filteredHistory.length === 0 ? (
                                    <div className="bg-slate-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-200">
                                        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">
                                            {searchQuery ? 'No matching reports found' : 'No uploads yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-[1.5rem] border border-slate-100">
                                        <table className="min-w-full divide-y divide-slate-100">
                                            <thead className="bg-slate-50/50">
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <th className="px-6 py-4 text-left">Date</th>
                                                    <th className="px-6 py-4 text-left">Patient</th>
                                                    <th className="px-6 py-4 text-left">Test</th>
                                                    <th className="px-6 py-4 text-left">Notes</th>
                                                    <th className="px-6 py-4 text-right">Report</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 bg-white">
                                                {filteredHistory.map(r => (
                                                    <tr key={r.id} className="hover:bg-[#3B9EE2]/3 transition-colors group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className="font-black text-[#0D1B2A] text-sm">{new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className="font-black text-[#0D1B2A] text-sm">{r.patient_name || '—'}</p>
                                                            <p className="text-[10px] font-mono text-[#3B9EE2] font-bold">{r.patient_health_id}</p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3B9EE2]/10 text-[#3B9EE2] font-black text-xs rounded-full">
                                                                <FlaskConical className="w-3 h-3" />
                                                                {r.test_type_details?.name || '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate font-bold" title={r.comments}>
                                                            {r.comments || <span className="text-slate-300">—</span>}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            {r.file ? (
                                                                <a href={r.file.startsWith('http') ? r.file : `${MEDIA_BASE}${r.file}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B9EE2]/10 text-[#3B9EE2] font-black text-xs rounded-xl hover:bg-[#3B9EE2] hover:text-white transition-all">
                                                                    <ExternalLink className="w-3.5 h-3.5" /> View
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-300 text-xs font-bold">No file</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Profile Tab ────────────────────────────────────── */}
                        {activeTab === 'profile' && (
                            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Profile hero */}
                                <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a3a5c] rounded-[2rem] p-8 text-white mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <User className="w-10 h-10 text-white/60" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black">{profile?.user?.first_name} {profile?.user?.last_name}</h2>
                                            <p className="text-white/60 font-bold">@{profile?.user?.username} · Lab Technician</p>
                                            <div className="mt-2">
                                                {isVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2EC4A9]/20 text-[#2EC4A9] font-black text-xs rounded-full border border-[#2EC4A9]/30">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 font-black text-xs rounded-full border border-amber-500/30">
                                                        <Clock className="w-3.5 h-3.5" /> Pending Verification
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Professional Info */}
                                    <div className="bg-slate-50/50 rounded-[2rem] p-7 border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5" /> Professional Info
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">License Number</p>
                                                <p className="font-black text-[#0D1B2A] font-mono">{profile?.license_number || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Role</p>
                                                <p className="font-black text-[#0D1B2A]">Laboratory Technician</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Account Status</p>
                                                <p className={`font-black ${isVerified ? 'text-[#2EC4A9]' : 'text-amber-500'}`}>
                                                    {isVerified ? 'Active & Verified' : 'Pending Verification'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="bg-slate-50/50 rounded-[2rem] p-7 border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                            <User className="w-3.5 h-3.5" /> Contact Details
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email</p>
                                                <p className="font-black text-[#0D1B2A]">{profile?.user?.email || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Joined</p>
                                                <p className="font-black text-[#0D1B2A]">
                                                    {profile?.user?.date_joined ? new Date(profile.user.date_joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lab Affiliation */}
                                    <div className="md:col-span-2 bg-[#0D1B2A]/5 rounded-[2rem] p-7 border border-[#0D1B2A]/10">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5" /> Affiliated Laboratory
                                        </h4>
                                        {profile?.lab_details ? (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Lab Name</p>
                                                        <p className="font-black text-[#0D1B2A] text-xl">{profile.lab_details.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Accreditation</p>
                                                        <p className="font-mono font-bold text-[#0D1B2A]">{profile.lab_details.accreditation_number}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    {profile.lab_details.hospital_details && (
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Parent Hospital</p>
                                                            <p className="font-black text-[#3B9EE2]">{profile.lab_details.hospital_details.name}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Lab Status</p>
                                                        <p className={`font-black ${profile.lab_details.is_verified ? 'text-[#2EC4A9]' : 'text-amber-500'}`}>
                                                            {profile.lab_details.is_verified ? 'Accredited' : 'Pending Accreditation'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="font-black text-slate-400 text-lg">Independent Practitioner</p>
                                        )}
                                    </div>
                                </div>

                                {profile?.rejection_reason && (
                                    <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-6">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Rejection Reason</p>
                                        <p className="font-bold text-red-700">{profile.rejection_reason}</p>
                                        <p className="text-xs text-red-400 font-bold mt-2">Please contact support or update your credentials to reapply.</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default LabDashboard;
