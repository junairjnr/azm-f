export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Habit {
  _id: string;
  userId: string;
  categoryId?: Category | string | null;
  title: string;
  color: string;
  icon: string;
  targetDurationMinutes: number;
  reminderTime: string;
  reminderEnabled: boolean;
  createdAt: string;
  completed?: boolean;
  durationSeconds?: number;
  timerStartedAt?: string | null;
  isTimerRunning?: boolean;
}

export interface HabitLogToggle {
  habitId: string;
  date: string;
  completed: boolean;
  durationSeconds?: number;
  timerStartedAt?: string | null;
}

export interface CalendarRow {
  date: string;
  habits: {
    habitId: string;
    title: string;
    color: string;
    icon: string;
    completed: boolean;
    durationSeconds?: number;
  }[];
}

export interface CalendarData {
  habits: Habit[];
  rows: CalendarRow[];
}

export interface SummaryData {
  range: { start: string; end: string };
  totalHabits: number;
  totalCompleted: number;
  completionRate: number;
  weeklyCompleted: number;
  monthlyCompleted: number;
  currentStreak: number;
  longestStreak: number;
  chartData: {
    date: string;
    completed: number;
    total: number;
    rate: number;
  }[];
}

export interface DiaryEntry {
  _id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'awful';
  createdAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank' | 'other';
  createdAt: string;
}

export interface ExpenseSummary {
  expenses: Expense[];
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
