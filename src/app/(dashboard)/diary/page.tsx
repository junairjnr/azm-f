'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import { MOOD_OPTIONS } from '@/lib/utils';
import type { DiaryEntry } from '@/types';

export default function DiaryPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('good');
  const [date, setDate] = useState(formatDate());
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getDiaryEntries(token);
      setEntries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !content.trim()) return;
    setSaving(true);
    try {
      await api.createDiaryEntry(token, { date, title, content, mood });
      setTitle('');
      setContent('');
      setMood('good');
      setShowForm(false);
      await fetchEntries();
      toast.success('Diary entry saved!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this entry?')) return;
    await api.deleteDiaryEntry(token, id);
    await fetchEntries();
    toast.success('Entry deleted');
  };

  if (loading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold gold-text sm:text-3xl">Diary</h1>
          <p className="mt-1 text-[var(--muted)]">Write your thoughts and reflect on your day</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-gold flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </div>

      {showForm && (
        <Card
          as="form"
          variant="clay"
          shine={false}
          padding="lg"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mood</label>
              <div className="flex gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`rounded-xl px-3 py-2 text-lg transition ${
                      mood === m.value ? 'ring-2 ring-[var(--gold)] bg-[var(--gold)]/10' : 'bg-[var(--surface-hover)]'
                    }`}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full rounded-xl px-4 py-3"
              placeholder="Today's highlight..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Write your diary</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="input-field w-full rounded-xl px-4 py-3"
              placeholder="Dear diary, today I..."
            />
          </div>
          <button type="submit" disabled={saving} className="btn-gold rounded-xl px-6 py-3 text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </Card>
      )}

      {entries.length === 0 ? (
        <Card variant="glass" shine={false} padding="lg" className="text-center">
          <p className="text-6xl">📔</p>
          <p className="mt-4 text-lg font-medium">No diary entries yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Start writing about your day!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const moodEmoji = MOOD_OPTIONS.find((m) => m.value === entry.mood)?.emoji || '😊';
            return (
              <Card key={entry._id} variant="liquid" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moodEmoji}</span>
                      {entry.title && (
                        <h3 className="text-lg font-semibold">{entry.title}</h3>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="rounded-lg p-2 text-[var(--muted)] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">
                  {entry.content}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
