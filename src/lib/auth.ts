const TOKEN_KEY = 'habit_tracker_token';
const USER_KEY = 'habit_tracker_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: import('@/types').User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): import('@/types').User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const HABIT_ICONS = ['✨', '🚶', '📚', '📖', '💪', '🙏', '💻', '🏃', '🧘', '💧', '🥗', '😴'];
export const HABIT_COLORS = [
  '#D4AF37',
  '#6366f1',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
];
