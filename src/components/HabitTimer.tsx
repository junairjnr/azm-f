'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useNotifications } from '@/context/NotificationContext';
import { formatDate } from '@/lib/auth';
import type { Habit } from '@/types';
import { formatDuration, formatTimerDisplay } from '@/lib/utils';

interface HabitTimerProps {
  habit: Habit;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string, elapsed: number) => Promise<void>;
  loading?: boolean;
}

export default function HabitTimer({ habit, onStart, onStop, loading }: HabitTimerProps) {
  const { notify } = useNotifications();
  const [elapsed, setElapsed] = useState(habit.durationSeconds || 0);
  const [running, setRunning] = useState(!!habit.isTimerRunning);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const goalNotifiedRef = useRef(false);

  const targetSeconds = (habit.targetDurationMinutes || 0) * 60;
  const progress = targetSeconds > 0 ? Math.min((elapsed / targetSeconds) * 100, 100) : 0;

  useEffect(() => {
    if (habit.isTimerRunning && habit.timerStartedAt) {
      const base = habit.durationSeconds || 0;
      const sinceStart = Math.floor((Date.now() - new Date(habit.timerStartedAt).getTime()) / 1000);
      setElapsed(base + sinceStart);
      setRunning(true);
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(base + sinceStart + Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [habit.isTimerRunning, habit.timerStartedAt, habit.durationSeconds]);

  useEffect(() => {
    goalNotifiedRef.current = false;
  }, [habit._id, habit.isTimerRunning]);

  useEffect(() => {
    if (!running || targetSeconds <= 0 || goalNotifiedRef.current) return;
    if (elapsed < targetSeconds) return;

    goalNotifiedRef.current = true;
    const today = formatDate();
    void notify({
      title: `🎯 Goal reached — ${habit.title}`,
      body: `You hit your ${habit.targetDurationMinutes} min target for ${habit.title}.`,
      tag: `timer-goal-${habit._id}-${today}`,
      toastMessage: `${habit.title}: ${habit.targetDurationMinutes} min goal reached!`,
      toastType: 'success',
    });
  }, [elapsed, running, targetSeconds, habit._id, habit.title, habit.targetDurationMinutes, notify]);

  const handleStart = async () => {
    await onStart(habit._id);
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const sessionElapsed = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;
    await onStop(habit._id, sessionElapsed);
  };

  const categoryName =
    typeof habit.categoryId === 'object' && habit.categoryId ? habit.categoryId.name : null;

  return (
    <Card
      variant="liquid"
      shine
      padding="md"
      className={habit.completed ? 'ring-1 ring-emerald-400/40' : ''}
    >
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
          <div
            className="card-clay flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl sm:h-12 sm:w-12"
            style={{ backgroundColor: `${habit.color}15` }}
          >
            {habit.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className={`font-semibold ${habit.completed ? 'text-emerald-500 line-through' : 'text-[var(--foreground)]'}`}>
                {habit.title}
              </p>
              {categoryName && (
                <span className="rounded-full bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] text-[var(--gold)]">
                  {categoryName}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
              <span className="font-mono text-base text-[var(--gold)] sm:text-lg">
                {formatTimerDisplay(elapsed)}
              </span>
              {targetSeconds > 0 && (
                <span>/ {habit.targetDurationMinutes} min goal</span>
              )}
              {habit.durationSeconds ? (
                <span>Logged: {formatDuration(habit.durationSeconds)}</span>
              ) : null}
            </div>
            {targetSeconds > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                <div
                  className="gold-gradient h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 self-end sm:self-center">
          {!running ? (
            <button
              onClick={handleStart}
              disabled={loading || habit.completed}
              className="card-neo flex h-11 w-11 items-center justify-center rounded-xl text-[var(--gold-dark)] transition hover:scale-105 disabled:opacity-40"
              aria-label="Start timer"
            >
              <Play className="h-5 w-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={loading}
              className="card-clay flex h-11 w-11 items-center justify-center rounded-xl text-red-500 transition hover:scale-105"
              aria-label="Stop timer"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
