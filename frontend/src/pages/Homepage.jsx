import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Database, 
  Users, 
  ArrowRight, 
  Lock, 
  History,
  CheckCircle,
  Menu,
  X,
  XCircle,
  Stethoscope,
  Building,
  User,
  Search,
  ChevronDown,
  HelpCircle,
  QrCode,
  Heart
} from 'lucide-react';

// Wave Divider Component
const WaveDivider = ({ fill, className = "" }) => (
    <div className={`w-full overflow-hidden leading-none rotate-180 -mt-1 ${className}`}>
        <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill={fill}></path>
        </svg>
    </div>
);

// Reusable Health ID Card Component
const HealthIDCard = ({ className = "" }) => (
    <div 
        className={`w-full max-w-sm aspect-[85/54] bg-[#0D1B2A] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] p-6 text-white relative overflow-hidden ${className}`}
        style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            containerType: 'inline-size',
        }}
    >
        {/* Subtle highlight */}
        <div
            style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse 70% 55% at 72% 28%, rgba(46, 196, 169, 0.14), transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />

        {/* Texture */}
        <div 
            style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.032,
                pointerEvents: 'none',
                backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                zIndex: 0,
            }} 
        />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.2cqw, 16px)' }}>
                    <span className="text-xl font-bold text-white leading-none mr-1" style={{ fontSize: 'clamp(18px, 4.6cqw, 28px)' }}>∿</span>
                    <div>
                        <div style={{ fontSize: 'clamp(16px, 4.4cqw, 22px)', fontWeight: '850', color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>PulseID</div>
                        <div style={{ fontSize: 'clamp(10px, 2cqw, 12px)', color: 'rgba(255,255,255,0.62)', marginTop: 'clamp(2px, 0.4cqw, 4px)' }}>Unified Health Record</div>
                    </div>
                </div>
            </div>

            {/* Middle Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(12px, 3.2cqw, 20px)', marginBottom: 'clamp(10px, 3.0cqw, 18px)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5cqw' }}>
                    <div>
                        <div style={{ fontSize: 'clamp(10px, 2cqw, 12px)', color: 'rgba(255,255,255,0.52)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.14em' }}>HEALTH ID</div>
                        <div style={{ fontSize: 'clamp(18px, 4.9cqw, 26px)', fontWeight: '880', color: 'white', letterSpacing: '0.02em', marginTop: 'clamp(2px, 0.5cqw, 6px)' }}>HID-E0D32414</div>
                    </div>
                    <div style={{ fontSize: 'clamp(16px, 4.3cqw, 22px)', color: 'white', fontWeight: '800', marginTop: 'clamp(6px, 1.2cqw, 10px)', letterSpacing: '-0.01em' }}>Aarav Mehta</div>
                </div>
                
                <div style={{ 
                    background: '#fff', 
                    padding: 'clamp(6px, 1cqw, 10px)', 
                    borderRadius: 'clamp(10px, 1.2cqw, 14px)',
                    boxShadow: '0 16px 40px rgba(2, 6, 23, 0.28)',
                    border: '1px solid rgba(15, 23, 42, 0.10)'
                }}>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HID-E0D32414" alt="QR" style={{ width: 'clamp(55px, 12cqw, 75px)', height: 'clamp(55px, 12cqw, 75px)', display: 'block' }} />
                </div>
            </div>

            {/* Bottom Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 'clamp(10px, 2.6cqw, 18px)',
                marginBottom: 'clamp(8px, 2.6cqw, 16px)'
            }}>
                <div>
                    <div style={{ fontSize: 'clamp(9px, 1.7cqw, 11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.12em' }}>BLOOD TYPE</div>
                    <div style={{ fontSize: 'clamp(12px, 2.5cqw, 14px)', color: 'white', fontWeight: '800', marginTop: 'clamp(3px, 0.5cqw, 6px)' }}>O+</div>
                </div>
                <div>
                    <div style={{ fontSize: 'clamp(9px, 1.7cqw, 11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.12em' }}>GENDER</div>
                    <div style={{ fontSize: 'clamp(12px, 2.5cqw, 14px)', color: 'white', fontWeight: '800', marginTop: 'clamp(3px, 0.5cqw, 6px)' }}>Male</div>
                </div>
                <div>
                    <div style={{ fontSize: 'clamp(9px, 1.7cqw, 11px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 750, letterSpacing: '0.12em' }}>DATE OF BIRTH</div>
                    <div style={{ fontSize: 'clamp(12px, 2.5cqw, 14px)', color: 'white', fontWeight: '800', marginTop: 'clamp(3px, 0.5cqw, 6px)' }}>1992-08-12</div>
                </div>
            </div>

            {/* Emergency Contacts Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'clamp(9px, 1.85cqw, 11px)', color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 'clamp(4px, 0.8cqw, 8px)', letterSpacing: '0.12em' }}>EMERGENCY CONTACTS</div>
                    <div style={{ fontSize: 'clamp(11px, 2.3cqw, 13px)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.2cqw, 10px)', flexWrap: 'wrap', rowGap: 'clamp(2px, 0.4cqw, 4px)' }}>
                            <span style={{ fontWeight: 800 }}>Riya Mehta</span>
                            <span style={{ opacity: 0.3 }}>·</span>
                            <span style={{ fontWeight: 600, opacity: 0.8 }}>Wife</span>
                            <span style={{ opacity: 0.3 }}>·</span>
                            <span style={{ fontWeight: 700, opacity: 0.9 }}>+91 98192 11082</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Homepage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFB] text-[#4A5568] font-sans selection:bg-[#3B9EE2]/30">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-8 h-8 text-[#0D1B2A]" />
                        <span className="text-2xl font-bold text-[#0D1B2A] tracking-tight">PulseID</span>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link 
                            to="/login"
                            className="px-6 py-2.5 rounded-md border border-[#3B9EE2] text-[#3B9EE2] font-medium hover:bg-[#3B9EE2]/5 transition-colors"
                        >
                            Login
                        </Link>
                    </div>

                    <button 
                        className="md:hidden text-[#0D1B2A]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-[#E2E8F0] p-6 flex flex-col gap-4 shadow-lg">
                        <Link 
                            to="/login"
                            className="w-full text-center px-6 py-3 rounded-md border border-[#3B9EE2] text-[#3B9EE2] font-medium"
                        >
                            Login
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 px-6 bg-[#F8FAFB] overflow-hidden">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text */}
                    <div className="text-left py-12">
                        <h1 className="text-5xl md:text-[64px] font-bold text-[#0D1B2A] mb-6 leading-tight tracking-tight">
                            Your Health Identity,<br />
                            Always With You.
                        </h1>
                        
                        <p className="text-xl text-[#4A5568] max-w-lg mb-10 leading-relaxed">
                            One QR code. Complete medical history. Full patient control.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                            <Link 
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 rounded-md bg-[#3B9EE2] text-white font-bold hover:bg-[#2d8ac9] transition-colors shadow-lg shadow-blue-500/10 flex items-center justify-center"
                            >
                                Create Your PulseID
                            </Link>
                            <a 
                                href="#how-it-works"
                                className="w-full sm:w-auto px-8 py-4 rounded-md border border-[#3B9EE2] text-[#3B9EE2] font-medium hover:bg-[#3B9EE2]/5 transition-colors flex items-center justify-center"
                            >
                                See How It Works
                            </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 md:gap-8 mb-12">
                             <div className="flex items-center gap-2 text-[#4A5568] font-medium">
                                <ShieldCheck className="w-5 h-5 text-[#3B9EE2]" /> OTP Secured
                             </div>
                             <div className="flex items-center gap-2 text-[#4A5568] font-medium">
                                <Lock className="w-5 h-5 text-[#3B9EE2]" /> Patient Controlled
                             </div>
                             <div className="flex items-center gap-2 text-[#4A5568] font-medium">
                                <Clock className="w-5 h-5 text-[#3B9EE2]" /> Auto-Expiring Access
                             </div>
                        </div>

                        <div className="border-t border-[#E2E8F0] pt-8">
                             <p className="text-[#9CA3AF] text-[13px]">Used by patients, doctors, and labs across clinics and hospitals.</p>
                        </div>
                    </div>

                    {/* Right Column: Animated Card */}
                    <div className="relative flex justify-center items-center h-full min-h-[400px]">
                        <div className="relative w-full max-w-md animate-[float_4s_ease-in-out_infinite] flex justify-center">
                             <HealthIDCard />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Wave Divider: Hero -> Why PulseID */}
            <WaveDivider fill="#FFFFFF" className="-mt-1" />

             {/* The Problem We Solve */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#2EC4A9] font-bold text-sm tracking-widest uppercase bg-[#E0F2F1] px-3 py-1 rounded-full">Why PulseID</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mt-4">Your Medical History Shouldn't Be This Hard to Access</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {[
                                "Records scattered across 5 different hospitals",
                                "Repeated blood tests because previous results were lost",
                                "Doctors making decisions with incomplete history",
                                "Carrying physical files to every appointment",
                                "No control over who sees your sensitive data"
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="shrink-0 mt-1 bg-red-50 p-1 rounded-full">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <p className="text-lg text-[#4A5568]">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#F0F7F4] p-8 md:p-10 rounded-2xl border border-[#2EC4A9]/20 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#2EC4A9]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                             <div className="relative z-10 space-y-6">
                                {[
                                    "One unified health profile, accessible anywhere",
                                    "Complete lab history always available to your doctor",
                                    "Full medical timeline at the point of care",
                                    "Just show your QR code — nothing to carry",
                                    "You approve every access request, every time"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="shrink-0 mt-1 bg-[#E0F2F1] p-1 rounded-full">
                                            <CheckCircle className="w-5 h-5 text-[#2EC4A9]" />
                                        </div>
                                        <p className="text-lg text-[#0D1B2A] font-medium">{item}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <WaveDivider fill="#EFF6FF" />

             {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6 bg-[#EFF6FF]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                         <span className="text-[#2EC4A9] font-bold text-sm tracking-widest uppercase bg-[#E0F2F1] px-3 py-1 rounded-full">The Process</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mt-4">Simple for Patients. Powerful for Doctors.</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: User,
                                title: "Register & Get Your ID",
                                desc: "Create your account and instantly receive a unique Health ID and downloadable QR code."
                            },
                            {
                                icon: Activity,
                                title: "Share with Your Doctor",
                                desc: "Show your QR code at any clinic. Your doctor requests access and you approve it."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Stay in Control",
                                desc: "Grant or revoke access anytime. All doctor permissions are time-limited and logged."
                            }
                        ].map((step, idx) => (
                            <div key={idx} className="p-8 rounded-xl bg-white border border-[#E2E8F0] border-l-4 border-l-[#2EC4A9] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                     <span className="text-[28px] font-bold text-[#3B9EE2]">0{idx + 1}</span>
                                     <div className="w-10 h-10 rounded-lg bg-[#F0F9FF] flex items-center justify-center">
                                        <step.icon className="w-5 h-5 text-[#3B9EE2]" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">{step.title}</h3>
                                <p className="text-[#4A5568] leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <WaveDivider fill="#FFFFFF" />

            {/* Access Control Flow */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                     <div className="text-center mb-16">
                        <span className="text-[#3B9EE2] font-bold text-sm tracking-widest uppercase bg-[#F0F9FF] px-3 py-1 rounded-full">How Access Works</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mt-4">Patient Consent at Every Step</h2>
                        <p className="text-lg text-[#4A5568] mt-4 max-w-2xl mx-auto">No doctor can view your records without your explicit approval. Here's exactly how it works.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-6 left-0 w-full h-1 bg-[#E2E8F0] -z-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                             {[
                                { step: 1, title: "Doctor Searches", desc: "Doctor enters Health ID or scans QR", highlight: false },
                                { step: 2, title: "Basic Info Only", desc: "Sees name, age, gender only", highlight: false },
                                { step: 3, title: "Access Requested", desc: "Doctor requests full access", highlight: true },
                                { step: 4, title: "You Approve", desc: "Accept request via dashboard", highlight: true },
                                { step: 5, title: "OTP Verified", desc: "One-time password for security", highlight: false },
                                { step: 6, title: "Timed Access", desc: "Full access for 30 mins", highlight: false },
                             ].map((item, idx) => (
                                 <div key={idx} className="flex flex-col items-center text-center group">
                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-md transition-transform group-hover:scale-110 ${item.highlight ? 'bg-[#2EC4A9] ring-4 ring-[#E0F2F1]' : 'bg-[#3B9EE2]'}`}>
                                         {item.step}
                                     </div>
                                     <h3 className={`font-bold mb-2 ${item.highlight ? 'text-[#2EC4A9]' : 'text-[#0D1B2A]'}`}>{item.title}</h3>
                                     <p className="text-xs text-[#4A5568]">{item.desc}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                     <div className="text-center mt-12 text-[#94A3B8] text-sm italic">
                        You can revoke access at any time from your dashboard.
                    </div>
                </div>
            </section>

            <WaveDivider fill="#EFF6FF" />

             {/* Key Features */}
            <section className="py-24 px-6 bg-[#EFF6FF]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">Everything in One Secure Place</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: ShieldCheck, title: "OTP Access Control", desc: "Doctors only see what you allow, when you allow it." },
                            { icon: History, title: "Medical History", desc: "Every consultation, prescription, and lab report in one timeline." },
                            { icon: FileText, title: "Instant Lab Reports", desc: "Lab results uploaded directly and linked to your profile." },
                            { icon: Lock, title: "Document Locker", desc: "Store insurance cards, vaccination records, and personal health files." },
                            { icon: Clock, title: "Time-Limited Access", desc: "Doctor access auto-expires. No lingering permissions ever." },
                            { icon: Building, title: "Multi-Provider Support", desc: "Works across hospitals, clinics, and specialist practices." },
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl border border-transparent shadow-sm hover:border-[#2EC4A9] transition-all group">
                                <div className="p-3 bg-[#F0F9FF] w-fit rounded-lg mb-4 group-hover:bg-[#E0F2F1] transition-colors">
                                    <feature.icon className="w-6 h-6 text-[#3B9EE2]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0D1B2A] mb-2">{feature.title}</h3>
                                <p className="text-[#4A5568] text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <WaveDivider fill="#FFFFFF" />

             {/* Trust Bar */}
            <section className="py-8 bg-white">
                 <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-0 divide-x-0 md:divide-x divide-[#E2E8F0]">
                        {[
                            { label: "Patient-Controlled Access", icon: ShieldCheck },
                            { label: "OTP Verified Every Time", icon: Lock },
                            { label: "End-to-End Secure", icon: CheckCircle },
                            { label: "No Data Selling, Ever", icon: Database },
                        ].map((stat, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center text-center px-4">
                                <stat.icon className="w-6 h-6 text-[#0D1B2A] mb-2" />
                                <span className="font-bold text-[#0D1B2A] text-sm">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <WaveDivider fill="#EFF6FF" />

            {/* Who Is It For */}
            <section className="py-24 px-6 bg-[#EFF6FF]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">Built for Everyone in the Care Journey</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                role: "Patients",
                                icon: User,
                                desc: "Carry your complete health history everywhere. No paper, no repeating yourself.",
                            },
                            {
                                role: "Doctors",
                                icon: Stethoscope,
                                desc: "Access verified patient history instantly with full consent.",
                            },
                            {
                                role: "Labs & Hospitals",
                                icon: Building,
                                desc: "Upload reports directly to patient profiles in seconds."
                            }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl border border-[#E2E8F0] hover:border-t-4 hover:border-t-[#2EC4A9] transition-all shadow-sm group">
                                <div className="w-12 h-12 rounded-lg bg-[#F0F9FF] flex items-center justify-center mb-6">
                                    <card.icon className="w-6 h-6 text-[#3B9EE2]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">{card.role}</h3>
                                <p className="text-[#4A5568]">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <WaveDivider fill="#FFFFFF" />

             {/* For Patients Deep Dive */}
             <section className="py-24 px-6 bg-white">
                 <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                     <div>
                        <span className="text-[#2EC4A9] font-bold text-sm tracking-widest uppercase bg-[#E0F2F1] px-3 py-1 rounded-full">For Patients</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mt-6 mb-6">Your Medical Passport, Always in Your Pocket</h2>
                        <p className="text-lg text-[#4A5568] mb-8 leading-relaxed">
                            PulseID gives you a unique Health ID and QR code the moment you register. Show it at any clinic, hospital, or emergency room — your complete history travels with you.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                "Instant Health ID and QR code on registration",
                                "Full medical history — consultations, prescriptions, lab reports",
                                "Document locker for insurance cards and vaccination records",
                                "See exactly who has access and revoke it instantly"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#3B9EE2]" />
                                    <span className="text-[#4A5568] font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Link 
                            to="/login" 
                            className="inline-block px-8 py-4 rounded-md bg-[#3B9EE2] text-white font-bold hover:bg-[#2d8ac9] transition-colors shadow-lg shadow-blue-500/10"
                        >
                            Create Your PulseID
                        </Link>
                     </div>
                     <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-xl flex flex-col items-center">
                         <HealthIDCard />
                     </div>
                 </div>
             </section>

            <WaveDivider fill="#EFF6FF" />

              {/* For Doctors Deep Dive */}
             <section className="py-24 px-6 bg-[#EFF6FF]">
                 <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                     <div className="order-2 md:order-1 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xl">
                          {/* Doctor View Mockup */}
                          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                               <div className="bg-[#F8FAFB] p-4 border-b border-[#E2E8F0] flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[#4A5568]">
                                        <Search className="w-4 h-4" />
                                        <span className="text-sm">HID-5521-7743</span>
                                    </div>
                                    <span className="text-xs bg-[#EFF6FF] text-[#3B9EE2] px-2 py-1 rounded-full font-bold">Basic View</span>
                               </div>
                               <div className="p-6">
                                   <div className="flex items-start gap-4 mb-6">
                                       <div className="w-12 h-12 bg-[#F0F9FF] rounded-full flex items-center justify-center text-[#3B9EE2] font-bold text-lg">PN</div>
                                       <div>
                                           <h3 className="font-bold text-[#0D1B2A]">Priya Nair</h3>
                                           <p className="text-sm text-[#4A5568]">31 Years • Female • A+</p>
                                       </div>
                                   </div>
                                    <button className="w-full py-2 bg-[#3B9EE2] text-white rounded-md font-medium text-sm hover:bg-[#2d8ac9] transition-colors">
                                        Request Full Access
                                    </button>
                               </div>
                          </div>
                     </div>
                     <div className="order-1 md:order-2">
                        <span className="text-[#3B9EE2] font-bold text-sm tracking-widest uppercase bg-[#F0F9FF] px-3 py-1 rounded-full">For Doctors</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mt-6 mb-6">Complete Patient Context, Right When You Need It</h2>
                         <p className="text-lg text-[#4A5568] mb-8 leading-relaxed">
                            No more incomplete histories. With patient consent, access a full medical timeline in seconds — consultations, prescriptions, and lab reports across all providers.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                "Search any patient by Health ID or QR scan",
                                "View complete cross-provider medical history",
                                "Add consultation notes and prescriptions directly",
                                "Access is always time-limited and patient-approved"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#2EC4A9]" />
                                    <span className="text-[#4A5568] font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                          <Link 
                            to="/login" 
                            className="inline-block px-8 py-4 rounded-md border border-[#3B9EE2] text-[#3B9EE2] font-bold hover:bg-[#3B9EE2]/5 transition-colors"
                        >
                            Register as a Doctor
                        </Link>
                     </div>
                 </div>
             </section>

             <WaveDivider fill="#FFFFFF" />

             {/* FAQ */}
             <section className="py-14 px-6 bg-white">
                 <div className="max-w-3xl mx-auto">
                     <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">Common Questions</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                        {[
                            { q: "Is my medical data safe?", a: "All data is access-controlled. No doctor can view your records without your explicit OTP-based approval." },
                            { q: "What happens if I lose my QR code?", a: "You can regenerate and download your QR code anytime from your dashboard. Your Health ID remains the same." },
                            { q: "Can I revoke access mid-session?", a: "Yes. From your Access Control Panel, you can revoke any active doctor access instantly." },
                            { q: "Is this free for patients?", a: "Yes, patient registration and Health ID generation is completely free." },
                             { q: "How do doctors get verified?", a: "Doctors register with license number and hospital affiliation. An admin reviews and approves their account." },
                            { q: "Can labs upload reports directly?", a: "Yes. Verified lab technicians can search a patient by Health ID and upload reports directly." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[#F8FAFB] p-4 rounded-lg border border-[#E2E8F0] hover:border-[#3B9EE2] transition-all group" title={item.a}>
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
                                        <HelpCircle className="w-3.5 h-3.5 text-[#3B9EE2]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[#0D1B2A] font-bold text-[13px] mb-1">{item.q}</h3>
                                        <p className="text-[#6B7280] text-[12px] leading-snug line-clamp-2">{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             </section>

             <WaveDivider fill="#3B9EE2" />

            {/* CTA Banner */}
            <section className="py-24 px-6 bg-[#3B9EE2] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.08] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-[0.08] rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Take Control of Your Health Records Today</h2>
                    <p className="text-white/80 text-lg mb-10">Join patients and doctors already using PulseID.</p>
                    <div className="flex flex-col items-center">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center justify-center px-10 py-4 rounded-md border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-[#3B9EE2] transition-colors shadow-xl"
                        >
                            Create Your PulseID
                        </Link>
                        <span className="text-white/70 text-sm mt-4">Free for patients. No credit card required.</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0D1B2A] py-16 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-white" />
                             <span className="text-xl font-bold text-white tracking-tight">PulseID</span>
                        </div>
                        <p className="text-[#94A3B8] text-sm">Your health identity, always with you.</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-[#94A3B8] text-sm">
                        <div className="flex flex-col gap-4">
                            <Link to="/about" className="hover:text-white transition-colors">About</Link>
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                             <Link to="/login" className="hover:text-[#3B9EE2] transition-colors">Register Hospital</Link>
                             <Link to="/login" className="hover:text-[#3B9EE2] transition-colors">Lab Technician Registration</Link>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
                    © 2026 PulseID. All rights reserved.
                </div>
            </footer>
            
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
};

export default Homepage;
