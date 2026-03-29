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
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import HospitalDashboard from './pages/HospitalDashboard';
import LabDashboard from './pages/LabDashboard';
import UnifiedLogin from './pages/UnifiedLogin';
import SystemAdminLogin from './pages/SystemAdminLogin';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import PublicPatientView from './pages/PublicPatientView';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Protected Route — requires authentication
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-headings text-xl">Loading...</div>;

    if (!user) {
        if (allowedRole === 'ADMIN') return <Navigate to="/system/login" replace />;
        return <Navigate to="/login" replace />;
    }

    // Role mapping for redirecting unauthorized users to their own dashboards
    const roleToPath = {
        'PATIENT': '/patient/dashboard',
        'DOCTOR': '/doctor/dashboard',
        'LAB_TECH': '/lab/dashboard',
        'HOSPITAL_ADMIN': '/hospital/dashboard',
        'ADMIN': '/admin-dashboard'
    };

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={roleToPath[user.role] || '/'} replace />;
    }

    return children;
};

// Smart redirect for legacy /dashboard route
const DashboardRedirect = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-900 text-xl">Loading...</div>;

    if (!user) return <Navigate to="/" replace />;

    if (user.role === 'ADMIN' || user.is_superuser) return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'LAB_TECH') return <Navigate to="/lab/dashboard" replace />;
    if (user.role === 'HOSPITAL_ADMIN') return <Navigate to="/hospital/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Homepage */}
                    <Route path="/" element={<Homepage />} />

                    {/* Organization Routes */}
                    {/* Hospital & Lab Login/Register */}
                    <Route path="/hospital/register" element={<UnifiedLogin initialTab="register" initialRole="HOSPITAL_ADMIN" />} />
                    <Route path="/hospital/login" element={<UnifiedLogin initialTab="login" initialRole="HOSPITAL_ADMIN" />} />
                    <Route
                        path="/hospital/dashboard"
                        element={
                            <ProtectedRoute allowedRole="HOSPITAL_ADMIN">
                                <HospitalDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/lab/register" element={<UnifiedLogin initialTab="register" initialRole="LAB_TECH" />} />
                    <Route path="/lab/login" element={<UnifiedLogin initialTab="login" initialRole="LAB_TECH" />} />
                    <Route
                        path="/lab/dashboard"
                        element={
                            <ProtectedRoute allowedRole="LAB_TECH">
                                <LabDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Patient Routes */}
                    <Route path="/patient/login" element={<UnifiedLogin initialTab="login" initialRole="PATIENT" />} />
                    <Route path="/patient/register" element={<UnifiedLogin initialTab="register" initialRole="PATIENT" />} />
                    <Route
                        path="/patient/dashboard"
                        element={
                            <ProtectedRoute allowedRole="PATIENT">
                                <PatientDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Doctor Routes */}
                    <Route path="/doctor/login" element={<UnifiedLogin initialTab="login" initialRole="DOCTOR" />} />
                    <Route path="/doctor/register" element={<UnifiedLogin initialTab="register" initialRole="DOCTOR" />} />
                    <Route
                        path="/doctor/dashboard"
                        element={
                            <ProtectedRoute allowedRole="DOCTOR">
                                <DoctorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRole="ADMIN">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Shared Auth Paths */}
                    <Route path="/login" element={<UnifiedLogin />} />
                    <Route path="/register" element={<UnifiedLogin initialTab="register" />} />
                    <Route path="/system/login" element={<SystemAdminLogin />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/patients/:healthId" element={<PublicPatientView />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
