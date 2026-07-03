'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import Card, { CardTitle } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils';
import type { Expense } from '@/types';

export default function ExpensesPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDate());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [month, setMonth] = useState(formatDate().slice(0, 7));
  const [saving, setSaving] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getExpenses(token, { month });
      setExpenses(data.expenses);
      setTotal(data.total);
      setByCategory(data.byCategory);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, month]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !amount) return;
    setSaving(true);
    try {
      await api.createExpense(token, {
        amount: Number(amount),
        category,
        description,
        date,
        paymentMethod,
      });
      setAmount('');
      setDescription('');
      setShowForm(false);
      await fetchExpenses();
      toast.success('Expense added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this expense?')) return;
    await api.deleteExpense(token, id);
    await fetchExpenses();
    toast.success('Expense removed');
  };

  if (loading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gold-text sm:text-3xl">Expenses</h1>
          <p className="mt-1 text-[var(--muted)]">Track your spending</p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Spent" value={`₹${total.toLocaleString()}`} subtitle="this month" />
        <StatCard title="Transactions" value={expenses.length} subtitle="this month" />
        <StatCard
          title="Top Category"
          value={
            Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || '—'
          }
          subtitle={
            Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0]
              ? `₹${Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0][1]}`
              : 'no data'
          }
        />
      </div>

      {Object.keys(byCategory).length > 0 && (
        <Card variant="neo" shine={false} padding="md">
          <CardTitle className="mb-3">By Category</CardTitle>
          <div className="space-y-2">
            {Object.entries(byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span>{cat}</span>
                  <span className="font-semibold text-[var(--gold)]">₹{amt.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </Card>
      )}

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
              <label className="mb-1 block text-sm font-medium">Amount (₹)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="input-field w-full rounded-xl px-4 py-3"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-3"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-3"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-3"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full rounded-xl px-4 py-3"
              placeholder="What was this for?"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-gold rounded-xl px-6 py-3 text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Expense'}
          </button>
        </Card>
      )}

      {expenses.length === 0 ? (
        <Card variant="glass" shine={false} padding="lg" className="text-center">
          <p className="text-6xl">💰</p>
          <p className="mt-4 text-lg font-medium">No expenses this month</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card key={expense._id} variant="liquid" padding="sm" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-xl">
                💸
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{expense.description || expense.category}</p>
                <p className="text-xs text-[var(--muted)]">
                  {expense.category} · {expense.paymentMethod} ·{' '}
                  {new Date(expense.date + 'T12:00:00').toLocaleDateString()}
                </p>
              </div>
              <p className="text-lg font-bold text-[var(--gold)]">
                ₹{expense.amount.toLocaleString()}
              </p>
              <button
                onClick={() => handleDelete(expense._id)}
                className="rounded-lg p-2 text-[var(--muted)] hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
