'use client';

import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import RegisterPWA from '@/components/RegisterPWA';
import ThemeTransition from '@/components/ThemeTransition';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeTransition />
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <RegisterPWA />
            {children}
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
