'use client';

import { useEffect, useState } from 'react';
import { HABIT_COLORS, HABIT_ICONS } from '@/lib/auth';
import { DURATION_PRESETS } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import type { Category, Habit } from '@/types';

interface HabitFormProps {
  initial?: Habit | null;
  categories: Category[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  onCreateCategory?: (name: string) => Promise<Category>;
  submitLabel?: string;
}

export default function HabitForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  onCreateCategory,
  submitLabel = 'Save Habit',
}: HabitFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [color, setColor] = useState(initial?.color || '#D4AF37');
  const [icon, setIcon] = useState(initial?.icon || HABIT_ICONS[0]);
  const [categoryId, setCategoryId] = useState(
    typeof initial?.categoryId === 'object'
      ? initial.categoryId?._id || ''
      : initial?.categoryId || ''
  );
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(
    initial?.targetDurationMinutes || 0
  );
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime || '');
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminderEnabled || false);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setColor(initial.color);
      setIcon(initial.icon);
      setCategoryId(
        typeof initial.categoryId === 'object'
          ? initial.categoryId?._id || ''
          : initial.categoryId || ''
      );
      setTargetDurationMinutes(initial.targetDurationMinutes || 0);
      setReminderTime(initial.reminderTime || '');
      setReminderEnabled(initial.reminderEnabled || false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Habit name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        color,
        icon,
        categoryId: categoryId || null,
        targetDurationMinutes,
        reminderTime,
        reminderEnabled,
      });
      if (!initial) {
        setTitle('');
        setColor('#D4AF37');
        setIcon(HABIT_ICONS[0]);
        setCategoryId('');
        setTargetDurationMinutes(0);
        setReminderTime('');
        setReminderEnabled(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !onCreateCategory) return;
    const cat = await onCreateCategory(newCategory.trim());
    setCategoryId(cat._id);
    setNewCategory('');
  };

  return (
    <Card as="form" onSubmit={handleSubmit} variant="clay" shine padding="lg" className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Habit name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Walking, Reading, Gym..."
          className="input-field w-full rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input-field w-full rounded-xl px-4 py-3"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {onCreateCategory && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category (Personal, Work...)"
              className="input-field flex-1 rounded-xl px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="rounded-xl bg-[var(--gold)]/20 px-4 py-2 text-sm text-[var(--gold)] hover:bg-[var(--gold)]/30"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Timer duration (minutes)</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTargetDurationMinutes(0)}
            className={`rounded-xl px-3 py-2 text-sm transition ${
              targetDurationMinutes === 0
                ? 'gold-gradient text-black font-semibold'
                : 'bg-[var(--surface-hover)] text-[var(--muted)]'
            }`}
          >
            No timer
          </button>
          {DURATION_PRESETS.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => setTargetDurationMinutes(min)}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                targetDurationMinutes === min
                  ? 'gold-gradient text-black font-semibold'
                  : 'bg-[var(--surface-hover)] text-[var(--muted)]'
              }`}
            >
              {min}m
            </button>
          ))}
        </div>
        <input
          type="number"
          min={0}
          value={targetDurationMinutes}
          onChange={(e) => setTargetDurationMinutes(Number(e.target.value))}
          className="input-field mt-2 w-32 rounded-xl px-3 py-2 text-sm"
          placeholder="Custom"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="accent-[var(--gold)]"
            />
            Enable reminder
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            disabled={!reminderEnabled}
            className="input-field w-full rounded-xl px-4 py-3 disabled:opacity-40"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Icon</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setIcon(item)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
                icon === item
                  ? 'ring-2 ring-[var(--gold)] bg-[var(--gold)]/20'
                  : 'bg-[var(--surface-hover)]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              className={`h-8 w-8 rounded-full transition ${
                color === item ? 'ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-[var(--background)]' : ''
              }`}
              style={{ backgroundColor: item }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-gold rounded-xl px-6 py-3 text-sm disabled:opacity-50">
          {loading ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--card-border)] px-6 py-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)]"
          >
            Cancel
          </button>
        )}
      </div>
    </Card>
  );
}
