'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { SplashScreen } from '@/components/ui/Skeleton';
import { getAuthErrorMessage, useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const { register, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      router.replace('/dashboard');
    }
  }, [authLoading, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to AZM.');
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || token) return <SplashScreen />;

  return (
    <div className="auth-layout app-bg">
      <div className="relative flex w-full items-center justify-center px-4 py-12">
        <div className="gold-orb gold-orb-1" />
        <div className="gold-orb gold-orb-2" />
        <div className="w-full max-w-md">
          <div className="auth-panel rounded-3xl p-6 backdrop-blur-xl sm:p-8">
            <Logo variant="full" size="md" framed={false} priority className="mb-6" />
            <h1 className="text-center text-2xl font-bold gold-text">Create account</h1>
            <p className="mt-2 text-center text-sm text-[var(--muted)]">Free to get started</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field w-full rounded-xl px-4 py-3.5"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full rounded-xl px-4 py-3.5"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field w-full rounded-xl px-4 py-3.5"
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full rounded-xl py-3.5 text-sm disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold gold-text hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
