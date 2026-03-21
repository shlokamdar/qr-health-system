import React from 'react';
import { Activity, ShieldCheck, Scale, FileText, AlertCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
          <h1 className="text-4xl font-bold text-[#0D1B2A] mb-4">Terms of Service</h1>
          <p className="text-[#94A3B8] font-medium">Agreement Version 1.2 • March 21, 2026</p>
        </div>
      </header>

      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr_2.5fr] gap-12">
            <aside className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                 <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider mb-2">
                    <AlertCircle className="w-4 h-4" /> Important
                 </div>
                 <p className="text-xs text-orange-800/80 leading-relaxed font-medium">
                    By using PulseID, you agree to these legal terms. Please read them carefully.
                 </p>
              </div>
              <div className="sticky top-28 space-y-2">
                 {["1. The Agreement", "2. User Obligations", "3. Data Accuracy", "4. Medical Disclaimer", "5. Termination"].map((label, idx) => (
                    <div key={idx} className="px-4 py-2 text-sm font-bold text-[#4A5568] hover:text-[#3B9EE2] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#3B9EE2]">
                        {label}
                    </div>
                 ))}
              </div>
            </aside>

            <article className="prose prose-slate max-w-none text-[#4A5568] space-y-10">
              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">1. The Agreement</h2>
                <p className="leading-relaxed">
                  By accessing or using PulseID, you signify that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">2. User Obligations</h2>
                <p className="leading-relaxed">
                  You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify PulseID immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">3. Data Accuracy</h2>
                 <p className="leading-relaxed">
                    While PulseID provides a platform for health record management, the accuracy of the records is the responsibility of the healthcare provider who uploads them. PulseID is not liable for errors, omissions, or misinterpretations of the health data stored on our platform.
                 </p>
              </section>

              <section className="p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-4 flex items-center gap-3">
                    <Scale className="w-6 h-6" /> 4. Medical Disclaimer
                </h2>
                <p className="text-sm font-medium leading-relaxed italic">
                    PulseID is NOT a medical provider. The information provided on this platform is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">5. Termination</h2>
                <p className="leading-relaxed">
                   We reserve the right to suspend or terminate your account at our discretion if you violate these terms or engage in any fraudulent or illegal activity on the platform.
                </p>
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

export default Terms;
