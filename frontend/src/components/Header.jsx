import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50 h-[56px] flex items-center">
            <div className="w-full px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-headings tracking-tight">
                        PulseID
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-6">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-light-blue rounded-full flex items-center justify-center border border-primary/10">
                                <span className="text-primary font-bold text-sm">
                                    {user.first_name?.[0]}{user.last_name?.[0] || user.username?.[0]}
                                </span>
                            </div>
                            <div className="hidden sm:flex flex-col items-start gap-1">
                                <span className="text-sm font-bold text-headings leading-none">
                                    {user.role === 'DOCTOR' ? 'Dr. ' : ''}{user.first_name} {user.last_name}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md leading-none ${
                                    user.role === 'PATIENT' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                    user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                    user.role === 'LAB_TECH' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                    user.role === 'HOSPITAL_ADMIN' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700 border border-red-200' :
                                    'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                    {user.role === 'HOSPITAL_ADMIN' ? 'Hospital Admin' :
                                     user.role === 'LAB_TECH' ? 'Lab Technician' :
                                     user.role === 'ADMIN' ? 'Admin' :
                                     user.role === 'DOCTOR' ? 'Doctor' :
                                     user.role === 'PATIENT' ? 'Patient' : 'User'}
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-[#4A5568] hover:text-red-500 transition-colors flex items-center gap-2"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
