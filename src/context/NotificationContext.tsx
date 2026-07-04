'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToast } from '@/context/ToastContext';
import {
  getNotificationSettings,
  isOnline,
  markNotified,
  requestNotificationPermission,
  saveNotificationSettings,
  sendBrowserNotification,
  wasNotified,
  type NotificationSettings,
} from '@/lib/notifications';
import { playReminderTone, primeNotificationSound } from '@/lib/notificationSound';

const DEFAULT_SETTINGS: NotificationSettings = {
  diaryReminderEnabled: true,
  diaryReminderTime: '21:00',
  soundEnabled: true,
};

type ToastType = 'success' | 'error' | 'info';

export interface NotifyOptions {
  title: string;
  body: string;
  tag: string;
  toastMessage?: string;
  toastType?: ToastType;
  skipIfNotified?: boolean;
  sound?: 'reminder' | 'success' | 'none';
}

interface NotificationContextValue {
  permission: NotificationPermission | 'unsupported' | 'default';
  online: boolean;
  settings: NotificationSettings;
  requestPermission: () => Promise<boolean>;
  updateSettings: (next: Partial<NotificationSettings>) => void;
  notify: (options: NotifyOptions) => Promise<boolean>;
  testSound: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | 'default'>('default');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setSettings(getNotificationSettings());
    setOnline(isOnline());
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    if (result !== 'unsupported') setPermission(result);
    if (result === 'granted') {
      await primeNotificationSound();
    }
    return result === 'granted';
  }, []);

  const updateSettings = useCallback((next: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      saveNotificationSettings(merged);
      return merged;
    });
  }, []);

  const testSound = useCallback(async () => {
    await primeNotificationSound();
    await playReminderTone('reminder');
  }, []);

  const notify = useCallback(
    async ({
      title,
      body,
      tag,
      toastMessage,
      toastType = 'info',
      skipIfNotified = true,
      sound = toastType === 'success' ? 'success' : 'reminder',
    }: NotifyOptions) => {
      if (skipIfNotified && wasNotified(tag)) return false;

      const message = toastMessage ?? body;
      toast.showToast(message, toastType);

      if (settings.soundEnabled && sound !== 'none') {
        await playReminderTone(sound);
      }

      let sent = false;
      if (permission === 'granted') {
        sent = await sendBrowserNotification(title, body, tag);
      }

      markNotified(tag);
      return sent;
    },
    [permission, settings.soundEnabled, toast]
  );

  const value = useMemo(
    () => ({ permission, online, settings, requestPermission, updateSettings, notify, testSound }),
    [permission, online, settings, requestPermission, updateSettings, notify, testSound]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
