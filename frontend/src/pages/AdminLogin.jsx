import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await login(formData.username, formData.password);
            if (res.role === 'ADMIN' || res.is_superuser) {
                const displayName = res.first_name ? res.first_name : (res.username || 'Admin');
                toast.success(`Welcome back, ${displayName}!`);
                navigate('/admin-dashboard');
            } else {
                toast.error('Access denied. Admin privileges required.');
            }
        } catch (err) {
            toast.error('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-700 mb-0">Password</label>
                            <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">Forgot password?</Link>
                        </div>
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
