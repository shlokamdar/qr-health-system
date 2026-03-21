import React from 'react';
import { Activity, ShieldCheck, Heart, Users, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans selection:bg-[#3B9EE2]/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-[#0D1B2A]" />
            <span className="text-2xl font-bold text-[#0D1B2A] tracking-tight">PulseID</span>
          </Link>
          <Link to="/login" className="px-6 py-2.5 rounded-md border border-[#3B9EE2] text-[#3B9EE2] font-medium hover:bg-[#3B9EE2]/5 transition-colors">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-6 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[#3B9EE2] font-bold text-sm tracking-widest uppercase bg-[#F0F9FF] px-3 py-1 rounded-full">Our Mission</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0D1B2A] mt-6 mb-8 leading-tight">
            Democratizing Health Data Access with Security and Consent.
          </h1>
          <p className="text-xl text-[#4A5568] leading-relaxed">
            PulseID was built on a simple premise: your medical records should be as mobile as you are, while remaining entirely under your control.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-6">The PulseID Story</h2>
            <p className="text-[#4A5568] mb-6 leading-relaxed">
              In an era of rapid technological advancement, healthcare records often remain trapped in silos. Patients often find themselves carrying physical files from one specialist to another, or worse, undergoing repeated tests because previous results aren't accessible.
            </p>
            <p className="text-[#4A5568] mb-8 leading-relaxed">
              We started PulseID to bridge this gap. By creating a unified health identity verified through secure authentication, we've made it possible for any doctor to see your complete history instantly—with your permission.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#E2E8F0]">
              <div>
                <div className="text-3xl font-bold text-[#3B9EE2] mb-1">100%</div>
                <div className="text-sm text-[#94A3B8] uppercase font-bold tracking-wider">Patient Controlled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3B9EE2] mb-1">256-bit</div>
                <div className="text-sm text-[#94A3B8] uppercase font-bold tracking-wider">Encryption</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] space-y-4">
              <ShieldCheck className="w-8 h-8 text-[#2EC4A9]" />
              <h3 className="font-bold text-[#0D1B2A]">Security First</h3>
              <p className="text-sm text-[#4A5568]">Built with military-grade encryption and OTP-based consent flows.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] mt-8 space-y-4">
              <Heart className="w-8 h-8 text-red-400" />
              <h3 className="font-bold text-[#0D1B2A]">Patient Centric</h3>
              <p className="text-sm text-[#4A5568]">Every feature is designed to empower the patient in their care journey.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] space-y-4">
              <Users className="w-8 h-8 text-[#3B9EE2]" />
              <h3 className="font-bold text-[#0D1B2A]">Inclusive</h3>
              <p className="text-sm text-[#4A5568]">Works for independent clinics and large hospital systems alike.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] mt-8 space-y-4">
              <Globe className="w-8 h-8 text-orange-400" />
              <h3 className="font-bold text-[#0D1B2A]">Universal</h3>
              <p className="text-sm text-[#4A5568]">One identity that works across all healthcare touchpoints.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D1B2A] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[#94A3B8] text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white tracking-tight">PulseID</span>
          </div>
          <div className="flex gap-8">
             <Link to="/about" className="hover:text-white transition-colors">About</Link>
             <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <div>© 2026 PulseID. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default About;
