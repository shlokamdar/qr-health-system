import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Activity, User, Stethoscope, Microscope, ShieldCheck,
    Check, ArrowRight, ArrowLeft, Loader2, Download, Smartphone,
    Eye, EyeOff, Upload, Clock, Lock, RefreshCw, X, Image as ImageIcon
} from 'lucide-react';
import { BuildingOffice2Icon, BeakerIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const UnifiedLogin = () => {
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [loginRole, setLoginRole] = useState('PATIENT');
    const [registerRole, setRegisterRole] = useState('PATIENT');

    // Login State
    const [username, setLoginUsername] = useState(''); // Renamed to avoid confusion with registration username
    const [password, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const { login, register } = useContext(AuthContext); // Destructure both here
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Registration State - Patient
    const [patientStep, setPatientStep] = useState(1);
    const [patientData, setPatientData] = useState({
        username: '', firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', email: '',
        password: '', confirmPassword: '', bloodGroup: 'O+', organDonor: false,
        allergies: '', conditions: '', addressLine1: '', addressLine2: '', city: '', state: '', pin: '',
        wantPhysicalCard: false
    });
    const [usernameAvailable, setUsernameAvailable] = useState(null); // null, true, false
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Registration State - Doctor
    const [doctorData, setDoctorData] = useState({
        username: '', firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', email: '',
        password: '', confirmPassword: '', specialization: 'General Medicine', otherSpecialization: '',
        experience: 0, hospital: '', department: '',
        licenseNumber: '', issuingCouncil: '', licenseExpiry: '',
        licenseDoc: null, degreeDoc: null, idDoc: null
    });
    const [availableHospitals, setAvailableHospitals] = useState([]);

    // Registration State - Doctor (step state)
    const [doctorStep, setDoctorStep] = useState(1);

    // Registration State - Lab Tech
    const [labTechStep, setLabTechStep] = useState(1);
    const [labTechData, setLabTechData] = useState({
        username: '', firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', email: '',
        password: '', confirmPassword: '', lab: '', licenseNumber: ''
    });
    const [availableLabs, setAvailableLabs] = useState([]);

    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [suggestedUsernames, setSuggestedUsernames] = useState([]);

    const [isGeneratingID, setIsGeneratingID] = useState(false);
    const [generatedID, setGeneratedID] = useState('');
    const fileInputRef = useRef(null);

    const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3B9EE2]/20 focus:border-[#3B9EE2] transition-all font-medium text-slate-700 placeholder:text-slate-400";
    const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
    const btnPrimaryStyle = "w-full py-4 bg-[#3B9EE2] hover:bg-[#2A8BD0] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center";
    const btnGhostStyle = "w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all";

    const loginRoles = [
        { id: 'PATIENT', label: 'Patient', icon: User },
        { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
        { id: 'LAB_TECH', label: 'Lab Tech', icon: Microscope },
        { id: 'HOSPITAL_ADMIN', label: 'Hospital', icon: BuildingOffice2Icon },
        { id: 'ADMIN', label: 'Admin', icon: ShieldCheck }
    ];

    // --- Validation Helpers ---
    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const getPasswordStrength = (pass) => {
        let strength = 0;
        if (pass.length > 7) strength++;
        if (pass.match(/[a-z]/) && pass.match(/[0-9]/)) strength++;
        if (pass.match(/[^a-zA-Z0-9]/)) strength++;
        return strength; // 0-3
    };

    // Auto-suggest usernames
    useEffect(() => {
        if (registerRole === 'PATIENT' && patientData.firstName && patientData.lastName && !patientData.username) {
            const base = `${patientData.firstName.toLowerCase()}${patientData.lastName.toLowerCase()}`;
            const rand = Math.floor(Math.random() * 100);
            setSuggestedUsernames([
                base,
                `${base}${rand}`,
                `${base}.${new Date().getFullYear()}`
            ]);
        }
    }, [patientData.firstName, patientData.lastName, registerRole]);

    // Fetch available labs when Lab Tech registration is selected
    useEffect(() => {
        if (registerRole === 'LAB_TECH') {
            fetch('http://localhost:8000/api/labs/organizations/')
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => setAvailableLabs(data.results || data))
                .catch(() => setAvailableLabs([]));
        }
        if (registerRole === 'DOCTOR') {
            fetch('http://localhost:8000/api/doctors/hospitals/')
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => {
                    const list = data.results || data;
                    setAvailableHospitals(list.filter(h => h.is_verified));
                })
                .catch(() => setAvailableHospitals([]));
        }
    }, [registerRole]);


    // Check Username Availability
    useEffect(() => {
        const checkAvailability = async () => {
            if (!patientData.username || patientData.username.length < 3) {
                setUsernameAvailable(null);
                return;
            }

            setIsCheckingUsername(true);
            try {
                // Import AuthService directly here or use a service helper if available
                // Assuming AuthService is imported or available via context if we added it there.
                // Since I added checkUsername to AuthService but didn't expose it in Context yet,
                // I will use direct import if I can, or update Context. 
                // Let's assume simpler: import AuthService at top. 
                // Actually I can't easily add import at top with replace_file_content mid-file.
                // But I can use the existing `api` util if I had it, or better:
                // I'll assume AuthService is imported (it wasn't in the view_file).
                // Wait, I need to check if AuthService is imported. 
                // Ah, UnifiedLogin imports AuthContext, but not AuthService.
                // I should add AuthService import or expose it in Context.
                // Let's expose it in Context or just fetch locally?
                // Fetching locally is easier for now to avoid Context refactor loops.
                // Actually, I can just use fetch for this simple check.
                const response = await fetch(`http://localhost:8000/api/auth/check-username/?username=${patientData.username}`);
                const data = await response.json();
                setUsernameAvailable(data.available);
            } catch (err) {
                console.error("Failed to check username", err);
                setUsernameAvailable(null); // Fallback
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [patientData.username]);

    // Generate Suggested Usernames for Doctor
    useEffect(() => {
        if (registerRole === 'DOCTOR' && doctorData.firstName && doctorData.lastName) {
            const base = (doctorData.firstName + doctorData.lastName).toLowerCase().replace(/\s/g, '');
            const rand = Math.floor(Math.random() * 100);
            setSuggestedUsernames([
                `dr.${base}`,
                `dr_${base}${rand}`,
                `${base}.md`
            ]);
        }
    }, [doctorData.firstName, doctorData.lastName, registerRole]);

    // Check Doctor Username Availability
    useEffect(() => {
        const checkAvailability = async () => {
            if (!doctorData.username || doctorData.username.length < 3) {
                setUsernameAvailable(null);
                return;
            }

            setIsCheckingUsername(true);
            try {
                const response = await fetch(`http://localhost:8000/api/auth/check-username/?username=${doctorData.username}`);
                const data = await response.json();
                setUsernameAvailable(data.available);
            } catch (err) {
                console.error("Failed to check username", err);
                setUsernameAvailable(null);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [doctorData.username]);

    // Fetch Labs for Lab Tech Registration
    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/labs/organizations/');
                const data = await response.json();
                setAvailableLabs(data.results || data);
            } catch (err) {
                console.error("Failed to fetch labs", err);
            }
        };
        if (registerRole === 'LAB_TECH') {
            fetchLabs();
        }
    }, [registerRole]);


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(username, password);
            if (result) {
                const role = result.role;
                if (role === 'PATIENT') navigate('/patient/dashboard');
                else if (role === 'DOCTOR') navigate('/doctor/dashboard');
                else if (role === 'LAB_TECH') navigate('/lab/dashboard');
                else if (role === 'HOSPITAL_ADMIN') navigate('/hospital/dashboard');
                else if (role === 'ADMIN') navigate('/admin-dashboard');
                else navigate('/');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Login failed. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    const ProgressBar = ({ step, total }) => (
        <div className="mb-8">
            <div className="flex gap-2 mb-2">
                {[...Array(total)].map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i + 1 < step ? 'bg-[#2EC4A9]' :
                        i + 1 === step ? 'bg-[#3B9EE2]' :
                            'bg-slate-200'
                        }`} />
                ))}
            </div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-right">Step {step} of {total}</p>
        </div>
    );

    const PasswordStrength = ({ password }) => {
        let s = 0;
        if (password?.length > 7) s++;
        if (password?.match(/[a-z]/) && password?.match(/[0-9]/)) s++;
        if (password?.match(/[^a-zA-Z0-9]/)) s++;

        return (
            <div className="flex gap-1 mt-2 h-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < s ? (s === 1 ? 'bg-red-400' : s === 2 ? 'bg-yellow-400' : 'bg-[#2EC4A9]') : 'bg-slate-100'}`} />
                ))}
            </div>
        );
    };

    // --- Patient Registration Flow ---

    const handlePatientNext = () => {
        if (patientStep === 1) {
            const { firstName, lastName, email, password, confirmPassword, username } = patientData;
            if (!firstName || !lastName || !email || !password || !username) {
                setError("Please fill all required fields."); return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                setError("Username can only contain letters, numbers, and underscores."); return;
            }
            if (!isEmailValid(email)) {
                setError("Please enter a valid email address."); return;
            }
            if (usernameAvailable === false) {
                setError("Username is already taken. Please choose another."); return;
            }
            if (getPasswordStrength(password) < 2) {
                setError("Password is too weak. Please use mix of letters and numbers."); return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match."); return;
            }
        }

        if (patientStep === 2) {
            const { dob, gender, phone, addressLine1, city, state, pin } = patientData;
            if (!dob || !gender || !phone || !addressLine1 || !city || !state || !pin) {
                setError("Please complete all personal details."); return;
            }
        }

        if (patientStep === 3) {
            setError("");
            setIsGeneratingID(true);
            setTimeout(() => {
                setGeneratedID(`HID-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
                setIsGeneratingID(false);
                setPatientStep(4);
            }, 1500);
            return;
        }

        setError("");
        setPatientStep(prev => prev + 1);
    };




    const handleDownloadPDF = async () => {
        const element = document.getElementById('health-id-card');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0D1B2A',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', [86, 54]); // Credit-card size landscape
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Fill background
            pdf.setFillColor('#0D1B2A');
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

            // Add card image filling the page
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`PulseID-HealthCard-${patientData.lastName || 'Card'}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
            setError("Failed to download card. Please try again.");
        }
    };

    const handleDownloadImage = async () => {
        const element = document.getElementById('health-id-card');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 4,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0D1B2A',
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `PulseID-Card-${patientData.lastName || 'Card'}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Image generation failed", err);
            setError("Failed to download image. Please try again.");
        }
    };

    const handlePatientRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const data = {
                username: patientData.username,
                password: patientData.password,
                email: patientData.email,
                first_name: patientData.firstName,
                last_name: patientData.lastName,
                role: 'PATIENT',
                profile_data: {
                    dob: patientData.dob,
                    phone: patientData.phone,
                    bloodGroup: patientData.bloodGroup,
                    organDonor: patientData.organDonor,
                    allergies: patientData.allergies,
                    conditions: patientData.conditions,
                    addressLine1: patientData.addressLine1,
                    addressLine2: patientData.addressLine2,
                    city: patientData.city,
                    state: patientData.state,
                    pin: patientData.pin,
                    wantPhysicalCard: patientData.wantPhysicalCard
                }
            };

            await register(data);
            await login(patientData.username, patientData.password);
            navigate('/patient/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorMsg = Object.values(err.response.data).flat().join(' ');
                setError(errorMsg || "Registration failed.");
            } else {
                setError("Registration failed. Please check your network.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ... (Handle Doctor Next same as before)

    // Login form input needs update to use 'username' state (which I renamed to 'loginUsername' but setLoginUsername)
    // Actually I renamed the state variable to avoid confusion, so I need to update the input value/onChange too.



    const handleDoctorNext = () => {
        if (doctorStep === 1) {
            const { firstName, lastName, email, password, confirmPassword } = doctorData;
            if (!firstName || !lastName || !email || !password) {
                setError("Please fill all required fields."); return;
            }
            if (!isEmailValid(email)) {
                setError("Please enter a valid email address."); return;
            }
            if (getPasswordStrength(password) < 2) {
                setError("Password is too weak."); return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match."); return;
            }
        }
        setError("");
        setDoctorStep(prev => prev + 1);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size should be less than 5MB");
                return;
            }
            setDoctorData({ ...doctorData, licenseDoc: file });
        }
    };
    const handleDoctorRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', doctorData.username);
            formData.append('password', doctorData.password);
            formData.append('email', doctorData.email);
            formData.append('first_name', doctorData.firstName);
            formData.append('last_name', doctorData.lastName);
            formData.append('role', 'DOCTOR');

            // Files
            if (doctorData.licenseDoc) formData.append('license_document', doctorData.licenseDoc);

            // Profile Data
            const profileData = {
                specialization: doctorData.specialization,
                experience: doctorData.experience,
                hospital_id: doctorData.hospital || null,
                department: doctorData.department,
                licenseNumber: doctorData.licenseNumber,
                issuingCouncil: doctorData.issuingCouncil,
                licenseExpiry: doctorData.licenseExpiry,
                dob: doctorData.dob,
                phone: doctorData.phone,
                addressLine1: doctorData.address,
            };
            formData.append('profile_data', JSON.stringify(profileData));

            // Use the username from the form, not an auto-generated one
            formData.set('username', doctorData.username);

            await register(formData);

            // Move to Step 5 (Under Review)
            setDoctorStep(5);

            try {
                await login(doctorData.username, doctorData.password);
                setTimeout(() => navigate('/doctor/dashboard'), 2000);
            } catch (e) {
                // If login fails (unverified), stay on Step 5 "Under Review"
            }

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorMsg = Object.values(err.response.data).flat().join(' ');
                setError(errorMsg || "Registration failed.");
            } else {
                setError("Registration failed. Please try again.");
            }
            // If failed, don't go to step 4
        } finally {
            setLoading(false); // Only set loading false if error, otherwise we are moving to step 4
        }
    };

    const handleLabTechNext = () => {
        if (labTechStep === 1) {
            const { firstName, lastName, email, password, confirmPassword, username } = labTechData;
            if (!firstName || !lastName || !email || !password || !username) {
                setError("Please fill all required fields."); return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match."); return;
            }
        }
        setError("");
        setLabTechStep(prev => prev + 1);
    };

    const handleLabTechRegister = async () => {
        if (!labTechData.licenseNumber) {
            setError('Please enter your license number.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const data = {
                username: labTechData.username,
                password: labTechData.password,
                email: labTechData.email,
                first_name: labTechData.firstName,
                last_name: labTechData.lastName,
                role: 'LAB_TECH',
                profile_data: {
                    lab: labTechData.lab || null,
                    license_number: labTechData.licenseNumber
                }
            };

            await register(data);

            try {
                await login(labTechData.username, labTechData.password);
                navigate('/lab/dashboard');
            } catch (e) {
                // If login fails (account might need activation), show pending step
                setLabTechStep(3);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorMsg = Object.values(err.response.data).flat().join(' ');
                setError(errorMsg || "Registration failed.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#3B9EE2]/20">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center mb-4 transform hover:scale-105 transition-transform">
                    <Activity className="w-8 h-8 text-[#0D1B2A]" />
                </div>
                <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">PulseID</h1>
            </div>

            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300">
                {/* Tabs */}
                <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex gap-1">
                    <button
                        onClick={() => { setActiveTab('login'); setError(''); }}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'login'
                            ? 'bg-white text-[#3B9EE2] shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setActiveTab('register'); setError(''); }}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'register'
                            ? 'bg-white text-[#3B9EE2] shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                    >
                        Register
                    </button>
                </div>

                <div className="p-8 sm:p-10">
                    {/* LOGIN FORM */}
                    {activeTab === 'login' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Role Selector */}
                            {/* Role Selector */}
                            <div className="grid grid-cols-2 gap-2 mb-8">
                                {loginRoles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setLoginRole(role.id)}
                                        className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${loginRole === role.id
                                            ? 'bg-[#3B9EE2] text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        {role.id === 'ADMIN' && <Lock className="w-3 h-3 opacity-70" />}
                                        {role.label}
                                    </button>
                                ))}
                            </div>

                            {loginRole === 'ADMIN' && (
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-3 leading-relaxed">
                                    <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="block font-bold text-slate-700 mb-1">Restricted Access</span>
                                        System administrators use credentials issued by PulseID.
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-3 animate-in shake">
                                    <Activity className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className={labelStyle}>Email or Username</label>
                                    <input
                                        type="text"
                                        value={username} onChange={e => setLoginUsername(e.target.value)}
                                        className={inputStyle}
                                        placeholder="name@domain.com or johndoe123"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-0">Password</label>
                                        <a href="#" className="text-xs font-bold text-[#3B9EE2] hover:text-[#2d8ac9] hover:underline transition-colors">Forgot password?</a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showLoginPassword ? "text" : "password"}
                                            value={password} onChange={e => setLoginPassword(e.target.value)}
                                            className={`${inputStyle} pr-12`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-4 top-3.5 text-slate-400 hover:text-[#3B9EE2] transition-colors focus:outline-none"
                                        >
                                            {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`${btnPrimaryStyle} mt-2`}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                </button>
                            </form>

                            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-500 font-medium">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setActiveTab('register')}
                                        className="text-[#3B9EE2] font-bold hover:text-[#2d8ac9] hover:underline transition-all ml-1"
                                    >
                                        Register
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}


                    {/* REGISTER FORM */}
                    {activeTab === 'register' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Registration Role Selector */}
                            <div className="flex bg-slate-50 p-1.5 rounded-xl mb-6 border border-slate-100">
                                {['PATIENT', 'DOCTOR', 'LAB_TECH'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => { setRegisterRole(role); setPatientStep(1); setDoctorStep(1); setLabTechStep(1); setError(''); }}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${registerRole === role
                                            ? 'bg-white text-[#3B9EE2] shadow-sm ring-1 ring-slate-200 transform scale-105'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {role === 'LAB_TECH' ? 'Lab Tech' : role.charAt(0) + role.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <Link
                                    to="/hospital/register"
                                    className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all group"
                                >
                                    <BuildingOffice2Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    Register Hospital
                                </Link>
                                <Link
                                    to="/lab/register"
                                    className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-purple-500 hover:text-purple-600 transition-all group"
                                >
                                    <BeakerIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    Register Lab
                                </Link>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-3 animate-in shake">
                                    <Activity className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}

                            {/* Patient Registration */}
                            {registerRole === 'PATIENT' && (
                                <div>
                                    <ProgressBar step={patientStep} total={5} />

                                    {/* Step 1: Personal Info */}
                                    {patientStep === 1 && (
                                        <div className="space-y-5">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>First Name</label>
                                                    <input type="text" className={inputStyle} value={patientData.firstName} onChange={e => setPatientData({ ...patientData, firstName: e.target.value })} placeholder="John" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Last Name</label>
                                                    <input type="text" className={inputStyle} value={patientData.lastName} onChange={e => setPatientData({ ...patientData, lastName: e.target.value })} placeholder="Doe" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Choose a Username</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        autoComplete="off"
                                                        className={`${inputStyle} pr-10 ${patientData.username && !/^[a-zA-Z0-9_]+$/.test(patientData.username) ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' :
                                                            usernameAvailable === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' :
                                                                usernameAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                                                            }`}
                                                        value={patientData.username}
                                                        onChange={e => setPatientData({ ...patientData, username: e.target.value.toLowerCase() })}
                                                        placeholder="johndoe123"
                                                    />
                                                    <div className="absolute right-3 top-3.5">
                                                        {isCheckingUsername ? (
                                                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                                        ) : patientData.username.length >= 3 ? (
                                                            (usernameAvailable === true && /^[a-zA-Z0-9_]+$/.test(patientData.username)) ? (
                                                                <Check className="w-5 h-5 text-green-500" />
                                                            ) : (usernameAvailable === false || !/^[a-zA-Z0-9_]+$/.test(patientData.username)) ? (
                                                                <X className="w-5 h-5 text-red-500" />
                                                            ) : null
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col mt-1.5 px-1 gap-1">
                                                    <p className="text-[12px] text-[#9CA3AF] font-medium">Used for quick login. Letters, numbers, and underscores only.</p>
                                                    {patientData.username && !/^[a-zA-Z0-9_]+$/.test(patientData.username) && (
                                                        <p className="text-[12px] text-red-500 font-medium">Only letters, numbers, and underscores allowed</p>
                                                    )}
                                                    {usernameAvailable === false && /^[a-zA-Z0-9_]+$/.test(patientData.username) && (
                                                        <p className="text-[12px] text-red-500 font-medium">Username is already taken.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Email Address</label>
                                                <input type="email" className={inputStyle} value={patientData.email} onChange={e => setPatientData({ ...patientData, email: e.target.value })} placeholder="name@domain.com" />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showRegisterPassword ? "text" : "password"}
                                                        className={`${inputStyle} pr-12`}
                                                        value={patientData.password}
                                                        onChange={e => setPatientData({ ...patientData, password: e.target.value })}
                                                        placeholder="Create a strong password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#3B9EE2] transition-colors focus:outline-none"
                                                    >
                                                        {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <PasswordStrength password={patientData.password} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Confirm Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showRegisterPassword ? "text" : "password"}
                                                        className={inputStyle}
                                                        value={patientData.confirmPassword}
                                                        onChange={e => setPatientData({ ...patientData, confirmPassword: e.target.value })}
                                                        placeholder="Re-enter password"
                                                    />
                                                </div>
                                            </div>

                                            <button onClick={handlePatientNext} className={`${btnPrimaryStyle} mt-4`}>Continue <ArrowRight className="w-5 h-5 ml-2" /></button>
                                        </div>
                                    )}

                                    {/* Step 2: Personal Details */}
                                    {patientStep === 2 && (
                                        <div className="space-y-5">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Date of Birth</label>
                                                    <input type="date" className={inputStyle} value={patientData.dob} onChange={e => setPatientData({ ...patientData, dob: e.target.value })} />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Gender</label>
                                                    <div className="relative">
                                                        <select className={`${inputStyle} appearance-none cursor-pointer`} value={patientData.gender} onChange={e => setPatientData({ ...patientData, gender: e.target.value })}>
                                                            {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 top-4 pointer-events-none text-slate-400"><ArrowRight className="w-4 h-4 rotate-90" /></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Phone Number</label>
                                                <input type="tel" className={inputStyle} value={patientData.phone} onChange={e => setPatientData({ ...patientData, phone: e.target.value })} placeholder="+91 98765 43210" />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Address</label>
                                                <input type="text" className={`${inputStyle} mb-3`} placeholder="Street Address / Flat No." value={patientData.addressLine1} onChange={e => setPatientData({ ...patientData, addressLine1: e.target.value })} />
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex gap-3">
                                                        <input type="text" placeholder="City" className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" value={patientData.city} onChange={e => setPatientData({ ...patientData, city: e.target.value })} />
                                                        <input type="text" placeholder="State" className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" value={patientData.state} onChange={e => setPatientData({ ...patientData, state: e.target.value })} />
                                                    </div>
                                                    <input type="text" placeholder="PIN Code" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" value={patientData.pin} onChange={e => setPatientData({ ...patientData, pin: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setPatientStep(1)} className={btnGhostStyle}>Back</button>
                                                <button onClick={handlePatientNext} className={btnPrimaryStyle}>Continue <ArrowRight className="w-5 h-5 ml-2" /></button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Medical Details */}
                                    {patientStep === 3 && (
                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Blood Group</label>
                                                    <div className="relative">
                                                        <select className={`${inputStyle} appearance-none cursor-pointer`} value={patientData.bloodGroup} onChange={e => setPatientData({ ...patientData, bloodGroup: e.target.value })}>
                                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                        </select>
                                                        <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                                                            <ArrowRight className="w-4 h-4 rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Organ Donor</label>
                                                    <button
                                                        onClick={() => setPatientData({ ...patientData, organDonor: !patientData.organDonor })}
                                                        className={`w-full py-[13px] px-4 rounded-xl border-2 flex items-center justify-between transition-all group ${patientData.organDonor
                                                            ? 'bg-[#2EC4A9]/5 border-[#2EC4A9] text-[#2EC4A9]'
                                                            : 'bg-white border-slate-200 text-slate-500 hover:border-[#3B9EE2] hover:text-[#3B9EE2]'
                                                            }`}
                                                    >
                                                        <span className="text-sm font-bold">{patientData.organDonor ? 'Yes, I am a Donor' : 'Not a Donor'}</span>
                                                        {patientData.organDonor ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Known Allergies (Optional)</label>
                                                <textarea className={`${inputStyle} h-32 resize-none`} placeholder="e.g. Penicillin, Peanuts, Dust Mites..." value={patientData.allergies} onChange={e => setPatientData({ ...patientData, allergies: e.target.value })} />
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setPatientStep(2)} className={btnGhostStyle}>Back</button>
                                                <button onClick={handlePatientNext} className={btnPrimaryStyle}>Continue</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: ID Reveal */}
                                    {patientStep === 4 && (
                                        <div className="text-center">
                                            {isGeneratingID ? (
                                                <div className="py-16 flex flex-col items-center">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 border-4 border-[#3B9EE2]/20 border-t-[#3B9EE2] rounded-full animate-spin mb-8"></div>
                                                        <Activity className="w-8 h-8 text-[#3B9EE2] absolute top-6 left-6 animate-pulse" />
                                                    </div>
                                                    <p className="text-[#0D1B2A] font-bold text-xl mb-2">Generating Identity</p>
                                                    <p className="text-slate-500 font-medium">Encrypting health records...</p>
                                                </div>
                                            ) : (
                                                <div className="animate-in zoom-in duration-500">
                                                    {/* Health ID Card */}
                                                    <div id="health-id-card" className="relative mx-auto w-full max-w-[380px] aspect-[85/54] bg-[#0D1B2A] rounded-2xl shadow-2xl overflow-hidden text-left p-6 text-white mb-8 group hover:scale-[1.02] transition-all duration-500 ring-4 ring-slate-100/50">
                                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-3"><div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm"><Activity className="w-5 h-5 text-[#3B9EE2]" /></div><span className="font-bold tracking-tight text-xl">PulseID</span></div>
                                                                <div className="bg-[#0d2e2a] text-[#2EC4A9] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[#2EC4A9]/20 backdrop-blur-sm">Patient</div>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-2 pl-1">
                                                                <div>
                                                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Health ID</div>
                                                                    <div className="text-2xl font-mono font-bold tracking-widest text-white drop-shadow-lg">{generatedID}</div>
                                                                    <div className="text-base mt-1.5 font-bold tracking-wide capitalize">{patientData.firstName} {patientData.lastName}</div>
                                                                </div>
                                                                <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-slate-100">
                                                                    <svg width="64" height="64" viewBox="0 0 72 72" className="text-[#0D1B2A]">
                                                                        <rect x="0" y="0" width="20" height="20" fill="currentColor" />
                                                                        <rect x="4" y="4" width="12" height="12" fill="white" />
                                                                        <rect x="6" y="6" width="8" height="8" fill="currentColor" />
                                                                        <rect x="52" y="0" width="20" height="20" fill="currentColor" />
                                                                        <rect x="56" y="4" width="12" height="12" fill="white" />
                                                                        <rect x="58" y="6" width="8" height="8" fill="currentColor" />
                                                                        <rect x="0" y="52" width="20" height="20" fill="currentColor" />
                                                                        <rect x="4" y="56" width="12" height="12" fill="white" />
                                                                        <rect x="6" y="58" width="8" height="8" fill="currentColor" />
                                                                        <rect x="25" y="5" width="5" height="5" fill="currentColor" />
                                                                        <rect x="35" y="15" width="5" height="5" fill="currentColor" />
                                                                        <rect x="45" y="25" width="5" height="5" fill="currentColor" />
                                                                        <rect x="5" y="35" width="5" height="5" fill="currentColor" />
                                                                        <rect x="15" y="45" width="5" height="5" fill="currentColor" />
                                                                        <rect x="55" y="45" width="5" height="5" fill="currentColor" />
                                                                        <rect x="25" y="55" width="5" height="5" fill="currentColor" />
                                                                        <rect x="35" y="65" width="5" height="5" fill="currentColor" />
                                                                        <rect x="25" y="30" width="10" height="10" fill="currentColor" opacity="0.5" />
                                                                        <rect x="40" y="40" width="10" height="10" fill="currentColor" opacity="0.3" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-end text-[10px] border-t border-white/10 pt-4 mt-2">
                                                                <div className="flex gap-6">
                                                                    <div><span className="text-slate-400 block mb-0.5 uppercase tracking-wider">Blood Type</span><span className="font-bold text-base">{patientData.bloodGroup}</span></div>
                                                                    <div><span className="text-slate-400 block mb-0.5 uppercase tracking-wider">Organ Donor</span><span className="font-bold text-[#2EC4A9] text-base">{patientData.organDonor ? 'Yes' : 'No'}</span></div>
                                                                </div>
                                                                <div className="text-slate-500 font-medium tracking-wide">Valid across all providers</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 transition-all hover:border-[#3B9EE2]/30">
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                                            Your Health ID has been successfully generated. You can download your official Health Card and QR code anytime from your dashboard after completing the final step.
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <button onClick={() => setPatientStep(3)} className={btnGhostStyle}>Back</button>
                                                        <button onClick={() => setPatientStep(5)} className={btnPrimaryStyle}>Continue →</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 5: Physical Card */}
                                    {patientStep === 5 && (
                                        <div>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 transition-all hover:border-[#3B9EE2]/30">
                                                <div className="flex justify-between items-center mb-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm ${patientData.wantPhysicalCard ? 'bg-[#2EC4A9] text-white shadow-[#2EC4A9]/20' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                                            <ShieldCheck className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-bold text-[#0D1B2A]">Order Physical ID Card</h3>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Premium PVC card shipped to your door</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setPatientData({ ...patientData, wantPhysicalCard: !patientData.wantPhysicalCard })}
                                                        className={`w-14 h-8 rounded-full transition-colors relative focus:outline-none focus:ring-4 focus:ring-[#3B9EE2]/20 ${patientData.wantPhysicalCard ? 'bg-[#2EC4A9]' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all transform duration-300 ${patientData.wantPhysicalCard ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                {patientData.wantPhysicalCard && (
                                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-5 border-t border-slate-200/60">
                                                        <input type="text" placeholder="Street Address" className={inputStyle} />
                                                        <input type="text" placeholder="Apartment, Suite, etc. (Optional)" className={inputStyle} />
                                                        <div className="flex gap-3">
                                                            <input type="text" placeholder="City" className="flex-[2] w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" />
                                                            <input type="text" placeholder="PIN Code" className="flex-1 w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4">
                                                <button onClick={() => setPatientStep(4)} className={btnGhostStyle}>Back</button>
                                                <button onClick={handlePatientRegister} className={btnPrimaryStyle}>
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Doctor Registration */}
                            {registerRole === 'DOCTOR' && (
                                <div>
                                    <ProgressBar step={doctorStep} total={4} />

                                    {/* Doctor Step 1: Account */}
                                    {doctorStep === 1 && (
                                        <div className="space-y-5">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>First Name</label>
                                                    <input type="text" className={inputStyle} value={doctorData.firstName} onChange={e => setDoctorData({ ...doctorData, firstName: e.target.value })} placeholder="Jane" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Last Name</label>
                                                    <input type="text" className={inputStyle} value={doctorData.lastName} onChange={e => setDoctorData({ ...doctorData, lastName: e.target.value })} placeholder="Smith" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Choose a Username</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className={`${inputStyle} pr-10 ${usernameAvailable === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' :
                                                            usernameAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                                                            }`}
                                                        value={doctorData.username || ''}
                                                        onChange={e => setDoctorData({ ...doctorData, username: e.target.value })}
                                                        placeholder="dr_jane_smith"
                                                    />
                                                    <div className="absolute right-3 top-3.5">
                                                        {isCheckingUsername ? (
                                                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                                        ) : (doctorData.username && doctorData.username.length >= 3) ? (
                                                            usernameAvailable === true ? (
                                                                <Check className="w-5 h-5 text-green-500" />
                                                            ) : usernameAvailable === false ? (
                                                                <X className="w-5 h-5 text-red-500" />
                                                            ) : null
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {usernameAvailable === false && <p className="text-xs text-red-500 mt-1 font-medium">Username is already taken.</p>}

                                                {suggestedUsernames.length > 0 && !doctorData.username && (
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Available suggestions:
                                                        {suggestedUsernames.map(s => (
                                                            <button key={s} onClick={() => setDoctorData({ ...doctorData, username: s })} className="ml-2 text-[#3B9EE2] hover:underline font-medium">
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Email Address</label>
                                                <input type="email" className={inputStyle} value={doctorData.email} onChange={e => setDoctorData({ ...doctorData, email: e.target.value })} placeholder="doctor@hospital.com" />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showRegisterPassword ? "text" : "password"}
                                                        className={`${inputStyle} pr-12`}
                                                        value={doctorData.password}
                                                        onChange={e => setDoctorData({ ...doctorData, password: e.target.value })}
                                                        placeholder="Create password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#3B9EE2] transition-colors focus:outline-none"
                                                    >
                                                        {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <PasswordStrength password={doctorData.password} />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Confirm Password</label>
                                                <div className="relative">
                                                    <input type={showRegisterPassword ? "text" : "password"} className={inputStyle} value={doctorData.confirmPassword} onChange={e => setDoctorData({ ...doctorData, confirmPassword: e.target.value })} placeholder="Re-enter password" />
                                                </div>
                                            </div>

                                            <button onClick={handleDoctorNext} className={`${btnPrimaryStyle} mt-4`}>Continue <ArrowRight className="w-5 h-5 ml-2" /></button>
                                        </div>
                                    )}

                                    {/* Doctor Step 2: Personal Details (NEW) */}
                                    {doctorStep === 2 && (
                                        <div className="space-y-5">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Personal Details</h3>

                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Date of Birth</label>
                                                    <input type="date" className={inputStyle} value={doctorData.dob || ''} onChange={e => setDoctorData({ ...doctorData, dob: e.target.value })} />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Phone Number</label>
                                                    <input type="tel" className={inputStyle} value={doctorData.phone || ''} onChange={e => setDoctorData({ ...doctorData, phone: e.target.value })} placeholder="+91 98765 43210" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Address</label>
                                                <textarea className={inputStyle} rows="3" value={doctorData.address || ''} onChange={e => setDoctorData({ ...doctorData, address: e.target.value })} placeholder="Full residential address" />
                                            </div>

                                            <div className="flex gap-3">
                                                <input type="text" placeholder="City" className="flex-[2] w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" value={doctorData.city || ''} onChange={e => setDoctorData({ ...doctorData, city: e.target.value })} />
                                                <input type="text" placeholder="PIN Code" className="flex-1 w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:border-[#3B9EE2] outline-none transition-all placeholder:text-slate-400 font-medium" value={doctorData.pin || ''} onChange={e => setDoctorData({ ...doctorData, pin: e.target.value })} />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setDoctorStep(1)} className={btnGhostStyle}>Back</button>
                                                <button onClick={() => setDoctorStep(3)} className={btnPrimaryStyle}>Continue</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Doctor Step 3: Professional */}
                                    {doctorStep === 3 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelStyle}>Specialization</label>
                                                <div className="relative">
                                                    <select className={`${inputStyle} appearance-none cursor-pointer`} value={doctorData.specialization} onChange={e => setDoctorData({ ...doctorData, specialization: e.target.value })}>
                                                        <option>General Medicine</option>
                                                        <option>Cardiology</option>
                                                        <option>Pediatrics</option>
                                                        <option>Surgery</option>
                                                        <option>Dermatology</option>
                                                        <option>Orthopedics</option>
                                                    </select>
                                                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Affiliated Hospital</label>
                                                <div className="relative">
                                                    <select
                                                        className={`${inputStyle} appearance-none cursor-pointer`}
                                                        value={doctorData.hospital}
                                                        onChange={e => setDoctorData({ ...doctorData, hospital: e.target.value })}
                                                    >
                                                        <option value="">— No affiliation / Independent —</option>
                                                        {availableHospitals.length === 0 && (
                                                            <option disabled>Loading hospitals...</option>
                                                        )}
                                                        {availableHospitals.map(h => (
                                                            <option key={h.id} value={h.id}>
                                                                {h.name} — {h.address?.split(',')[0] || h.address}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400"><ArrowRight className="w-4 h-4 rotate-90" /></div>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1.5 ml-1">Only verified hospitals are shown. You can update this later.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Experience (Yrs)</label>
                                                    <input type="number" className={inputStyle} placeholder="5" value={doctorData.experience} onChange={e => setDoctorData({ ...doctorData, experience: e.target.value })} />
                                                </div>
                                                <div className="flex-[2]">
                                                    <label className={labelStyle}>Department</label>
                                                    <input type="text" className={inputStyle} placeholder="e.g. Outpatient" value={doctorData.department} onChange={e => setDoctorData({ ...doctorData, department: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setDoctorStep(2)} className={btnGhostStyle}>Back</button>
                                                <button onClick={() => setDoctorStep(4)} className={btnPrimaryStyle}>Continue</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Doctor Step 4: Licensing & Documents */}
                                    {doctorStep === 4 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelStyle}>Medical License Number</label>
                                                <input type="text" className={inputStyle} placeholder="e.g. MCI/1234/5678" value={doctorData.licenseNumber} onChange={e => setDoctorData({ ...doctorData, licenseNumber: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Issuing Council</label>
                                                <input type="text" className={inputStyle} placeholder="State Medical Council" value={doctorData.issuingCouncil} onChange={e => setDoctorData({ ...doctorData, issuingCouncil: e.target.value })} />
                                            </div>

                                            {/* License Document */}
                                            <div className="py-2">
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">License Document</label>
                                                <input type="file" onChange={(e) => setDoctorData({ ...doctorData, licenseDoc: e.target.files[0] })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            </div>

                                            {/* Degree Certificate */}
                                            <div className="py-2">
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Degree Certificate</label>
                                                <input type="file" onChange={(e) => setDoctorData({ ...doctorData, degreeCertificate: e.target.files[0] })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            </div>

                                            {/* Identity Proof */}
                                            <div className="py-2">
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Identity Proof (Aadhaar/PAN)</label>
                                                <input type="file" onChange={(e) => setDoctorData({ ...doctorData, identityProof: e.target.files[0] })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setDoctorStep(3)} className={btnGhostStyle}>Back</button>
                                                <button onClick={handleDoctorRegister} className={btnPrimaryStyle}>Submit Application</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Doctor Step 4: Pending */}
                                    {doctorStep === 4 && (
                                        <div className="text-center py-12 animate-in zoom-in duration-500">
                                            <div className="w-24 h-24 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-white">
                                                <Clock className="w-12 h-12 text-[#3B9EE2] animate-pulse" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-4 tracking-tight">Under Review</h2>
                                            <p className="text-slate-500 text-base mb-10 px-4 leading-relaxed max-w-sm mx-auto font-medium">
                                                We're verifying your credentials with the medical council. You'll receive an approval email within 24-48 hours.
                                            </p>

                                            <div className="space-y-4 mb-10 text-left max-w-[300px] mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                                                <div className="flex items-center gap-4 text-sm pb-4 border-b border-slate-50">
                                                    <div className="w-8 h-8 rounded-full bg-[#2EC4A9] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#2EC4A9]/20"><Check className="w-5 h-5" /></div>
                                                    <div>
                                                        <span className="text-[#0D1B2A] font-bold block">Submitted</span>
                                                        <span className="text-xs text-slate-400">Application received</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm pt-1">
                                                    <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border-2 border-[#3B9EE2] flex items-center justify-center shrink-0"><div className="w-3 h-3 bg-[#3B9EE2] rounded-full animate-bounce" /></div>
                                                    <div>
                                                        <span className="text-[#3B9EE2] font-bold block">In Progress</span>
                                                        <span className="text-xs text-slate-400">Verifying documents</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link to="/" className={btnGhostStyle}>Return to Homepage</Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Lab Tech Registration */}
                            {registerRole === 'LAB_TECH' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <ProgressBar step={labTechStep} total={3} />

                                    {/* Lab Tech Step 1: Account */}
                                    {labTechStep === 1 && (
                                        <div className="space-y-5">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>First Name</label>
                                                    <input type="text" className={inputStyle} value={labTechData.firstName} onChange={e => setLabTechData({ ...labTechData, firstName: e.target.value })} placeholder="Jane" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Last Name</label>
                                                    <input type="text" className={inputStyle} value={labTechData.lastName} onChange={e => setLabTechData({ ...labTechData, lastName: e.target.value })} placeholder="Smith" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Choose a Username</label>
                                                <input
                                                    type="text"
                                                    className={inputStyle}
                                                    value={labTechData.username}
                                                    onChange={e => setLabTechData({ ...labTechData, username: e.target.value.toLowerCase() })}
                                                    placeholder="labtech_jane"
                                                />
                                            </div>

                                            <div>
                                                <label className={labelStyle}>Email Address</label>
                                                <input type="email" className={inputStyle} value={labTechData.email} onChange={e => setLabTechData({ ...labTechData, email: e.target.value })} placeholder="jane@lab.com" />
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Password</label>
                                                    <input type="password" className={inputStyle} value={labTechData.password} onChange={e => setLabTechData({ ...labTechData, password: e.target.value })} placeholder="••••••••" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className={labelStyle}>Confirm</label>
                                                    <input type="password" className={inputStyle} value={labTechData.confirmPassword} onChange={e => setLabTechData({ ...labTechData, confirmPassword: e.target.value })} placeholder="••••••••" />
                                                </div>
                                            </div>

                                            <button onClick={handleLabTechNext} className={`${btnPrimaryStyle} mt-4`}>Continue <ArrowRight className="w-5 h-5 ml-2" /></button>
                                        </div>
                                    )}

                                    {/* Lab Tech Step 2: Professional */}
                                    {labTechStep === 2 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelStyle}>Affiliated Laboratory</label>
                                                <div className="relative">
                                                    <select
                                                        className={`${inputStyle} appearance-none cursor-pointer`}
                                                        value={labTechData.lab}
                                                        onChange={e => setLabTechData({ ...labTechData, lab: e.target.value })}
                                                    >
                                                        <option value="">Select a Lab (optional)</option>
                                                        {availableLabs.map(lab => (
                                                            <option key={lab.id} value={lab.id}>{lab.name} — {lab.address?.split(',')[0]}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">If your lab isn't listed, you can proceed without selecting one and add it later.</p>
                                            </div>

                                            <div>
                                                <label className={labelStyle}>License Number</label>
                                                <input
                                                    type="text"
                                                    className={inputStyle}
                                                    placeholder="e.g. LAB-123456"
                                                    value={labTechData.licenseNumber}
                                                    onChange={e => setLabTechData({ ...labTechData, licenseNumber: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button onClick={() => setLabTechStep(1)} className={btnGhostStyle}>Back</button>
                                                <button onClick={handleLabTechRegister} className={btnPrimaryStyle}>
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register as Lab Tech'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lab Tech Step 3: Pending */}
                                    {labTechStep === 3 && (
                                        <div className="text-center py-12 animate-in zoom-in duration-500">
                                            <div className="w-24 h-24 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-white">
                                                <Clock className="w-12 h-12 text-purple-600 animate-pulse" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-4 tracking-tight">Under Review</h2>
                                            <p className="text-slate-500 text-base mb-10 px-4 leading-relaxed max-w-sm mx-auto font-medium">
                                                Your technician profile is being verified by the lab administrator and PulseID system. You'll be notified once approved.
                                            </p>
                                            <Link to="/" className={btnGhostStyle}>Return to Homepage</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnifiedLogin;
