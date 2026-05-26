export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  notes?: string;
  goalId?: string; // Optional link to a savings goal
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string; // YYYY-MM-DD representing the start of recurrence
  notes?: string;
  lastGeneratedDate?: string; // ISO string representing the last occurrence successfully created
  isActive: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  date?: string; // Target due date
}

export interface UserProfile {
  name: string;
  email: string;
  phonePref: boolean; // Local notifications pref
  pin: string; // 4-digit PIN
  onboarded: boolean;
  currency: string; // e.g. "₦", "$", "£", "€"
  weeklyDigest?: boolean;
  billReminders?: boolean;
  twoFactor?: boolean;
  profilePicture?: string; // local base64 image
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  profile: UserProfile | null;
  pinVerified: boolean;
  theme: ThemeMode;
  peekBalance: boolean;
}

export interface CategoryOption {
  value: string;
  label: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class (text/bg)
}

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { value: 'housing', label: 'Housing & Utilities', icon: 'Home', color: 'from-blue-500 to-indigo-600' },
  { value: 'food', label: 'Food & Dining', icon: 'Utensils', color: 'from-amber-500 to-orange-600' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: 'from-pink-500 to-rose-600' },
  { value: 'transport', label: 'Transport', icon: 'Car', color: 'from-cyan-500 to-blue-600' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Film', color: 'from-purple-500 to-violet-600' },
  { value: 'health', label: 'Health & Medical', icon: 'Heart', color: 'from-red-500 to-rose-600' },
  { value: 'education', label: 'Education', icon: 'GraduationCap', color: 'from-teal-500 to-emerald-600' },
  { value: 'church', label: 'Church / Tithe / Charity', icon: 'HeartHandshake', color: 'from-yellow-500 to-amber-600' },
  { value: 'business', label: 'Business Expenses', icon: 'Briefcase', color: 'from-sky-500 to-indigo-600' },
  { value: 'other_expense', label: 'Other Expenses', icon: 'HelpCircle', color: 'from-slate-550 to-slate-705' },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { value: 'salary', label: 'Salary / Wages', icon: 'Briefcase', color: 'from-emerald-500 to-green-600' },
  { value: 'freelance', label: 'Freelance / Side Gig', icon: 'Laptop', color: 'from-sky-500 to-blue-600' },
  { value: 'investment', label: 'Investments', icon: 'TrendingUp', color: 'from-indigo-500 to-purple-600' },
  { value: 'gift', label: 'Gifts & Awards', icon: 'Gift', color: 'from-pink-500 to-rose-600' },
  { value: 'other_income', label: 'Other Income', icon: 'Coins', color: 'from-amber-550 to-yellow-605' },
];
