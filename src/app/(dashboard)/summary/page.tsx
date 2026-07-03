'use client';

import { useCallback, useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import SummaryChart from '@/components/SummaryChart';
import Card from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import type { SummaryData } from '@/types';

export default function SummaryPage() {
  const { token } = useAuth();
  const [month, setMonth] = useState(formatDate(new Date()).slice(0, 7));
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = useCustomRange && start && end ? { start, end } : { month };
      const data = await api.getSummary(token, params);
      setSummary(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, month, start, end, useCustomRange]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gold-text">Summary & Analytics</h1>
        <p className="mt-1 text-[var(--muted)]">Track your progress over time</p>
      </div>

      <Card variant="neo" shine={false} padding="sm" className="flex flex-wrap items-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setUseCustomRange(false)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              !useCustomRange ? 'btn-gold' : 'border border-[var(--card-border)] text-[var(--muted)]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setUseCustomRange(true)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              useCustomRange ? 'btn-gold' : 'border border-[var(--card-border)] text-[var(--muted)]'
            }`}
          >
            Custom Range
          </button>
        </div>
        {!useCustomRange ? (
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input-field rounded-xl px-3 py-2 text-sm" />
        ) : (
          <>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input-field rounded-xl px-3 py-2 text-sm" />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input-field rounded-xl px-3 py-2 text-sm" />
          </>
        )}
      </Card>

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Completed This Month" value={summary.monthlyCompleted} subtitle="habits" />
            <StatCard title="Completion Rate" value={`${summary.completionRate}%`} subtitle="in selected range" />
            <StatCard title="Current Streak" value={`${summary.currentStreak} days`} subtitle="keep going" />
            <StatCard title="Longest Streak" value={`${summary.longestStreak} days`} subtitle="best record" />
          </div>
          <SummaryChart data={summary.chartData} />
        </>
      )}
    </div>
  );
}
