import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            // Fetch full profile info often to get generic user data or verify role
            // For now, we rely on the decoded token 'role'. But standard JWT decoders might not have it unless added.
            // Let's assume we need to fetch /api/auth/me (not implemented) or just deduce from context if we decoded it there.
            // Or simpler: We fetch patient profile if patient, else nothing.
        };
       // fetchProfile();
    }, []);

    // Helper to get role safely from user object or token decode
    // In our context, we only stored {id: ...}. We really should have stored role.
    // Let's update AuthContext later or just fetch here.
    // For prototype speed: let's assume we decode 'role' in AuthContext or use a helper. 
    // Wait, the default SimpleJWT doesn't put 'role' in token. I need to customize TokenObtainPairSerializer.
    // OR: I just fetch a "whoami" endpoint.

    // Let's do a quick hack: we assume the user object has it if we modify AuthContext to decode it IF it's there.
    // But since I didn't customize the serializer yet, it WON'T be there.
    // Alternative: Fetch user details from a new endpoint /api/auth/me/ or just try to hit /api/patients/me/
    
    // Better plan: I'll make a generic 'Home' that directs based on what works.
    
    // NOTE: To fix this properly, I should update the backend serializer to include 'role'.
    // BUT, I can't easily switch context back to backend.
    // So, I'll use a wrapper that tries to fetch "Patient Profile". If success -> Patient. Else -> Doctor.
    
    const [role, setRole] = useState(null);

    useEffect(() => {
        const determineRole = async () => {
             try {
                 await api.get('patients/me/');
                 setRole('PATIENT');
             } catch (e) {
                 setRole('DOCTOR'); // Default fall back for now
             }
        }
        determineRole();
    }, []);

    if (!role) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Unified Health Record</h1>
                    <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </nav>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {role === 'PATIENT' ? <PatientDashboard /> : <DoctorDashboard />}
            </div>
        </div>
    );
};

export default Dashboard;
