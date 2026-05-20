import React, { useState, useEffect } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const PatientRegisterForm = ({ newPatient, setNewPatient, handleRegister }) => {
    const inputStyle = "w-full border border-[#E2E8F0] bg-white p-3 rounded-[6px] text-[14px] focus:border-[#3B9EE2] focus:ring-4 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]";

    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    
    const [phoneAvailable, setPhoneAvailable] = useState(null);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);

    // Reset validations if form fields are cleared/reset
    useEffect(() => {
        if (!newPatient.username) setUsernameAvailable(null);
        if (!newPatient.email) setEmailAvailable(null);
        if (!newPatient.contact_number) setPhoneAvailable(null);
    }, [newPatient.username, newPatient.email, newPatient.contact_number]);

    // Username Check
    useEffect(() => {
        const username = newPatient.username;
        const checkAvailability = async () => {
            if (!username || username.length < 3) {
                setUsernameAvailable(null);
                return;
            }
            setIsCheckingUsername(true);
            try {
                const response = await api.get(`auth/check-username/?username=${username}`);
                setUsernameAvailable(response.data.available);
            } catch (err) {
                console.error("Failed to check username", err);
                setUsernameAvailable(null);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [newPatient.username]);

    // Email Check
    useEffect(() => {
        const email = newPatient.email;
        const checkAvailability = async () => {
            if (!email || !isEmailValid(email)) {
                setEmailAvailable(null);
                return;
            }
            setIsCheckingEmail(true);
            try {
                const response = await api.get(`auth/check-email/?email=${email}`);
                setEmailAvailable(response.data.available);
            } catch (err) {
                console.error("Failed to check email", err);
                setEmailAvailable(null);
            } finally {
                setIsCheckingEmail(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [newPatient.email]);

    // Phone Check
    useEffect(() => {
        const phone = newPatient.contact_number;
        const checkAvailability = async () => {
            if (!phone || phone.length < 10) {
                setPhoneAvailable(null);
                return;
            }
            setIsCheckingPhone(true);
            try {
                const response = await api.get(`auth/check-phone/?phone=${phone}`);
                setPhoneAvailable(response.data.available);
            } catch (err) {
                console.error("Failed to check phone", err);
                setPhoneAvailable(null);
            } finally {
                setIsCheckingPhone(false);
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [newPatient.contact_number]);

    const onSubmit = (e) => {
        e.preventDefault();
        
        if (!/^[a-zA-Z0-9_]+$/.test(newPatient.username)) {
            toast.error("Username can only contain letters, numbers, and underscores.");
            return;
        }
        if (!isEmailValid(newPatient.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (usernameAvailable === false) {
            toast.error("Username is already taken.");
            return;
        }
        if (emailAvailable === false) {
            toast.error("Email is already registered.");
            return;
        }
        if (phoneAvailable === false) {
            toast.error("Contact number is already registered.");
            return;
        }
        
        handleRegister(e);
    };
    
    return (
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-8 shadow-sm max-w-4xl mx-auto">
            <h3 className="text-[18px] font-bold text-[#0D1B2A] mb-6">Register New Patient</h3>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Username *"
                        required
                        className={`${inputStyle} pr-10 ${usernameAvailable === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' :
                            usernameAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                        }`}
                        value={newPatient.username}
                        onChange={e => setNewPatient({ ...newPatient, username: e.target.value })}
                    />
                    <div className="absolute right-3 top-3.5">
                        {isCheckingUsername ? (
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        ) : (newPatient.username && newPatient.username.length >= 3) ? (
                            usernameAvailable === true ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : usernameAvailable === false ? (
                                <X className="w-5 h-5 text-red-500" />
                            ) : null
                        ) : null}
                    </div>
                </div>
                <input
                    type="password"
                    placeholder="Password *"
                    required
                    className={inputStyle}
                    value={newPatient.password}
                    onChange={e => setNewPatient({ ...newPatient, password: e.target.value })}
                />
                <div className="relative">
                    <input
                        type="email"
                        placeholder="Email *"
                        required
                        className={`${inputStyle} pr-10 ${emailAvailable === true && isEmailValid(newPatient.email) ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' :
                            (emailAvailable === false || (newPatient.email && newPatient.email.length > 5 && !isEmailValid(newPatient.email))) ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                        }`}
                        value={newPatient.email}
                        onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                    />
                    <div className="absolute right-3 top-3.5">
                        {isCheckingEmail ? (
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        ) : (newPatient.email && newPatient.email.length > 5) ? (
                            (emailAvailable === true && isEmailValid(newPatient.email)) ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (emailAvailable === false || !isEmailValid(newPatient.email)) ? (
                                <X className="w-5 h-5 text-red-500" />
                            ) : null
                        ) : null}
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="First Name *"
                    required
                    className={inputStyle}
                    value={newPatient.first_name}
                    onChange={e => setNewPatient({ ...newPatient, first_name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Last Name *"
                    required
                    className={inputStyle}
                    value={newPatient.last_name}
                    onChange={e => setNewPatient({ ...newPatient, last_name: e.target.value })}
                />
                <input
                    type="date"
                    required
                    className={inputStyle}
                    value={newPatient.date_of_birth}
                    onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                />
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Contact Number"
                        className={`${inputStyle} pr-10 ${phoneAvailable === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' :
                            phoneAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
                        }`}
                        value={newPatient.contact_number}
                        onChange={e => setNewPatient({ ...newPatient, contact_number: e.target.value })}
                    />
                    <div className="absolute right-3 top-3.5">
                        {isCheckingPhone ? (
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        ) : (newPatient.contact_number && newPatient.contact_number.length >= 10) ? (
                            phoneAvailable === true ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : phoneAvailable === false ? (
                                <X className="w-5 h-5 text-red-500" />
                            ) : null
                        ) : null}
                    </div>
                </div>
                <select
                    className={inputStyle}
                    value={newPatient.blood_group}
                    onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })}
                >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full bg-[#3B9EE2] text-white py-3.5 rounded-[8px] hover:bg-[#2e8dd1] font-bold text-lg shadow-sm transition-all"
                    >
                        Register Patient
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientRegisterForm;
