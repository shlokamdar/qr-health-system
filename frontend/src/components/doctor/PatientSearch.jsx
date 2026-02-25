import React from 'react';
import { Search, QrCode } from 'lucide-react';

const PatientSearch = ({ searchId, setSearchId, handleSearch, openScanner }) => {
    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-[18px] font-bold text-[#0D1B2A]">Patient Lookup</h3>
                <p className="text-[#9CA3AF] text-[13px]">Enter a Health ID or scan the patient's QR code</p>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] group-focus-within:text-[#3B9EE2] transition-colors" />
                    <input
                        type="text"
                        placeholder="Enter Health ID..."
                        className="w-full border border-[#E2E8F0] bg-white p-3 pl-12 rounded-[8px] focus:border-[#3B9EE2] focus:ring-4 focus:ring-[#3B9EE2]/10 focus:outline-none transition-all font-medium text-[#0D1B2A] placeholder:text-[#9CA3AF]"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={openScanner}
                        className="border border-[#3B9EE2] text-[#3B9EE2] px-6 py-3 rounded-[8px] hover:bg-[#3B9EE2]/5 font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <QrCode className="w-5 h-5" />
                        <span>Scan QR</span>
                    </button>
                    <button
                        type="submit"
                        className="bg-[#3B9EE2] text-white px-8 py-3 rounded-[8px] hover:bg-[#2e8dd1] font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        <span>Search</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientSearch;
