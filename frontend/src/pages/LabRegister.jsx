import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/Header';
import {
  BeakerIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const LabRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    accreditation_number: '',
    address: '',
    phone: '',
    email: '',
    hospital: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // Fetch verified hospitals for the parent dropdown
        const response = await api.get('/hospitals/');
        setHospitals(response.data.results || response.data);
      } catch (err) {
        console.error('Failed to fetch hospitals');
      }
    };
    fetchHospitals();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert empty hospital string to null for backend
    const submissionData = { ...formData };
    if (!submissionData.hospital) delete submissionData.hospital;

    try {
      await api.post('/labs/organizations/', submissionData);
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
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircleIcon className="h-12 w-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Registration Submitted!</h2>
          <p className="text-slate-600 leading-relaxed">
            Your laboratory registration for <strong>{formData.name}</strong> has been received.
            We will verify your accreditation credentials and notify you once approved.
          </p>
          <Link
            to="/login"
            className="block w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg"
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
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200">
              <BeakerIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Register Diagnostic Lab</h2>
            <p className="mt-2 text-sm text-slate-500">Enable digital health records for your laboratory.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Lab Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <BeakerIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-50/50 transition-all"
                    placeholder="PulseID Molecular Diagnostics"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Accreditation ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <IdentificationIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="accreditation_number"
                      type="text"
                      required
                      className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-50/50 transition-all"
                      placeholder="NABL-12345"
                      value={formData.accreditation_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Parent Hospital (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      name="hospital"
                      className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-50/50 transition-all cursor-pointer"
                      value={formData.hospital}
                      onChange={handleChange}
                    >
                      <option value="">Independent Lab</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Lab Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-50/50 transition-all"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Lab Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-50/50 transition-all"
                      placeholder="lab@diagnostic.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Lab Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    className="appearance-none block w-full pl-11 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-50/50 transition-all"
                    placeholder="Full address of the diagnostic center..."
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting Registration...' : 'Register Diagnostic Center'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="text-sm font-semibold text-purple-600 hover:text-purple-500 transition-colors">
              Already registered? Go back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LabRegister;
