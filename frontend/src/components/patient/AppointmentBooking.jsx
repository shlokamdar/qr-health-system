import React from 'react';

const AppointmentBooking = ({ 
    newAppointment, 
    setNewAppointment, 
    doctorsList, 
    handleBookAppointment 
}) => {
    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-3">Book Appointment</h3>
            <form onSubmit={handleBookAppointment} className="space-y-3">
                <select
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                    value={newAppointment.doctor}
                    onChange={e => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                >
                    <option value="">Select Doctor</option>
                    {doctorsList.map(doc => (
                        <option key={doc.id} value={doc.id}>
                            Dr. {doc.user.first_name} {doc.user.last_name} ({doc.specialization})
                        </option>
                    ))}
                </select>
                <input
                    type="datetime-local"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newAppointment.appointment_date}
                    onChange={e => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
                />
                <textarea
                    placeholder="Reason for visit *"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows="3"
                    value={newAppointment.reason}
                    onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors shadow-sm">
                    Request Appointment
                </button>
            </form>
        </div>
    );
};

export default AppointmentBooking;
