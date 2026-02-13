import React from 'react';

const ConsultationForm = ({ newConsultation, setNewConsultation, handleSubmit }) => {
    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>➕</span>
                <span>New Consultation</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="datetime-local"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    value={newConsultation.consultation_date}
                    onChange={e => setNewConsultation({ ...newConsultation, consultation_date: e.target.value })}
                />
                <textarea
                    placeholder="Chief Complaint *"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    rows="2"
                    required
                    value={newConsultation.chief_complaint}
                    onChange={e => setNewConsultation({ ...newConsultation, chief_complaint: e.target.value })}
                />
                <textarea
                    placeholder="Diagnosis"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    rows="2"
                    value={newConsultation.diagnosis}
                    onChange={e => setNewConsultation({ ...newConsultation, diagnosis: e.target.value })}
                />
                <textarea
                    placeholder="Prescription"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    rows="2"
                    value={newConsultation.prescription}
                    onChange={e => setNewConsultation({ ...newConsultation, prescription: e.target.value })}
                />
                <input
                    type="date"
                    placeholder="Follow-up Date"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                    value={newConsultation.follow_up_date}
                    onChange={e => setNewConsultation({ ...newConsultation, follow_up_date: e.target.value })}
                />
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg transition-all"
                >
                    💾 Save Consultation
                </button>
            </form>
        </div>
    );
};

export default ConsultationForm;
