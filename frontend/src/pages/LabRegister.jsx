import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BuildingOffice2Icon, 
  UserCircleIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  IdentificationIcon 
} from '@heroicons/react/24/outline';

const LabRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    hospital: '',
    license_number: '',
  });
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch verified hospitals for dropdown
    const fetchHospitals = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/doctors/hospitals/');
        setHospitals(response.data);
      } catch (err) {
        console.error("Failed to load hospitals", err);
      }
    };
    fetchHospitals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/labs/technicians/', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="rounded-full bg-purple-100 p-3">
                <IdentificationIcon className="h-10 w-10 text-purple-600" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Lab Technician Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the network to update patient records directly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Registration Successful!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your account has been created. Please wait for admin approval before logging in.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="jdoe_lab"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        required
                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  name="license_number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  value={formData.license_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hospital (Optional)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOffice2Icon className="h-5 w-5 text-gray-400" />
                 </div>
                  <select
                    name="hospital"
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={formData.hospital}
                    onChange={handleChange}
                  >
                    <option value="">Independent / No Affiliation</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        name="password"
                        required
                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Register as Lab Technician
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabRegister;
