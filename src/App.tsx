import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Car, 
  ShoppingBag, 
  Utensils, 
  Film, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  HelpCircle, 
  Plus, 
  X, 
  Calendar, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  LogOut, 
  Settings, 
  FileText, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Bell, 
  Mail, 
  User, 
  HeartHandshake, 
  Laptop, 
  ChevronRight, 
  AlertTriangle, 
  Download, 
  Upload, 
  Percent,
  Repeat,
  Sun,
  Moon,
  TrendingUp as BulletIcon,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { 
  Transaction, 
  Budget, 
  Goal, 
  UserProfile, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES,
  RecurringTransaction
} from './types';
import { processRecurringTransactions } from './utils/recurring';
import CategoryIcon from './components/CategoryIcon';
import Onboarding from './components/Onboarding';
import LockScreen from './components/LockScreen';
import StatsPage from './components/StatsPage';
import TransactionForm from './components/TransactionForm';
import RecurringForm from './components/RecurringForm';
import PlaygroundPage from './components/PlaygroundPage';
import ImageCropperModal from './components/ImageCropperModal';
import InteractiveTour from './components/InteractiveTour';
import { generateStatementPDF } from './utils/pdfGenerator';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export default function App() {
  // Navigation & Screen Control
  const [appBooting, setAppBooting] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const getApiUrl = (path: string) => {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalDev && (window.location.port === '3000' || window.location.port === '5173')) {
      return `/api${path}`;
    }
    return `https://flowse-six.vercel.app/api${path}`;
  };

  // Flowse Modular Theme Preferences (light | dark | system)
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('flowse_theme_preference');
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Interactive step-by-step onboarding walkthrough guides
  const [showTour, setShowTour] = useState<boolean>(false);
  const [selectedCropFile, setSelectedCropFile] = useState<File | null>(null);

  // Toggleable Interactive Welcoming Onboarding Feature
  const [showWelcomingPromo, setShowWelcomingPromo] = useState<boolean>(() => {
    const saved = localStorage.getItem('flowse_welcoming_promo');
    return saved !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('flowse_theme_preference', themePref);
    const root = document.documentElement;

    const applyTheme = (theme: 'light' | 'dark') => {
      setResolvedTheme(theme);
      if (theme === 'light') {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
      } else {
        root.classList.remove('theme-light');
        root.classList.add('theme-dark');
      }
    };

    if (themePref === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      handleSystemThemeChange(mediaQuery);
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    } else {
      applyTheme(themePref);
    }
  }, [themePref]);

  const isLight = resolvedTheme === 'light';

  // Backwards compatibility shim for older theme references in code
  const themeMode = resolvedTheme; 

  const toggleWelcomingPromo = () => {
    const nextVal = !showWelcomingPromo;
    setShowWelcomingPromo(nextVal);
    localStorage.setItem('flowse_welcoming_promo', String(nextVal));
  };
  const [pinVerified, setPinVerified] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [peekBalance, setPeekBalance] = useState<boolean>(false);
  const [hasProcessedRecurring, setHasProcessedRecurring] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppBooting(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle Capacitor native splash screen hide
  useEffect(() => {
    if (!appBooting && Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(err => console.warn('Splash hide error', err));
    }
  }, [appBooting]);

  // Handle Capacitor native status bar coloring and style cycle
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: resolvedTheme === 'dark' ? Style.Dark : Style.Light })
        .catch(err => console.warn('StatusBar style error', err));
      StatusBar.setBackgroundColor({ color: resolvedTheme === 'dark' ? '#030C0A' : '#F6FBF9' })
        .catch(err => console.warn('StatusBar bg error', err));
    }
  }, [resolvedTheme]);

  // App Database State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  // Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');

  const syncLedger = async (
    currentProfile: UserProfile | null,
    currentTransactions: Transaction[],
    currentBudgets: Budget[],
    currentGoals: Goal[],
    currentRecurring: RecurringTransaction[]
  ) => {
    if (!currentProfile || !currentProfile.email || !currentProfile.pin) {
      return;
    }
    setSyncStatus('syncing');
    try {
      // getApiUrl is defined globally at the component level

      const response = await fetch(getApiUrl('/data/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentProfile.email,
          pin: currentProfile.pin,
          data: {
            profile: currentProfile,
            transactions: currentTransactions,
            budgets: currentBudgets,
            goals: currentGoals,
            recurringTransactions: currentRecurring
          }
        })
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Sync failed:', err);
      setSyncStatus('error');
    }
  };

  // Debounced auto-sync effect
  useEffect(() => {
    if (!profile) return;
    const timer = setTimeout(() => {
      syncLedger(profile, transactions, budgets, goals, recurringTransactions);
    }, 1500);
    return () => clearTimeout(timer);
  }, [profile, transactions, budgets, goals, recurringTransactions]);

  // Modals Controller
  const [showAddTxModal, setShowAddTxModal] = useState<boolean>(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState<boolean>(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);
  const [showAddRecurringModal, setShowAddRecurringModal] = useState<boolean>(false);
  const [showContributionModal, setShowContributionModal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('');

  // Local Modal Form States
  const [budgetCategory, setBudgetCategory] = useState<string>('food');
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  
  const [goalName, setGoalName] = useState<string>('');
  const [goalTarget, setGoalTarget] = useState<string>('');
  const [goalSaved, setGoalSaved] = useState<string>('0');
  const [goalDate, setGoalDate] = useState<string>('');

  // Transactions Filter Settings
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Feed/Demo Seed Generator
  const seedDemoData = (username: string, baseCurrency: string) => {
    const isNaira = baseCurrency === '₦';
    const multiplier = isNaira ? 100 : 1;
    
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const d = (day: number) => {
      const dateStr = new Date(y, m, day).toISOString();
      return dateStr;
    };

    const initialTxs: Transaction[] = [
      { id: 't1', type: 'income', description: 'Web Project Milestone', amount: 4500 * multiplier, category: 'freelance', date: d(1), notes: 'Contract with client' },
      { id: 't2', type: 'income', description: 'Monthly Retention Pay', amount: 2000 * multiplier, category: 'salary', date: d(2) },
      { id: 't3', type: 'expense', description: 'Co-working Office Rent', amount: 1200 * multiplier, category: 'housing', date: d(3) },
      { id: 't4', type: 'expense', description: 'Grocery Stockup', amount: 280 * multiplier, category: 'food', date: d(5), notes: 'Whole Foods' },
      { id: 't5', type: 'expense', description: 'Monthly Cloud Bills', amount: 50 * multiplier, category: 'business', date: d(10) },
      { id: 't6', type: 'expense', description: 'Fuel Refill', amount: 120 * multiplier, category: 'transport', date: d(12) },
      { id: 't7', type: 'expense', description: 'Weekend Cinema & Eatery', amount: 85 * multiplier, category: 'entertainment', date: d(15) },
      { id: 't8', type: 'expense', description: 'Ledger Tithe / Donation', amount: 650 * multiplier, category: 'church', date: d(17) },
      { id: 't9', type: 'income', description: 'Side Freelance Audit', amount: 400 * multiplier, category: 'freelance', date: d(19) },
      { id: 't10', type: 'expense', description: 'Prescription Drugs', amount: 45 * multiplier, category: 'health', date: d(20) },
    ];

    const initialBudgets: Budget[] = [
      { id: 'b1', category: 'food', limit: 600 * multiplier },
      { id: 'b2', category: 'transport', limit: 300 * multiplier },
      { id: 'b3', category: 'housing', limit: 1500 * multiplier },
      { id: 'b4', category: 'business', limit: 200 * multiplier },
    ];

    const initialGoals: Goal[] = [
      { id: 'g1', name: 'New M4 Silicon MacBook', target: 2400 * multiplier, saved: 800 * multiplier, date: new Date(y, m + 3, 15).toISOString().split('T')[0] },
      { id: 'g2', name: 'Emergency Treasury Buffer', target: 5000 * multiplier, saved: 1550 * multiplier, date: new Date(y, m + 6, 1).toISOString().split('T')[0] },
    ];

    const initialRecurring: RecurringTransaction[] = [
      {
        id: 'rec_demo_salary',
        amount: 5000 * multiplier,
        description: 'Salary',
        category: 'salary',
        type: 'income',
        frequency: 'monthly',
        startDate: `${y}-${String(m + 1).padStart(2, '0')}-01`,
        notes: 'Monthly corporate salary deposit',
        isActive: true
      },
      {
        id: 'rec_demo_rent',
        amount: 1500 * multiplier,
        description: 'Rent',
        category: 'housing',
        type: 'expense',
        frequency: 'monthly',
        startDate: `${y}-${String(m + 1).padStart(2, '0')}-01`,
        notes: 'Monthly apartment rent auto-debit',
        isActive: true
      }
    ];

    localStorage.setItem('flowse_transactions_react', JSON.stringify(initialTxs));
    localStorage.setItem('flowse_budgets_react', JSON.stringify(initialBudgets));
    localStorage.setItem('flowse_goals_react', JSON.stringify(initialGoals));
    localStorage.setItem('flowse_recurring_react', JSON.stringify(initialRecurring));

    setTransactions(initialTxs);
    setBudgets(initialBudgets);
    setGoals(initialGoals);
    setRecurringTransactions(initialRecurring);
  };

  // Initialize DB from Device Hardware Storage
  useEffect(() => {
    const localProfile = localStorage.getItem('flowse_profile_react');
    const localTxs = localStorage.getItem('flowse_transactions_react');
    const localBudgets = localStorage.getItem('flowse_budgets_react');
    const localGoals = localStorage.getItem('flowse_goals_react');
    const localRecurring = localStorage.getItem('flowse_recurring_react');

    if (localProfile) {
      const parsedProfile = JSON.parse(localProfile) as UserProfile;
      setProfile(parsedProfile);
      
      if (localTxs) setTransactions(JSON.parse(localTxs));
      if (localBudgets) setBudgets(JSON.parse(localBudgets));
      if (localGoals) setGoals(JSON.parse(localGoals));
      if (localRecurring) setRecurringTransactions(JSON.parse(localRecurring));
    }
  }, []);

  // Automatically process recurring transactions when authenticated
  useEffect(() => {
    if (!profile || !pinVerified || hasProcessedRecurring) return;
    
    if (recurringTransactions.length > 0) {
      const now = new Date();
      const { newTransactions, updatedRecurringList } = processRecurringTransactions(recurringTransactions, now);
      
      if (newTransactions.length > 0) {
        const updatedTxs = [...newTransactions, ...transactions];
        updateTransactionsList(updatedTxs);
        updateRecurringList(updatedRecurringList);
        
        alert(`Flowse Automated Engine: ${newTransactions.length} scheduled transaction(s) have been successfully logged!`);
      }
      setHasProcessedRecurring(true);
    } else {
      setHasProcessedRecurring(true);
    }
  }, [pinVerified, recurringTransactions, hasProcessedRecurring]);

  // Sync Storage
  const updateTransactionsList = (newList: Transaction[]) => {
    setTransactions(newList);
    localStorage.setItem('flowse_transactions_react', JSON.stringify(newList));
  };

  const updateBudgetsList = (newList: Budget[]) => {
    setBudgets(newList);
    localStorage.setItem('flowse_budgets_react', JSON.stringify(newList));
  };

  const updateGoalsList = (newList: Goal[]) => {
    setGoals(newList);
    localStorage.setItem('flowse_goals_react', JSON.stringify(newList));
  };

  const updateRecurringList = (newList: RecurringTransaction[]) => {
    setRecurringTransactions(newList);
    localStorage.setItem('flowse_recurring_react', JSON.stringify(newList));
  };

  const handleOnboardComplete = (
    completedProfile: UserProfile,
    restoredData?: {
      transactions: Transaction[];
      budgets: Budget[];
      goals: Goal[];
      recurringTransactions: RecurringTransaction[];
    }
  ) => {
    setProfile(completedProfile);
    setPinVerified(true);
    localStorage.setItem('flowse_profile_react', JSON.stringify(completedProfile));
    
    if (restoredData) {
      updateTransactionsList(restoredData.transactions);
      updateBudgetsList(restoredData.budgets);
      updateGoalsList(restoredData.goals);
      updateRecurringList(restoredData.recurringTransactions);
    } else {
      // Maintain a pristine empty state dashboard on registration as requested
      updateTransactionsList([]);
      updateBudgetsList([]);
      updateGoalsList([]);
      updateRecurringList([]);
      
      // Automatically trigger the interactive school tutorial walkthrough for a perfect onboarding experience
      setShowTour(true);
    }
  };

  const handleFactoryReset = () => {
    localStorage.clear();
    setProfile(null);
    setPinVerified(false);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurringTransactions([]);
    setHasProcessedRecurring(false);
    setActiveTab('dashboard');
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const finalTx: Transaction = {
      ...newTxData,
      id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    };
    const updated = [finalTx, ...transactions];
    updateTransactionsList(updated);
    setShowAddTxModal(false);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    updateTransactionsList(updated);
  };

  const handleAddRecurring = (newRecData: Omit<RecurringTransaction, 'id' | 'isActive'>) => {
    const finalRec: RecurringTransaction = {
      ...newRecData,
      id: 'rec_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      isActive: true
    };
    
    // Add to lists
    const updated = [finalRec, ...recurringTransactions];
    updateRecurringList(updated);
    setShowAddRecurringModal(false);
    
    // Check if the start date is in the past or today, and automatically trigger a run
    const now = new Date();
    const { newTransactions, updatedRecurringList } = processRecurringTransactions([finalRec], now);
    if (newTransactions.length > 0) {
      const updatedTxs = [...newTransactions, ...transactions];
      updateTransactionsList(updatedTxs);
      
      // Merge updated recurring config
      const mergedRecurring = updated.map(r => {
        const matching = updatedRecurringList.find(u => u.id === r.id);
        return matching || r;
      });
      updateRecurringList(mergedRecurring);
      alert(`Flowse Automated Engine: Template saved! ${newTransactions.length} transaction(s) have been successfully logged!`);
    } else {
      alert(`Flowse Automated Engine: Template saved successfully!`);
    }
  };

  const handleToggleRecurringActive = (id: string) => {
    const updated = recurringTransactions.map(rec => {
      if (rec.id === id) {
        return { ...rec, isActive: !rec.isActive };
      }
      return rec;
    });
    updateRecurringList(updated);
  };

  const handleDeleteRecurring = (id: string) => {
    const updated = recurringTransactions.filter(rec => rec.id !== id);
    updateRecurringList(updated);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(budgetLimit);
    if (!budgetCategory || isNaN(limitNum) || limitNum <= 0) return;

    if (budgets.find(b => b.category === budgetCategory)) {
      alert(`A monthly limit has already been formulated for this category. Delete the existing limit to set a new one.`);
      return;
    }

    const newBudget: Budget = {
      id: 'bgt_' + Date.now().toString(),
      category: budgetCategory,
      limit: limitNum
    };
    updateBudgetsList([...budgets, newBudget]);
    setBudgetLimit('');
    setShowAddBudgetModal(false);
  };

  const handleDeleteBudget = (id: string) => {
    updateBudgetsList(budgets.filter(b => b.id !== id));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(goalTarget);
    const initialSaved = parseFloat(goalSaved) || 0;
    if (!goalName.trim() || isNaN(targetNum) || targetNum <= 0) return;

    const newGoal: Goal = {
      id: 'go_' + Date.now().toString(),
      name: goalName.trim(),
      target: targetNum,
      saved: Math.min(initialSaved, targetNum),
      date: goalDate || undefined
    };

    updateGoalsList([...goals, newGoal]);
    setGoalName('');
    setGoalTarget('');
    setGoalSaved('0');
    setGoalDate('');
    setShowAddGoalModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    updateGoalsList(goals.filter(g => g.id !== id));
  };

  const handleGoalDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContributionModal) return;
    const depositAmount = parseFloat(contributionAmount);
    if (isNaN(depositAmount) || depositAmount <= 0) return;

    // Update goal progress
    const updatedGoals = goals.map(g => {
      if (g.id === showContributionModal.id) {
        return {
          ...g,
          saved: Math.min(g.saved + depositAmount, g.target)
        };
      }
      return g;
    });

    updateGoalsList(updatedGoals);

    // Create an automatic transaction tracking this savings layout!
    const savedTx: Transaction = {
      id: 'tx_s_' + Date.now().toString(36),
      amount: depositAmount,
      description: `Target Deposit: ${showContributionModal.name}`,
      category: 'other_expense',
      type: 'expense',
      date: new Date().toISOString(),
      notes: `Dedicated savings locked toward targeting goal target: ${showContributionModal.target}`
    };

    updateTransactionsList([savedTx, ...transactions]);
    setContributionAmount('');
    setShowContributionModal(null);
  };

  // Backups
  const exportBackupJSON = () => {
    const bundle = {
      profile,
      transactions,
      budgets,
      goals,
      recurringTransactions,
      schema: "flowse_v1_backup"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `flowse_${profile?.name.replace(/\s+/g, '_')}_ledger_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.schema !== "flowse_v1_backup") {
          alert("Invalid backup schema format.");
          return;
        }
        if (data.profile) {
          setProfile(data.profile);
          localStorage.setItem('flowse_profile_react', JSON.stringify(data.profile));
        }
        if (data.transactions) {
          setTransactions(data.transactions);
          localStorage.setItem('flowse_transactions_react', JSON.stringify(data.transactions));
        }
        if (data.budgets) {
          setBudgets(data.budgets);
          localStorage.setItem('flowse_budgets_react', JSON.stringify(data.budgets));
        }
        if (data.goals) {
          setGoals(data.goals);
          localStorage.setItem('flowse_goals_react', JSON.stringify(data.goals));
        }
        if (data.recurringTransactions) {
          setRecurringTransactions(data.recurringTransactions);
          localStorage.setItem('flowse_recurring_react', JSON.stringify(data.recurringTransactions));
        }
        alert("Metadata and transaction ledger restored successfully!");
        setPinVerified(true);
      } catch (err) {
        alert("Errors encountered during JSON syntax parsing.");
      }
    };
    reader.readAsText(file);
  };

  const handleProfileSave = (nameInput: string, emailInput: string, currencyInput: string, notifyInput: boolean) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      name: nameInput,
      email: emailInput,
      currency: currencyInput,
      phonePref: notifyInput
    };
    setProfile(updated);
    localStorage.setItem('flowse_profile_react', JSON.stringify(updated));
    alert('Configuration saved successfully!');
  };

  // Formatter functions
  const currSym = profile?.currency || '₦';
  const formatVal = (num: number) => {
    if (peekBalance) return '••••••';
    return currSym + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
  const formatValDecimal = (num: number) => {
    if (peekBalance) return '••••••';
    return currSym + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Date Formatter
  const formatRecordDate = (dString: string) => {
    const dateObj = new Date(dString);
    return dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // State Calculations
  const calculatedBalance = transactions
    .filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) -
    transactions
    .filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const calculatedMonthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, t) => acc + t.amount, 0);

  const calculatedMonthlyExpense = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavingsRate = calculatedMonthlyIncome > 0 
    ? Math.round(((calculatedMonthlyIncome - calculatedMonthlyExpense) / calculatedMonthlyIncome) * 100)
    : 0;

  // Active Category Options lookup
  const getCatMeta = (val: string) => {
    const expenseMeta = EXPENSE_CATEGORIES.find(c => c.value === val);
    const incomeMeta = INCOME_CATEGORIES.find(c => c.value === val);
    return expenseMeta || incomeMeta || { label: val, color: 'from-slate-400 to-slate-500', icon: 'HelpCircle' };
  };

  if (appBooting) {
    return (
      <div className="fixed inset-0 bg-natural z-[9999] flex flex-col items-center justify-center select-none font-sans transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,189,125,0.06),transparent_60%)] pointer-events-none" />
        
        {/* Premium emblem logo */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-[#1ebd7d] to-[#109D64] rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-[#1ebd7d]/20 mb-6 overflow-hidden animate-pulse-soft">
          <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/10 blur-[0.5px]" />
          <div className="absolute w-12 h-12 border-[4px] border-white/85 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '2.5s' }} />
          <div className="absolute w-2 h-2 bg-white rounded-full" />
        </div>
        <h2 className="text-2xl font-black tracking-[0.3em] text-white uppercase font-sans mb-1">Flowse</h2>
        <p className="text-[8px] text-[#1ebd7d] tracking-[0.25em] uppercase font-mono font-bold animate-pulse">Money in Motion</p>
      </div>
    );
  }

  // Onboarding Screen Branch
  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={handleOnboardComplete} />;
  }

  // Security Screen PIN check Branch
  if (!pinVerified) {
    return (
      <LockScreen 
        userName={profile.name} 
        savedPin={profile.pin} 
        onVerify={() => setPinVerified(true)} 
        onFactoryReset={handleFactoryReset} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-natural font-sans text-natural flex flex-col lg:flex-row antialiased relative selection:bg-[#1ebd7d]/35 selection:text-white transition-colors duration-300">
      
      {/* Dynamic desktop navigation sidebar matching Natural Tones code */}
      <aside className="hidden lg:flex w-64 bg-cream border-r border-soft flex-col p-8 pt-[calc(env(safe-area-inset-top)+32px)] shrink-0 relative z-10 select-none transition-colors duration-300">
        
        {/* Brand Header block */}
        <div className="flex items-center justify-between mb-10 group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-[#1ebd7d] rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
              <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white/20 blur-[0.2px]" />
              {/* Geometric static flow element with hover rotation */}
              <div className="absolute w-5 h-5 border-[3px] border-white border-t-white border-r-white border-b-transparent border-l-transparent rounded-full transition-transform duration-700 group-hover:rotate-180" />
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-[0.25em] text-white uppercase bg-gradient-to-r from-white to-[#1ebd7d] bg-clip-text text-transparent">Flowse</h1>
              <p className="text-[8px] font-mono tracking-widest text-[#1ebd7d] uppercase font-bold -mt-0.5">Premium Vault</p>
            </div>
          </div>

          {/* Interactive luxury Theme Switcher button */}
          <button
            id="theme-switch-btn"
            onClick={() => {
              const cycle: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const nextIdx = (cycle.indexOf(themePref) + 1) % cycle.length;
              setThemePref(cycle[nextIdx]);
            }}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1 text-[9px] font-bold uppercase ${
              themeMode === 'dark' 
                ? 'bg-[#12332A]/80 border-[#1ebd7d]/20 text-[#1ebd7d] hover:bg-[#1ebd7d]/10' 
                : 'bg-[#DFEDE8] border-[#109D64]/30 text-[#109D64] hover:bg-[#10a36b]/10'
            }`}
            title={`Active theme: ${themePref}. Click to toggle cycle.`}
          >
            {themePref === 'light' && <Sun size={11} />}
            {themePref === 'dark' && <Moon size={11} />}
            {themePref === 'system' && <Laptop size={11} />}
            <span>{themePref}</span>
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="flex-1 space-y-1.5 font-sans">
          {[
            { id: 'dashboard', label: 'Wallet Deck', icon: Home },
            { id: 'transactions', label: 'Transactions', icon: Coins },
            { id: 'recurring', label: 'Recurring Outlays', icon: Repeat },
            { id: 'budgets', label: 'Budget Caps', icon: TrendingDown },
            { id: 'goals', label: 'Savings Goals', icon: PiggyBank },
            { id: 'reports', label: 'Analytics', icon: Percent },
            { id: 'playground', label: 'Sandbox Playground', icon: Laptop },
          ].map((navObj) => {
            const isActive = activeTab === navObj.id;
            const IconComp = navObj.icon;
            
            let btnClass = 'text-[#8c9e99] hover:bg-[#12332A]/30 hover:text-white';
            if (themeMode === 'light') {
              btnClass = 'text-[#58736B] hover:bg-[#DFEDE8]/40 hover:text-[#0B1915]';
            }
            const activeClass = themeMode === 'light'
              ? 'bg-[#DFEDE8] text-[#109D64] border border-[#109D64]/20 shadow-sm'
              : 'bg-[#12332A] text-[#1ebd7d] border border-[#1ebd7d]/20 shadow-md shadow-[#1ebd7d]/5';

            return (
              <button
                key={navObj.id}
                onClick={() => setActiveTab(navObj.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-xs font-bold tracking-wide cursor-pointer ${
                  isActive ? activeClass : btnClass
                }`}
              >
                <IconComp size={16} className={isActive ? (themeMode === 'light' ? 'text-[#109D64]' : 'text-[#1ebd7d]') : 'text-current'} />
                <span>{navObj.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sync backup panel deck inside Sidebar */}
        <div className={`mt-auto p-4 border rounded-2xl space-y-3 shadow-md ${themeMode === 'light' ? 'bg-[#F0FAF7] border-[#DFEDE8]' : 'bg-[#040D0A] border-[#12332A]'}`}>
          <div>
            <p className="text-[9px] font-bold text-[#1ebd7d] uppercase tracking-widest mb-1 font-mono">Cold Vault Storage</p>
            <p className="text-[10px] text-[#8c9e99] font-semibold leading-relaxed">No logs. Backup or factory reset parameters offline.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              id="export-backup-btn"
              onClick={exportBackupJSON}
              className={`py-2.5 px-3 hover:scale-[1.02] active:scale-[0.98] font-bold rounded-xl text-[10px] tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${themeMode === 'light' ? 'bg-[#FFFFFF] text-[#0B1915] border-[#DFEDE8] hover:bg-[#F6FBF9]' : 'bg-[#12332A] text-white border-[#1ebd7d]/10 hover:bg-[#1ebd7d]/20'}`}
              title="Download local JSON Database"
            >
              <Download size={11} className="text-[#1ebd7d]" />
              <span>Backup</span>
            </button>
            
            <label className={`py-2.5 px-3 hover:scale-[1.02] active:scale-[0.98] font-bold rounded-xl text-[10px] tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center border ${themeMode === 'light' ? 'bg-[#FFFFFF] text-[#0B1915] border-[#DFEDE8] hover:bg-[#F6FBF9]' : 'bg-[#12332A] text-white border-[#1ebd7d]/10 hover:bg-[#1ebd7d]/20'}`}>
              <Upload size={11} className="text-[#1ebd7d]" />
              <span>Restore</span>
              <input 
                id="import-backup-file"
                type="file" 
                accept=".json" 
                onChange={handleImportBackupJSON} 
                className="hidden" 
              />
            </label>
          </div>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full py-2 border text-[10px] font-bold tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${themeMode === 'light' ? 'bg-white hover:bg-neutral-50 border-[#DFEDE8] text-[#58736B] hover:text-[#109D64]' : 'bg-[#12332A]/50 hover:bg-[#12332A] border-[#12332A]/50 text-[#8c9e99] hover:text-[#1ebd7d]'}`}
          >
            <Settings size={11} className="text-[#8c9e99]" />
            <span>Settings Deck</span>
          </button>
        </div>
      </aside>

      {/* Main viewport Container */}
      <main className="flex-1 p-5 md:p-8 lg:p-10 flex flex-col gap-6 overflow-hidden min-h-screen relative pb-24 lg:pb-10 bg-natural pt-[calc(env(safe-area-inset-top)+20px)]">
        
        {/* Universal Desk Header */}
        <header className="flex flex-row justify-between items-center gap-4 border-b border-border-soft pb-4 select-none">
          <div className="flex items-center gap-3">
            {/* Elegant Static Brand Logo */}
            <div className="relative w-9 h-9 bg-gradient-to-br from-[#1ebd7d] to-[#109D64] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
              <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-white/20 blur-[0.2px]" />
              <div className="absolute w-4 h-4 border-2 border-white/95 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full font-bold" />
              <div className="absolute w-1 h-1 bg-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Welcome back, <span className="text-sage">{profile.name.split(' ')[0]}</span>
                </h2>
                <button 
                  id="peek-toggle-btn"
                  onClick={() => setPeekBalance(!peekBalance)}
                  className="p-1 rounded-lg hover:bg-border-soft/30 text-[#8c9e99] hover:text-[#1ebd7d] transition-colors cursor-pointer"
                  title={peekBalance ? "Reveal account balances" : "Hide sensitive ledger statistics"}
                >
                  {peekBalance ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
              <p className="text-[10px] text-[#8c9e99] font-medium hidden sm:block mt-0.5">
                Your localized offline ledger is completely private and secure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 select-none">
            {/* Segmentation Pills Theme Switcher supporting light / dark / system */}
            <div className="hidden sm:flex bg-cream border border-border-soft p-0.5 rounded-xl items-center gap-0.5 shadow-sm">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setThemePref(mode)}
                  className={`px-2 py-1 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    themePref === mode
                      ? 'bg-sage text-white shadow-sm'
                      : 'text-[#8c9e99] hover:text-sage'
                  }`}
                  title={`Sync theme style: ${mode}`}
                >
                  {mode === 'light' && <Sun size={10} />}
                  {mode === 'dark' && <Moon size={10} />}
                  {mode === 'system' && <Laptop size={10} />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>

            {/* Simple Mobile Theme Cycle Toggle */}
            <button
              id="header-mobile-theme-cycle"
              onClick={() => {
                const cycle: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
                const nextIdx = (cycle.indexOf(themePref) + 1) % cycle.length;
                setThemePref(cycle[nextIdx]);
              }}
              className="sm:hidden p-1.5 rounded-lg border border-border-soft text-sage bg-cream hover:bg-natural flex items-center justify-center cursor-pointer"
              title="Toggle system theme cycle"
            >
              {themePref === 'light' && <Sun size={13} />}
              {themePref === 'dark' && <Moon size={13} />}
              {themePref === 'system' && <Laptop size={13} />}
            </button>

            {/* Help / Guide Trigger icon to re-watch the training animation */}
            <button
              onClick={() => setShowTour(true)}
              className="p-1.5 rounded-lg border border-border-soft text-sage bg-cream hover:bg-natural flex items-center justify-center cursor-pointer transition-colors hover:text-white"
              title="Launch training guide walkthrough"
            >
              <HelpCircle size={13} />
            </button>

            {/* Clickable Profile Avatar badge taking user directly to settings deck */}
            <button
              id="header-profile-avatar-clickable"
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs uppercase cursor-pointer select-none transition-all border border-border-soft hover:scale-105"
              title="Open profile & settings deck"
            >
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt={profile.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${
                  isLight
                    ? 'bg-[#109D64] text-white'
                    : 'bg-gradient-to-br from-[#1ebd7d] to-[#109D64] text-[#030C0A]'
                }`}>
                  {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Interactive View Content Router based on ActiveTab */}
        <div className="flex-1 w-full max-w-7xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Welcoming guidelines & feature toggle deck */}
                <AnimatePresence>
                  {showWelcomingPromo && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="card-natural p-6 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden"
                    >
                      {/* Brand dynamic background ambient element */}
                      <div className="absolute -left-12 -top-12 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(30,189,125,0.06),transparent_60%)] pointer-events-none rounded-full" />
                      
                      <div className="space-y-2 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-2">
                          <span className="p-1 px-2.5 rounded-lg bg-[#1ebd7d]/10 text-[#1ebd7d] text-[10px] uppercase tracking-widest font-mono font-bold">
                            FLOWSE COMMAND CENTER
                          </span>
                          <span className="hidden md:inline text-neutral-400">·</span>
                          <span className="text-[10px] font-semibold text-neutral-400">Secure Offline System v2.4</span>
                        </div>
                        <h3 className={`text-lg font-extrabold tracking-tight ${themeMode === 'light' ? 'text-neutral-900 font-sans' : 'text-white'}`}>
                          Welcome back to your localized treasury system, {profile.name}!
                        </h3>
                        <p className="text-xs text-[#8c9e99] max-w-2xl leading-relaxed">
                          Your records and PIN verification are stored safely inside keychains on your hardware. Customize your funds privacy on-the-fly.
                        </p>
                        
                        {/* Inline security configuration switches */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1.5">
                          <button
                            onClick={() => setPeekBalance(!peekBalance)}
                            className={`flex items-center gap-2 p-2 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              peekBalance 
                                ? 'bg-red-950/20 border-red-500/25 text-red-400 hover:bg-red-950/30' 
                                : 'bg-[#1ebd7d]/10 border-[#1ebd7d]/10 text-[#1ebd7d] hover:bg-[#1ebd7d]/20'
                            }`}
                          >
                            {peekBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>Funds Visual Privacy: {peekBalance ? "Muffled (Hidden)" : "Raw (Visible)"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive toggle dismissal button */}
                      <button 
                        onClick={toggleWelcomingPromo}
                        className={`p-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer self-stretch md:self-auto text-center ${
                          themeMode === 'light'
                            ? 'bg-white hover:bg-neutral-50 text-[#58736B] border-[#DFEDE8]'
                            : 'bg-natural hover:bg-soft text-[#8c9e99] hover:text-[#1ebd7d] border-soft'
                        }`}
                        title="Dismiss Welcoming hub"
                      >
                        Dismiss Dashboard Guide
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Toggle to Recheck or Force Reveal Welcoming section if dismissed */}
                {!showWelcomingPromo && (
                  <div className="flex justify-end pr-1">
                    <button 
                      onClick={toggleWelcomingPromo}
                      className="text-[10px] font-bold text-[#8c9e99] hover:text-[#1ebd7d] flex items-center gap-1 cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                      <span>💡 Reveal Workspace Welcoming Center</span>
                    </button>
                  </div>
                )}

                {/* Visual Premium Card Deck: Ledger Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  
                  {/* Total available net funds */}
                  <div className="card-natural p-6 flex flex-col justify-between min-h-[145px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.08),transparent_70%)] pointer-events-none rounded-bl-full group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-[#1ebd7d] tracking-widest uppercase font-bold font-mono">Total Available Treasury</span>
                      <button 
                        onClick={() => setPeekBalance(!peekBalance)} 
                        className="p-1 px-1.5 rounded-lg bg-natural text-[#8c9e99] hover:text-[#1ebd7d]"
                        title={peekBalance ? "Reveal account balances" : "Hide sensitive ledger statistics"}
                      >
                        {peekBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>
                    <p className={`text-3xl font-bold tracking-tight text-white font-serif-display ${peekBalance ? 'tracking-wider font-sans text-xl opacity-60' : ''}`}>
                      {formatValDecimal(calculatedBalance)}
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-1 relative z-10 border-t border-[#12332A]/20">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          syncStatus === 'synced' ? 'bg-[#1ebd7d]' :
                          syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' :
                          syncStatus === 'error' ? 'bg-red-400' : 'bg-neutral-500'
                        }`} />
                        <span className="text-[10px] text-[#8c9e99] font-medium">
                          {syncStatus === 'synced' && 'Cloud Sync: Active'}
                          {syncStatus === 'syncing' && 'Backing up...'}
                          {syncStatus === 'error' && 'Cloud Sync: Offline'}
                          {syncStatus === 'offline' && 'Offline-only Mode'}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowAddTxModal(true)}
                        className="py-1.5 px-3.5 bg-[#1ebd7d] hover:bg-[#1ab073] active:bg-[#158f5c] text-neutral-900 font-bold rounded-xl text-[9.5px] uppercase tracking-wider cursor-pointer shadow-md shadow-[#1ebd7d]/10 hover:scale-[1.03] transition-all flex items-center gap-1"
                      >
                        <Plus size={10} strokeWidth={3} />
                        <span>Record outlay</span>
                      </button>
                    </div>
                  </div>

                  {/* Monthly positive inflow */}
                  <div className="card-natural p-6 flex flex-col justify-between min-h-[145px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_top_right,rgba(30,189,125,0.08),transparent_70%)] pointer-events-none rounded-bl-full" />
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#1ebd7d] tracking-widest uppercase font-bold font-mono">Inflow This Month</span>
                      <div className="flex items-center gap-1 p-1 px-2 bg-natural text-[#1ebd7d] text-[9px] font-bold rounded-lg border border-emerald-500/25 tracking-wide uppercase">
                        <TrendingUp size={10} />
                        <span>INWARD</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight text-[#1ebd7d] font-serif-display">
                      {formatValDecimal(calculatedMonthlyIncome)}
                    </p>
                    <span className="text-[10px] text-[#8c9e99] mt-1 block font-medium">Summed deposits for the current month cycle</span>
                  </div>

                  {/* Monthly outflow */}
                  <div className="card-natural p-6 flex flex-col justify-between min-h-[145px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(circle_at_top_right,rgba(238,118,93,0.08),transparent_70%)] pointer-events-none rounded-bl-full" />
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#1ebd7d] tracking-widest uppercase font-bold font-mono">Outflow This Month</span>
                      <div className="flex items-center gap-1 p-1 px-2 bg-natural text-[#EE765D] text-[9px] font-bold rounded-lg border border-red-500/15 tracking-wide uppercase">
                        <TrendingDown size={10} />
                        <span>OUTWARD</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight text-[#EE765D] font-serif-display">
                      {formatValDecimal(calculatedMonthlyExpense)}
                    </p>
                    <span className="text-[10px] text-[#8c9e99] mt-1 block font-medium">
                      {calculatedMonthlyIncome > 0 ? `${netSavingsRate}% savings retention rate` : 'No cash injection this month cycle'}
                    </span>
                  </div>

                </div>

                {/* Sub layout columns: Recent transactions and active budgets progress */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
                  
                  {/* Left segment - Recent payments table */}
                  <div className="lg:col-span-7 card-natural flex flex-col overflow-hidden min-h-[350px]">
                    <div className="p-5 border-b border-soft flex justify-between items-center bg-[#1ebd7d]/5">
                      <h3 className="font-bold text-base font-serif-display text-white tracking-wide">
                        Recent Outlays & Inflows
                      </h3>
                      <button 
                        onClick={() => setActiveTab('transactions')}
                        className="text-xs font-bold text-[#1ebd7d] hover:underline cursor-pointer tracking-wider"
                      >
                        Ledger Table
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                      {transactions.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-[9px] uppercase tracking-widest text-[#8c9e99] border-b border-soft bg-natural">
                              <th className="px-5 py-3 font-bold">Identifier / Tag</th>
                              <th className="px-5 py-3 font-bold">Category</th>
                              <th className="px-5 py-3 font-bold text-right">Magnitude</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-soft/40">
                            {transactions.slice(0, 5).map((t) => {
                              const meta = getCatMeta(t.category);
                              const isExpense = t.type === 'expense';
                              return (
                                <tr key={t.id} className="hover:bg-soft/20 transition-colors text-xs">
                                  <td className="px-5 py-3.5 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                                      <CategoryIcon name={meta.icon} size={13} />
                                    </div>
                                    <div className="truncate max-w-[150px] sm:max-w-[200px]">
                                      <p className="font-bold text-white truncate text-xs">{t.description}</p>
                                      <p className="text-[9px] text-[#8c9e99] font-semibold block truncate mt-0.5">
                                        {formatRecordDate(t.date)}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className="p-1 px-1.5 rounded-lg bg-soft/60 text-[#8c9e99] text-[9px] font-bold border border-[#1ebd7d]/10 truncate block w-fit">
                                      {meta.label}
                                    </span>
                                  </td>
                                  <td className={`px-5 py-3.5 text-right font-bold whitespace-nowrap text-xs ${isExpense ? 'text-[#EE765D]' : 'text-[#1ebd7d]'}`}>
                                    {isExpense ? '-' : '+'}{formatRecordDate ? formatVal(t.amount) : t.amount}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 py-16 text-[#8c9e99]">
                          <p className="text-xs mb-1 font-bold">Empty Ledger Records</p>
                          <p className="text-[10px] text-[#8c9e99]/80 max-w-xs leading-normal">Construct your financial metadata by clicking the Record option at the top.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right segment - Budget and progress widgets */}
                  <div className="lg:col-span-5 card-natural p-6 space-y-5 min-h-[350px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-base font-serif-display text-white tracking-wide">
                          Limits Allocation
                        </h3>
                        <button 
                          onClick={() => setActiveTab('budgets')}
                          className="text-xs font-bold text-[#1ebd7d] hover:underline cursor-pointer tracking-wider"
                        >
                          Manage Caps
                        </button>
                      </div>

                      <div className="space-y-4">
                        {budgets.length > 0 ? (
                          budgets.slice(0, 3).map((b) => {
                            const meta = getCatMeta(b.category);
                            // Spent in current month cycle
                            const spent = transactions
                              .filter(t => t.type === 'expense' && t.category === b.category && new Date(t.date).getMonth() === new Date().getMonth())
                              .reduce((acc, t) => acc + t.amount, 0);
                            
                            const percent = Math.min(100, Math.round((spent / b.limit) * 100));
                            
                            // Visual color indicators based on threshold limits
                            let trackColor = 'bg-[#1ebd7d]';
                            if (percent >= 100) trackColor = 'bg-[#EE765D]';
                            else if (percent >= 75) trackColor = 'bg-amber-400';

                            return (
                              <div key={b.id} className="space-y-1.5 group">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2 text-[#8c9e99]">
                                    <span className={`p-1 rounded-md bg-gradient-to-br ${meta.color} text-white shrink-0 shadow-sm`}>
                                      <CategoryIcon name={meta.icon} size={11} />
                                    </span>
                                    <span className="font-bold group-hover:text-white transition-colors">{meta.label}</span>
                                  </div>
                                  <div className="text-right font-mono text-[10px] text-[#8c9e99]">
                                    <span className="font-bold text-white">{formatVal(spent)}</span>
                                    <span className="text-[#8c9e99]/60"> / {formatVal(b.limit)}</span>
                                  </div>
                                </div>
                                <div className="w-full h-2 bg-[#040D0A] rounded-full overflow-hidden border border-[#12332A]/30">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${trackColor}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[9px] text-[#8c9e99] font-bold">
                                  <span>{percent}% allocated</span>
                                  {spent > b.limit && <span className="text-[#EE765D] font-bold">Limit Exceeded</span>}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 text-[#8c9e99]">
                            <p className="text-xs font-bold mb-1">Unallocated Budget</p>
                            <p className="text-[10px]">Enforce dynamic alert triggers against categorical outflows.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#12332A]/40 rounded-2xl p-3 border border-[#1ebd7d]/10 flex items-center gap-2.5 text-[10px] text-[#8c9e99] font-semibold leading-relaxed">
                      <Bell size={13} className="text-[#1ebd7d] shrink-0 animate-pulse" />
                      <span>Warning alerts trigger automatically on budgets hitting 75% caps.</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TRANSACTIONS TABLE VIEW */}
            {activeTab === 'transactions' && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white font-serif-display">Ledger Audit Logs</h1>
                    <p className="text-xs text-[#8c9e99]">Audit and query transaction records completely offline</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!profile) return;
                      generateStatementPDF(profile, transactions, currSym);
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-sage text-white hover:bg-sage/90 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider self-start sm:self-auto shadow-md shadow-sage/15"
                    title="Export secure offline PDF statement branded to Flowse guidelines"
                  >
                    <Download size={13} />
                    <span>Export Statement (PDF)</span>
                  </button>
                </div>

                {/* Filter and query controller panel */}
                <div className="bg-[#081A15] border border-[#12332A] rounded-3xl p-5 shadow-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Filter Type Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#1ebd7d] uppercase tracking-widest block font-mono">Statement Flow</label>
                      <select
                        id="filter-flow-type"
                        className="w-full bg-[#040D0A] border border-[#12332A] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1ebd7d] font-bold cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                      >
                        <option value="all" className="bg-[#081A15]">Comprehensive Logs</option>
                        <option value="income" className="bg-[#081A15]">Inflow Deposits</option>
                        <option value="expense" className="bg-[#081A15]">Outflow Expenditures</option>
                      </select>
                    </div>

                    {/* Filter Category Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#1ebd7d] uppercase tracking-widest block font-mono">Category Tag</label>
                      <select
                        id="filter-category"
                        className="w-full bg-[#040D0A] border border-[#12332A] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1ebd7d] font-bold cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="all" className="bg-[#081A15]">All Category Tags</option>
                        <optgroup label="Outflow Category Groups" className="bg-[#081A15]">
                          {EXPENSE_CATEGORIES.map(c => (
                            <option key={c.value} value={c.value} className="bg-[#081A15]">{c.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Inflow Category Groups" className="bg-[#081A15]">
                          {INCOME_CATEGORIES.map(c => (
                            <option key={c.value} value={c.value} className="bg-[#081A15]">{c.label}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Query Search */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#1ebd7d] uppercase tracking-widest block font-mono">Search identifier</label>
                      <input
                        id="search-query-input"
                        type="text"
                        placeholder="e.g. rent, Salary..."
                        className="w-full bg-[#040D0A] border border-[#12332A] rounded-xl p-2.5 text-xs text-white placeholder-[#4d6d63] focus:outline-none focus:border-[#1ebd7d] font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                  </div>
                </div>

                {/* Listing Audit Table container */}
                <div className="bg-[#081A15] border border-[#12332A] rounded-3xl flex flex-col overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    {(() => {
                      const filtered = transactions.filter(t => {
                        const matchType = filterType === 'all' || t.type === filterType;
                        const matchCategory = filterCategory === 'all' || t.category === filterCategory;
                        const matchQuery = !searchQuery.trim() || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          getCatMeta(t.category).label.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchType && matchCategory && matchQuery;
                      }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      if (filtered.length > 0) {
                        return (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[9px] uppercase tracking-widest text-[#8c9e99] border-b border-[#12332A] bg-[#040D0A] select-none">
                                <th className="px-5 py-3 font-bold">Payee / Identifier</th>
                                <th className="px-5 py-3 font-bold">Category</th>
                                <th className="px-5 py-3 font-bold">Memo details</th>
                                <th className="px-5 py-3 font-bold text-right">Sum magnitude</th>
                                <th className="px-5 py-3 font-bold text-center">Option</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#12332A]/30">
                              {filtered.map((t) => {
                                const meta = getCatMeta(t.category);
                                const isExpense = t.type === 'expense';
                                return (
                                  <tr key={t.id} className="hover:bg-[#12332A]/20 transition-colors text-xs text-[#8c9e99]">
                                    <td className="px-5 py-4 flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                                        <CategoryIcon name={meta.icon} size={13} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-white text-xs">{t.description}</p>
                                        <p className="text-[9px] text-[#8c9e99] font-semibold mt-0.5">
                                          {formatRecordDate(t.date)}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="p-1 px-1.5 rounded-lg bg-[#12332A]/60 text-[#8c9e99] text-[9px] font-bold border border-[#1ebd7d]/10 whitespace-nowrap block w-fit">
                                        {meta.label}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-[#8c9e99]/80 italic max-w-xs truncate text-[11px]">
                                      {t.notes || "—"}
                                    </td>
                                    <td className={`px-5 py-4 text-right font-bold whitespace-nowrap text-xs ${isExpense ? 'text-[#EE765D]' : 'text-[#1ebd7d]'}`}>
                                      {isExpense ? '−' : '+'}{formatValDecimal(t.amount)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                      <button
                                        onClick={() => handleDeleteTransaction(t.id)}
                                        className="p-1.5 px-3 text-xs text-[#EE765D] hover:bg-[#EE765D]/10 rounded-lg transition-colors cursor-pointer block mx-auto font-bold tracking-wide"
                                        title="Delete Log"
                                      >
                                        Delete

                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      }

                      return (
                        <div className="p-16 text-center text-[#8c8a82]">
                          <p className="text-xs font-semibold mb-1">Query Returned Empty Logs</p>
                          <p className="text-[11px]">Perform different parameters settings filter search log</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {/* BUDGET CAPS PAGE */}
            {activeTab === 'budgets' && (
              <motion.div
                key="budgets"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white font-serif-display">Formulate Budget Caps</h1>
                    <p className="text-xs text-[#8c9e99]">Restrict outflows and allocations under strict device parameters alert warning threshold</p>
                  </div>
                  <button
                    onClick={() => setShowAddBudgetModal(true)}
                    className="py-2.5 px-4 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-bold text-xs tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer select-none"
                  >
                    <Plus size={14} className="stroke-[3px]" />
                    <span>Create Cap</span>
                  </button>
                </div>

                {/* Budgets layout deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {budgets.length > 0 ? (
                    budgets.map((b) => {
                      const meta = getCatMeta(b.category);
                      const spent = transactions
                        .filter(t => t.type === 'expense' && t.category === b.category && new Date(t.date).getMonth() === new Date().getMonth())
                        .reduce((acc, t) => acc + t.amount, 0);

                      const percent = Math.min(100, Math.round((spent / b.limit) * 100));
                      const remaining = Math.max(0, b.limit - spent);

                      let trackingBadge = 'bg-emerald-950/40 text-[#1ebd7d] border-emerald-500/20';
                      let barColor = 'bg-[#1ebd7d]';
                      if (percent >= 100) {
                        trackingBadge = 'bg-red-950/40 text-[#EE765D] border-red-500/20';
                        barColor = 'bg-[#EE765D]';
                      } else if (percent >= 75) {
                        trackingBadge = 'bg-amber-950/40 text-amber-400 border-amber-500/20';
                        barColor = 'bg-amber-400';
                      }

                      return (
                        <div key={b.id} className="bg-[#081A15] border border-[#12332A] rounded-3xl p-5 flex flex-col justify-between min-h-[160px] relative overflow-hidden group shadow-lg">
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                                <CategoryIcon name={meta.icon} size={15} />
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-white">{meta.label}</h3>
                                <p className="text-[10px] text-[#8c9e99] font-semibold">Monthly Spending Allowance</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 select-none">
                              <span className={`p-1 px-1.5 text-[9px] font-bold tracking-wide rounded-lg border ${trackingBadge}`}>
                                {percent >= 100 ? 'Exceeded' : percent >= 75 ? 'Warning Cap' : 'Optimal'}
                              </span>
                              <button
                                onClick={() => handleDeleteBudget(b.id)}
                                className="p-1 px-2.5 text-xs text-[#EE765D] hover:bg-[#EE765D]/20 font-bold rounded-lg cursor-pointer"
                                title="Delete Limit Cap"
                              >
                                &times;
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-[#8c9e99] font-bold">
                              <span>Outflow: <strong className="text-white font-mono">{formatValDecimal(spent)}</strong></span>
                              <span>Buffer: <strong className="text-white font-mono">{formatValDecimal(remaining)}</strong></span>
                            </div>
                            
                            <div className="w-full h-2.5 bg-[#040D0A] rounded-full overflow-hidden border border-[#12332A]/30">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[10px] text-[#8c9e99] font-medium">
                              <span>Limit limit Formulation: {formatVal(b.limit)}</span>
                              <span className="font-bold text-white">{percent}% spent</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 bg-[#081A15] border border-[#12332A] rounded-3xl py-16 text-center text-[#8c9e99] flex flex-col items-center justify-center shadow-lg">
                      <p className="text-xs font-bold mb-1">Unassigned Capital Limits</p>
                      <p className="text-[10px] text-[#8c9e99]/80 mb-4 max-w-sm">You have set no categorical spending limits. Formulate your first cap limit now.</p>
                      <button
                        onClick={() => setShowAddBudgetModal(true)}
                        className="py-2.5 px-5 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Enforce Budget Restriction
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SAVINGS GOALS PAGE VIEW */}
            {activeTab === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white font-serif-display">Goal Deck</h1>
                    <p className="text-xs text-[#8c9e99]">Lock funds toward targeting secure savings and hardware ambitions</p>
                  </div>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="py-2.5 px-4 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-bold text-xs tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Plus size={14} className="stroke-[3px]" />
                    <span>Create Target Goal</span>
                  </button>
                </div>

                {/* Savings Goals display board */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {goals.length > 0 ? (
                    goals.map((g) => {
                      const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
                      const remaining = Math.max(0, g.target - g.saved);
                      
                      // Due days remaining representation
                      let daysLeftText = null;
                      if (g.date) {
                        const targetD = new Date(g.date);
                        const today = new Date();
                        const rawDiff = targetD.getTime() - today.getTime();
                        if (rawDiff > 0) {
                          daysLeftText = `${Math.ceil(rawDiff / (1000 * 3600 * 24))} days left`;
                        } else {
                          daysLeftText = "Overdue Target";
                        }
                      }

                      return (
                        <div key={g.id} className="bg-[#081A15] border border-[#12332A] rounded-3xl p-5 flex flex-col justify-between min-h-[170px] relative overflow-hidden group shadow-lg">
                          
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                              <h3 className="font-bold text-sm text-white font-serif-display">🎯 {g.name}</h3>
                              <p className="text-[10px] text-[#8c9e99] font-bold mt-1">
                                Target: {formatVal(g.target)} {g.date ? `· By ${formatRecordDate(g.date)}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 select-none">
                              {daysLeftText && (
                                <span className={`p-1 px-1.5 text-[9px] font-bold rounded-lg border ${
                                  daysLeftText.includes('Overdue') 
                                    ? 'bg-red-950/40 text-[#EE765D] border-red-500/20'
                                    : 'bg-[#12332A] text-[#1ebd7d] border-[#1ebd7d]/20'
                                }`}>
                                  {daysLeftText}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setShowContributionModal(g);
                                  setContributionAmount('');
                                }}
                                className="py-1 px-2.5 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-sm"
                              >
                                + Deposit
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(g.id)}
                                className="p-1 px-2 text-xs text-[#EE765D] hover:bg-[#EE765D]/25 font-bold rounded-lg cursor-pointer"
                                title="Remove Goal"
                              >
                                &times;
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-[#8c9e99] font-bold">
                              <span>Locked Buffer: <strong className="text-[#1ebd7d] font-mono">{formatValDecimal(g.saved)}</strong></span>
                              <span>Target left: <strong className="text-white font-mono">{formatValDecimal(remaining)}</strong></span>
                            </div>
                            
                            <div className="w-full h-2.5 bg-[#040D0A] rounded-full overflow-hidden border border-[#12332A]/30">
                              <div 
                                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#1ebd7d] to-[#1ebd7d]/70"
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[10px] text-[#8c9e99] font-medium">
                              <span>Device cold vault backup tracker index</span>
                              <span className="font-bold text-[#1ebd7d]">{percent}% unlocked</span>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 bg-[#081A15] border border-[#12332A] rounded-3xl py-16 text-center text-[#8c9e99] flex flex-col items-center justify-center shadow-lg">
                      <p className="text-xs font-bold mb-1">Clean Savings Board</p>
                      <p className="text-[10px] text-[#8c9e99]/80 mb-4 max-w-sm">You have set no lock targets or hardware goals. Configure targets now.</p>
                      <button
                        onClick={() => setShowAddGoalModal(true)}
                        className="py-2.5 px-5 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Configure savings lock goal
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* RECURRING FLOWS VIEW */}
            {activeTab === 'recurring' && (
              <motion.div
                key="recurring"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 lg:space-y-8"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white font-serif-display">Recurring Outlays & Inflows</h1>
                    <p className="text-xs text-[#8c9e99]">Structure client-side automatic recurring transactions templates</p>
                  </div>
                  <button
                    id="recurring-desk-create-trigger"
                    onClick={() => setShowAddRecurringModal(true)}
                    className="flex items-center gap-2 px-4.5 py-3 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 text-xs font-bold rounded-2xl tracking-wide uppercase transition-all duration-200 self-start sm:self-auto cursor-pointer shadow-lg"
                  >
                    <Plus size={14} className="stroke-[3px]" />
                    <span>Setup Recurring Schedule</span>
                  </button>
                </div>

                {recurringTransactions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
                    {recurringTransactions.map((rec) => {
                      const meta = getCatMeta(rec.category);
                      const isExpense = rec.type === 'expense';
                      return (
                        <div 
                          key={rec.id} 
                          id={`rec-card-${rec.id}`}
                          className="bg-[#081A15] border border-[#12332A] p-5 flex flex-col justify-between min-h-[220px] relative overflow-hidden group rounded-3xl shadow-lg"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                                  <CategoryIcon name={meta.icon} size={15} />
                                </div>
                                <div className="truncate max-w-[140px]">
                                  <h3 className="font-bold text-sm text-white truncate">{rec.description}</h3>
                                  <p className="text-[10px] text-[#8c9e99] font-bold mt-0.5">{meta.label}</p>
                                </div>
                              </div>
                              
                              <button
                                id={`rec-delete-${rec.id}`}
                                onClick={() => handleDeleteRecurring(rec.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#12332A] text-xs text-[#EE765D] hover:bg-[#EE765D]/10 shadow-sm cursor-pointer text-center font-bold"
                                title="Remove template"
                              >
                                &times;
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-baseline text-xs pb-1.5 border-b border-[#12332A]/40">
                                <span className="text-[11px] text-[#8c9e99] font-bold">Value magnitude:</span>
                                <span className={`text-base font-extrabold ${isExpense ? 'text-[#EE765D]' : 'text-[#1ebd7d]'}`}>
                                  {isExpense ? '−' : '+'}{formatValDecimal(rec.amount)}
                                </span>
                              </div>
                              
                              <div className="bg-[#040D0A] p-3 rounded-xl border border-[#12332A]/60 text-[11px] text-[#8c9e99] space-y-1 font-semibold">
                                <div className="flex justify-between">
                                  <span>Frequency:</span>
                                  <span className="capitalize text-white font-bold">{rec.frequency}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Start Cycle Date:</span>
                                  <span className="text-white font-bold">{formatRecordDate(rec.startDate)}</span>
                                </div>
                                {rec.lastGeneratedDate && (
                                  <div className="flex justify-between text-[10px] text-[#8c9e99]/80 pt-0.5">
                                    <span>Last automatics logged:</span>
                                    <span>{formatRecordDate(rec.lastGeneratedDate)}</span>
                                  </div>
                                )}
                                {rec.notes && (
                                  <div className="text-[10px] text-[#8c9e99]/70 italic border-t border-[#12332A]/30 pt-1 mt-1 truncate" title={rec.notes}>
                                    Memo: {rec.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-4 select-none border-t border-[#12332A]/30 mt-4">
                            <span className="text-[#8c9e99]/60 font-bold text-[9px] tracking-wide uppercase">Autopost Scheduler</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold tracking-wider uppercase ${rec.isActive ? 'text-[#1ebd7d]' : 'text-[#EE765D]'}`}>
                                {rec.isActive ? 'Active' : 'Paused'}
                              </span>
                              <button
                                id={`rec-toggle-${rec.id}`}
                                onClick={() => handleToggleRecurringActive(rec.id)}
                                className={`p-1 px-3 rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors ${
                                  rec.isActive 
                                    ? 'bg-amber-950/45 hover:bg-amber-900 border border-amber-500/20 text-amber-400' 
                                    : 'bg-[#1ebd7d]/10 hover:bg-[#1ebd7d]/20 text-[#1ebd7d]'
                                }`}
                              >
                                {rec.isActive ? 'Pause' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#081A15] border border-[#12332A] py-16 text-center text-[#8c9e99] flex flex-col items-center justify-center max-w-xl mx-auto rounded-3xl shadow-lg">
                    <div className="w-12 h-12 bg-[#1ebd7d]/10 rounded-full flex items-center justify-center text-[#1ebd7d] mb-4">
                      <Repeat size={18} className="animate-spin-slow" />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">No Active Recurring Schedules</p>
                    <p className="text-xs mb-5 max-w-xs leading-normal text-[#8c9e99]/80">
                      You have not formulated any scheduled income deposits or automatic recurring outflows. Get started now to map salaries, wages, or housing rent.
                    </p>
                    <button
                      id="recurring-empty-setup-trigger"
                      onClick={() => setShowAddRecurringModal(true)}
                      className="py-2.5 px-5 bg-[#1ebd7d] hover:bg-[#1ebd7d]/90 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg"
                    >
                      Setup first recurring schedule
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ANALYTICS / REPORTS VIEW */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <StatsPage transactions={transactions} currencySymbol={currSym} />
              </motion.div>
            )}

            {/* PLAYGROUND / SIMULATOR VIEW */}
            {activeTab === 'playground' && (
              <motion.div
                key="playground"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <PlaygroundPage realBalance={calculatedBalance} currencySymbol={currSym} />
              </motion.div>
            )}

            {/* PROFILE & SETTINGS VIEW */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white font-serif-display">Treasury Profiles</h1>
                  <p className="text-xs text-[#8c9e99]">Configure client variables and backup ledger metadata details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left segment - Preferences Panel Form */}
                  <div className="md:col-span-7 bg-cream border border-border-soft rounded-3xl p-6 space-y-6 shadow-lg">
                    <div className="flex items-center gap-4 border-b border-border-soft/60 pb-5 select-none">
                      {profile.profilePicture ? (
                        <div className="relative group">
                          <img 
                            src={profile.profilePicture} 
                            alt={profile.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-sage" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none text-[8px] text-white font-bold">
                            CHANGE
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-sage text-white flex items-center justify-center font-serif-display font-extrabold text-xl shadow-md border border-white/10 shrink-0">
                          {profile.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-extrabold text-white font-serif-display text-base tracking-wide flex items-center gap-2">
                          <span>{profile.name}</span>
                          <span className="p-1 px-1.5 rounded-lg bg-sage/15 text-sage text-[8px] font-mono font-bold tracking-widest uppercase">Verified Holder</span>
                        </h4>
                        <p className="text-xs text-[#8c9e99] font-medium mt-0.5">{profile.email}</p>
                        
                        {/* Branded local photo upload and cropper triggers */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <label className="py-1 px-2.5 rounded-lg bg-natural border border-border-soft text-[10px] font-mono font-bold tracking-wider text-sage hover:text-white hover:bg-sage/20 flex items-center gap-1 cursor-pointer transition-all duration-200">
                            <span>Adjust Photo</span>
                            <Upload size={10} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedCropFile(file);
                                }
                              }} 
                            />
                          </label>
                          {profile.profilePicture && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...profile, profilePicture: undefined };
                                setProfile(updated);
                                localStorage.setItem('flowse_profile_react', JSON.stringify(updated));
                              }}
                              className="py-1 px-2.5 rounded-lg bg-red-950/20 text-[#EE765D] hover:bg-red-900/30 text-[10px] font-mono font-bold border border-red-500/10 cursor-pointer transition-all"
                            >
                              Reset Icon
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Local state container and form handler */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const nInput = (form.elements.namedItem('p_name') as HTMLInputElement).value;
                        const eInput = (form.elements.namedItem('p_email') as HTMLInputElement).value;
                        const cInput = (form.elements.namedItem('p_curr') as HTMLSelectElement).value;
                        const nToggle = (form.elements.namedItem('p_notify') as HTMLInputElement).checked;
                        handleProfileSave(nInput, eInput, cInput, nToggle);
                      }}
                      className="space-y-4 text-natural-text"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-sage uppercase tracking-widest block font-mono">Username Ledger</label>
                          <input 
                            name="p_name"
                            type="text" 
                            defaultValue={profile.name}
                            required
                            className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-sage uppercase tracking-widest block font-mono">Ledger Contact Email</label>
                          <input 
                            name="p_email"
                            type="email" 
                            defaultValue={profile.email}
                            required
                            className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-sage uppercase tracking-widest block font-mono">Active Currency</label>
                          <select 
                            name="p_curr"
                            defaultValue={profile.currency}
                            className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-bold cursor-pointer"
                          >
                            <option value="₦">Nigerian Naira (₦)</option>
                            <option value="$">US Dollar ($)</option>
                            <option value="£">British Pound (£)</option>
                            <option value="€">Euro (€)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-sage uppercase tracking-widest block font-mono">Theme Mode</label>
                          <select 
                            value={themePref}
                            onChange={(e) => setThemePref(e.target.value as any)}
                            className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-bold cursor-pointer"
                          >
                            <option value="light">Light Scheme</option>
                            <option value="dark">Dark Scheme</option>
                            <option value="system">System Sync</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-sage uppercase tracking-widest block font-mono">Caps Warner Alarm</label>
                          <div className="flex items-center gap-2 pt-3 font-bold text-xs text-[#8c9e99]">
                            <input 
                              name="p_notify"
                              type="checkbox" 
                              defaultChecked={profile.phonePref}
                              className="w-4 h-4 accent-sage border-border-soft bg-natural rounded focus:ring-0 cursor-pointer"
                            />
                            <span>Enable warning alarms</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="py-3 px-5 bg-sage hover:bg-sage/90 text-white text-xs font-bold uppercase rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-sage/15 tracking-wider hover:scale-[1.02] mt-2"
                      >
                        Commit Meta Parameters
                      </button>
                    </form>
                  </div>

                  {/* Right segment - Destructive Factory Reset Wipe */}
                  <div className="md:col-span-5 space-y-6">
                    
                    {/* Vault parameters details info box */}
                    <div className="bg-[#12332A]/30 border border-[#1ebd7d]/10 p-5 text-white space-y-3 shadow-inner rounded-3xl">
                      <h4 className="font-serif-display font-extrabold text-sm text-white tracking-wide">
                        🔒 Device security block
                      </h4>
                      <p className="text-[11px] text-[#8c9e99] leading-relaxed font-semibold">
                        Flowse does not track or backup your account metrics onto cloud networks. Your records lock into local secure database memory. Ensure dynamic exports regularly.
                      </p>
                      <button 
                        onClick={exportBackupJSON}
                        className="py-2.5 px-4 bg-[#040D0A] hover:bg-[#12332A] border border-[#12332A]/60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                      >
                        <Download size={13} className="text-[#1ebd7d]" />
                        <span>Export database backup JSON file</span>
                      </button>
                    </div>

                    {/* Dangerous Wiping sector */}
                    <div className="bg-red-950/20 border border-red-500/20 p-5 space-y-4 rounded-3xl">
                      <div>
                        <h4 className="font-extrabold text-[#EE765D] text-xs uppercase font-sans-dm tracking-widest block mb-1">
                          Danger Wiping Sector
                        </h4>
                        <p className="text-[11px] text-[#8c9e99] font-medium leading-normal">
                          Purge local memory partitions. Erases PIN checks and entire transactions list history instantly.
                        </p>
                      </div>

                      <button
                        id="reset-trigger-button"
                        onClick={() => {
                          if (confirm("Executing this instruction wipes the entire Flowse ledger directory database permanently. Continue?")) {
                            if (confirm("Re-confirm destructive clear metadata instruction.")) {
                              handleFactoryReset();
                            }
                          }
                        }}
                        className="py-3 px-4 bg-red-950/40 text-[#EE765D] hover:bg-red-950 border border-red-500/30 transition-all font-bold rounded-xl text-xs cursor-pointer text-center w-full uppercase tracking-wider h-11"
                      >
                        Wipe Metadata & Reset Wallet Directory
                      </button>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cinematic branding footer (no verbose logs) */}
        <footer className="mt-auto text-center py-4 border-t border-[#12332A] select-none">
          <p className="text-[10px] text-[#8c9e99]/50 font-bold tracking-wide">
            Flowse Treasury System · Local Ledger Operations · No Cloud Dependencies
          </p>
        </footer>

      </main>

      {/* Floating center mobile action payment entry trigger */}
      <button
        onClick={() => setShowAddTxModal(true)}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-6 lg:hidden w-12 h-12 rounded-full bg-[#1ebd7d] text-neutral-950 flex items-center justify-center shadow-lg shadow-[#1ebd7d]/35 z-50 cursor-pointer"
        title="Add transaction log"
      >
        <Plus size={20} strokeWidth={3} />
      </button>

      {/* Responsive mobile touch-friendly bottom navigation bar matching DM Sans rules */}
      <nav className="fixed bottom-0 inset-x-0 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[#040D0A] border-t border-[#12332A] lg:hidden flex justify-around items-center px-2 select-none z-40 shadow-xl">
        {[
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'transactions', label: 'Logs', icon: Coins },
          { id: 'recurring', label: 'Auto', icon: Repeat },
          { id: 'budgets', label: 'Limits', icon: TrendingDown },
          { id: 'goals', label: 'Goals', icon: PiggyBank },
          { id: 'profile', label: 'Meta', icon: Settings },
        ].map((tabObj) => {
          const isActive = activeTab === tabObj.id;
          const IconComp = tabObj.icon;
          return (
            <button
              key={tabObj.id}
              onClick={() => setActiveTab(tabObj.id)}
              className="flex flex-col items-center justify-center py-1.5 focus:outline-none cursor-pointer flex-1 text-center"
            >
              <IconComp size={18} className={isActive ? 'text-[#1ebd7d] scale-110 transition-transform' : 'text-[#8c9e99]'} />
              <span className={`text-[9px] mt-0.5 tracking-wider uppercase font-bold ${isActive ? 'text-[#1ebd7d]' : 'text-[#8c9e99]'}`}>
                {tabObj.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* RENDER DYNAMIC RECORD TRANSACTION MODAL FORM */}
      <AnimatePresence>
        {showAddTxModal && (
          <TransactionForm 
            onAdd={handleAddTransaction} 
            onClose={() => setShowAddTxModal(false)} 
            currencySymbol={profile?.currency || '₦'}
          />
        )}
      </AnimatePresence>

      {/* RENDER DYNAMIC FORM FOR ADDING BUDGET CAPS */}
      <AnimatePresence>
        {showAddBudgetModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAddBudgetModal(false)} />
            <motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-cream border border-border-soft rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 text-natural-text"
            >
              <div className="flex items-center justify-between pointer-events-auto select-none">
                <h3 className="font-bold text-base text-natural-text">Set Budget Limit</h3>
                <button 
                  onClick={() => setShowAddBudgetModal(false)}
                  className="p-1 text-[#8c8a82] hover:text-sage cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddBudget} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Category</label>
                  <select
                    className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold cursor-pointer"
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Monthly Limit ({currSym})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    min="0.01"
                    step="0.01"
                    className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sage hover:bg-sage/90 text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Budget
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER DYNAMIC FORM FOR FORMULATING TARGET SAVINGS GOALS */}
      <AnimatePresence>
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAddGoalModal(false)} />
            <motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-cream border border-border-soft rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 text-natural-text"
            >
              <div className="flex items-center justify-between select-none">
                <h3 className="font-bold text-base text-natural-text">New Savings Goal</h3>
                <button 
                  onClick={() => setShowAddGoalModal(false)}
                  className="p-1 text-[#8c8a82] hover:text-sage cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Goal Name</label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    placeholder="e.g. MacBook Pro, Emergency Fund..."
                    className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Target Amount ({currSym})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1500"
                      className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Initial Saved ({currSym})</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 0"
                      className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold"
                      value={goalSaved}
                      onChange={(e) => setGoalSaved(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Target Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold cursor-pointer"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sage hover:bg-sage/90 text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER DYNAMIC MODAL TO DEPOSIT DIRECT CONTRIBUTIONS TOWARDS TARGET GOALS */}
      <AnimatePresence>
        {showContributionModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowContributionModal(null)} />
            <motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-cream border border-border-soft rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 text-natural-text"
            >
              <div className="flex items-center justify-between select-none">
                <div>
                  <h3 className="font-bold text-base text-natural-text">Add Deposit</h3>
                  <p className="text-[10px] text-[#8c8a82]">Target: {showContributionModal.name}</p>
                </div>
                <button 
                  onClick={() => setShowContributionModal(null)}
                  className="p-1 text-[#8c8a82] hover:text-sage cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGoalDeposit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sage uppercase tracking-wider block font-semibold pl-1">Amount to Save ({currSym})</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 100"
                    className="w-full bg-natural border border-border-soft rounded-xl p-3 text-xs text-natural-text focus:outline-none focus:border-sage font-semibold"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                  <span className="text-[10px] text-[#8c8a82] leading-relaxed block font-semibold italic">
                    🔓 Note: Depositing automatically adds an expense transaction to track this contribution.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sage hover:bg-sage/90 text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Confirm Deposit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER DYNAMIC RECURRING SCHEDULE FORM MODAL */}
      <AnimatePresence>
        {showAddRecurringModal && (
          <RecurringForm
            onAdd={handleAddRecurring}
            onClose={() => setShowAddRecurringModal(false)}
            currencySymbol={profile?.currency || '₦'}
          />
        )}
      </AnimatePresence>

      {/* RENDER INTEGRATED CROP PICTURE SCALE ADJUSTER MODAL */}
      <AnimatePresence>
        {selectedCropFile && (
          <ImageCropperModal
            file={selectedCropFile}
            onClose={() => setSelectedCropFile(null)}
            onCrop={(croppedDataUrl) => {
              if (profile) {
                const updated = { ...profile, profilePicture: croppedDataUrl };
                setProfile(updated);
                localStorage.setItem('flowse_profile_react', JSON.stringify(updated));
              }
              setSelectedCropFile(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* RENDER INTERACTIVE WALKTHROUGH PRODUCT SCHOOL TOUR */}
      <AnimatePresence>
        {showTour && (
          <InteractiveTour
            onClose={() => setShowTour(false)}
            currencySymbol={profile?.currency || '₦'}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
