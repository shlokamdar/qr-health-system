import React from 'react';

const UploadDocumentForm = ({ newDocument, setNewDocument, handleUpload }) => {
    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-3">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-3">
                <select
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newDocument.document_type}
                    onChange={e => setNewDocument({ ...newDocument, document_type: e.target.value })}
                >
                    <option value="REPORT">Medical Report</option>
                    <option value="INSURANCE">Insurance Document</option>
                    <option value="ID_PROOF">ID Proof</option>
                    <option value="OTHER">Other</option>
                </select>
                <input
                    type="text"
                    placeholder="Title *"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newDocument.title}
                    onChange={e => setNewDocument({ ...newDocument, title: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={newDocument.description}
                    onChange={e => setNewDocument({ ...newDocument, description: e.target.value })}
                />
                <input
                    type="file"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={e => setNewDocument({ ...newDocument, file: e.target.files[0] })}
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors shadow-sm">
                    Upload
                </button>
            </form>
        </div>
    );
};

export default UploadDocumentForm;
