import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Plus, Check, FileText } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import CategoryIcon from './CategoryIcon';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  currencySymbol?: string;
}

export default function TransactionForm({ onAdd, onClose, currencySymbol = '₦' }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a title or payee description');
      return;
    }

    if (!category) {
      setErrorMsg('Please select a category');
      return;
    }

    onAdd({
      amount: parsedAmount,
      description: description.trim(),
      category,
      type,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });
  };

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end justify-center sm:items-center p-0 sm:p-4 text-natural-text select-none"
    >
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ y: 200, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 200, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-10 w-full max-w-lg bg-cream border-t sm:border border-border-soft rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl overflow-y-auto max-h-[92vh] sm:max-h-[85vh]"
      >
        <div className="w-12 h-1 rounded-full bg-border-soft mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-sage/15 text-sage">
              <Plus size={18} />
            </span>
            <h2 className="text-xl font-bold text-natural-text tracking-tight">Record Transaction</h2>
          </div>
          <button
            id="transaction-form-close"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-natural/50 border border-border-soft text-[#8c9e99] hover:text-sage transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-400/10 border border-red-500/20 text-red-500 rounded-xl text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          {/* Toggles */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-natural rounded-2xl border border-border-soft">
            <button
              id="form-tab-expense"
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-border-soft text-clay border border-red-500/10 shadow'
                  : 'text-[#8c9e99] hover:text-natural-text'
              }`}
            >
              Expense
            </button>
            <button
              id="form-tab-income"
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-border-soft text-sage border border-emerald-500/10 shadow'
                  : 'text-[#8c9e99] hover:text-natural-text'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sage uppercase tracking-widest block pl-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage font-extrabold">{currencySymbol}</span>
                <input
                  id="transaction-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full bg-natural border border-border-soft rounded-2xl py-3 pl-9 pr-4 text-natural-text text-base font-bold focus:outline-none focus:border-sage transition-colors"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sage uppercase tracking-widest block pl-1">Transaction Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" size={15} />
                <input
                  id="transaction-date-input"
                  type="date"
                  className="w-full bg-natural border border-border-soft rounded-2xl py-3 pl-11 pr-4 text-natural-text text-xs font-semibold focus:outline-none focus:border-sage transition-colors cursor-pointer"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-sage uppercase tracking-widest block pl-1">Title / Description</label>
            <input
              id="transaction-desc-input"
              type="text"
              className="w-full bg-natural border border-border-soft rounded-2xl py-3 px-4 text-natural-text text-xs font-semibold placeholder-[#506e64] focus:outline-none focus:border-sage transition-colors"
              placeholder="e.g. Grocery Shop, Freelance project, Office supply"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Categories Grid selectors */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sage uppercase tracking-widest block pl-1">Select Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeCategories.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    id={`cat-select-${cat.value}`}
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center border text-center transition-all duration-150 cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-sage/10 border-sage text-sage scale-[1.02] shadow'
                        : 'bg-natural border-border-soft text-[#8c9e99] hover:bg-border-soft/30 hover:text-natural-text'
                    }`}
                  >
                    <span className={`p-2 rounded-xl bg-gradient-to-br ${cat.color} text-white mb-2 shadow`}>
                      <CategoryIcon name={cat.icon} size={15} />
                    </span>
                    <span className="text-[10px] font-bold tracking-wide truncate max-w-full leading-tight">
                      {cat.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-sage flex items-center justify-center text-white">
                        <Check size={9} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Optional memo */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-sage uppercase tracking-widest block pl-1">Additional Notes (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-3 text-sage" size={15} />
              <textarea
                id="transaction-notes-input"
                className="w-full bg-natural border border-border-soft rounded-2xl py-2.5 pl-11 pr-4 text-natural-text text-xs placeholder-[#506e64] focus:outline-none focus:border-sage transition-colors h-14 resize-none font-medium animate-none"
                placeholder="Include payment notes or reference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <button
            id="transaction-form-submit"
            type="submit"
            className="w-full py-4 bg-sage hover:bg-sage/90 text-white dark:text-neutral-900 font-bold rounded-2xl shadow-xl shadow-sage/10 transition-all text-xs tracking-wider uppercase cursor-pointer"
          >
            Add Transaction
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
