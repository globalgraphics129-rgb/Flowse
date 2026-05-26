import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle, 
  Sparkles, 
  TrendingUp, 
  PiggyBank, 
  ShieldCheck, 
  Lock
} from 'lucide-react';

interface InteractiveTourProps {
  onClose: () => void;
  currencySymbol?: string;
}

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlightTitle: string;
}

export default function InteractiveTour({ onClose, currencySymbol = '₦' }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: TourStep[] = [
    {
      title: "Welcome to Flowse Premium",
      description: "Welcome! Your ledger is a beautifully private, offline-first personal treasury vault. Since your records reside strictly on your device hardware, let's explore how to pilot your funds.",
      icon: <Sparkles className="text-sage w-10 h-10 animate-pulse" />,
      highlightTitle: "THE PRIVACY MISSION"
    },
    {
      title: "Real-Time Balance Ledger",
      description: "At the top of your dashboard, monitor your true combined balance, monthly incomes, and monthly spending outflows. Click the eye icon next to your name at any time to toggle absolute secrecy mode (peeking blocks sensitive counts from stray eyes!).",
      icon: <TrendingUp className="text-sage w-10 h-10" />,
      highlightTitle: "LEDGER AUDITS"
    },
    {
      title: "Formulate Budget Caps",
      description: "Set hard monthly caps on spend groupings like Food, Transport, or Business. Flowse keeps tabs on spending metrics with automatic color codes and real-world margin buffer trackers to ward off over-spending.",
      icon: <ShieldCheck className="text-sage w-10 h-10 animate-bounce" style={{ animationDuration: '3s' }} />,
      highlightTitle: "SPENDING CAPS"
    },
    {
      title: "Target Savings lock objectives",
      description: "Formulate specific target saving goals! Whenever you lock contributions to a savings lock, Flowse translates that transaction as a corresponding spending outflow automatically, helping you build an emergency buffer with ease.",
      icon: <PiggyBank className="text-sage w-10 h-10" />,
      highlightTitle: "SAVINGS MILESTONES"
    },
    {
      title: "Severe Solvency Sandbox",
      description: "Test hypothetical stress events in the 'Sandbox Sandbox' tab! Tweak baseline inputs, add negative cash-flows (like cloud services or hardware upgrades), assign stress margins, and map solvency metrics without tampering with active records.",
      icon: <Lock className="text-[#EE765D] w-10 h-10 animate-spin-slow" />,
      highlightTitle: "SIMULATION RUNWAYS"
    }
  ];

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const active = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      {/* Absolute clickable background backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative z-10 w-full max-w-lg bg-cream border border-border-soft rounded-[2rem] p-6 md:p-8 shadow-2xl text-natural-text relative overflow-hidden"
      >
        {/* Aesthetic radial gloss overlay */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.08),transparent_70%)] pointer-events-none" />

        {/* Header toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-lg bg-sage/15 text-sage text-[10px] font-mono font-bold tracking-widest uppercase">
              {active.highlightTitle}
            </span>
            <span className="text-xs text-[#8c9e99]">Step {currentStep + 1} of {steps.length}</span>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-natural border border-border-soft text-[#8c9e99] hover:text-sage transition-all cursor-pointer"
            title="Close interactive guide"
          >
            <X size={15} />
          </button>
        </div>

        {/* Carousel slide step animation content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 min-h-[170px]"
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="p-3 bg-natural border border-border-soft rounded-2xl shrink-0">
                {active.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{active.title}</h3>
                <p className="text-[10px] uppercase tracking-wider text-sage font-mono font-bold">Flowse Treasury School</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#8c9e99] leading-relaxed font-medium">
              {active.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic visual step pager tracker dots */}
        <div className="flex items-center gap-1.5 py-4">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-sage' : 'w-2 bg-border-soft'}`} 
            />
          ))}
        </div>

        {/* Navigation Action Buttons Panel */}
        <div className="flex items-center justify-between pt-4 border-t border-border-soft mt-2">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none border cursor-pointer ${
              currentStep === 0 
                ? 'opacity-40 border-border-soft text-gray-500 pointer-events-none' 
                : 'bg-natural border-border-soft text-[#8c9e99] hover:text-white'
            }`}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <button
            onClick={next}
            className="py-3 px-6 bg-sage hover:bg-sage/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none cursor-pointer shadow-lg shadow-sage/10 ml-auto"
          >
            <span>{currentStep === steps.length - 1 ? "Finish School" : "Next Step"}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
