export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimerDisplay(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export {
  requestNotificationPermission,
  sendBrowserNotification as sendNotification,
} from '@/lib/notifications';

export const MOOD_OPTIONS = [
  { value: 'great', emoji: '🤩', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
  { value: 'awful', emoji: '😢', label: 'Awful' },
] as const;

export const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other',
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank', label: 'Bank' },
  { value: 'other', label: 'Other' },
] as const;

export const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
