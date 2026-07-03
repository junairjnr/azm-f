'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Sun,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import Logo from '@/components/Logo';

const navItems = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: ListChecks },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/summary', label: 'Summary', icon: ChartColumn },
  { href: '/diary', label: 'Diary', icon: BookOpen },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Today',
  '/habits': 'Habits',
  '/calendar': 'Calendar',
  '/summary': 'Summary',
  '/diary': 'Diary',
  '/expenses': 'Expenses',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const openMobile = () => setMobileOpen(true);
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    closeMobile();
  }, [pathname]);

  const navLinks = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={closeMobile}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium ${
              active ? 'nav-active' : 'nav-inactive'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const navFooter = (
    <div className="mt-auto shrink-0 space-y-2 border-t border-[var(--sidebar-border)] pt-3">
      <button
        type="button"
        onClick={() => {
          toggleTheme();
          toast.info(theme === 'dark' ? 'Switched to light mode ☀️' : 'Switched to dark mode 🌙');
        }}
        className="nav-inactive hidden w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] lg:flex"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      <div className="nav-user-pill rounded-lg px-3 py-2">
        <p className="truncate text-xs font-semibold">{user?.name}</p>
        <p className="truncate text-[11px] opacity-80">{user?.email}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          toast.info('Signed out successfully');
          logout();
        }}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-red-400 transition hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      <header className="mobile-topbar lg:hidden">
        <button
          type="button"
          onClick={openMobile}
          className="mobile-topbar-btn"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5 pointer-events-none" />
        </button>

        <p className="min-w-0 flex-1 truncate px-1 text-center text-sm font-semibold text-[var(--nav-fg)]">
          {pageTitle}
        </p>

        <button
          type="button"
          onClick={() => {
            toggleTheme();
            // toast.info(theme === 'dark' ? 'Light mode ☀️' : 'Dark mode 🌙');
          }}
          className="mobile-topbar-btn"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 pointer-events-none" />
          ) : (
            <Moon className="h-5 w-5 pointer-events-none" />
          )}
        </button>
      </header>

      <aside className="sidebar-panel hidden w-56 shrink-0 flex-col p-4 lg:flex">
        <div className="sidebar-logo mb-4 border-b border-[var(--nav-border)] pb-4">
          <Logo variant="sidebar" size="sm" framed={false} priority/>
        </div>
        {navLinks}
        {navFooter}
      </aside>

      {mobileOpen && (
        <div className="mobile-drawer lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="mobile-drawer-backdrop"
            onClick={closeMobile}
            aria-label="Close menu overlay"
          />
          <aside
            className="mobile-drawer-panel sidebar-panel flex justify-center itemcenter w-64 shrink-0 flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header mb-4 flex items-center justify-between border-b border-[var(--nav-border)] pb-4">
              <Logo variant="sidebar" size="xs" framed={false} />
              <button
                type="button"
                onClick={closeMobile}
                className="mobile-topbar-btn mobile-drawer-close"
                aria-label="Close menu"
              >
                <X className="h-3 w-3 pointer-events-none" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4 pt-2">
              {navLinks}
              {navFooter}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
