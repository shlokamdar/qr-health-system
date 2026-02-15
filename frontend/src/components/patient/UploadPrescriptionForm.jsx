import React from 'react';

const UploadPrescriptionForm = ({ newPrescription, setNewPrescription, handleUpload }) => {
    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-3">Add Old Prescription</h3>
            <form onSubmit={handleUpload} className="space-y-3">
                <input
                    type="date"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newPrescription.prescription_date}
                    onChange={e => setNewPrescription({ ...newPrescription, prescription_date: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Doctor Name"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newPrescription.doctor_name}
                    onChange={e => setNewPrescription({ ...newPrescription, doctor_name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Hospital Name"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newPrescription.hospital_name}
                    onChange={e => setNewPrescription({ ...newPrescription, hospital_name: e.target.value })}
                />
                <textarea
                    placeholder="Symptoms *"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newPrescription.symptoms}
                    onChange={e => setNewPrescription({ ...newPrescription, symptoms: e.target.value })}
                />
                <textarea
                    placeholder="Diagnosis"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newPrescription.diagnosis}
                    onChange={e => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                />
                <textarea
                    placeholder="Medicines (one per line: name, dosage, frequency)"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    value={newPrescription.medicines}
                    onChange={e => setNewPrescription({ ...newPrescription, medicines: e.target.value })}
                />
                <input
                    type="file"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    onChange={e => setNewPrescription({ ...newPrescription, file: e.target.files[0] })}
                />
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors shadow-sm">
                    Save Prescription
                </button>
            </form>
        </div>
    );
};

export default UploadPrescriptionForm;
