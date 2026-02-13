import React from 'react';

const PatientSearch = ({ searchId, setSearchId, handleSearch, openScanner }) => {
    return (
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                placeholder="🔎 Enter Patient Health ID..."
                className="flex-1 border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
            />
            <button
                type="button"
                onClick={openScanner}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 font-medium shadow-lg hover:shadow-xl transition-all"
            >
                📷 Scan QR
            </button>
            <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all"
            >
                Search
            </button>
        </form>
    );
};

export default PatientSearch;
