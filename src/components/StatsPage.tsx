import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PieChart, TrendingUp, TrendingDown, PiggyBank, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import CategoryIcon from './CategoryIcon';

interface StatsPageProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export default function StatsPage({ transactions, currencySymbol }: StatsPageProps) {
  const [filterPeriod, setFilterPeriod] = useState<'30' | '90' | 'all'>('30');

  // Filter transactions based on date
  const filteredTransactions = transactions.filter((t) => {
    if (filterPeriod === 'all') return true;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(filterPeriod));
    return new Date(t.date) >= dateLimit;
  });

  // Calculations
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Group by category for expenses
  const expenseByCategory: Record<string, number> = {};
  filteredTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const categoryData = Object.entries(expenseByCategory).map(([catValue, amount]) => {
    const meta = EXPENSE_CATEGORIES.find((c) => c.value === catValue) || {
      label: catValue,
      color: 'from-slate-500 to-slate-700',
      icon: 'HelpCircle',
    };
    return {
      value: catValue,
      label: meta.label,
      amount,
      color: meta.color,
      icon: meta.icon,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Math for SVG Donut Plot
  let accumulatedPercent = 0;
  const donutSlices = categoryData.map((data) => {
    const startPercent = accumulatedPercent;
    accumulatedPercent += data.percentage;
    return {
      ...data,
      startPercent,
      endPercent: accumulatedPercent,
    };
  });

  // Fallback if no transactions
  const hasExpense = categoryData.length > 0;

  return (
    <div className="space-y-6 pb-20 p-2 text-natural-text animate-fade-in">
      {/* Visual Welcome Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-serif-display">Financial Intelligence</h1>
          <p className="text-xs text-[#8c9e99] font-medium">Tactile metrics and category analytics for Flowse ledger</p>
        </div>

        {/* Temporal Filters */}
        <div className="flex bg-natural border border-border-soft p-1 rounded-xl self-start shadow-md">
          {(['30', '90', 'all'] as const).map((period) => (
            <button
              id={`stats-filter-${period}`}
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-150 cursor-pointer ${
                filterPeriod === period
                  ? 'bg-[#1ebd7d] text-neutral-950 font-extrabold shadow-sm'
                  : 'text-[#8c9e99] hover:text-white'
              }`}
            >
              {period === 'all' ? 'ALL TIME' : `${period} DAYS`}
            </button>
          ))}
        </div>
      </div>

      {/* Numerical Bento Grid matching Finmori kit aesthetics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-natural p-5 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.05),transparent_70%)] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-[#8c9e99] uppercase font-mono">Total Income</span>
            <span className="p-1 px-1.5 text-[9px] bg-[#1ebd7d]/10 text-[#1ebd7d] border border-[#1ebd7d]/20 rounded-lg font-mono flex items-center font-bold">
              <TrendingUp size={10} className="mr-1" /> ACTIVE
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#1ebd7d] font-serif-display">
            {currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card-natural p-5 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(238,118,93,0.05),transparent_70%)] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-[#8c9e99] uppercase font-mono">Total Outflow</span>
            <span className="p-1 px-1.5 text-[9px] bg-[#EE765D]/10 text-[#EE765D] border border-[#EE765D]/20 rounded-lg font-mono flex items-center font-bold">
              <TrendingDown size={10} className="mr-1" /> ACTIVE
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#EE765D] font-serif-display">
            {currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card-natural p-5 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.05),transparent_70%)] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-[#8c9e99] uppercase font-mono">Savings Rate</span>
            <span className="p-1 px-1.5 text-[9px] bg-[#1ebd7d]/10 text-[#1ebd7d] border border-[#1ebd7d]/20 rounded-lg font-mono flex items-center font-bold">
              <PiggyBank size={10} className="mr-1" /> RATE
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-serif-display">
            {savingsRate >= 0 ? `${savingsRate}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Playbook: Category Distribution Donut with Finmori theme colors */}
        <div className="md:col-span-5 card-natural p-6 flex flex-col items-center justify-center min-h-[340px]">
          <h3 className="text-[10px] font-bold tracking-widest text-[#8c9e99] uppercase self-start mb-6 font-mono">Distribution</h3>

          {hasExpense ? (
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Dynamic SVG Ring Pie */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="var(--bg-natural)" strokeWidth="12" fill="transparent" />
                {donutSlices.map((slice) => {
                  const circumference = 251.3;
                  const dashArray = `${(slice.percentage * circumference) / 100} ${circumference}`;
                  const dashOffset = `${circumference - (slice.startPercent * circumference) / 100}`;
                  
                  const isPink = slice.color.includes('pink');
                  const isRed = slice.color.includes('red');
                  const isAmber = slice.color.includes('amber');
                  const isBlue = slice.color.includes('blue');
                  const isCyan = slice.color.includes('cyan');
                  const isPurple = slice.color.includes('purple');
                  const isTeal = slice.color.includes('teal');
                  let strokeColor = '#1ebd7d'; // default lime mint
                  if (isPink) strokeColor = '#f43f5e';
                  else if (isRed) strokeColor = '#EE765D';
                  else if (isAmber) strokeColor = '#f59e0b';
                  else if (isBlue) strokeColor = '#3b82f6';
                  else if (isCyan) strokeColor = '#06b6d4';
                  else if (isPurple) strokeColor = '#a855f7';
                  else if (isTeal) strokeColor = '#14b8a6';

                  return (
                    <circle
                      key={slice.value}
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={strokeColor}
                      strokeWidth="11"
                      fill="transparent"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      strokeLinecap={slice.percentage > 3 ? 'round' : 'butt'}
                      className="transition-all duration-350 hover:stroke-[13px] cursor-pointer"
                    />
                  );
                })}
              </svg>
              {/* Central readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-mono tracking-widest text-[#8c9e99] uppercase font-bold">Spent Total</span>
                <span className="text-xl font-extrabold text-white font-serif-display">
                  {currencySymbol}{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#8c9e99] py-10">
              <div className="p-4 rounded-full bg-[#12332A]/50 border border-[#1ebd7d]/10 text-[#1ebd7d] mb-3">
                <PieChart size={32} />
              </div>
              <p className="text-xs font-bold">No outflow transactions recorded</p>
            </div>
          )}

          {/* Minimal legends at the bottom */}
          <div className="w-full grid grid-cols-2 gap-2 mt-6">
            {donutSlices.slice(0, 4).map((slice) => {
              const isPink = slice.color.includes('pink');
              const isRed = slice.color.includes('red');
              const isAmber = slice.color.includes('amber');
              const isBlue = slice.color.includes('blue');
              const isCyan = slice.color.includes('cyan');
              const isPurple = slice.color.includes('purple');
              const isTeal = slice.color.includes('teal');
              let badgeColor = 'bg-[#1ebd7d]';
              if (isPink) badgeColor = 'bg-rose-400';
              else if (isRed) badgeColor = 'bg-[#EE765D]';
              else if (isAmber) badgeColor = 'bg-amber-400';
              else if (isBlue) badgeColor = 'bg-blue-400';
              else if (isCyan) badgeColor = 'bg-cyan-400';
              else if (isPurple) badgeColor = 'bg-purple-400';
              else if (isTeal) badgeColor = 'bg-teal-400';

              return (
                <div key={slice.value} className="flex items-center space-x-2 text-[10px] text-[#8c9e99] bg-natural/60 p-1.5 rounded-lg border border-border-soft/30">
                  <div className={`w-2 h-2 rounded-full ${badgeColor}`} />
                  <span className="truncate flex-1 font-bold">{slice.label}</span>
                  <span className="font-mono text-white text-[9px] font-extrabold">{slice.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Categorical Progress Bars with high-contrast UI details */}
        <div className="md:col-span-7 card-natural p-6 flex flex-col justify-between space-y-5">
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#8c9e99] uppercase mb-5 font-mono">Categorical Breakdown</h3>
            <div className="space-y-4">
              {hasExpense ? (
                categoryData.map((data) => (
                  <div key={data.value} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-[#8c9e99]">
                        <span className={`p-1 rounded-md bg-gradient-to-br ${data.color} text-white`}>
                          <CategoryIcon name={data.icon} size={11} />
                        </span>
                        <span className="font-bold group-hover:text-white transition-colors">{data.label}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-mono text-[#8c9e99]">
                        <span className="text-white font-bold">{currencySymbol}{data.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        <span className="text-[10px] text-[#8c9e99]/60">({data.percentage}%)</span>
                      </div>
                    </div>
                    {/* Linear progress track */}
                    <div className="w-full h-2 bg-natural rounded-full overflow-hidden border border-border-soft/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${data.color}`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-[#8c9e99] flex flex-col items-center justify-center">
                  <span className="text-xs font-bold leading-relaxed">No analytics parameters available. Record expenses to initiate charts.</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-border-soft/30 rounded-2xl border border-border-soft flex items-center space-x-2.5 text-[10px] text-[#8c9e99] font-medium leading-relaxed">
            <ShieldCheck size={13} className="text-sage" />
            <span>Analytical metrics computed dynamically fully offline.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
