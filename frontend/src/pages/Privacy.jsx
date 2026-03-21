import React from 'react';
import { Activity, ShieldCheck, Lock, EyeOff, Scale, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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

      <header className="py-20 px-6 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0D1B2A] mb-4">Privacy Policy</h1>
          <p className="text-[#94A3B8] font-medium">Last Updated: March 21, 2026</p>
        </div>
      </header>

      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12">
            <aside className="space-y-6">
              <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
                <h3 className="font-bold text-[#0D1B2A] mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2EC4A9]" /> Our Promise
                </h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">
                  We never sell your data. We never share your records without your explicit consent. Your health is your business.
                </p>
              </div>
              <div className="p-6 bg-[#F0F9FF] rounded-2xl border border-[#3B9EE2]/10">
                <h3 className="font-bold text-[#3B9EE2] mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Quick Summary
                </h3>
                <ul className="text-xs space-y-3 text-[#4A5568] font-medium">
                  <li className="flex gap-2"><span className="text-[#3B9EE2]">•</span> You control every access request.</li>
                  <li className="flex gap-2"><span className="text-[#3B9EE2]">•</span> All access is time-limited.</li>
                  <li className="flex gap-2"><span className="text-[#3B9EE2]">•</span> Records are encrypted at rest.</li>
                  <li className="flex gap-2"><span className="text-[#3B9EE2]">•</span> We store minimal personal data.</li>
                </ul>
              </div>
            </aside>

            <article className="prose prose-slate max-w-none text-[#4A5568] space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">1. Information We Collect</h2>
                <p className="leading-relaxed">
                  PulseID collects information to provide better services to all our users. This includes:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li><strong>Account Information:</strong> Name, email, phone number, and date of birth for identity verification.</li>
                  <li><strong>Health Data:</strong> Medical history, consultation records, and lab reports uploaded by verified providers.</li>
                  <li><strong>Access Logs:</strong> Records of who accessed your profiles, when, and for how long.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">2. How We Use Information</h2>
                <p className="leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services. We do NOT use your health data for marketing or advertising.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">3. Data Sharing and Consent</h2>
                <p className="leading-relaxed">
                  The core of PulseID is patient control. Your health data is shared ONLY when:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  <li>A verified healthcare provider requests access and you approve it via an OTP or dashboard accept.</li>
                  <li>You explicitly share your Health ID QR for emergency or basic profile viewing.</li>
                  <li>Required by law for public health safety or legal compliance.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">4. Security Measures</h2>
                <div className="flex gap-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <Lock className="w-8 h-8 text-[#0D1B2A] shrink-0" />
                  <p className="text-sm">
                    We employ 256-bit encryption for data at rest and TLS for all data in transit. 
                    Our systems undergo regular security audits to ensure your sensitive medical history remains protected against unauthorized access.
                  </p>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>

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

export default Privacy;
