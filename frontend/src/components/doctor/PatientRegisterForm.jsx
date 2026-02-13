import React from 'react';

const PatientRegisterForm = ({ newPatient, setNewPatient, handleRegister }) => {
    return (
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <input
                type="text"
                placeholder="Username *"
                required
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.username}
                onChange={e => setNewPatient({ ...newPatient, username: e.target.value })}
            />
            <input
                type="password"
                placeholder="Password *"
                required
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.password}
                onChange={e => setNewPatient({ ...newPatient, password: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email *"
                required
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.email}
                onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
            />
            <input
                type="text"
                placeholder="First Name *"
                required
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.first_name}
                onChange={e => setNewPatient({ ...newPatient, first_name: e.target.value })}
            />
            <input
                type="text"
                placeholder="Last Name *"
                required
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.last_name}
                onChange={e => setNewPatient({ ...newPatient, last_name: e.target.value })}
            />
            <input
                type="date"
                required
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.date_of_birth}
                onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
            />
            <input
                type="text"
                placeholder="Contact Number"
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
                value={newPatient.contact_number}
                onChange={e => setNewPatient({ ...newPatient, contact_number: e.target.value })}
            />
            <select
                className="border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none"
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
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                    Register Patient
                </button>
            </div>
        </form>
    );
};

export default PatientRegisterForm;
