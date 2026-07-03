'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useNotifications } from '@/context/NotificationContext';

const DISMISS_KEY = 'azm_notification_banner_dismissed';

export default function NotificationPermissionBanner() {
  const { permission, requestPermission, settings, updateSettings } = useNotifications();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  if (permission === 'granted' || permission === 'unsupported' || dismissed) {
    return null;
  }

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(100%,22rem)] -translate-x-1/2 px-3 sm:left-auto sm:right-4 sm:translate-x-0">
      <Card variant="liquid-gold" padding="md" className="shadow-xl">
        <div className="flex items-start gap-3">
          {permission === 'denied' ? (
            <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          ) : (
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-dark)]" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">Enable reminders</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {permission === 'denied'
                ? 'Notifications are blocked in browser settings. You will still see in-app alerts.'
                : 'Get alerts for habit reminders, timer goals, and daily diary nudges.'}
            </p>
            {permission === 'default' && (
              <button
                type="button"
                onClick={() => void requestPermission()}
                className="gold-gradient mt-3 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-950"
              >
                Turn on notifications
              </button>
            )}
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={settings.diaryReminderEnabled}
                onChange={(e) => updateSettings({ diaryReminderEnabled: e.target.checked })}
                className="rounded border-[var(--border)]"
              />
              Daily diary reminder at {settings.diaryReminderTime}
            </label>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="card-neo flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)]"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
