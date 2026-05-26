import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Bell, User, Mail, ChevronRight, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phonePref, setPhonePref] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>('₦');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const nextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter your name');
        return;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
    }
    setErrorMsg('');
    setStep((prev) => prev + 1);
  };

  const handleKeyPress = (num: string) => {
    setErrorMsg('');
    if (pinStep === 'create') {
      if (pin.length < 4) {
        setPin((prev) => prev + num);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin((prev) => prev + num);
      }
    }
  };

  const handleDelete = () => {
    if (pinStep === 'create') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  // Triggered when pin editing finishes
  React.useEffect(() => {
    if (pin.length === 4 && pinStep === 'create') {
      const timer = setTimeout(() => {
        setPinStep('confirm');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, pinStep]);

  React.useEffect(() => {
    if (confirmPin.length === 4 && pinStep === 'confirm') {
      const timer = setTimeout(() => {
        if (pin === confirmPin) {
          onComplete({
            name: name.trim(),
            email: email.trim(),
            phonePref,
            pin,
            onboarded: true,
            currency,
            weeklyDigest: true,
            billReminders: true,
            twoFactor: false,
          });
        } else {
          setErrorMsg('PINs do not match. Try again.');
          setConfirmPin('');
          setPin('');
          setPinStep('create');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [confirmPin, pinStep, pin, name, email, phonePref, currency, onComplete]);

  // Page slider configurations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 250 : -250,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 250 : -250,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[#040D0A] text-[#E2ECE9] flex flex-col justify-between p-6 overflow-hidden font-sans relative select-none">
      {/* Background premium effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(18,51,42,0.25),transparent_50%)] pointer-events-none" />

      {/* Header section with brand logo */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-4">
        <div className="flex items-center space-x-3">
          {/* Static logo element */}
          <div className="relative w-8 h-8 bg-[#1ebd7d] rounded-xl flex items-center justify-center text-white overflow-hidden shadow">
            <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white/25 blur-[0.2px]" />
            <div className="absolute w-4.5 h-4.5 border-2 border-white border-t-white border-r-white border-b-transparent border-l-transparent rounded-full" />
            <div className="absolute w-1 h-1 bg-white rounded-full" />
          </div>
          <span className="font-black text-sm tracking-[0.2em] text-[#1ebd7d] font-sans">FLOWSE</span>
        </div>
        
        {/* Step indicator bars */}
        <div className="flex space-x-1.5">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-[#1ebd7d]' : 'w-2 bg-[#12332A]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main sliding content deck */}
      <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-center my-6">
        <AnimatePresence mode="wait" initial={false} custom={step}>
          {step === 0 && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="inline-flex py-1 px-3 rounded-full bg-[#1ebd7d]/10 border border-[#1ebd7d]/20 text-[#1ebd7d] text-xs font-mono font-semibold tracking-wider">
                <Sparkles size={13} className="inline mr-1 text-[#1ebd7d]" /> MONEY IN MOTION
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white font-serif-display">
                Take absolute control of your finances.
              </h1>

              <p className="text-[#8c9e99] text-sm md:text-base leading-relaxed font-medium">
                Flowse delivers a premium, offline-first personal finance tracker. Your data stays entirely on this device. Beautifully secure, private, and fast.
              </p>

              <div className="pt-4">
                <button
                  id="onboarding-welcome-next"
                  onClick={nextStep}
                  className="w-full py-4 px-6 bg-[#1ebd7d] hover:bg-[#1ab073] active:bg-[#158f5c] text-neutral-900 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-[#1ebd7d]/10 group cursor-pointer"
                >
                  <span>Begin Secure Setup</span>
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="profile"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="text-[#1ebd7d] text-[10px] font-mono tracking-widest font-bold uppercase">Step 1 — Let's get acquainted</span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Establish Your Profile</h2>
                <p className="text-[#8c9e99] text-xs leading-relaxed max-w-sm mx-auto">
                  Every byte of your data is encrypted and saved strictly on this device. We don't use servers or cloud tracking.
                </p>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-400/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold"
                >
                  {errorMsg}
                </motion.div>
              )}

              <div className="space-y-4 text-left">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#1ebd7d] uppercase tracking-widest block font-sans pl-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1ebd7d]" size={16} />
                    <input
                      id="onboarding-input-name"
                      type="text"
                      className="w-full bg-[#081A15] border border-[#12332A] rounded-2xl py-4 pl-11 pr-4 text-white placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] transition-colors font-medium text-xs focus:ring-1 focus:ring-[#1ebd7d]/50"
                      placeholder="e.g. Eleanor Vance"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMsg('');
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#1ebd7d] uppercase tracking-widest block font-sans pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1ebd7d]" size={16} />
                    <input
                      id="onboarding-input-email"
                      type="email"
                      className="w-full bg-[#081A15] border border-[#12332A] rounded-2xl py-4 pl-11 pr-4 text-white placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] transition-colors font-medium text-xs focus:ring-1 focus:ring-[#1ebd7d]/50"
                      placeholder="eleanor@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                    />
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#1ebd7d] uppercase tracking-widest block font-sans pl-1">Preferred Currency Symbol</label>
                  <select
                    id="onboarding-input-currency"
                    className="w-full bg-[#081A15] border border-[#12332A] rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-[#1ebd7d] transition-colors text-xs font-bold cursor-pointer"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="$">US Dollar ($)</option>
                    <option value="₦">Nigerian Naira (₦)</option>
                    <option value="£">British Pound (£)</option>
                    <option value="€">Euro (€)</option>
                  </select>
                </div>

                {/* Alerts preference */}
                <div className="bg-[#081A15] border border-[#12332A] rounded-2xl p-4 flex items-start space-x-3">
                  <Bell className="text-[#1ebd7d] shrink-0 mt-0.5" size={16} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Threshold Overspending Alerts</span>
                      <button
                        id="onboarding-notification-toggle"
                        type="button"
                        onClick={() => setPhonePref(!phonePref)}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          phonePref ? 'bg-[#1ebd7d]' : 'bg-[#12332A]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4.5 h-4.5 rounded-full shadow transform duration-200 ease-in-out ${
                            phonePref ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#8c9e99] leading-relaxed font-semibold">Get beautiful local reminders if you exceed your budget constraints.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="onboarding-profile-next"
                  onClick={nextStep}
                  className="w-full py-4 bg-[#1ebd7d] hover:bg-[#1ab073] active:bg-[#158f5c] text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-[#1ebd7d]/15"
                >
                  <span>Set Up Secure PIN</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="security"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-5 flex flex-col items-center"
            >
              <div className="text-center space-y-1.5 w-full">
                <span className="text-[#1ebd7d] text-[10px] font-mono tracking-widest font-bold">PROFILE PIN SECURITY</span>
                <h2 className="text-2xl font-bold text-white tracking-tight font-serif-display">
                  {pinStep === 'create' ? 'Set Login PIN' : 'Confirm Login Pin'}
                </h2>
                <p className="text-[#8c9e99] text-[11px] leading-relaxed font-semibold max-w-xs mx-auto">
                  {pinStep === 'create'
                    ? 'Create a secure 4-digit PIN to access your account privately on this device.'
                    : 'Please re-enter your 4-digit PIN to confirm.'}
                </p>
              </div>

              {errorMsg && (
                <div className="w-full p-3 bg-red-400/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Secure dots indicators */}
              <div className="flex space-x-6 my-2">
                {[0, 1, 2, 3].map((index) => {
                  const active = pinStep === 'create' ? index < pin.length : index < confirmPin.length;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        active ? 'bg-[#1ebd7d] border-[#1ebd7d] scale-125 shadow-lg shadow-[#1ebd7d]/35' : 'border-[#12332A] bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Secure grid keypad */}
              <div className="w-full max-w-[270px] grid grid-cols-3 gap-3.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    id={`onboarding-keypad-${num}`}
                    key={num}
                    onClick={() => handleKeyPress(num)}
                    className="aspect-square rounded-full bg-[#081A15] hover:bg-[#12332A] active:bg-[#1ebd7d]/20 text-xl font-bold text-white flex items-center justify-center transition-all border border-[#12332A] shadow cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <div className="aspect-square" />
                <button
                  id="onboarding-keypad-0"
                  onClick={() => handleKeyPress('0')}
                  className="aspect-square rounded-full bg-[#081A15] hover:bg-[#12332A] active:bg-[#1ebd7d]/20 text-xl font-bold text-white flex items-center justify-center transition-all border border-[#12332A] shadow cursor-pointer"
                >
                  0
                </button>
                <button
                  id="onboarding-keypad-delete"
                  onClick={handleDelete}
                  className="aspect-square rounded-full bg-[#12332A]/50 hover:bg-[#12332A] active:bg-amber-500/15 text-[#1ebd7d] flex items-center justify-center transition-all border border-[#12332A]/30 text-xs font-bold tracking-widest uppercase cursor-pointer"
                >
                  DEL
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[#1ebd7d] text-[9px] font-mono tracking-widest uppercase font-bold animate-pulse-soft">SHIELDED SAFE ENVIRONMENT</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pb-2">
        <p className="text-[11px] text-[#8c9e99] font-semibold leading-normal">Flowse Ledger Security Console. Zero data tracking telemetry.</p>
      </div>
    </div>
  );
}
