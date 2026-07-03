'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import Logo from '@/components/Logo';
import Card, { CardDescription, CardTitle } from '@/components/ui/Card';
import PhoneMockup from '@/components/landing/PhoneMockup';

const features = [
  {
    title: 'Habit building & management',
    desc: 'Set goals, pick timers, and organize habits by category. Build routines that actually stick with our clean daily tracker.',
    screen: 'habits' as const,
    reverse: false,
    variant: 'clay' as const,
  },
  {
    title: 'Statistics & streaks',
    desc: 'Monitor progress with charts, completion rates, and streak milestones. Celebrate wins and stay motivated every day.',
    screen: 'stats' as const,
    reverse: true,
    variant: 'neo' as const,
  },
  {
    title: 'Calendar tracking',
    desc: 'See your full habit history in a beautiful day-by-day view. Spot patterns and never lose track of your consistency.',
    screen: 'calendar' as const,
    reverse: false,
    variant: 'glass' as const,
  },
  {
    title: 'Diary & expenses',
    desc: 'Reflect in your personal diary and track spending — all in one premium white & gold dashboard.',
    screen: 'diary' as const,
    reverse: true,
    variant: 'liquid' as const,
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Logo variant="full" size="md" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="landing-link">
            Sign in
          </Link>
          <Link href="/register" className="btn-gold rounded-full px-5 py-2.5 text-sm">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero — like Productive with fan of phone mockups */}
      <section className="landing-hero">
        <div className="landing-hero-text">
          <p className="landing-badge">✦ Premium habit tracker</p>
          <h1 className="landing-title">
            Make this your most
            <span className="gold-text block">successful year ever</span>
          </h1>
          <p className="landing-subtitle">
            Discover HabitFlow — build positive life-changing habits. Track tasks, timers,
            diary entries, and expenses with smart reminders every day.
          </p>
          <Link href="/register" className="btn-gold landing-cta inline-flex items-center gap-2 rounded-full px-8 py-4 text-base">
            Get started free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="landing-trust">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
              ))}
            </div>
            <span>Built for daily productivity</span>
          </div>
        </div>

        <div className="landing-phones">
          <PhoneMockup screen="calendar" className="phone-pos-1" />
          <PhoneMockup screen="stats" className="phone-pos-2" />
          <PhoneMockup screen="today" className="phone-pos-3" />
          <PhoneMockup screen="habits" className="phone-pos-4" />
          <PhoneMockup screen="diary" className="phone-pos-5" />
        </div>
      </section>

      {/* Feature sections with alternating mockups */}
      {features.map((f) => (
        <section key={f.title} className={`landing-feature ${f.reverse ? 'reverse' : ''}`}>
          <Card variant={f.variant} padding="lg" className="landing-feature-text max-w-xl">
            <CardTitle className="text-2xl">{f.title}</CardTitle>
            <CardDescription className="mt-3 text-base leading-relaxed">{f.desc}</CardDescription>
          </Card>
          <div className="landing-feature-visual">
            <PhoneMockup screen={f.screen} className="phone-feature" />
          </div>
        </section>
      ))}

      <section className="landing-bottom-cta">
        <Card variant="liquid-gold" padding="lg" className="mx-auto max-w-2xl text-center">
          <h2 className="gold-text text-3xl font-bold">Build habits that change your life</h2>
          <p className="mt-3 text-[var(--muted)]">Start free today — no credit card required.</p>
          <Link href="/register" className="btn-gold mt-8 inline-flex rounded-full px-10 py-4 text-base font-semibold">
            Try HabitFlow free
          </Link>
        </Card>
      </section>

      <footer className="landing-footer">
        <Logo variant="sidebar" size="sm" />
        <p>© {new Date().getFullYear()} AZM. All rights reserved.</p>
      </footer>
    </div>
  );
}
