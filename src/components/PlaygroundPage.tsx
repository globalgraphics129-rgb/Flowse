import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Laptop, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Play, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle, 
  Coins, 
  Flame, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../types';

interface PlaygroundPageProps {
  realBalance: number;
  currencySymbol: string;
}

interface SimulatedItem {
  id: string;
  name: string;
  amount: number;
  type: 'inflow' | 'outflow';
  frequency: 'one-time' | 'monthly';
}

export default function PlaygroundPage({ realBalance, currencySymbol }: PlaygroundPageProps) {
  const [startingBalance, setStartingBalance] = useState<number>(realBalance);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [stressFactor, setStressFactor] = useState<number>(100); // percentage of outflow inflation
  
  // Pre-seed some hypothetical simulator items
  const [items, setItems] = useState<SimulatedItem[]>([
    { id: 'h1', name: 'Hypothetical Side Hustle Boost', amount: 800, type: 'inflow', frequency: 'monthly' },
    { id: 'h2', name: 'Hardware Upgrade Investment', amount: 1500, type: 'outflow', frequency: 'one-time' },
    { id: 'h3', name: 'Cloud Server Maintenance Spike', amount: 120, type: 'outflow', frequency: 'monthly' }
  ]);

  // Form State for new simulator items
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemAmount, setNewItemAmount] = useState<string>('');
  const [newItemType, setNewItemType] = useState<'inflow' | 'outflow'>('outflow');
  const [newItemFreq, setNewItemFreq] = useState<'one-time' | 'monthly'>('monthly');

  // Simulation Results state
  const [monthlyProjections, setMonthlyProjections] = useState<{ month: number; balance: number; netChange: number }[]>([]);
  const [safetyMetrics, setSafetyMetrics] = useState({
    finalBalance: 0,
    isViable: true,
    lowestBalance: 0,
    estimatedRunway: 'Infinite',
    isStressed: false
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newItemAmount);
    if (!newItemName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newItem: SimulatedItem = {
      id: 'sim_' + Date.now().toString(),
      name: newItemName.trim(),
      amount: amountNum,
      type: newItemType,
      frequency: newItemFreq
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemAmount('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Run the Simulation equations
  const runSimulation = () => {
    const projections = [];
    let currentWallet = startingBalance;
    let stressMultiplier = stressFactor / 100;
    let lowest = currentWallet;

    for (let m = 1; m <= durationMonths; m++) {
      let monthlyInflow = 0;
      let monthlyOutflow = 0;

      items.forEach(item => {
        const isApplies = item.frequency === 'monthly' || (item.frequency === 'one-time' && m === 1);
        if (isApplies) {
          if (item.type === 'inflow') {
            monthlyInflow += item.amount;
          } else {
            // Apply stress factor to outflows
            monthlyOutflow += item.amount * stressMultiplier;
          }
        }
      });

      const netChange = monthlyInflow - monthlyOutflow;
      currentWallet += netChange;
      if (currentWallet < lowest) {
        lowest = currentWallet;
      }

      projections.push({
        month: m,
        balance: currentWallet,
        netChange
      });
    }

    // Calculate Runway (Months starting balances are viable if active inflows drop to 0)
    let totalMonthlyOutflow = items
      .filter(i => i.type === 'outflow' && i.frequency === 'monthly')
      .reduce((sum, i) => sum + i.amount * stressMultiplier, 0);
    
    let runwayText = 'Infinite';
    if (totalMonthlyOutflow > 0) {
      const runwayVal = startingBalance / totalMonthlyOutflow;
      runwayText = runwayVal > 48 ? '48+ Months' : `${runwayVal.toFixed(1)} Months`;
    }

    setMonthlyProjections(projections);
    setSafetyMetrics({
      finalBalance: currentWallet,
      isViable: lowest >= 0,
      lowestBalance: lowest,
      estimatedRunway: runwayText,
      isStressed: stressFactor > 100
    });
  };

  useEffect(() => {
    runSimulation();
  }, [startingBalance, durationMonths, stressFactor, items]);

  return (
    <div className="space-y-6 pb-20 p-2 text-[#E2ECE9] animate-fade-in">
      
      {/* Visual Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#12332A]/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-serif-display flex items-center gap-2">
            <Sparkles className="text-[#1ebd7d]" size={22} />
            Interactive Portfolio Sandbox
          </h1>
          <p className="text-xs text-[#8c9e99]">
            Stress-test your treasury index, mock recurring forecasts, and model future milestones under variable macroeconomic bounds.
          </p>
        </div>
        <button
          onClick={() => {
            setStartingBalance(realBalance);
            setStressFactor(100);
            setItems([
              { id: 'h1', name: 'Hypothetical Side Hustle Boost', amount: 800, type: 'inflow', frequency: 'monthly' },
              { id: 'h2', name: 'Hardware Upgrade Investment', amount: 1500, type: 'outflow', frequency: 'one-time' },
              { id: 'h3', name: 'Cloud Server Maintenance Spike', amount: 120, type: 'outflow', frequency: 'monthly' }
            ]);
          }}
          className="py-2 px-4 bg-[#12332A] hover:bg-[#1ebd7d]/10 text-[#1ebd7d] border border-[#1ebd7d]/20 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
        >
          <RefreshCw size={12} />
          <span>Reset Playground parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Controls & Mocks Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-natural p-6 space-y-5">
            <h2 className="text-sm font-bold text-white font-mono tracking-wider uppercase mb-2">Configure Baseline Stress Inputs</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Simulation Sandbox Seed</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-[#1ebd7d] font-bold text-xs">{currencySymbol}</span>
                  <input
                    type="number"
                    value={startingBalance === 0 ? '' : startingBalance}
                    onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-natural border border-border-soft rounded-xl p-3 pl-8 text-xs text-white focus:outline-none focus:border-[#1ebd7d] font-bold font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Horizon Domain</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                  className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#1ebd7d] font-bold cursor-pointer"
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Macro Outflow Stress</label>
                  <span className="text-[10px] text-[#1ebd7d] font-extrabold font-mono">{stressFactor}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="10"
                  value={stressFactor}
                  onChange={(e) => setStressFactor(parseInt(e.target.value))}
                  className="w-full h-1 bg-natural rounded-lg appearance-none cursor-pointer accent-[#1ebd7d] outline-none mt-4"
                />
              </div>
            </div>
          </div>

          {/* Simulated Assets List */}
          <div className="card-natural p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white font-mono tracking-wider uppercase">Sandbox Variables Deck</h2>
              <span className="text-[10px] text-[#8c9e99] font-mono">({items.length} Active Vectors)</span>
            </div>

            {/* Form to add item */}
            <form onSubmit={handleAddItem} className="bg-natural p-4 rounded-2xl border border-border-soft/50 space-y-3">
              <span className="text-[10px] font-extrabold text-[#1ebd7d] uppercase tracking-widest font-mono">Inject Variable Vector</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Server Cost, Marketing Bonus"
                  className="bg-cream border border-border-soft rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1ebd7d] font-bold"
                />
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#8c9e99] text-[10px] font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    placeholder="Amount Value"
                    className="w-full bg-[#081A15] border border-[#12332A] rounded-xl p-2.5 pl-7 text-xs text-white focus:outline-none focus:border-[#1ebd7d] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-4 bg-[#081A15] p-2.5 rounded-xl border border-[#12332A]">
                  <label className="text-[#8c9e99] font-bold">Vector:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewItemType('inflow')}
                      className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold ${newItemType === 'inflow' ? 'bg-[#1ebd7d] text-neutral-900' : 'bg-[#040D0A] text-[#8c9e99]'}`}
                    >
                      Inflow
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemType('outflow')}
                      className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold ${newItemType === 'outflow' ? 'bg-[#EE765D] text-white' : 'bg-[#040D0A] text-[#8c9e99]'}`}
                    >
                      Outflow
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#081A15] p-2.5 rounded-xl border border-[#12332A]">
                  <label className="text-[#8c9e99] font-bold">Cycle:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewItemFreq('monthly')}
                      className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold ${newItemFreq === 'monthly' ? 'bg-[#1ebd7d] text-neutral-900' : 'bg-[#040D0A] text-[#8c9e99]'}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemFreq('one-time')}
                      className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold ${newItemFreq === 'one-time' ? 'bg-[#1ebd7d] text-neutral-900' : 'bg-[#040D0A] text-[#8c9e99]'}`}
                    >
                      One-time
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-extrabold text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} className="stroke-[3px]" />
                <span>Inject Variable into Sandbox Matrix</span>
              </button>
            </form>

            {/* List of variables */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <AnimatePresence>
                {items.map((item) => {
                  const isInflow = item.type === 'inflow';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between bg-natural p-3 rounded-2xl border border-border-soft/70"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[9px] font-bold tracking-widest text-[#8c9e99] uppercase font-mono">
                          {item.frequency} Vector
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold font-mono ${isInflow ? 'text-[#1ebd7d]' : 'text-[#EE765D]'}`}>
                          {isInflow ? '+' : '−'}{currencySymbol}{item.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-[#8c9e99] hover:text-[#EE765D] p-1.5 hover:bg-[#EE765D]/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Hand: Simulation Readouts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-natural p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.08),transparent_70%)] pointer-events-none" />
            <h2 className="text-sm font-bold text-white font-mono tracking-wider uppercase">Sandbox Trajectory Matrix</h2>

            <div className="space-y-4">
              <div className="bg-natural p-4.5 rounded-2xl border border-border-soft/60 space-y-1">
                <span className="text-[10px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Future Solvency Projection ({durationMonths} Month)</span>
                <span className={`text-3xl font-extrabold font-serif-display ${safetyMetrics.isViable ? 'text-[#1ebd7d]' : 'text-[#EE765D]'}`}>
                  {currencySymbol}{safetyMetrics.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  {safetyMetrics.isViable ? (
                    <CheckCircle size={12} className="text-[#1ebd7d]" />
                  ) : (
                    <ShieldAlert size={12} className="text-[#EE765D]" />
                  )}
                  <span className="text-[10px] text-[#8c9e99] font-bold">
                    {safetyMetrics.isViable 
                      ? 'Solid Capital Projection: Solvent bounds verified.' 
                      : 'Alert: Projected Capital Depletion detected! Check allocations.'}
                  </span>
                </div>
              </div>

              {/* Solvency stats table grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-natural p-3.5 rounded-xl border border-border-soft/50">
                  <span className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Severe Runway</span>
                  <span className="text-sm font-extrabold text-white font-mono block mt-1">{safetyMetrics.estimatedRunway}</span>
                </div>
                <div className="bg-natural p-3.5 rounded-xl border border-border-soft/50">
                  <span className="text-[9px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Stressed Floor</span>
                  <span className={`text-sm font-extrabold font-mono block mt-1 ${safetyMetrics.lowestBalance >= 0 ? 'text-[#1ebd7d]' : 'text-[#EE765D]'}`}>
                    {currencySymbol}{safetyMetrics.lowestBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Projection Step Items list representation */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8c9e99] uppercase tracking-wider block font-mono">Monthly Projection Step Sequence</span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {monthlyProjections.map((p) => {
                    const isPositive = p.netChange >= 0;
                    return (
                      <div key={p.month} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-natural/60 border border-border-soft/40 font-mono">
                        <span className="text-white font-bold">Month {p.month}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] ${isPositive ? 'text-[#1ebd7d]' : 'text-[#EE765D]'}`}>
                            {isPositive ? '▲' : '▼'} {currencySymbol}{Math.abs(p.netChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-white font-bold">
                            {currencySymbol}{p.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
