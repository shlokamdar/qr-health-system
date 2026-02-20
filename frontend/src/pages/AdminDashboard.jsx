import React, { useState, useEffect, useContext } from 'react';
import {
    Activity, Users, Building2, FlaskConical, FileText, CheckCircle,
    XCircle, Clock, LogOut, ChevronRight, ShieldCheck, BarChart3,
    AlertTriangle, Search, X, MessageSquare, Eye, ExternalLink,
    Phone, MapPin, Calendar, Award, Stethoscope, User2, Building
} from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ doctor, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Reject Doctor Registration</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    You are rejecting <span className="font-semibold text-gray-900">
                        {doctor?.user?.first_name} {doctor?.user?.last_name}
                    </span>'s registration. Please provide a reason that will be visible to the doctor.
                </p>
                <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={4}
                        placeholder="e.g. License number could not be verified. Please resubmit with a clearer scan of your medical council certificate."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => reason.trim() && onConfirm(reason)}
                        disabled={!reason.trim()}
                        className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <XCircle className="w-4 h-4" /> Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Doctor Profile Drawer ────────────────────────────────────────────────────
const DoctorProfileDrawer = ({ doctor, onClose }) => {
    if (!doctor) return null;

    const DocLink = ({ url, label, icon: Icon }) => {
        if (!url) return (
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                <Icon className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-400">{label} — Not uploaded</span>
            </div>
        );
        return (
            <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group">
                <Icon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 flex-1">{label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 transition-colors" />
            </a>
        );
    };

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm text-gray-800 font-medium mt-0.5">{value || <span className="text-gray-400 italic">Not provided</span>}</p>
            </div>
        </div>
    );

    const u = doctor.user || {};
    const h = doctor.hospital_details;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="bg-[#0D1B2A] text-white px-6 py-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-base">Dr. {u.first_name} {u.last_name}</p>
                            <p className="text-xs text-white/60">{doctor.specialization}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 px-6 py-5 space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        {doctor.is_verified
                            ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                            : doctor.rejection_reason
                                ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> Rejected</span>
                                : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Review</span>
                        }
                        <span className="text-xs text-gray-400">Registered {new Date(doctor.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Rejection reason */}
                    {doctor.rejection_reason && !doctor.is_verified && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-800">{doctor.rejection_reason}</p>
                        </div>
                    )}

                    {/* Contact & Personal */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Details</p>
                        <div className="space-y-3">
                            <InfoRow icon={User2} label="Full Name" value={`${u.first_name || ''} ${u.last_name || ''}`.trim()} />
                            <InfoRow icon={FileText} label="Email" value={u.email} />
                            <InfoRow icon={Phone} label="Contact" value={doctor.contact_number} />
                            <InfoRow icon={Calendar} label="Date of Birth" value={doctor.date_of_birth} />
                            <InfoRow icon={MapPin} label="Address" value={doctor.address} />
                        </div>
                    </div>

                    {/* Professional */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Professional Details</p>
                        <div className="space-y-3">
                            <InfoRow icon={Award} label="License Number" value={doctor.license_number} />
                            <InfoRow icon={Building} label="Issuing Council" value={doctor.issuing_medical_council} />
                            <InfoRow icon={Calendar} label="License Expiry" value={doctor.license_expiry_date} />
                            <InfoRow icon={Stethoscope} label="Specialization" value={doctor.specialization} />
                            <InfoRow icon={Activity} label="Years of Experience" value={doctor.years_of_experience ? `${doctor.years_of_experience} years` : null} />
                            <InfoRow icon={Building2} label="Hospital" value={h ? h.name : 'Independent Practice'} />
                        </div>
                    </div>

                    {/* Documents */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Uploaded Documents</p>
                        <div className="space-y-2">
                            <DocLink url={doctor.license_document_url} label="Medical License" icon={Award} />
                            <DocLink url={doctor.degree_certificate_url} label="Degree Certificate" icon={FileText} />
                            <DocLink url={doctor.identity_proof_url} label="Identity Proof" icon={User2} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ verified, rejected }) => {
    if (rejected) return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <XCircle className="w-3 h-3" /> Rejected
        </span>
    );
    if (verified) return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" /> Verified
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" /> Pending
        </span>
    );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [labs, setLabs] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([fetchStats(), fetchDoctors(), fetchHospitals(), fetchLabs(), fetchLogs()])
            .finally(() => setLoading(false));
    }, []);

    const fetchStats = async () => {
        try { const r = await api.get('admin/stats/'); setStats(r.data); } catch { }
    };
    const fetchDoctors = async () => {
        try { const r = await api.get('admin/doctors/'); setDoctors(r.data); } catch { }
    };
    const fetchHospitals = async () => {
        try { const r = await api.get('admin/hospitals/'); setHospitals(r.data); } catch { }
    };
    const fetchLabs = async () => {
        try { const r = await api.get('admin/labs/'); setLabs(r.data.results || r.data); } catch { }
    };
    const fetchLogs = async () => {
        try { const r = await api.get('audit/logs/'); setLogs(r.data.results || r.data); } catch { }
    };

    const handleVerifyDoctor = async (id) => {
        try {
            await api.patch(`admin/doctors/${id}/manage/`, { verify: true });
            fetchDoctors(); fetchStats();
        } catch { alert('Failed to verify doctor'); }
    };

    const handleRejectDoctor = async (id, reason) => {
        try {
            await api.patch(`admin/doctors/${id}/manage/`, { verify: false, rejection_reason: reason });
            setRejectTarget(null);
            fetchDoctors(); fetchStats();
        } catch { alert('Failed to reject doctor'); }
    };

    const handleVerifyHospital = async (id) => {
        try {
            await api.patch(`admin/hospitals/${id}/manage/`, { verify: true });
            fetchHospitals(); fetchStats();
        } catch { alert('Failed to verify hospital'); }
    };

    const handleVerifyLab = async (id) => {
        try {
            await api.patch(`admin/labs/${id}/manage/`, { verify: true });
            fetchLabs(); fetchStats();
        } catch { alert('Failed to verify lab'); }
    };

    const handleUpdateAuth = async (id, level) => {
        try {
            await api.patch(`admin/doctors/${id}/manage/`, { auth_level: level });
            fetchDoctors();
        } catch { alert('Failed to update authorization'); }
    };

    const handleLogout = () => { logout(); navigate('/system/login'); };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'doctors', label: 'Doctors', icon: Users, badge: stats?.pending_doctors },
        { id: 'hospitals', label: 'Hospitals', icon: Building2 },
        { id: 'labs', label: 'Labs', icon: FlaskConical },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
    ];

    const filteredDoctors = doctors.filter(d =>
        !search || `${d.user?.first_name} ${d.user?.last_name} ${d.license_number} ${d.specialization}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
            <div className="text-white text-center">
                <Activity className="w-10 h-10 mx-auto mb-3 animate-pulse text-[#3B9EE2]" />
                <p className="text-lg font-semibold">Loading PulseID Admin...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans">
            {rejectTarget && (
                <RejectModal
                    doctor={rejectTarget}
                    onConfirm={(reason) => handleRejectDoctor(rejectTarget.id, reason)}
                    onClose={() => setRejectTarget(null)}
                />)}
            {viewTarget && (
                <DoctorProfileDrawer
                    doctor={viewTarget}
                    onClose={() => setViewTarget(null)}
                />
            )}

            {/* Top Nav */}
            <header className="bg-[#0D1B2A] text-white px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-[#3B9EE2]" />
                    <div>
                        <span className="text-lg font-bold tracking-tight">PulseID</span>
                        <span className="ml-2 text-xs bg-[#3B9EE2]/20 text-[#3B9EE2] px-2 py-0.5 rounded-full font-medium">System Admin</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    id="admin-logout-btn"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage users, verify registrations, and monitor system health.</p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Patients', value: stats.total_patients, color: 'bg-blue-500', icon: Users },
                            { label: 'Total Doctors', value: stats.total_doctors, sub: `${stats.pending_doctors} pending`, subColor: 'text-amber-600', color: 'bg-emerald-500', icon: ShieldCheck },
                            { label: 'Hospitals', value: stats.total_hospitals, color: 'bg-purple-500', icon: Building2 },
                            { label: 'Labs', value: stats.total_labs, sub: `${stats.pending_labs} pending`, subColor: 'text-amber-600', color: 'bg-indigo-500', icon: FlaskConical },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-0.5">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value ?? '—'}</p>
                                    {stat.sub && <p className={`text-xs mt-1 font-medium ${stat.subColor}`}>{stat.sub}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                                className={`flex items-center gap-2 px-5 py-4 font-medium text-sm whitespace-nowrap transition-all relative outline-none ${activeTab === tab.id
                                    ? 'text-[#0D1B2A] border-b-2 border-[#0D1B2A] bg-gray-50/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Recent Audit Events</h3>
                                {logs.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">No audit events recorded yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {logs.slice(0, 10).map((log, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-8 h-8 bg-[#0D1B2A]/5 rounded-full flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800 font-medium truncate">{log.details || log.action}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {log.actor || 'System'} · {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DOCTORS TAB */}
                        {activeTab === 'doctors' && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/10 focus:border-[#0D1B2A]"
                                            placeholder="Search by name, license, specialization..."
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Doctor</th>
                                                <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">License / Specialty</th>
                                                <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hospital</th>
                                                <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                                <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Auth Level</th>
                                                <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredDoctors.map(doc => (
                                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3 pr-4">
                                                        <div className="font-semibold text-gray-900">
                                                            Dr. {doc.user?.first_name} {doc.user?.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">{doc.user?.email}</div>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <div className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded w-fit">{doc.license_number}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{doc.specialization}</div>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="text-xs text-gray-600">{doc.hospital_name || <span className="text-gray-400 italic">Independent</span>}</span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <StatusBadge verified={doc.is_verified} rejected={doc.rejection_reason && !doc.is_verified} />
                                                        {doc.rejection_reason && !doc.is_verified && (
                                                            <div className="flex items-start gap-1 mt-1.5 text-xs text-red-500 max-w-[160px]">
                                                                <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                                                <span className="leading-tight">{doc.rejection_reason}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <select
                                                            value={doc.authorization_level}
                                                            onChange={e => handleUpdateAuth(doc.id, e.target.value)}
                                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1B2A]"
                                                        >
                                                            {['BASIC', 'STANDARD', 'FULL'].map(l => (
                                                                <option key={l} value={l}>{l}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setViewTarget(doc)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> View
                                                            </button>
                                                            {!doc.is_verified && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleVerifyDoctor(doc.id)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setRejectTarget(doc)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {doc.is_verified && (
                                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Approved
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredDoctors.length === 0 && (
                                        <p className="text-center text-gray-400 py-10 text-sm">No doctors found.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* HOSPITALS TAB */}
                        {activeTab === 'hospitals' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {['Hospital', 'Registration No.', 'Contact', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {hospitals.map(h => (
                                            <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <div className="font-semibold text-gray-900">{h.name}</div>
                                                    <div className="text-xs text-gray-400">{h.address}</div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{h.registration_number}</span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="text-xs text-gray-600">{h.phone}</div>
                                                    <div className="text-xs text-gray-400">{h.email}</div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <StatusBadge verified={h.is_verified} />
                                                </td>
                                                <td className="py-3">
                                                    {!h.is_verified && (
                                                        <button
                                                            onClick={() => handleVerifyHospital(h.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Verify
                                                        </button>
                                                    )}
                                                    {h.is_verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {hospitals.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No hospitals registered yet.</p>}
                            </div>
                        )}

                        {/* LABS TAB */}
                        {activeTab === 'labs' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {['Lab Name', 'Accreditation No.', 'Contact', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {labs.map(lab => (
                                            <tr key={lab.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <div className="font-semibold text-gray-900">{lab.name}</div>
                                                    <div className="text-xs text-gray-400">{lab.address}</div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{lab.accreditation_number}</span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="text-xs text-gray-600">{lab.phone}</div>
                                                    <div className="text-xs text-gray-400">{lab.email}</div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <StatusBadge verified={lab.is_verified} />
                                                </td>
                                                <td className="py-3">
                                                    {!lab.is_verified && (
                                                        <button
                                                            onClick={() => handleVerifyLab(lab.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Verify
                                                        </button>
                                                    )}
                                                    {lab.is_verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {labs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No labs registered yet.</p>}
                            </div>
                        )}

                        {/* AUDIT LOGS TAB */}
                        {activeTab === 'audit' && (
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                                        <div className="w-8 h-8 bg-[#0D1B2A]/5 rounded-full flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{log.action}</p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">By: {log.actor || 'System'}</p>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No audit logs available.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
