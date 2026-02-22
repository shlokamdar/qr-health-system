import React, { useState, useEffect } from 'react';
import {
    UserPlus, Mail, Phone, MapPin, Search, Filter,
    LayoutGrid, ClipboardList, Trash2, Plus
} from 'lucide-react';
import HospitalService from '../services/hospital.service';
import Header from '../components/Header';

const HospitalDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [hospitalInfo, setHospitalInfo] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [labs, setLabs] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [visitLogs, setVisitLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateTechModal, setShowCreateTechModal] = useState(false);
    const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
    const [showAssignDeptModal, setShowAssignDeptModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [techForm, setTechForm] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        license_number: '',
        lab: ''
    });
    const [deptForm, setDeptForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, h, d, l, t, de, v] = await Promise.all([
                    HospitalService.getStats(),
                    HospitalService.getProfile(),
                    HospitalService.getDoctors(),
                    HospitalService.getLabs(),
                    HospitalService.getTechnicians(),
                    HospitalService.getDepartments(),
                    HospitalService.getVisitLogs()
                ]);
                setStats(s);
                setHospitalInfo(h);
                setDoctors(d);
                setLabs(l);
                setTechnicians(t);
                setDepartments(de);
                setVisitLogs(v);
                if (l.length > 0) setTechForm(prev => ({ ...prev, lab: l[0].id }));
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateDept = async (e) => {
        e.preventDefault();
        try {
            await HospitalService.createDepartment(deptForm);
            setShowCreateDeptModal(false);
            setDeptForm({ name: '', description: '' });
            const updated = await HospitalService.getDepartments();
            setDepartments(updated);
        } catch (err) {
            alert("Failed to create department");
        }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        try {
            await HospitalService.deleteDepartment(id);
            const updated = await HospitalService.getDepartments();
            setDepartments(updated);
        } catch (err) {
            alert("Failed to delete department");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[#3B9EE2] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading Hospital Core...</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, delay }) => (
        <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both`} style={{ animationDelay: `${delay}ms` }}>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: `${color}15` }}>
                <Icon size={28} color={color} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-[#0D1B2A] z-0 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#3B9EE2]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <Header />

            <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-white text-sm font-bold uppercase tracking-[0.3em] opacity-80">Hospital Administration</h2>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            {hospitalInfo?.name || 'Hospital Dashboard'}
                        </h1>
                        <div className="flex items-center gap-2 text-blue-400/80 text-sm font-medium">
                            <MapPin size={16} />
                            <span>{hospitalInfo?.address}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all transition-duration-300"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Users} label="Total Doctors" value={stats?.total_doctors || '0'} color="#3B9EE2" delay={100} />
                    <StatCard icon={AlertCircle} label="Pending Verifications" value={stats?.pending_doctors || '0'} color="#F59E0B" delay={200} />
                    <StatCard icon={Beaker} label="Affiliated Labs" value={stats?.total_labs || '0'} color="#2EC4A9" delay={300} />
                    <StatCard icon={BarChart3} label="Total Consultations" value={stats?.total_consultations || '0'} color="#8B5CF6" delay={400} />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden min-h-[600px]">
                    {/* Inner Navigation */}
                    <div className="flex flex-wrap border-b border-slate-100 p-2 bg-slate-50/50">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'departments', label: 'Departments', icon: LayoutGrid },
                            { id: 'doctors', label: 'Doctor Roster', icon: Users },
                            { id: 'labs', label: 'Lab Network', icon: Beaker },
                            { id: 'staff', label: 'Staff Management', icon: UserPlus },
                            { id: 'logs', label: 'Visit Logs', icon: ClipboardList },
                            { id: 'profile', label: 'Facility Profile', icon: Building2 }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[150px] flex items-center justify-center gap-3 py-5 px-6 rounded-2xl font-bold transition-all duration-500 relative group ${activeTab === tab.id
                                    ? 'bg-white shadow-lg text-slate-900'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                    }`}
                            >
                                <tab.icon size={20} className={activeTab === tab.id ? 'text-[#3B9EE2]' : 'opacity-50'} />
                                <span className="uppercase tracking-widest text-xs">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B9EE2] to-[#2EC4A9] rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in duration-700">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] p-8 rounded-[2rem] text-white space-y-6">
                                        <h3 className="text-2xl font-bold">System Status</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="font-medium">Verification Service</span>
                                                </div>
                                                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="font-medium">Audit Pipeline</span>
                                                </div>
                                                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-center items-center text-center space-y-4">
                                        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600">
                                            <UserPlus size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Grow Your Network</h3>
                                        <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
                                            Invite new practitioners to join your facility's digital health network on PulseID.
                                        </p>
                                        <button className="px-8 py-3 bg-[#3B9EE2] text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-[#2E8BCC] transition-all">
                                            Generate Invite Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'departments' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">Departments</h3>
                                        <p className="text-slate-500 text-sm">Organize your medical staff into specialized units.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateDeptModal(true)}
                                        className="px-6 py-3 bg-[#3B9EE2] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-[#2E8BCC] transition-all"
                                    >
                                        <Plus size={18} /> Add Department
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {departments.length > 0 ? departments.map(dept => (
                                        <div key={dept.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#3B9EE2]">
                                                    <LayoutGrid size={24} />
                                                </div>
                                                <button onClick={() => handleDeleteDept(dept.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-lg">{dept.name}</h4>
                                            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{dept.description || 'No description provided.'}</p>

                                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Medical Staff</span>
                                                <span className="text-[#3B9EE2] bg-blue-50 px-2 py-0.5 rounded-full">{dept.doctor_count} Doctors</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                            <LayoutGrid size={48} className="mb-4 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No departments configured</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'doctors' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">Practitioner Directory</h3>
                                        <p className="text-slate-500 text-sm">Manage and verify medical professionals affiliated with your hospital.</p>
                                    </div>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#3B9EE2]" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search doctors..."
                                            className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl w-full md:w-[300px] outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {doctors.length > 0 ? doctors.map(doctor => (
                                        <div key={doctor.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3B9EE2] font-black text-xl">
                                                    {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {doctor.is_verified ? (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                            <CheckCircle2 size={12} /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                            <AlertCircle size={12} /> Pending
                                                        </span>
                                                    )}
                                                    {doctor.department_details && (
                                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                                                            {doctor.department_details.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-800">Dr. {doctor.user.first_name} {doctor.user.last_name}</h4>
                                            <p className="text-sm text-[#3B9EE2] font-bold mb-4">{doctor.specialization}</p>

                                            <div className="space-y-2 border-t border-slate-50 pt-4">
                                                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                                                    <Mail size={14} className="opacity-50" />
                                                    <span>{doctor.user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                                                    <BarChart3 size={14} className="opacity-50" />
                                                    <span>{doctor.license_number}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedDoctor(doctor);
                                                    setShowAssignDeptModal(true);
                                                }}
                                                className="w-full mt-6 py-3 bg-slate-50 text-[#3B9EE2] rounded-xl text-xs font-bold hover:bg-blue-50 transition-all uppercase tracking-widest"
                                            >
                                                {doctor.department ? 'Change Department' : 'Assign Department'}
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                            <Users size={48} className="mb-4 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No affiliated doctors found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">Visitation Logs</h3>
                                    <p className="text-slate-500 text-sm">Detailed audit of all consultations performed within your hospital network.</p>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Practitioner</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient ID</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Complaint</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {visitLogs.length > 0 ? visitLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-700">{new Date(log.consultation_date).toLocaleDateString()}</div>
                                                        <div className="text-[10px] text-slate-400">{new Date(log.consultation_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-800">Dr. {log.doctor_details?.user.first_name} {log.doctor_details?.user.last_name}</div>
                                                        <div className="text-[10px] text-[#3B9EE2] font-bold uppercase">{log.doctor_details?.specialization}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                                                            {log.doctor_details?.department_details?.name || 'General'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg inline-block border border-slate-100">
                                                            {log.patient_health_id}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                        <div className="text-sm text-slate-600 font-medium truncate">{log.chief_complaint}</div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                        No visitation logs record yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Assign Department Modal */}
                        {showAssignDeptModal && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAssignDeptModal(false)} />
                                <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="p-8 border-b border-slate-100">
                                        <h3 className="text-xl font-black text-slate-800">Assign Department</h3>
                                        <p className="text-slate-500 text-sm">Select a department for Dr. {selectedDoctor?.user.first_name} {selectedDoctor?.user.last_name}.</p>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={async () => {
                                                    await HospitalService.assignDoctorDepartment(selectedDoctor.id, null);
                                                    setShowAssignDeptModal(false);
                                                    const updated = await HospitalService.getDoctors();
                                                    setDoctors(updated);
                                                }}
                                                className="w-full p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 text-left transition-all group"
                                            >
                                                <div className="text-sm font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">General / None</div>
                                            </button>
                                            {departments.map(dept => (
                                                <button
                                                    key={dept.id}
                                                    onClick={async () => {
                                                        await HospitalService.assignDoctorDepartment(selectedDoctor.id, dept.id);
                                                        setShowAssignDeptModal(false);
                                                        const updated = await HospitalService.getDoctors();
                                                        setDoctors(updated);
                                                    }}
                                                    className={`w-full p-4 rounded-2xl border transition-all text-left ${selectedDoctor?.department === dept.id
                                                        ? 'border-[#3B9EE2] bg-blue-50/50'
                                                        : 'border-slate-100 hover:bg-slate-50'}`}
                                                >
                                                    <div className="text-sm font-bold text-slate-800">{dept.name}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-black">{dept.doctor_count} Current Members</div>
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setShowAssignDeptModal(false)}
                                            className="w-full py-4 mt-4 text-slate-400 font-bold text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create Department Modal */}
                        {showCreateDeptModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateDeptModal(false)} />
                                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="p-8 border-b border-slate-100">
                                        <h3 className="text-2xl font-black text-slate-800">Add Department</h3>
                                        <p className="text-slate-500 text-sm">Create a new organizational unit for medical staff.</p>
                                    </div>
                                    <form onSubmit={handleCreateDept} className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
                                            <input required type="text" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" placeholder="e.g., Cardiology" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                                            <textarea rows={3} value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-medium resize-none" placeholder="Describe the focus of this department..." />
                                        </div>
                                        <div className="pt-4 flex gap-4">
                                            <button type="button" onClick={() => setShowCreateDeptModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                                            <button type="submit" className="flex-1 py-4 bg-[#3B9EE2] text-white rounded-2xl font-bold hover:bg-[#2E8BCC] transition-all shadow-xl shadow-blue-200">Save Department</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Create Technician Modal */}
                        {showCreateTechModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateTechModal(false)} />
                                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="p-8 border-b border-slate-100">
                                        <h3 className="text-2xl font-black text-slate-800">Onboard Technician</h3>
                                        <p className="text-slate-500 text-sm">Create a new secure account for laboratory staff.</p>
                                    </div>
                                    <form onSubmit={handleCreateTech} className="p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                                <input required type="text" value={techForm.first_name} onChange={e => setTechForm({ ...techForm, first_name: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                                <input required type="text" value={techForm.last_name} onChange={e => setTechForm({ ...techForm, last_name: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                            <input required type="text" value={techForm.username} onChange={e => setTechForm({ ...techForm, username: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                            <input required type="email" value={techForm.email} onChange={e => setTechForm({ ...techForm, email: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License #</label>
                                                <input required type="text" value={techForm.license_number} onChange={e => setTechForm({ ...techForm, license_number: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-mono" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Lab</label>
                                                <select required value={techForm.lab} onChange={e => setTechForm({ ...techForm, lab: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold">
                                                    {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                            <input required type="password" value={techForm.password} onChange={e => setTechForm({ ...techForm, password: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" />
                                        </div>
                                        <div className="pt-4 flex gap-4">
                                            <button type="button" onClick={() => setShowCreateTechModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                                            <button type="submit" className="flex-1 py-4 bg-[#3B9EE2] text-white rounded-2xl font-bold hover:bg-[#2E8BCC] transition-all shadow-xl shadow-blue-200">Create Staff Account</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="max-w-3xl animate-in fade-in slide-in-from-left-4 duration-500">
                                <h3 className="text-2xl font-black text-slate-800 mb-8 border-b border-slate-100 pb-4">Facility Configuration</h3>
                                <form className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hospital Name</label>
                                            <input
                                                type="text"
                                                defaultValue={hospitalInfo?.name}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration #</label>
                                            <input
                                                type="text"
                                                defaultValue={hospitalInfo?.registration_number}
                                                readOnly
                                                className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-mono text-sm opacity-60 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Line</label>
                                            <input
                                                type="tel"
                                                defaultValue={hospitalInfo?.phone}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                                            <input
                                                type="email"
                                                defaultValue={hospitalInfo?.email}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                                        <textarea
                                            rows={3}
                                            defaultValue={hospitalInfo?.address}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-bold resize-none"
                                        />
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button className="px-10 py-4 bg-[#3B9EE2] text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-[#2E8BCC] transition-all transform active:scale-95">
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom padding for mobile */}
            <div className="h-20 md:hidden" />
        </div>
    );
};

export default HospitalDashboard;
