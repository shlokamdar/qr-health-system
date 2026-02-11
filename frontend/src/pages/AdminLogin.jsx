import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await login(formData.username, formData.password);
            if (res.role === 'ADMIN' || res.is_superuser) {
                navigate('/admin-dashboard');
            } else {
                setError('Access denied. Admin privileges required.');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900 transition-colors"
                    >
                        Login as Admin
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
