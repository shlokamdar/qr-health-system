import React from 'react';
import { Link } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck, Microscope } from 'lucide-react';

const RoleSelection = () => {
  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      description: 'Access your complete personal health records.',
      icon: <User className="w-8 h-8 text-blue-400" />,
      link: '/patient/login',
      color: 'border-blue-500/20 hover:border-blue-500/60'
    },
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'View patient history and manage consultations.',
      icon: <Stethoscope className="w-8 h-8 text-emerald-400" />,
      link: '/doctor/login',
      color: 'border-emerald-500/20 hover:border-emerald-500/60'
    },
    {
      id: 'lab',
      title: 'Lab Technician',
      description: 'Upload and manage patient lab reports.',
      icon: <Microscope className="w-8 h-8 text-purple-400" />,
      link: '/lab/login',
      color: 'border-purple-500/20 hover:border-purple-500/60'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Hospital and system administration.',
      icon: <ShieldCheck className="w-8 h-8 text-amber-400" />,
      link: '/admin/login',
      color: 'border-amber-500/20 hover:border-amber-500/60'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">PulseID</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose your Portal</h1>
          <p className="text-[#A0A0A0] text-lg">Select your role to access the system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Link 
              key={role.id}
              to={role.link}
              className={`flex items-center gap-6 p-6 rounded-xl bg-[#1E1E1E] border ${role.color} transition-all duration-300 hover:bg-[#242424] group`}
            >
              <div className="p-4 rounded-lg bg-[#2E2E2E] group-hover:bg-[#363636] transition-colors">
                {role.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
                <p className="text-[#A0A0A0] text-sm">{role.description}</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                <svg className="w-6 h-6 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
            <p className="text-[#A0A0A0]">
                Don't have an account? <Link to="/" className="text-blue-500 hover:text-blue-400 font-medium">Register here</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
