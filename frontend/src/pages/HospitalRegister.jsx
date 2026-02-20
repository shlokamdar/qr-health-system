import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/Header';
import {
    BuildingOffice2Icon,
    IdentificationIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const HospitalRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        registration_number: '',
        address: '',
        phone: '',
        email: '',
        admin_username: '',
        admin_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/hospitals/', formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please check the details and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Registration Submitted!</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Your hospital registration for <strong>{formData.name}</strong> has been submitted.
                        Our team will verify your clinical credentials and notify you via email.
                    </p>
                    <Link
                        to="/login"
                        className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
                    <div className="text-center">
                        <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200">
                            <BuildingOffice2Icon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register Your Hospital</h2>
                        <p className="mt-2 text-sm text-slate-500">Provide hospital details for system verification.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Hospital Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <BuildingOffice2Icon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                        placeholder="PulseID General Hospital"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Registration Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <IdentificationIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="registration_number"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                        placeholder="HOSP-12345-REG"
                                        value={formData.registration_number}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                            placeholder="+91 9876543210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                            placeholder="contact@hospital.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none">
                                        <MapPinIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <textarea
                                        name="address"
                                        required
                                        rows={3}
                                        className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                        placeholder="Full building address..."
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">Admin Account Credentials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Admin Username</label>
                                        <input
                                            name="admin_username"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                            placeholder="hosp_admin"
                                            value={formData.admin_username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Admin Password</label>
                                        <input
                                            name="admin_password"
                                            type="password"
                                            required
                                            className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50/50 transition-all"
                                            placeholder="••••••••"
                                            value={formData.admin_password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting Registration...' : 'Complete Hospital Registration'}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Already registered? Go back to Login
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HospitalRegister;
