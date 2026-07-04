'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Volume2, Wifi, WifiOff, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useNotifications } from '@/context/NotificationContext';

const DISMISS_KEY = 'azm_notification_banner_dismissed';

export default function NotificationPermissionBanner() {
  const { permission, online, requestPermission, settings, updateSettings, testSound } =
    useNotifications();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 w-[min(100%,24rem)] -translate-x-1/2 px-3 sm:left-auto sm:right-4 sm:translate-x-0">
      <Card variant="liquid-gold" padding="md" className="shadow-xl">
        <div className="flex items-start gap-3">
          {permission === 'denied' ? (
            <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          ) : (
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-dark)]" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[var(--foreground)]">Reminders & sound</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  online
                    ? 'bg-emerald-500/15 text-emerald-700'
                    : 'bg-amber-500/15 text-amber-700'
                }`}
              >
                {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {online ? 'Online' : 'Offline — cached reminders'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {permission === 'denied'
                ? 'Allow notifications in browser settings for alerts with tone when away from the app.'
                : 'Habit reminders, timer alerts, and diary nudges with a chime — works offline using saved tasks.'}
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
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="rounded border-[var(--border)]"
                />
                Play reminder tone (in app + system alert)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--muted)]">
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
              onClick={() => void testSound()}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gold-dark)]"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Test reminder sound
            </button>
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
