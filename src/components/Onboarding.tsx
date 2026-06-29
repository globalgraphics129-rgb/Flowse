import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, Eye, EyeOff, Lock, Sparkles, Check, Phone, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (
    profile: UserProfile,
    restoredData?: {
      transactions: any[];
      budgets: any[];
      goals: any[];
      recurringTransactions: any[];
    }
  ) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  
  // Form states
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [currency, setCurrency] = useState<string>('₦');
  const [phonePref, setPhonePref] = useState<boolean>(true);
  
  // UI states
  const [signUpMethod, setSignUpMethod] = useState<'email' | 'phone'>('email');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getApiUrl = (path: string) => {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalDev && (window.location.port === '3000' || window.location.port === '5173')) {
      return `/api${path}`;
    }
    return `https://flowse-six.vercel.app/api${path}`;
  };

  const handleCloudRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setErrorMsg('Please enter a valid 4-digit numeric PIN.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), pin: pin.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate.');
      }
      onComplete(data.profile, {
        transactions: data.transactions || [],
        budgets: data.budgets || [],
        goals: data.goals || [],
        recurringTransactions: data.recurringTransactions || []
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error connecting to backend.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpMethod === 'phone') {
      setErrorMsg('Phone sign-up is not fully configured yet. Please register with your Email Address.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setErrorMsg('PIN must be a 4-digit code (e.g. 1234).');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const profileData: UserProfile = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      phonePref,
      pin: pin.trim(),
      onboarded: true,
      currency,
      weeklyDigest: true,
      billReminders: true,
      twoFactor: false,
    };

    try {
      const response = await fetch(getApiUrl('/auth/onboard'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register.');
      }
      onComplete(profileData);
    } catch (err: any) {
      console.warn('Sync server onboard failed, falling back to offline:', err);
      const proceedOffline = confirm(
        `Could not connect to the Flowse Sync Server (${err.message}).\n\nDo you want to proceed in offline-only mode? Your data will be saved locally on this device.`
      );
      if (proceedOffline) {
        onComplete(profileData);
      } else {
        setErrorMsg(err.message || 'Onboarding cancelled.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#02130e] text-[#E2ECE9] flex flex-col justify-between overflow-hidden font-sans relative select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* Top Brand Green Backdrop Banner */}
      <div className="relative px-6 pt-8 pb-12 bg-gradient-to-b from-[#063c2c] to-[#02130e] flex flex-row items-end justify-between max-w-md mx-auto w-full">
        <div className="space-y-4 max-w-[280px]">
          {/* Static premium logo */}
          <div className="relative w-12 h-12 bg-gradient-to-br from-[#1ebd7d] to-[#109d64] rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
            <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/20 blur-[0.2px]" />
            <div className="absolute w-6.5 h-6.5 border-[3px] border-white border-t-white border-r-white border-b-transparent border-l-transparent rounded-full" />
            <div className="absolute w-2 h-2 bg-white rounded-full" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome to Flowse
            </h1>
            <p className="text-[#8c9e99] text-xs leading-relaxed font-medium">
              {activeTab === 'signup' 
                ? 'Create your account and start building calmer money habits today.'
                : 'Welcome back! Restore your cloud treasury parameters and logs.'
              }
            </p>
          </div>
        </div>

        {/* Right side glassmorphic dynamic block */}
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white text-3xl font-light shadow-xl shrink-0 transition-transform duration-700 hover:rotate-90">
          +
        </div>
      </div>

      {/* Bottom Form Container Card */}
      <div className="bg-[#050b09] rounded-t-[40px] border-t border-[#122822] flex-1 flex flex-col p-6 w-full max-w-md mx-auto relative z-10 shadow-2xl">
        
        {/* Log In / Sign Up Selector Switch */}
        <div className="bg-[#0d1714] border border-[#162a24] p-1.5 rounded-full flex gap-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 text-center py-3 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-[#1ebd7d] text-neutral-950 shadow-md shadow-[#1ebd7d]/10' 
                : 'text-[#8c9e99] hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
            }}
            className={`flex-1 text-center py-3 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'signup' 
                ? 'bg-[#1ebd7d] text-neutral-950 shadow-md shadow-[#1ebd7d]/10' 
                : 'text-[#8c9e99] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-400/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: SIGN UP */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="flex-grow flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Feature Grid box */}
              <div className="border border-[#122822] bg-[#081310]/50 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#1ebd7d]/10 border border-[#1ebd7d]/35 text-[#1ebd7d] flex items-center justify-center mx-auto text-xs font-bold mb-1">
                    N
                  </div>
                  <span className="text-[10px] text-[#8c9e99] font-semibold">Track spend</span>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#1ebd7d]/10 border border-[#1ebd7d]/35 text-[#1ebd7d] flex items-center justify-center mx-auto text-xs font-bold mb-1">
                    %
                  </div>
                  <span className="text-[10px] text-[#8c9e99] font-semibold">Plan limits</span>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#1ebd7d]/10 border border-[#1ebd7d]/35 text-[#1ebd7d] flex items-center justify-center mx-auto text-xs font-bold mb-1">
                    OK
                  </div>
                  <span className="text-[10px] text-[#8c9e99] font-semibold">Save goals</span>
                </div>
              </div>

              {/* Email / Phone Method Picker */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignUpMethod('email')}
                  className={`py-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    signUpMethod === 'email'
                      ? 'border-[#1ebd7d] bg-[#1ebd7d]/10 text-[#1ebd7d]'
                      : 'border-[#162a24] bg-transparent text-[#8c9e99] hover:text-white'
                  }`}
                >
                  <Mail size={14} />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpMethod('phone')}
                  className={`py-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    signUpMethod === 'phone'
                      ? 'border-[#1ebd7d] bg-[#1ebd7d]/10 text-[#1ebd7d]'
                      : 'border-[#162a24] bg-transparent text-[#8c9e99] hover:text-white'
                  }`}
                >
                  <Phone size={14} />
                  <span>Phone</span>
                </button>
              </div>

              {/* Name fields side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">First name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Glory"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 px-4 text-white text-xs font-semibold placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">Last name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adeniran"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 px-4 text-white text-xs font-semibold placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 px-4 text-white text-xs font-semibold placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                />
              </div>

              {/* PIN / Password input side by side */}
              <div className="grid grid-cols-2 gap-3">
                {/* 4-digit PIN */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">Set 4-Digit PIN</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPin(val);
                        setErrorMsg('');
                      }}
                      className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 pl-4 pr-10 text-white text-xs font-extrabold tracking-[0.4em] placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c9e99] hover:text-[#1ebd7d] cursor-pointer"
                    >
                      {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm PIN */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">Confirm PIN</label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      required
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setConfirmPin(val);
                        setErrorMsg('');
                      }}
                      className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 pl-4 pr-10 text-white text-xs font-extrabold tracking-[0.4em] placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c9e99] hover:text-[#1ebd7d] cursor-pointer"
                    >
                      {showConfirmPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Currency Symbol Selection */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">Active Currency Symbol</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 px-4 text-white text-xs font-bold focus:outline-none focus:border-[#1ebd7d] cursor-pointer"
                >
                  <option value="₦">Nigerian Naira (₦)</option>
                  <option value="$">US Dollar ($)</option>
                  <option value="£">British Pound (£)</option>
                  <option value="€">Euro (€)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#1ebd7d] hover:bg-[#1ab073] disabled:opacity-50 text-neutral-950 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#1ebd7d]/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>

              {/* Social Login Divider */}
              <div className="text-center space-y-3">
                <span className="text-[10px] text-[#506e64] font-bold uppercase tracking-wider">Or continue with</span>
                <button
                  type="button"
                  onClick={() => alert("Google Sign-In is not fully configured yet on this Android app package. Please use the form above.")}
                  className="w-full py-3.5 bg-white hover:bg-neutral-50 text-neutral-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-neutral-200 transition-colors cursor-pointer"
                >
                  <span className="text-red-500 font-extrabold">G</span>
                  <span>Google</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: LOG IN */}
        {activeTab === 'login' && (
          <form onSubmit={handleCloudRestore} className="flex-grow flex flex-col justify-between space-y-6">
            <div className="space-y-4 pt-4">
              <div className="text-center py-2">
                <span className="text-[#1ebd7d] text-[10px] font-mono tracking-widest font-bold uppercase">Safe Wallet Vault</span>
                <p className="text-[#8c9e99] text-xs font-semibold mt-1">Enter credentials to load synced treasury records.</p>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1ebd7d]" size={15} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs font-semibold placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                  />
                </div>
              </div>

              {/* 4-digit PIN */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block pl-1">4-Digit PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1ebd7d]" size={15} />
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPin(val);
                      setErrorMsg('');
                    }}
                    className="w-full bg-[#081310] border border-[#162a24] rounded-2xl py-3.5 pl-11 pr-10 text-white text-xs font-extrabold tracking-[0.4em] placeholder-[#506e64] focus:outline-none focus:border-[#1ebd7d] focus:ring-1 focus:ring-[#1ebd7d]/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c9e99] hover:text-[#1ebd7d] cursor-pointer"
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#1ebd7d] hover:bg-[#1ab073] disabled:opacity-50 text-neutral-950 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#1ebd7d]/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Restoring records...' : 'Log In & Sync'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>

              <div className="text-center pt-2">
                <p className="text-[10px] text-[#506e64] font-semibold">Zero-knowledge local security backup active.</p>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Footer bar */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-4 pb-2">
        <p className="text-[10px] text-[#506e64] font-semibold">
          Flowse Secure Wallet Onboarding. Offline-First Ledgers.
        </p>
      </div>
    </div>
  );
}
