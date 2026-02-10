import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Homepage from './pages/Homepage';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

// Protected Route — requires authentication
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading...</div>;

    const token = localStorage.getItem('access_token');
    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    // If a specific role is required, check it
    if (allowedRole && user.role !== allowedRole) {
        // Redirect to their own dashboard
        const redirect = user.role === 'PATIENT' ? '/patient/dashboard' : '/doctor/dashboard';
        return <Navigate to={redirect} replace />;
    }

    return children;
};

// Smart redirect for legacy /dashboard route
const DashboardRedirect = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading...</div>;

    if (!user) return <Navigate to="/" replace />;

    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
                {/* Homepage */}
                <Route path="/" element={<Homepage />} />

                {/* Patient Routes */}
                <Route path="/patient/login" element={<PatientLogin />} />
                <Route path="/patient/register" element={<PatientRegister />} />
                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute allowedRole="PATIENT">
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Doctor Routes */}
                <Route path="/doctor/login" element={<DoctorLogin />} />
                <Route path="/doctor/register" element={<DoctorRegister />} />
                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedRoute allowedRole="DOCTOR">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Legacy redirect */}
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
