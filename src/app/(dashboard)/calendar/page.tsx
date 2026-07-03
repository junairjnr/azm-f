'use client';

import { useCallback, useEffect, useState } from 'react';
import CalendarTable from '@/components/CalendarTable';
import Card from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import type { CalendarData } from '@/types';

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 13);
  return { start: formatDate(start), end: formatDate(end) };
}

export default function CalendarPage() {
  const { token } = useAuth();
  const [range, setRange] = useState(getDefaultRange);
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await api.getCalendarData(token, range.start, range.end);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, range]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const presets = [
    { label: '7 days', days: 6 },
    { label: '14 days', days: 13 },
    { label: '30 days', days: 29 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold gold-text sm:text-3xl">Calendar Tracker</h1>
        <p className="mt-1 text-[var(--muted)]">Day-wise habit completion overview</p>
      </div>

      <Card variant="neo" shine={false} padding="sm" className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Start</label>
          <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="input-field rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">End</label>
          <input type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="input-field rounded-xl px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - p.days);
                setRange({ start: formatDate(start), end: formatDate(end) });
              }}
              className="rounded-xl border border-[var(--card-border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {loading ? <ListSkeleton rows={8} /> : data ? <CalendarTable data={data} /> : null}
    </div>
  );
}
