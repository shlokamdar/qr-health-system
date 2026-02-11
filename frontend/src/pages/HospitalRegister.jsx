import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const HospitalRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        registration_number: '',
        phone: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('doctors/hospitals/', formData);
            setSuccess(true);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.registration_number
                ? 'Registration number already exists.'
                : 'Registration failed. Please check your details.';
            setError(errorMsg);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex flex-col items-center justify-center px-6 py-12">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-teal-500/20 p-8 shadow-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
                    <p className="text-slate-300 mb-6">
                        Your hospital <strong>{formData.name}</strong> has been registered successfully.
                        It is now pending approval from the Superadmin.
                    </p>
                    <Link to="/" className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex flex-col items-center justify-center px-6 py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Back to Home */}
            <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
            </Link>

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-teal-500/20 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-1 4h1m-1 4h1" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Register Hospital</h2>
                        <p className="text-slate-400 mt-2">Join our medical network</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Hospital Name *</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="e.g. City General Hospital"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Official Email *</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="contact@hospital.com"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Registration No. *</label>
                                <input
                                    name="registration_number"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Reg. ID"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
                                <input
                                    name="phone"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="+1 234 567 890"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Address *</label>
                            <textarea
                                name="address"
                                required
                                rows="3"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                placeholder="Full physical address"
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-sm text-teal-300 flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Registration requires verification by system administrators before appearing in doctor options.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-emerald-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 transition-all transform hover:scale-[1.02]"
                        >
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HospitalRegister;
