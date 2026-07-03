import InstallPrompt from '@/components/InstallPrompt';
import NotificationManager from '@/components/NotificationManager';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="app-bg app-shell text-[var(--foreground)]">
        <div className="gold-orb gold-orb-1 opacity-60" />
        <div className="gold-orb gold-orb-2 opacity-50" />
        <Sidebar />
        <main className="app-main">
          <div className="app-content">{children}</div>
        </main>
        <NotificationManager />
        <NotificationPermissionBanner />
        <InstallPrompt />
      </div>
    </ProtectedRoute>
  );
}
