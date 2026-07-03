import InstallPrompt from '@/components/InstallPrompt';
import NotificationManager from '@/components/NotificationManager';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="app-bg relative flex min-h-screen text-[var(--foreground)]">
        <div className="gold-orb gold-orb-1 opacity-60" />
        <div className="gold-orb gold-orb-2 opacity-50" />
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-3 py-5 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:px-4 lg:px-6 lg:py-6 lg:pt-6">{children}</div>
        </main>
        <NotificationManager />
        <NotificationPermissionBanner />
        <InstallPrompt />
      </div>
    </ProtectedRoute>
  );
}
