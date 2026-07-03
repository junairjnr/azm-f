'use client';

import Card from '@/components/ui/Card';
import type { CalendarData } from '@/types';
import { formatDisplayDate } from '@/lib/auth';
import { formatDuration } from '@/lib/utils';

interface CalendarTableProps {
  data: CalendarData;
}

export default function CalendarTable({ data }: CalendarTableProps) {
  if (!data.habits.length) {
    return (
      <Card variant="glass" shine={false} padding="lg" className="text-center text-[var(--muted)]">
        No habits yet. Add habits to see your calendar tracker.
      </Card>
    );
  }

  return (
    <Card variant="glass" shine={false} padding="none" className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--card-border)]">
            <th className="sticky left-0 bg-[var(--surface)] px-4 py-3 text-left font-medium">Date</th>
            {data.habits.map((habit) => (
              <th key={habit._id} className="min-w-[80px] px-3 py-3 text-center font-medium">
                <span className="mr-1">{habit.icon}</span>
                <span className="hidden sm:inline">{habit.title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.date} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--surface-hover)]">
              <td className="sticky left-0 bg-[var(--surface)] px-4 py-3 font-medium">
                {formatDisplayDate(row.date)}
              </td>
              {row.habits.map((habit) => (
                <td key={`${row.date}-${habit.habitId}`} className="px-3 py-3 text-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                      habit.completed
                        ? 'bg-[var(--gold)]/20 text-[var(--gold)]'
                        : 'bg-[var(--surface-hover)] text-[var(--muted)]'
                    }`}
                    title={habit.durationSeconds ? formatDuration(habit.durationSeconds) : undefined}
                  >
                    {habit.completed ? '✔' : '✖'}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
