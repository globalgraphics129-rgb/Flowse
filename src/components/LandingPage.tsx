import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, ArrowRight, Shield, Activity, TrendingUp, Cpu, Menu, X, PiggyBank, RefreshCw } from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Link to the latest compiled APK on GitHub
  const APK_DOWNLOAD_URL = "https://github.com/globalgraphics129-rgb/Flowse/actions";

  return (
    <div className="min-h-screen bg-[#020C0A] text-[#E2ECE9] font-sans overflow-x-hidden selection:bg-[#1ebd7d]/35 selection:text-white">
      
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1ebd7d]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#109d64]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-[#1ebd7d]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-50 border-b border-[#12332A]/40 bg-[#020C0A]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-gradient-to-br from-[#1ebd7d] to-[#109d64] rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
              <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white/20 blur-[0.2px]" />
              <div className="absolute w-5 h-5 border-[2.5px] border-white border-t-white border-r-white border-b-transparent border-l-transparent rounded-full" />
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="font-black text-base tracking-[0.2em] text-[#1ebd7d]">FLOWSE</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#8c9e99]">
            <a href="#features" className="hover:text-[#1ebd7d] transition-colors">Features</a>
            <a href="#security" className="hover:text-[#1ebd7d] transition-colors">Security</a>
            <a href="#download" className="hover:text-[#1ebd7d] transition-colors">Download</a>
            <a 
              href="https://github.com/globalgraphics129-rgb/Flowse" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#1ebd7d] transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* Call To Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-5 bg-transparent border border-[#1ebd7d]/30 text-[#1ebd7d] hover:bg-[#1ebd7d]/10 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download size={13} />
              <span>Get Android APK</span>
            </a>
            <button
              onClick={onLaunchApp}
              className="py-2.5 px-5 bg-[#1ebd7d] hover:bg-[#1ab073] active:bg-[#158f5c] text-neutral-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-[#1ebd7d]/10 cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#8c9e99] hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#12332A]/30 bg-[#020C0A] overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-4 text-sm font-bold text-[#8c9e99]">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-2 border-b border-[#12332A]/10">Features</a>
                <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-2 border-b border-[#12332A]/10">Security</a>
                <a href="#download" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-2 border-b border-[#12332A]/10">Download</a>
                <a 
                  href="https://github.com/globalgraphics129-rgb/Flowse" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white py-2"
                >
                  GitHub
                </a>
                
                <div className="flex flex-col gap-2 pt-4 border-t border-[#12332A]/10">
                  <a
                    href={APK_DOWNLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-transparent border border-[#1ebd7d]/30 text-[#1ebd7d] hover:bg-[#1ebd7d]/10 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <Download size={14} />
                    <span>Get Android APK</span>
                  </a>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLaunchApp();
                    }}
                    className="py-3 px-4 bg-[#1ebd7d] text-neutral-900 font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                  >
                    <span>Launch Web Wallet</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section (Split Screen inspired by WhatsApp Web) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-80px)]">
        
        {/* Left Column: Text Content */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex py-1.5 px-3.5 rounded-full bg-[#1ebd7d]/10 border border-[#1ebd7d]/20 text-[#1ebd7d] text-[11px] font-mono font-bold tracking-widest uppercase">
            <Sparkles size={12} className="inline mr-1 text-[#1ebd7d] animate-pulse" /> Money in Motion
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Simple. Secure.<br />
            Personal Finance.
          </h2>

          <p className="text-[#8c9e99] text-base md:text-lg leading-relaxed font-medium max-w-lg">
            Flowse is a high-performance, offline-first personal ledger application. Take absolute custody of your financial records with encrypted local vaults and secure real-time backups.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onLaunchApp}
              className="py-4 px-8 bg-[#1ebd7d] hover:bg-[#1ab073] active:bg-[#158f5c] text-neutral-900 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#1ebd7d]/10 hover:scale-[1.02] cursor-pointer"
            >
              <span>Launch Web Wallet</span>
              <ArrowRight size={16} />
            </button>
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="py-4 px-8 bg-transparent hover:bg-[#12332A]/20 text-white border border-[#12332A] hover:border-[#1ebd7d]/35 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={16} className="text-[#1ebd7d]" />
              <span>Get Android App</span>
            </a>
          </div>

          <div className="pt-4 flex items-center gap-6 text-[10px] font-mono tracking-wider text-[#506e64] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Check size={12} className="text-[#1ebd7d]" /> Zero Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={12} className="text-[#1ebd7d]" /> Local-first encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={12} className="text-[#1ebd7d]" /> Cloud Synced
            </span>
          </div>
        </div>

        {/* Right Column: Premium Interactive Mockup Device */}
        <div className="lg:col-span-6 flex justify-center relative">
          
          {/* Glassmorphic decorative grid behind phone mockup */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1ebd7d]/5 to-transparent rounded-[40px] transform rotate-3 blur-md -z-10" />

          {/* Interactive Mobile device shell mock */}
          <div className="w-[280px] sm:w-[320px] aspect-[9/19] rounded-[48px] border-[6px] border-[#163028] bg-[#030C0A] shadow-2xl relative overflow-hidden flex flex-col p-4">
            {/* Notch Speaker */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 flex items-center justify-center">
              <div className="w-8 h-1 bg-neutral-800 rounded-full" />
            </div>

            {/* App UI Screen Mockup */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative pt-6 select-none font-sans text-left">
              
              {/* Fake status bar */}
              <div className="flex justify-between items-center text-[8px] text-[#8c9e99] font-mono tracking-widest px-2 pt-1 pb-2">
                <span>9:30 PM</span>
                <span className="flex items-center gap-1">5G 📶 🔋 78%</span>
              </div>

              {/* Fake Header */}
              <div className="flex justify-between items-center px-2 py-2 border-b border-[#12332A]/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-[#1ebd7d] rounded-md flex items-center justify-center text-white text-[8px] font-extrabold relative">
                    <div className="w-2.5 h-2.5 border border-white border-t-white border-r-white border-b-transparent border-l-transparent rounded-full" />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-[#1ebd7d]">FLOWSE</span>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#12332A]/50 flex items-center justify-center text-[#1ebd7d] text-[6px]">🔒</div>
              </div>

              {/* Fake Cards */}
              <div className="flex-1 space-y-2.5 pt-3 overflow-hidden">
                {/* Balance Card */}
                <div className="bg-[#081A15] border border-[#12332A]/60 rounded-xl p-3 space-y-1 shadow">
                  <span className="text-[7px] text-[#1ebd7d] uppercase tracking-widest font-mono font-bold">Total Available Treasury</span>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold text-white tracking-tight">₦4,250,000</h3>
                    <span className="text-[6px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">Active</span>
                  </div>
                </div>

                {/* mini charts layout */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#081A15]/40 border border-[#12332A]/40 rounded-xl p-2.5">
                    <span className="text-[6px] text-[#8c9e99] uppercase tracking-wider font-bold">Inflow</span>
                    <p className="text-xs font-bold text-[#1ebd7d] mt-0.5">₦6,400,000</p>
                  </div>
                  <div className="bg-[#081A15]/40 border border-[#12332A]/40 rounded-xl p-2.5">
                    <span className="text-[6px] text-[#8c9e99] uppercase tracking-wider font-bold">Outflow</span>
                    <p className="text-xs font-bold text-red-400 mt-0.5">₦2,150,000</p>
                  </div>
                </div>

                {/* Fake list logs */}
                <div className="space-y-1.5">
                  <span className="text-[6px] text-[#8c9e99] uppercase tracking-wider font-bold block px-1">Ledger Audits</span>
                  <div className="bg-[#081A15] border border-[#12332A]/30 rounded-xl p-2 flex items-center justify-between text-[8px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">+</div>
                      <div>
                        <p className="font-bold text-white">Client Salary Outlay</p>
                        <p className="text-[6px] text-[#8c9e99]">Automated Sync</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-[#1ebd7d]">+₦3,500,000</span>
                  </div>
                  <div className="bg-[#081A15] border border-[#12332A]/30 rounded-xl p-2 flex items-center justify-between text-[8px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold">-</div>
                      <div>
                        <p className="font-bold text-white">Cloud Node Server</p>
                        <p className="text-[6px] text-[#8c9e99]">Monthly Outlay</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-red-400">-₦150,000</span>
                  </div>
                </div>
              </div>

              {/* Fake Navigation Bar */}
              <div className="h-10 bg-[#040D0A] border-t border-[#12332A] flex justify-around items-center text-[7px] text-[#8c9e99] font-bold">
                <span className="text-[#1ebd7d] flex flex-col items-center"><span>🏠</span><span>Home</span></span>
                <span className="flex flex-col items-center"><span>📊</span><span>Logs</span></span>
                <span className="flex flex-col items-center"><span>🎯</span><span>Limits</span></span>
                <span className="flex flex-col items-center"><span>⚙️</span><span>Meta</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 border-t border-[#12332A]/30 bg-[#03100d]/30 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="text-[10px] text-[#1ebd7d] font-mono tracking-widest font-bold uppercase">Features Vault</span>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-serif-display">
              Built for Private Operations.
            </h3>
            <p className="text-[#8c9e99] text-sm leading-relaxed max-w-md mx-auto">
              Your money is personal. We designed Flowse to operate strictly offline with zero third-party telemetry, giving you complete data sovereign rights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* feature 1 */}
            <div className="bg-[#081A15]/40 border border-[#12332A]/50 hover:border-[#1ebd7d]/30 p-8 rounded-3xl space-y-4 transition-all duration-300 group hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-2xl bg-[#1ebd7d]/10 border border-[#1ebd7d]/20 text-[#1ebd7d] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu size={20} />
              </div>
              <h4 className="font-extrabold text-white text-lg">Offline-First Engine</h4>
              <p className="text-[#8c9e99] text-xs leading-relaxed font-semibold">
                Operates entirely locally. Run ledger transactions, outline savings caps, and auditing records instantly with or without network coverage.
              </p>
            </div>

            {/* feature 2 */}
            <div className="bg-[#081A15]/40 border border-[#12332A]/50 hover:border-[#1ebd7d]/30 p-8 rounded-3xl space-y-4 transition-all duration-300 group hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-2xl bg-[#1ebd7d]/10 border border-[#1ebd7d]/20 text-[#1ebd7d] flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw size={20} />
              </div>
              <h4 className="font-extrabold text-white text-lg">Automatic Cloud Sync</h4>
              <p className="text-[#8c9e99] text-xs leading-relaxed font-semibold">
                Rest easy with transparent, cloud sync backups. LED indicators on the dashboard verify backup synchronisation instantly on Vercel backend instances.
              </p>
            </div>

            {/* feature 3 */}
            <div className="bg-[#081A15]/40 border border-[#12332A]/50 hover:border-[#1ebd7d]/30 p-8 rounded-3xl space-y-4 transition-all duration-300 group hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-2xl bg-[#1ebd7d]/10 border border-[#1ebd7d]/20 text-[#1ebd7d] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
              <h4 className="font-extrabold text-white text-lg">Keychain PIN Lock</h4>
              <p className="text-[#8c9e99] text-xs leading-relaxed font-semibold">
                Access parameters lock behind secure 4-digit device PIN hashes. Keeps physical intruders out of your personal financial ledgers.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Security Section (Dark ambient quote banner) */}
      <section id="security" className="relative z-10 py-24 max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="w-16 h-16 rounded-full bg-[#1ebd7d]/10 border border-[#1ebd7d]/20 text-[#1ebd7d] flex items-center justify-center mx-auto shadow-inner shadow-[#1ebd7d]/5">
          <LockIcon size={24} />
        </div>
        
        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
          "Data privacy isn't a feature; it's a fundamental prerequisite."
        </h3>
        
        <p className="text-[#8c9e99] text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
          Flowse is built on the philosophy of local data sovereignty. All data is structured locally. There are no tracking scripts, analytics trackers, advertising logs, or centralized data collectors.
        </p>

        <div className="pt-2">
          <span className="text-[10px] font-mono tracking-widest text-[#1ebd7d] font-bold uppercase">Flowse Cryptography Core</span>
        </div>
      </section>

      {/* Download Section (Solid Green banner CTA) */}
      <section id="download" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-[#063c2c] to-[#031b14] border border-[#12332A] rounded-[32px] p-8 md:p-16 text-center space-y-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1ebd7d]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              Download Flowse for Android
            </h3>
            <p className="text-[#8c9e99] text-xs md:text-sm font-semibold max-w-md mx-auto">
              Get the latest compiled standalone APK to install directly on your Android device and manage your money in absolute secrecy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="py-4 px-8 bg-[#1ebd7d] hover:bg-[#1ab073] active:bg-[#158f5c] text-neutral-900 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#1ebd7d]/10 w-full sm:w-auto cursor-pointer"
            >
              <Download size={16} />
              <span>Download Standalone APK</span>
            </a>
            <button
              onClick={onLaunchApp}
              className="py-4 px-8 bg-transparent hover:bg-[#12332A]/20 text-white border border-[#1ebd7d]/35 hover:border-[#1ebd7d] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all w-full sm:w-auto cursor-pointer"
            >
              <span>Open Web Wallet</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="pt-2 text-[9px] text-[#506e64] font-bold font-mono uppercase tracking-widest">
            Latest Version v2.4 (Android 8.0+)
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#12332A]/30 py-8 text-center text-[11px] text-[#506e64] font-semibold">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Flowse Wallet System. All data rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://github.com/globalgraphics129-rgb/Flowse" target="_blank" rel="noreferrer" className="hover:text-white">Source Code</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#download" className="hover:text-white">Download</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Inline fallback lock icon
function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
