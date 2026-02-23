import React, { useState } from 'react';
import { Search, FileText, FlaskConical, History, Clock, CheckIcon } from 'lucide-react';

const GrantAccessForm = ({ doctorsList, onGrant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [scope, setScope] = useState({
    prescriptions: true,
    labReports: false,
    history: false
  });
  const [duration, setDuration] = useState('24_HOURS');

  const filteredDoctors = searchTerm.length > 2 
    ? doctorsList.filter(d => 
        d.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.health_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleGrant = () => {
    if (!selectedDoctor) return;
    onGrant({
      doctor_id: selectedDoctor.id,
      scope,
      duration
    });
    // Reset
    setSelectedDoctor(null);
    setSearchTerm('');
  };

  const scopeItemClasses = (isActive) => `
    flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer flex-1
    ${isActive ? 'border-[#3B9EE2] bg-[#F0F9FF] text-[#3B9EE2]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'}
  `;

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-sm border border-[#F1F5F9]">
      <h3 className="text-[16px] font-bold text-[#0D1B2A] mb-4">Grant New Access</h3>
      
      <div className="space-y-6">
        {/* Doctor Search */}
        <div className="relative">
          <label className="block text-[#9CA3AF] text-[10px] font-bold mb-1 uppercase tracking-tight">Search Doctor</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input 
              type="text"
              placeholder="Search by ID or Name (e.g. Dr. Sameer)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedDoctor) setSelectedDoctor(null);
              }}
              className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9EE2] focus:ring-opacity-20 focus:border-[#3B9EE2] transition-all text-sm"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchTerm.length > 2 && !selectedDoctor && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setSearchTerm(`Dr. ${doc.user.first_name} ${doc.user.last_name}`);
                    }}
                    className="p-3 hover:bg-[#F8FAFB] cursor-pointer flex items-center justify-between border-b border-[#F1F5F9] last:border-0"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#0D1B2A]">Dr. {doc.user.first_name} {doc.user.last_name}</div>
                      <div className="text-xs text-[#9CA3AF]">{doc.specialization} • {doc.health_id}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[#9CA3AF] text-xs">No doctors found matching your search.</div>
              )}
            </div>
          )}
        </div>

        {/* Scope Selection */}
        <div>
          <label className="block text-[#9CA3AF] text-[10px] font-bold mb-2 uppercase tracking-tight">Define Access Scope</label>
          <div className="flex flex-col md:flex-row gap-3">
            <div 
              onClick={() => setScope({...scope, prescriptions: !scope.prescriptions})}
              className={scopeItemClasses(scope.prescriptions)}
            >
              <FileText size={18} />
              <div className="flex-1">
                <div className="text-sm font-bold">Prescriptions</div>
                <div className="text-[10px] opacity-70">Medication records</div>
              </div>
              {scope.prescriptions && <CheckIcon size={14} />}
            </div>
            <div 
              onClick={() => setScope({...scope, labReports: !scope.labReports})}
              className={scopeItemClasses(scope.labReports)}
            >
              <FlaskConical size={18} />
              <div className="flex-1">
                <div className="text-sm font-bold">Lab Reports</div>
                <div className="text-[10px] opacity-70">Testing & visuals</div>
              </div>
              {scope.labReports && <CheckIcon size={14} />}
            </div>
            <div 
              onClick={() => setScope({...scope, history: !scope.history})}
              className={scopeItemClasses(scope.history)}
            >
              <History size={18} />
              <div className="flex-1">
                <div className="text-sm font-bold">Full History</div>
                <div className="text-[10px] opacity-70">All past records</div>
              </div>
              {scope.history && <CheckIcon size={14} />}
            </div>
          </div>
        </div>

        {/* Duration & Button Row */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-[#9CA3AF] text-[10px] font-bold mb-1 uppercase tracking-tight">Access Duration</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B9EE2]" />
              <select 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9EE2] focus:ring-opacity-20 focus:border-[#3B9EE2] transition-all text-sm appearance-none bg-white"
              >
                <option value="24_HOURS">24 Hours (Emergency)</option>
                <option value="7_DAYS">7 Days (Standard)</option>
                <option value="30_DAYS">30 Days (Follow-up)</option>
                <option value="PERMANENT">Permanent (Primary Care)</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleGrant}
            disabled={!selectedDoctor}
            className={`
              px-8 py-2.5 rounded-lg font-bold transition-all shadow-md w-full md:w-auto
              ${selectedDoctor 
                ? 'bg-[#2EC4A9] text-white hover:bg-[#25b198] shadow-[#2EC4A9]/20' 
                : 'bg-[#F1F5F9] text-[#9CA3AF] cursor-not-allowed shadow-none'}
            `}
          >
            Grant Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantAccessForm;
