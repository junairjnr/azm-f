'use client';

import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Habit } from '@/types';

interface HabitCheckboxProps {
  habit: Habit;
  onToggle: (id: string) => void;
  loading?: boolean;
}

export default function HabitCheckbox({ habit, onToggle, loading }: HabitCheckboxProps) {
  const categoryName =
    typeof habit.categoryId === 'object' && habit.categoryId ? habit.categoryId.name : null;

  return (
    <Card
      as="button"
      variant="liquid"
      shine
      padding="none"
      hover={!loading}
      type="button"
      onClick={() => onToggle(habit._id)}
      disabled={loading}
      className={`flex w-full items-center gap-4 p-4 text-left ${
        habit.completed ? 'ring-1 ring-[var(--gold)]/40' : ''
      } ${loading ? 'opacity-60' : ''}`}
    >
      <div
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition ${
          habit.completed ? 'gold-gradient text-black shadow-lg' : 'card-clay'
        }`}
        style={!habit.completed ? { backgroundColor: `${habit.color}18` } : undefined}
      >
        {habit.completed ? <Check className="h-6 w-6" /> : habit.icon}
      </div>

      <div className="relative z-[2] min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className={`font-semibold ${
              habit.completed
                ? 'text-[var(--gold-dark)] line-through dark:text-[var(--gold-light)]'
                : 'text-[var(--foreground)]'
            }`}
          >
            {habit.title}
          </p>
          {categoryName && (
            <span className="card-clay rounded-full px-2 py-0.5 text-[10px] font-medium text-[var(--gold-dark)]">
              {categoryName}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--muted)]">
          {habit.completed ? 'Completed today ✓' : 'Tap to mark complete'}
        </p>
      </div>

      <div
        className={`relative z-[2] h-7 w-7 shrink-0 rounded-full border-2 transition ${
          habit.completed
            ? 'border-[var(--gold)] bg-[var(--gold)] shadow-md'
            : 'card-neo border-transparent'
        }`}
      />
    </Card>
  );
}
