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
  markNotified,
  requestNotificationPermission,
  saveNotificationSettings,
  sendBrowserNotification,
  wasNotified,
  type NotificationSettings,
} from '@/lib/notifications';

const DEFAULT_SETTINGS: NotificationSettings = {
  diaryReminderEnabled: true,
  diaryReminderTime: '21:00',
};

type ToastType = 'success' | 'error' | 'info';

export interface NotifyOptions {
  title: string;
  body: string;
  tag: string;
  toastMessage?: string;
  toastType?: ToastType;
  skipIfNotified?: boolean;
}

interface NotificationContextValue {
  permission: NotificationPermission | 'unsupported' | 'default';
  settings: NotificationSettings;
  requestPermission: () => Promise<boolean>;
  updateSettings: (next: Partial<NotificationSettings>) => void;
  notify: (options: NotifyOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | 'default'>('default');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getNotificationSettings());
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    if (result !== 'unsupported') setPermission(result);
    return result === 'granted';
  }, []);

  const updateSettings = useCallback((next: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      saveNotificationSettings(merged);
      return merged;
    });
  }, []);

  const notify = useCallback(
    async ({
      title,
      body,
      tag,
      toastMessage,
      toastType = 'info',
      skipIfNotified = true,
    }: NotifyOptions) => {
      if (skipIfNotified && wasNotified(tag)) return false;

      const message = toastMessage ?? body;
      toast.showToast(message, toastType);

      let sent = false;
      if (permission === 'granted') {
        sent = await sendBrowserNotification(title, body, tag);
      }

      markNotified(tag);
      return sent;
    },
    [permission, toast]
  );

  const value = useMemo(
    () => ({ permission, settings, requestPermission, updateSettings, notify }),
    [permission, settings, requestPermission, updateSettings, notify]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
