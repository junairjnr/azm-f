'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/ui/Skeleton';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [token, loading, router]);

  if (loading) return <SplashScreen />;
  if (!token) return null;

  return <>{children}</>;
}
