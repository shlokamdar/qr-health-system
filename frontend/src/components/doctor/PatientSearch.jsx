import React from 'react';
import { Search, Camera } from 'lucide-react';

const PatientSearch = ({ searchId, setSearchId, handleSearch, openScanner }) => {
    return (
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3B9EE2] transition-colors" />
                <input
                    type="text"
                    placeholder="Enter Patient Health ID..."
                    className="w-full border-2 border-slate-100 bg-slate-50/50 p-3 pl-12 rounded-2xl focus:border-[#3B9EE2] focus:bg-white focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-slate-400"
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                />
            </div>
            <button
                type="button"
                onClick={openScanner}
                className="bg-[#0D1B2A] text-white px-6 py-3 rounded-2xl hover:bg-[#1a2e41] font-bold shadow-xl shadow-[#0D1B2A]/10 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
            >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Scan QR</span>
            </button>
            <button
                type="submit"
                className="bg-[#3B9EE2] text-white px-8 py-3 rounded-2xl hover:bg-[#2e8dd1] font-bold shadow-xl shadow-[#3B9EE2]/20 transition-all flex items-center justify-center gap-2 group"
            >
                <span>Search</span>
                <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </form>
    );
};

export default PatientSearch;
