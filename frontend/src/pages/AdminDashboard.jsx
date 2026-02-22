import React, { useState, useEffect, useContext } from 'react';
import {
    Phone, MapPin, Calendar, Award, Stethoscope, User2, Building, Heart, Plus, UserPlus, Link2, LifeBuoy, MoreVertical,
    X, ExternalLink, Activity, CheckCircle, Clock, FlaskConical, ShieldCheck, Eye, XCircle, Search, ChevronRight, MessageSquare, BarChart3, LogOut, Building2, Users, FileText
} from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';

// ─── Reject Modal ─────────────────────────────────────────────────────────────
// ─── Universal Reject Modal ───────────────────────────────────────────────────
const GenericRejectModal = ({ title, entityName, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    You are rejecting <span className="font-semibold text-gray-900">{entityName}</span>. Please provide a reason.
                </p>
                <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={4}
                        placeholder="Provide details for the rejection..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none font-medium"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => reason.trim() && onConfirm(reason)}
                        disabled={!reason.trim()}
                        className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        Confirm Rejection
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

// ─── Support Ticket Resolution Modal ──────────────────────────────────────────
const SupportTicketResolutionModal = ({ isOpen, onClose, ticket, onConfirm }) => {
    const [notes, setNotes] = useState('');
    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Resolve Ticket</h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                    <p className="text-sm font-medium text-gray-800">{ticket.subject}</p>
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Resolution Notes</label>
                    <textarea
                        required
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Explain how the issue was resolved..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none font-medium"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={() => notes.trim() && onConfirm(notes)}
                        disabled={!notes.trim()}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        Resolve Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────
const AssignModal = ({ isOpen, onClose, type, institutions, onConfirm }) => {
    const [search, setSearch] = useState('');
    if (!isOpen) return null;

    const filtered = institutions.filter(inst =>
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        (inst.registration_number || inst.accreditation_number || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Assign {type === 'doctor' ? 'Hospital' : 'Lab'}</h3>
                        <p className="text-xs text-gray-500 mt-1">Select an organization to link this user to.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/10 focus:border-[#0D1B2A]/30"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8">
                            <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No organizations found</p>
                        </div>
                    ) : (
                        filtered.map(inst => (
                            <button
                                key={inst.id}
                                onClick={() => onConfirm(inst.id)}
                                className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{inst.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{inst.registration_number || inst.accreditation_number}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Create User Modal ────────────────────────────────────────────────────────
const CreateUserModal = ({ isOpen, onClose, hospitals, labs, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'PATIENT',
        first_name: '',
        last_name: '',
        profile_data: {}
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('accounts/admin/create-user/', formData);
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'PATIENT', label: 'Patient', icon: User2 },
        { value: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
        { value: 'LAB_TECH', label: 'Lab Technician', icon: FlaskConical },
        { value: 'HOSPITAL_ADMIN', label: 'Hospital Admin', icon: ShieldCheck },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Add New System User</h3>
                            <p className="text-sm text-gray-500">Create a new account manually. Users created here are pre-verified.</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto leading-relaxed">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">User Role</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {roles.map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r.value })}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === r.value
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <r.icon className="w-5 h-5" />
                                        <span className="text-xs font-bold">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Account Info</label>
                                <input
                                    required
                                    placeholder="Username"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                                <input
                                    required
                                    type="password"
                                    placeholder="Temporary Password"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm mt-3 focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <input
                                    required
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm mt-3 focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Personal Info</label>
                                <input
                                    required
                                    placeholder="First Name"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                />
                                <input
                                    required
                                    placeholder="Last Name"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm mt-3 focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        {formData.role === 'DOCTOR' && (
                            <div className="md:col-span-2 bg-blue-50 px-4 py-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                                    <Stethoscope className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-blue-900">Assign to Hospital</p>
                                    <select
                                        className="w-full bg-transparent border-none text-sm text-blue-700 font-medium focus:ring-0 p-0"
                                        onChange={e => setFormData({ ...formData, profile_data: { ...formData.profile_data, hospital_id: e.target.value } })}
                                    >
                                        <option value="">Independent Practice</option>
                                        {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {formData.role === 'LAB_TECH' && (
                            <div className="md:col-span-2 bg-purple-50 px-4 py-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                                    <FlaskConical className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-purple-900">Affiliate with Laboratory</p>
                                    <select
                                        required
                                        className="w-full bg-transparent border-none text-sm text-purple-700 font-medium focus:ring-0 p-0"
                                        onChange={e => setFormData({ ...formData, profile_data: { ...formData.profile_data, lab: e.target.value } })}
                                    >
                                        <option value="">Select Lab</option>
                                        {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 flex gap-3 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:border-gray-300 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-[#0D1B2A] text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create User Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
    const [techs, setTechs] = useState([]);
    const [donors, setDonors] = useState([]);
    const [logs, setLogs] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Entity Modal States
    const [rejectTarget, setRejectTarget] = useState(null); // { type: 'doctor'|'lab'|'tech'|'donor', data: object }
    const [viewTarget, setViewTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null); // { type: 'doctor'|'tech', data: object }
    const [ticketTarget, setTicketTarget] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            fetchStats(), fetchDoctors(), fetchHospitals(),
            fetchLabs(), fetchLogs(), fetchDonors(), fetchTechs(), fetchTickets(), fetchUsers()
        ]).finally(() => setLoading(false));
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
    const fetchDonors = async () => {
        try { const r = await api.get('patients/organ-donor-requests/'); setDonors(r.data); } catch { }
    };
    const fetchTechs = async () => {
        try { const r = await api.get('labs/admin/technicians/'); setTechs(r.data.results || r.data); } catch { }
    };
    const fetchTickets = async () => {
        try { const r = await api.get('support/tickets/'); setTickets(r.data.results || r.data); } catch { }
    };
    const fetchUsers = async () => {
        try { const r = await api.get('accounts/admin/users/'); setUsers(r.data.results || r.data); } catch { }
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

    const handleRejectLab = async (id, reason) => {
        try {
            await api.patch(`admin/labs/${id}/manage/`, { verify: false, rejection_reason: reason });
            setRejectTarget(null);
            fetchLabs(); fetchStats();
        } catch { alert('Failed to reject lab'); }
    };

    const handleVerifyTech = async (id) => {
        try {
            await api.patch(`labs/admin/technicians/${id}/verify/`, { verify: true });
            fetchTechs(); fetchStats();
        } catch { alert('Failed to verify technician'); }
    };

    const handleRejectTech = async (id, reason) => {
        try {
            await api.patch(`labs/admin/technicians/${id}/verify/`, { verify: false, rejection_reason: reason });
            setRejectTarget(null);
            fetchTechs(); fetchStats();
        } catch { alert('Failed to reject technician'); }
    };

    const handleUpdateAuth = async (id, level) => {
        try {
            await api.patch(`admin/doctors/${id}/manage/`, { auth_level: level });
            fetchDoctors();
        } catch { alert('Failed to update authorization'); }
    };

    const handleVerifyDonor = async (healthId) => {
        try {
            await api.post(`patients/${healthId}/verify-organ-donor/`, { verify: true });
            fetchDonors();
        } catch { alert('Failed to verify donor'); }
    };

    const handleRejectDonor = async (healthId, reason) => {
        try {
            await api.post(`patients/${healthId}/verify-organ-donor/`, { verify: false, rejection_reason: reason });
            setRejectTarget(null);
            fetchDonors();
        } catch { alert('Failed to reject donor'); }
    };

    const handleAssignInstitution = async (id, instId) => {
        try {
            const endpoint = assignTarget.type === 'doctor'
                ? `admin/doctors/${id}/manage/`
                : `labs/admin/technicians/${id}/verify/`;
            const payload = assignTarget.type === 'doctor' ? { hospital: instId } : { lab: instId };

            await api.patch(endpoint, payload);
            assignTarget.type === 'doctor' ? fetchDoctors() : fetchTechs();
            setAssignTarget(null);
        } catch { alert('Assignment failed'); }
    };

    const handleUpdateTicketStatus = async (ticketId, status, notes) => {
        try {
            await api.post(`support/tickets/${ticketId}/update_status/`, { status, admin_notes: notes });
            fetchTickets();
        } catch { alert('Failed to update ticket'); }
    };

    const handleLogout = () => { logout(); navigate('/system/login'); };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'doctors', label: 'Doctors', icon: Users, badge: stats?.pending_doctors },
        { id: 'donors', label: 'Donors', icon: Heart, badge: donors.length },
        { id: 'hospitals', label: 'Hospitals', icon: Building2 },
        { id: 'labs', label: 'Labs', icon: FlaskConical, badge: stats?.pending_labs },
        { id: 'techs', label: 'Technicians', icon: Users, badge: techs.filter(t => !t.is_verified && !t.rejection_reason).length },
        { id: 'users', label: 'Users', icon: User2 },
        { id: 'tickets', label: 'Support', icon: LifeBuoy, badge: tickets.filter(t => t.status === 'OPEN').length },
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
            {rejectTarget?.type === 'doctor' && (
                <GenericRejectModal
                    title="Reject Doctor Registration"
                    entityName={`Dr. ${rejectTarget.data.user?.first_name} ${rejectTarget.data.user?.last_name}`}
                    onConfirm={(reason) => handleRejectDoctor(rejectTarget.data.id, reason)}
                    onClose={() => setRejectTarget(null)}
                />
            )}
            {rejectTarget?.type === 'donor' && (
                <GenericRejectModal
                    title="Reject Donor status"
                    entityName={`${rejectTarget.data.user?.first_name} ${rejectTarget.data.user?.last_name}`}
                    onConfirm={(reason) => handleRejectDonor(rejectTarget.data.health_id, reason)}
                    onClose={() => setRejectTarget(null)}
                />
            )}
            {rejectTarget?.type === 'lab' && (
                <GenericRejectModal
                    title="Reject Lab Registration"
                    entityName={rejectTarget.data.name}
                    onConfirm={(reason) => handleRejectLab(rejectTarget.data.id, reason)}
                    onClose={() => setRejectTarget(null)}
                />
            )}
            {rejectTarget?.type === 'tech' && (
                <GenericRejectModal
                    title="Reject Technician Registration"
                    entityName={`${rejectTarget.data.user?.first_name} ${rejectTarget.data.user?.last_name}`}
                    onConfirm={(reason) => handleRejectTech(rejectTarget.data.id, reason)}
                    onClose={() => setRejectTarget(null)}
                />
            )}

            {assignTarget && (
                <AssignModal
                    isOpen={!!assignTarget}
                    onClose={() => setAssignTarget(null)}
                    type={assignTarget.type}
                    institutions={assignTarget.type === 'doctor' ? hospitals : labs}
                    onConfirm={(instId) => handleAssignInstitution(assignTarget.data.id, instId)}
                />
            )}

            {showCreateModal && (
                <CreateUserModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    hospitals={hospitals}
                    labs={labs}
                    onSuccess={() => { fetchStats(); fetchDoctors(); fetchTechs(); fetchDonors(); }}
                />
            )}

            {viewTarget && (
                <DoctorProfileDrawer
                    doctor={viewTarget}
                    onClose={() => setViewTarget(null)}
                />
            )}

            {ticketTarget && (
                <SupportTicketResolutionModal
                    isOpen={!!ticketTarget}
                    onClose={() => setTicketTarget(null)}
                    ticket={ticketTarget}
                    onConfirm={(notes) => {
                        handleUpdateTicketStatus(ticketTarget.id, 'RESOLVED', notes);
                        setTicketTarget(null);
                    }}
                />
            )}

            {/* Top Nav */}
            <header className="bg-[#0D1B2A] text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-[45]">
                <div className="flex items-center gap-4 lg:gap-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-[#3B9EE2]" />
                        <div>
                            <span className="text-base sm:text-lg font-bold tracking-tight">PulseID</span>
                            <span className="ml-1 sm:ml-2 text-[8px] sm:text-[10px] bg-[#3B9EE2]/20 text-[#3B9EE2] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Admin</span>
                        </div>
                    </div>

                    {/* Global Search - Hidden on Small Screens */}
                    <div className="hidden lg:flex relative w-64 xl:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Global Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#3B9EE2]/30 transition-all placeholder:text-gray-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                        className="lg:hidden p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs sm:text-sm font-medium transition-all group"
                    >
                        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="hidden xs:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="lg:hidden bg-[#0D1B2A] px-4 py-3 border-t border-white/10 sticky top-[72px] z-[44] transition-all duration-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Global Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#3B9EE2]/30 transition-all placeholder:text-gray-500"
                        />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage users, verify registrations, and monitor system health.</p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Patients', value: stats.total_patients, color: 'bg-blue-500', icon: Users },
                            { label: 'Doctors', value: stats.total_doctors, sub: `${stats.pending_doctors} pending`, subColor: 'text-amber-600', color: 'bg-emerald-500', icon: ShieldCheck },
                            { label: 'Hospitals', value: stats.total_hospitals, color: 'bg-purple-500', icon: Building2 },
                            { label: 'Labs', value: stats.total_labs, sub: `${stats.pending_labs} pending`, subColor: 'text-amber-600', color: 'bg-indigo-500', icon: FlaskConical },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-start gap-3 sm:gap-4 transition-transform hover:scale-[1.02]">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 ${stat.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                                    <stat.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                                    <p className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{stat.value ?? '—'}</p>
                                    {stat.sub && <p className={`text-[9px] sm:text-xs mt-1.5 font-bold ${stat.subColor} bg-amber-50 px-1.5 py-0.5 rounded-full inline-block`}>{stat.sub}</p>}
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
                            <div className="space-y-6">
                                {/* Analytics Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-gray-800">Registration Trends</h3>
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12% this week</span>
                                        </div>
                                        <div className="h-[240px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={[
                                                    { name: 'Mon', value: 4 },
                                                    { name: 'Tue', value: 3 },
                                                    { name: 'Wed', value: 12 },
                                                    { name: 'Thu', value: 7 },
                                                    { name: 'Fri', value: 15 },
                                                    { name: 'Sat', value: 10 },
                                                    { name: 'Sun', value: 18 },
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Line type="monotone" dataKey="value" stroke="#3B9EE2" strokeWidth={3} dot={{ r: 4, fill: '#3B9EE2', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-gray-800">System Distribution</h3>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Docs</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Labs</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-[240px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { name: 'Hospitals', value: stats?.total_hospitals || 0 },
                                                    { name: 'Labs', value: stats?.total_labs || 0 },
                                                    { name: 'Doctors', value: stats?.total_doctors || 0 },
                                                    { name: 'Techs', value: techs.length || 0 },
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                        {[0, 1, 2, 3].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#3B9EE2', '#8B5CF6', '#10B981', '#F59E0B'][index % 4]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-800">Recent Audit Events</h3>
                                            <button onClick={() => setActiveTab('audit')} className="text-xs text-[#3B9EE2] font-semibold hover:underline">View All</button>
                                        </div>
                                        {logs.length === 0 ? (
                                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-12 text-center">
                                                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                                                <p className="text-gray-400 text-sm font-medium">No activity recorded yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {logs.slice(0, 5).map((log, i) => (
                                                    <div key={i} className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#3B9EE2]/30 hover:shadow-md hover:shadow-blue-500/5 transition-all">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${log.action === 'LOGIN' ? 'bg-blue-50 text-blue-500' :
                                                            log.action.includes('UPLOAD') ? 'bg-emerald-50 text-emerald-500' :
                                                                'bg-slate-50 text-slate-500'
                                                            }`}>
                                                            {log.action === 'LOGIN' ? <ShieldCheck className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-900 font-bold truncate group-hover:text-[#3B9EE2] transition-colors">
                                                                {log.details || log.action.replace(/_/g, ' ')}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                    {log.actorUsername || 'System'}
                                                                </span>
                                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-800">Quick Actions</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { label: 'Register Hospital', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                                { label: 'Add Admin User', icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                { label: 'System Backup', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' }
                                            ].map((action, i) => (
                                                <button key={i} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all text-left">
                                                    <div className={`w-10 h-10 ${action.bg} ${action.color} rounded-xl flex items-center justify-center shrink-0`}>
                                                        <action.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Managed Doctors</h3>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> Add New User
                                    </button>
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
                                                            <button
                                                                onClick={() => setAssignTarget({ type: 'doctor', data: doc })}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                                            >
                                                                <Link2 className="w-3.5 h-3.5" /> {doc.hospital_name ? 'Change Hospital' : 'Assign'}
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
                                                                        onClick={() => setRejectTarget({ type: 'doctor', data: doc })}
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
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleVerifyLab(lab.id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" /> Verify
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectTarget({ type: 'lab', data: lab })}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {lab.is_verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                    {lab.rejection_reason && !lab.is_verified && (
                                                        <div className="flex items-start gap-1 mt-1.5 text-xs text-red-500">
                                                            <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                                            <span>{lab.rejection_reason}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {labs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No labs registered yet.</p>}
                            </div>
                        )}

                        {/* TECHNICIANS TAB */}
                        {activeTab === 'techs' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {['Technician', 'License', 'Affiliated Lab', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {techs.map(tech => (
                                            <tr key={tech.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <div className="font-semibold text-gray-900">{tech.user?.first_name} {tech.user?.last_name}</div>
                                                    <div className="text-xs text-gray-400">{tech.user?.email}</div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{tech.license_number}</span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="text-xs text-gray-900 font-medium">{tech.lab_name}</div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <StatusBadge verified={tech.is_verified} rejected={tech.rejection_reason && !tech.is_verified} />
                                                </td>
                                                <td className="py-3">
                                                    {!tech.is_verified && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleVerifyTech(tech.id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" /> Verify
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectTarget({ type: 'tech', data: tech })}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => setAssignTarget({ type: 'tech', data: tech })}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                                    >
                                                        <Link2 className="w-3.5 h-3.5" /> {tech.lab ? 'Change Lab' : 'Assign Lab'}
                                                    </button>
                                                    {tech.is_verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                    {tech.rejection_reason && !tech.is_verified && (
                                                        <div className="flex items-start gap-1 mt-1.5 text-xs text-red-500">
                                                            <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                                            <span>{tech.rejection_reason}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {techs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No technicians registered yet.</p>}
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

                        {/* DONORS TAB */}
                        {activeTab === 'donors' && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-4">Pending Organ Donor Verifications</h3>
                                {donors.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                        <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm italic">No pending donor requests.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {donors.map(donor => (
                                            <div key={donor.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                                                        <Heart className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{donor.user?.first_name} {donor.user?.last_name}</h4>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">{donor.health_id}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mb-5 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Blood Group:</span>
                                                        <span className="font-semibold text-gray-900">{donor.blood_group}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Gender:</span>
                                                        <span className="font-semibold text-gray-900">{donor.gender}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerifyDonor(donor.health_id)}
                                                        className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectTarget({ type: 'donor', data: donor })}
                                                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TICKETS TAB */}
                        {activeTab === 'tickets' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">Support Tickets</h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                            {tickets.filter(t => t.status === 'OPEN').length} Open
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                            {tickets.filter(t => t.status === 'RESOLVED').length} Resolved
                                        </span>
                                    </div>
                                </div>

                                {tickets.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                        <LifeBuoy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No support tickets found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {tickets.map(ticket => (
                                            <div key={ticket.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ticket.status === 'OPEN' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                                                            }`}>
                                                            {ticket.status === 'OPEN' ? <Clock className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-gray-900">{ticket.subject}</h4>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.priority === 'URGENT' ? 'bg-red-100 text-red-600' :
                                                                    ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                                                        'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                    {ticket.priority}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                #{ticket.id} • From: <span className="text-gray-600 font-medium">{ticket.full_name || ticket.username}</span> • {new Date(ticket.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {ticket.status === 'OPEN' && (
                                                            <button
                                                                onClick={() => setTicketTarget(ticket)}
                                                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                                            >
                                                                Resolve
                                                            </button>
                                                        )}
                                                        <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed mb-4">
                                                    {ticket.description}
                                                </div>

                                                {ticket.admin_notes && (
                                                    <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Resolution Notes</p>
                                                            <p className="text-sm text-emerald-900">{ticket.admin_notes}</p>
                                                            <p className="text-[10px] text-emerald-600 mt-2 font-medium">By {ticket.resolved_by_name} on {new Date(ticket.resolved_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/10 focus:border-[#0D1B2A]"
                                            placeholder="Search users by name, email, or username..."
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-95"
                                    >
                                        <UserPlus className="w-4 h-4" /> Create User
                                    </button>
                                </div>

                                <div className="hidden md:block overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                                                <th className="pb-3 pr-4">User</th>
                                                <th className="pb-3 pr-4">Role</th>
                                                <th className="pb-3 pr-4">Email</th>
                                                <th className="pb-3 pr-4">Joined On</th>
                                                <th className="pb-3 pr-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.filter(u => !search || `${u.first_name} ${u.last_name} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())).map(u => (
                                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#0D1B2A] font-bold text-xs">
                                                                {(u.username?.[0] || 'U').toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{u.first_name} {u.last_name}</div>
                                                                <div className="text-[10px] text-gray-400 font-mono">@{u.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.is_superuser ? 'bg-purple-100 text-purple-700' :
                                                            u.is_staff ? 'bg-indigo-100 text-indigo-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {u.is_superuser ? 'SuperAdmin' : (u.is_staff ? 'Staff' : 'User')}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-600">{u.email}</td>
                                                    <td className="py-4 pr-4 text-gray-500 text-xs">{new Date(u.date_joined).toLocaleDateString()}</td>
                                                    <td className="py-4">
                                                        {u.is_active ? (
                                                            <span className="text-emerald-500 flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"><CheckCircle className="w-3 h-3" /> Active</span>
                                                        ) : (
                                                            <span className="text-red-400 flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"><XCircle className="w-3 h-3" /> Disabled</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile User Cards */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {users.filter(u => !search || `${u.first_name} ${u.last_name} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())).map(u => (
                                        <div key={u.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0D1B2A] font-bold text-sm">
                                                        {(u.username?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{u.first_name} {u.last_name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono italic">@{u.username}</div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.is_superuser ? 'bg-purple-100 text-purple-700' :
                                                    u.is_staff ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {u.is_superuser ? 'Super' : (u.is_staff ? 'Staff' : 'User')}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400 uppercase font-bold text-[9px] tracking-widest">Email</span>
                                                    <span className="text-gray-700 font-medium">{u.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400 uppercase font-bold text-[9px] tracking-widest">Joined</span>
                                                    <span className="text-gray-700 font-medium">{new Date(u.date_joined).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400 uppercase font-bold text-[9px] tracking-widest">Status</span>
                                                    {u.is_active ? (
                                                        <span className="text-emerald-500 font-bold uppercase text-[9px]">Active</span>
                                                    ) : (
                                                        <span className="text-red-400 font-bold uppercase text-[9px]">Disabled</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AUDIT LOGS TAB */}
                        {activeTab === 'audit' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-bold text-gray-800">System Audit Logs</h3>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                            {logs.length} Total Events
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Timestamp</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actor</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Details</th>
                                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">IP Address</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(logs || []).filter(l =>
                                                    !search ||
                                                    l.action.toLowerCase().includes(search.toLowerCase()) ||
                                                    (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
                                                    (l.actorUsername && l.actorUsername.toLowerCase().includes(search.toLowerCase()))
                                                ).map((log, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-[10px]">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-800">{log.actor_email || log.actor_username || log.actorUsername || 'System'}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter font-medium">ID: {log.actor || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.action === 'LOGIN' ? 'bg-blue-50 text-blue-600' :
                                                                log.action.includes('VIEW') ? 'bg-amber-50 text-amber-600' :
                                                                    log.action.includes('UPLOAD') ? 'bg-emerald-50 text-emerald-600' :
                                                                        'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                {log.action.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 max-w-sm truncate" title={log.details}>
                                                            {log.details || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">
                                                            {log.ip_address || '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="lg:hidden divide-y divide-gray-50">
                                        {(logs || []).filter(l =>
                                            !search ||
                                            l.action.toLowerCase().includes(search.toLowerCase()) ||
                                            (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
                                            (l.actorUsername && l.actorUsername.toLowerCase().includes(search.toLowerCase()))
                                        ).map((log, i) => (
                                            <div key={i} className="p-4 bg-white hover:bg-gray-50/50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{log.actorUsername || log.actor_username || 'System'}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${log.action === 'LOGIN' ? 'bg-blue-50 text-blue-600' :
                                                            log.action.includes('VIEW') ? 'bg-amber-50 text-amber-600' :
                                                                log.action.includes('UPLOAD') ? 'bg-emerald-50 text-emerald-600' :
                                                                    'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-3 line-clamp-2" title={log.details}>
                                                    {log.details || 'No additional details.'}
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase border-t border-gray-50 pt-2">
                                                    <span>IP: {log.ip_address || '—'}</span>
                                                    <span>ID: {log.actor || 'N/A'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {logs.length === 0 && (
                                        <div className="py-20 text-center">
                                            <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium">No activity logs found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
