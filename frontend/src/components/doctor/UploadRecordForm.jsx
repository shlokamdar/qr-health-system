import React from 'react';

const UploadRecordForm = ({ newRecord, setNewRecord, handleUpload }) => {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>📤</span>
                <span>Add Record</span>
            </h3>
            <form onSubmit={handleUpload} className="space-y-3">
                <select
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                    value={newRecord.record_type}
                    onChange={e => setNewRecord({ ...newRecord, record_type: e.target.value })}
                >
                    <option value="PRESCRIPTION">💊 Prescription</option>
                    <option value="DIAGNOSIS">🔬 Diagnosis</option>
                    <option value="LAB_REPORT">🧪 Lab Report</option>
                    <option value="VISIT_NOTE">📝 Visit Note</option>
                </select>
                <input
                    type="text"
                    placeholder="Record Title"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                    value={newRecord.title}
                    onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                />
                <input
                    type="file"
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    onChange={e => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                />
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium shadow-lg transition-all"
                >
                    📤 Upload Record
                </button>
            </form>
        </div>
    );
};

export default UploadRecordForm;
