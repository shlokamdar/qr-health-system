import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 px-6 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">HealthQR</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Unified Health
                        <span className="block bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
                            Record System
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Secure, instant access to patient medical records via QR code scanning.
                        Connecting doctors and patients seamlessly.
                    </p>
                </div>



                {/* Portal Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {/* Patient Portal Card */}
                    <Link
                        to="/patient/login"
                        className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-teal-500/10 to-teal-600/10 border border-teal-500/20 backdrop-blur-xl hover:border-teal-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-600/0 group-hover:from-teal-500/10 group-hover:to-teal-600/10 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">I'm a Patient</h2>
                            <p className="text-slate-300 mb-6">
                                Access your health records, view your QR code, and manage your medical history securely.
                            </p>
                            <div className="flex items-center text-teal-400 font-semibold group-hover:gap-3 transition-all duration-300">
                                <span>Enter Portal</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Doctor Portal Card */}
                    <Link
                        to="/doctor/login"
                        className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 border border-purple-500/20 backdrop-blur-xl hover:border-purple-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-600/0 group-hover:from-purple-500/10 group-hover:to-indigo-600/10 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">I'm a Doctor</h2>
                            <p className="text-slate-300 mb-6">
                                Scan patient QR codes, access medical records, and upload prescriptions securely.
                            </p>
                            <div className="flex items-center text-purple-400 font-semibold group-hover:gap-3 transition-all duration-300">
                                <span>Enter Portal</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Admin Portal Card */}
                    <Link
                        to="/admin/login"
                        className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/30 backdrop-blur-xl hover:border-slate-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/0 to-slate-800/0 group-hover:from-slate-700/10 group-hover:to-slate-800/10 transition-all duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">I'm an Admin</h2>
                            <p className="text-slate-300 mb-6">
                                Manage hospital verifications, doctors, and view system analytics.
                            </p>
                            <div className="flex items-center text-slate-300 font-semibold group-hover:gap-3 transition-all duration-300">
                                <span>Enter Portal</span>
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>


                {/* Features Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl text-center">
                    <div className="text-slate-400">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">Secure & Encrypted</p>
                    </div>
                    <div className="text-slate-400">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">QR Code Access</p>
                    </div>
                    <div className="text-slate-400">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">Digital Records</p>
                    </div>
                </div>
            </main >

            {/* Footer */}
            <footer className="relative z-10 px-6 py-6 text-center text-slate-500 text-sm">
                <p>© 2026 HealthQR - Unified Health Record System</p>
                <div className="mt-2">
                    <Link to="/hospital/register" className="text-teal-500 hover:text-teal-400 font-medium transition-colors">
                        Register your Hospital
                    </Link>
                    <span className="mx-2">|</span>
                    <Link to="/lab/register" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
                        Lab Technician Registration
                    </Link>
                </div>
            </footer>
        </div >
    );
};

export default Homepage;
