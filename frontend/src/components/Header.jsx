import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-purple-600 hidden sm:block">
                        HealthQR
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{user.role}</span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Logout"
                    >
                        <span className="text-sm font-medium hidden sm:block">Logout</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
