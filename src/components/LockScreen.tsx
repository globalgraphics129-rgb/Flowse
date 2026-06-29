import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface LockScreenProps {
  userName: string;
  savedPin: string;
  onVerify: () => void;
  onFactoryReset: () => void;
}

export default function LockScreen({ userName, savedPin, onVerify, onFactoryReset }: LockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    setErrorMsg('');
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  React.useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        if (pin === savedPin) {
          onVerify();
        } else {
          setErrorMsg('Incorrect secure PIN. Vault remains locked.');
          setPin('');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, savedPin, onVerify]);

  return (
    <div className="min-h-screen bg-[#040D0A] text-[#E2ECE9] flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      {/* Dark premium ambient radial lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,189,125,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

      {/* Top Lock Badge with Static Flowse Logo */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center pt-[calc(env(safe-area-inset-top)+24px)]">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-14 h-14 bg-[#1ebd7d] rounded-[1.25rem] flex items-center justify-center text-white mb-4 shadow-xl shadow-[#1ebd7d]/15 overflow-hidden"
        >
          {/* Reflection gloss */}
          <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white/25 blur-[0.5px]" />
          
          {/* Static premium arc */}
          <div className="absolute w-7 h-7 border-[3px] border-white border-t-white border-r-white border-b-transparent border-l-transparent rounded-full" />
          
          {/* Center tiny dot */}
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />
        </motion.div>
        
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#1ebd7d] uppercase font-bold">FLOWSE SECURE VAULT</span>
      </div>

      {/* Center PIN layout panel */}
      <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center my-4">
        <AnimatePresence mode="wait">
          {!showResetConfirm ? (
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight font-serif-display">
                  Welcome Back, <span className="text-[#1ebd7d]">{userName}</span>
                </h1>
                <p className="text-[#8c9e99] text-sm font-medium">Unlock local device treasury keychain</p>
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 bg-red-400/10 border border-red-500/20 text-red-450 rounded-xl text-xs text-center font-semibold"
                >
                  {errorMsg}
                </motion.div>
              )}

              {/* Dot PIN indicators */}
              <div className="flex space-x-6 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const filled = index < pin.length;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        filled
                          ? 'bg-[#1ebd7d] border-[#1ebd7d] scale-125 shadow-lg shadow-[#1ebd7d]/35'
                          : 'border-[#12332A] bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Premium dark keypad grid of rounded-full nodes */}
              <div className="w-full max-w-[280px] grid grid-cols-3 gap-4 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    id={`lock-keypad-${num}`}
                    key={num}
                    onClick={() => handleKeyPress(num)}
                    className="aspect-square rounded-full bg-[#081A15] hover:bg-[#12332A] active:bg-[#1ebd7d]/20 text-xl font-bold text-white flex items-center justify-center transition-all border border-[#12332A]/70 shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                {/* Empty block */}
                <div className="aspect-square" />
                {/* 0 */}
                <button
                  id="lock-keypad-0"
                  onClick={() => handleKeyPress('0')}
                  className="aspect-square rounded-full bg-[#081A15] hover:bg-[#12332A] active:bg-[#1ebd7d]/20 text-xl font-bold text-white flex items-center justify-center transition-all border border-[#12332A]/70 shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  0
                </button>
                {/* Backspace Delete button */}
                <button
                  id="lock-keypad-delete"
                  onClick={handleDelete}
                  className="aspect-square rounded-full bg-[#12332A]/50 hover:bg-[#12332A] active:bg-amber-500/15 text-[#1ebd7d] flex items-center justify-center transition-all hover:text-white border border-[#12332A]/30 text-xs font-bold tracking-widest uppercase cursor-pointer"
                >
                  DEL
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="factory-reset-confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#081A15] border border-red-500/20 rounded-[2rem] p-6 text-center space-y-5 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <AlertTriangle size={26} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white tracking-tight font-serif-display">Wipe Local Database?</h2>
                <p className="text-[#8c9e99] text-xs leading-relaxed font-semibold">
                  We generate no centralized backups. Resetting will completely erase your entire local database ledger from this device.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  id="lock-reset-confirm"
                  onClick={onFactoryReset}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Confirm Permanent Factory Wipe
                </button>
                <button
                  id="lock-reset-cancel"
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3.5 bg-[#12332A] hover:bg-[#1a473b] text-[#E2ECE9] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel & Return to Pin PIN Entry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset footer trigger */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pb-4">
        {!showResetConfirm && (
          <button
            id="lock-forgot-pin"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-[#8c9e99] hover:text-[#1ebd7d] transition-colors underline underline-offset-4 font-semibold cursor-pointer"
          >
            Forgot PIN? Clear Offline App Data
          </button>
        )}
      </div>
    </div>
  );
}
