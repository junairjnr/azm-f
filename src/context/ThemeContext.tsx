'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  isTransitioning: boolean;
  transitionTheme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const TRANSITION_MS = 1200;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('habit_tracker_theme') as Theme | null;
    const preferred = stored || 'light';
    setTheme(preferred);
    setTransitionTheme(preferred);
    document.documentElement.classList.toggle('dark', preferred === 'dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('habit_tracker_theme', theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTransitionTheme(next);
    setIsTransitioning(true);

    window.setTimeout(() => {
      setTheme(next);
    }, 120);

    window.setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_MS);
  }, [theme]);

  if (!mounted) {
    return <div className="app-bg min-h-screen bg-white" />;
  }

  return (
    <ThemeContext.Provider value={{ theme, isTransitioning, transitionTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
