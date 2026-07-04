'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ErrorBanner from '@/components/ErrorBanner';
import HabitCheckbox from '@/components/HabitCheckbox';
import HabitTimer from '@/components/HabitTimer';
import StatCard from '@/components/StatCard';
import Card from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import type { Category, Habit, SummaryData } from '@/types';

export default function DashboardPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const today = formatDate();

  const fetchData = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [habitsData, summaryData, cats] = await Promise.all([
        api.getHabits(token, today),
        api.getSummary(token),
        api.getCategories(token),
      ]);
      setHabits(habitsData);
      setSummary(summaryData);
      setCategories(cats);
      setExpandedCategories(new Set(['all', ...cats.map((c) => c._id)]));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token, today, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredHabits = useMemo(() => {
    if (!filterCategory) return habits;
    return habits.filter((h) => {
      const catId = typeof h.categoryId === 'object' ? h.categoryId?._id : h.categoryId;
      return catId === filterCategory;
    });
  }, [habits, filterCategory]);

  const groupedHabits = useMemo(() => {
    const groups: Record<string, { name: string; icon: string; habits: Habit[] }> = {
      uncategorized: { name: 'Uncategorized', icon: '📋', habits: [] },
    };
    categories.forEach((c) => {
      groups[c._id] = { name: c.name, icon: c.icon, habits: [] };
    });
    filteredHabits.forEach((h) => {
      const catId =
        typeof h.categoryId === 'object' && h.categoryId ? h.categoryId._id : h.categoryId;
      if (catId && groups[catId]) {
        groups[catId].habits.push(h);
      } else {
        groups.uncategorized.habits.push(h);
      }
    });
    return Object.entries(groups).filter(([, g]) => g.habits.length > 0);
  }, [filteredHabits, categories]);

  const handleToggle = async (id: string, durationSeconds?: number) => {
    if (!token) return;
    setTogglingId(id);
    try {
      const result = await api.toggleHabit(token, id, today, durationSeconds);
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id
            ? {
                ...h,
                completed: result.completed,
                durationSeconds: result.durationSeconds,
                isTimerRunning: false,
                timerStartedAt: null,
              }
            : h
        )
      );
      const summaryData = await api.getSummary(token);
      setSummary(summaryData);
      toast.success(result.completed ? 'Habit completed! 🎉' : 'Habit unchecked');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update habit');
    } finally {
      setTogglingId(null);
    }
  };

  const handleStartTimer = async (id: string) => {
    if (!token) return;
    setTogglingId(id);
    try {
      const result = await api.startTimer(token, id, today);
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id
            ? { ...h, isTimerRunning: true, timerStartedAt: result.timerStartedAt || new Date().toISOString() }
            : h
        )
      );
      toast.info('Timer started — stay focused!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to start timer');
    } finally {
      setTogglingId(null);
    }
  };

  const handleStopTimer = async (id: string, elapsed: number) => {
    if (!token) return;
    setTogglingId(id);
    try {
      const result = await api.stopTimer(token, id, today, elapsed);
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id
            ? {
                ...h,
                completed: result.completed,
                durationSeconds: result.durationSeconds,
                isTimerRunning: false,
                timerStartedAt: null,
              }
            : h
        )
      );
      const summaryData = await api.getSummary(token);
      setSummary(summaryData);
      toast.success(result.completed ? 'Timer complete! Great job! 🏆' : 'Timer stopped & time logged');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to stop timer');
    } finally {
      setTogglingId(null);
    }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <div>
        <h1 className="text-2xl font-bold gold-text sm:text-3xl">Today&apos;s Tasks</h1>
        <p className="mt-1 text-[var(--muted)]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {' · '}{totalCount} tasks
        </p>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Completed Today" value={`${completedCount}/${totalCount}`} subtitle={`${progress}% done`} />
          <StatCard title="This Month" value={summary.monthlyCompleted} subtitle="habits completed" />
          <StatCard title="Current Streak" value={`${summary.currentStreak} days`} subtitle="keep going!" />
          <StatCard title="Completion Rate" value={`${summary.completionRate}%`} subtitle="this month" />
        </div>
      )}

      {categories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setFilterCategory('')}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              !filterCategory ? 'btn-gold' : 'gold-gradient-soft text-[var(--muted)] border border-[var(--card-border)]'
            }`}
          >
            All ({totalCount})
          </button>
          {categories.map((cat) => {
            const count = habits.filter((h) => {
              const id = typeof h.categoryId === 'object' ? h.categoryId?._id : h.categoryId;
              return id === cat._id;
            }).length;
            return (
              <button
                key={cat._id}
                onClick={() => setFilterCategory(cat._id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  filterCategory === cat._id
                    ? 'btn-gold'
                    : 'gold-gradient-soft text-[var(--muted)] border border-[var(--card-border)]'
                }`}
              >
                {cat.icon} {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filteredHabits.length === 0 ? (
        <Card variant="clay" shine={false} padding="lg" className="border-dashed text-center">
          <p className="text-6xl">🎯</p>
          <p className="mt-4 text-lg font-medium">No tasks for today</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Add habits from the Habits page to get started!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedHabits.map(([groupId, group]) => (
            <div key={groupId}>
              <button
                onClick={() => toggleCategory(groupId)}
                className="mb-3 flex w-full items-center justify-between rounded-xl px-2 py-1 text-left"
              >
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {group.icon} {group.name}
                  <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                    ({group.habits.filter((h) => h.completed).length}/{group.habits.length})
                  </span>
                </h2>
                {expandedCategories.has(groupId) ? (
                  <ChevronUp className="h-5 w-5 text-[var(--muted)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--muted)]" />
                )}
              </button>

              {expandedCategories.has(groupId) && (
                <div className="space-y-3">
                  {group.habits.map((habit) =>
                    habit.targetDurationMinutes > 0 ? (
                      <HabitTimer
                        key={habit._id}
                        habit={habit}
                        onStart={handleStartTimer}
                        onStop={handleStopTimer}
                        onToggle={handleToggle}
                        loading={togglingId === habit._id}
                      />
                    ) : (
                      <HabitCheckbox
                        key={habit._id}
                        habit={habit}
                        onToggle={handleToggle}
                        loading={togglingId === habit._id}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
