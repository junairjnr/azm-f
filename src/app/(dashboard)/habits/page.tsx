'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ErrorBanner from '@/components/ErrorBanner';
import HabitForm from '@/components/HabitForm';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import Card from '@/components/ui/Card';
import type { Category, Habit } from '@/types';

export default function HabitsPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Habit | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [habitsData, cats] = await Promise.all([
        api.getHabits(token),
        api.getCategories(token),
      ]);
      setHabits(habitsData);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: Record<string, unknown>) => {
    if (!token) return;
    await api.createHabit(token, data);
    await fetchData();
    toast.success('Habit added successfully!');
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!token || !editing) return;
    await api.updateHabit(token, editing._id, data);
    setEditing(null);
    await fetchData();
    toast.success('Habit updated!');
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this habit and all its logs?')) return;
    await api.deleteHabit(token, id);
    if (editing?._id === id) setEditing(null);
    await fetchData();
    toast.success('Habit deleted');
  };

  const handleCreateCategory = async (name: string) => {
    if (!token) throw new Error('Not authenticated');
    const cat = await api.createCategory(token, { name });
    setCategories((prev) => [...prev, cat]);
    toast.success(`Category "${name}" created`);
    return cat;
  };

  if (loading) return <ListSkeleton rows={8} />;

  return (
    <div className="space-y-8">
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <div>
        <h1 className="text-3xl font-bold gold-text">Manage Habits</h1>
        <p className="mt-1 text-[var(--muted)]">Add tasks with timers, categories & reminders</p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{editing ? 'Edit Habit' : 'Add New Habit'}</h2>
        <HabitForm
          key={editing?._id || 'new'}
          initial={editing}
          categories={categories}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={editing ? () => setEditing(null) : undefined}
          onCreateCategory={handleCreateCategory}
          submitLabel={editing ? 'Update Habit' : 'Add Habit'}
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Categories ({categories.length})</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Card
              key={cat._id}
              variant="neo"
              shine={false}
              padding="sm"
              hover={false}
              className="rounded-full px-4 py-2 text-sm"
              style={{ borderColor: `${cat.color}40` }}
            >
              {cat.icon} {cat.name}
            </Card>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Create categories when adding habits</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Your Habits ({habits.length})</h2>
        {habits.length === 0 ? (
          <Card variant="glass" shine={false} padding="lg" className="border-dashed text-center text-[var(--muted)]">
            <p className="text-4xl">📝</p>
            <p className="mt-2">No habits yet — add your first one above!</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {habits.map((habit) => {
              const catName =
                typeof habit.categoryId === 'object' && habit.categoryId
                  ? habit.categoryId.name
                  : null;
              return (
                <Card key={habit._id} variant="liquid" padding="sm" className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${habit.color}22` }}
                  >
                    {habit.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{habit.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {catName && `${catName} · `}
                      {habit.targetDurationMinutes > 0
                        ? `${habit.targetDurationMinutes} min timer`
                        : 'Checkbox'}
                      {habit.reminderEnabled && ` · ⏰ ${habit.reminderTime}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(habit)}
                      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--gold)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(habit._id)}
                      className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
