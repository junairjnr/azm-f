import type { Habit } from '@/types';

const SETTINGS_KEY = 'azm_notification_settings';
const NOTIFIED_PREFIX = 'azm_notified_';
const HABITS_CACHE_KEY = 'azm_habits_offline_cache';

export interface NotificationSettings {
  diaryReminderEnabled: boolean;
  diaryReminderTime: string;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  diaryReminderEnabled: true,
  diaryReminderTime: '21:00',
  soundEnabled: true,
};

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    return {
      diaryReminderEnabled: parsed.diaryReminderEnabled ?? DEFAULT_SETTINGS.diaryReminderEnabled,
      diaryReminderTime: parsed.diaryReminderTime ?? DEFAULT_SETTINGS.diaryReminderTime,
      soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function wasNotified(tag: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${NOTIFIED_PREFIX}${tag}`) === '1';
}

export function markNotified(tag: string) {
  localStorage.setItem(`${NOTIFIED_PREFIX}${tag}`, '1');
}

export function getCurrentTimeHHMM(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function cacheHabitsForOffline(date: string, habits: Habit[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    HABITS_CACHE_KEY,
    JSON.stringify({ date, habits, savedAt: Date.now() })
  );
}

export function getCachedHabits(date: string): Habit[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HABITS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date: string; habits: Habit[] };
    return parsed.date === date ? parsed.habits : null;
  } catch {
    return null;
  }
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export async function sendBrowserNotification(
  title: string,
  body: string,
  tag?: string
): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;

  const options = {
    body,
    icon: '/icons/icon512_rounded.png',
    badge: '/icons/icon512_rounded.png',
    tag,
    silent: false,
    requireInteraction: false,
    data: { url: '/dashboard' },
  } satisfies NotificationOptions;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}
