import React from 'react';

const PatientRegisterForm = ({ newPatient, setNewPatient, handleRegister }) => {
    const inputStyle = "w-full border border-[#E2E8F0] bg-white p-3 rounded-[6px] text-[14px] focus:border-[#3B9EE2] focus:ring-4 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]";
    
    return (
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-8 shadow-sm max-w-4xl mx-auto">
            <h3 className="text-[18px] font-bold text-[#0D1B2A] mb-6">Register New Patient</h3>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                    type="text"
                    placeholder="Username *"
                    required
                    className={inputStyle}
                    value={newPatient.username}
                    onChange={e => setNewPatient({ ...newPatient, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password *"
                    required
                    className={inputStyle}
                    value={newPatient.password}
                    onChange={e => setNewPatient({ ...newPatient, password: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email *"
                    required
                    className={inputStyle}
                    value={newPatient.email}
                    onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                />
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
                <input
                    type="text"
                    placeholder="Contact Number"
                    className={inputStyle}
                    value={newPatient.contact_number}
                    onChange={e => setNewPatient({ ...newPatient, contact_number: e.target.value })}
                />
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
