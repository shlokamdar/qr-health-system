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
                <Link to="/doctor/dashboard" className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[#3B9EE2]" />
                    <span className="text-xl font-bold text-[#0D1B2A] tracking-tight">
                        PulseID
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-6">
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#EFF6FF] rounded-full flex items-center justify-center border border-[#3B9EE2]/10">
                                <span className="text-[#3B9EE2] font-bold text-sm">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-sm font-bold text-[#0D1B2A]">
                                    Dr. {user.first_name} {user.last_name}
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
