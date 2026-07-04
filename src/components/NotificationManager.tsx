'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import {
  cacheHabitsForOffline,
  getCachedHabits,
  getCurrentTimeHHMM,
  isOnline,
} from '@/lib/notifications';
import type { Habit } from '@/types';

const POLL_MS = 15000;

function getTimerElapsed(habit: Habit): number {
  const base = habit.durationSeconds || 0;
  if (!habit.isTimerRunning || !habit.timerStartedAt) return base;
  const sinceStart = Math.floor((Date.now() - new Date(habit.timerStartedAt).getTime()) / 1000);
  return base + Math.max(0, sinceStart);
}

export default function NotificationManager() {
  const { token } = useAuth();
  const { notify, settings } = useNotifications();
  const habitsRef = useRef<Habit[]>([]);
  const hasDiaryTodayRef = useRef<boolean | null>(null);
  const diaryCheckedDateRef = useRef('');

  const checkAll = useCallback(async () => {
    if (!token) return;

    const now = new Date();
    const today = formatDate(now);
    const currentTime = getCurrentTimeHHMM(now);
    const online = isOnline();

    let habits = habitsRef.current;

    if (online) {
      try {
        habits = await api.getHabits(token, today);
        habitsRef.current = habits;
        cacheHabitsForOffline(today, habits);
      } catch {
        habits = getCachedHabits(today) ?? habitsRef.current;
      }
    } else {
      habits = getCachedHabits(today) ?? habitsRef.current;
    }

    for (const habit of habits) {
      if (habit.reminderEnabled && habit.reminderTime === currentTime && !habit.completed) {
        await notify({
          title: `⏰ ${habit.title}`,
          body: `Time for your habit: ${habit.title}${habit.targetDurationMinutes ? ` (${habit.targetDurationMinutes} min)` : ''}.`,
          tag: `reminder-${habit._id}-${today}-${currentTime}`,
          toastMessage: `Reminder: ${habit.title}`,
          toastType: 'info',
          sound: 'reminder',
        });
      }

      const targetSeconds = (habit.targetDurationMinutes || 0) * 60;
      if (targetSeconds > 0 && habit.isTimerRunning) {
        const elapsed = getTimerElapsed(habit);
        if (elapsed >= targetSeconds) {
          await notify({
            title: `🎯 Goal reached — ${habit.title}`,
            body: `You hit your ${habit.targetDurationMinutes} min target. Keep going or stop the timer when ready.`,
            tag: `timer-goal-${habit._id}-${today}`,
            toastMessage: `${habit.title}: ${habit.targetDurationMinutes} min goal reached!`,
            toastType: 'success',
            sound: 'success',
          });
        }
      }
    }

    if (settings.diaryReminderEnabled && settings.diaryReminderTime === currentTime) {
      if (online) {
        if (diaryCheckedDateRef.current !== today) {
          try {
            const entries = await api.getDiaryEntries(token, { date: today });
            hasDiaryTodayRef.current = entries.length > 0;
            diaryCheckedDateRef.current = today;
          } catch {
            hasDiaryTodayRef.current = null;
          }
        }
      } else if (hasDiaryTodayRef.current === null) {
        hasDiaryTodayRef.current = false;
      }

      if (hasDiaryTodayRef.current === false) {
        await notify({
          title: '📔 Diary reminder',
          body: "You haven't written in your diary today. Take a moment to reflect.",
          tag: `diary-reminder-${today}-${currentTime}`,
          toastMessage: 'Time to write in your diary today.',
          toastType: 'info',
          sound: 'reminder',
        });
      }
    }
  }, [token, notify, settings.diaryReminderEnabled, settings.diaryReminderTime]);

  useEffect(() => {
    if (!token) return;

    checkAll();
    const interval = setInterval(checkAll, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkAll();
    };
    const onOnline = () => void checkAll();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [token, checkAll]);

  return null;
}
