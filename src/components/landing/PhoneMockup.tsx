import type { ReactNode } from 'react';

type Screen = 'today' | 'stats' | 'habits' | 'calendar' | 'diary';

interface PhoneMockupProps {
  screen?: Screen;
  className?: string;
  label?: string;
}

const screens: Record<Screen, ReactNode> = {
  today: (
    <div className="mock-screen-inner">
      <div className="mock-header">Today</div>
      <div className="mock-stat-row">
        <div className="mock-stat gold" />
        <div className="mock-stat" />
      </div>
      {['🚶 Walking', '📚 Study', '📖 Read'].map((h) => (
        <div key={h} className="mock-habit">
          <span>{h.split(' ')[0]}</span>
          <span className="mock-habit-text">{h.split(' ').slice(1).join(' ')}</span>
          <div className="mock-check done" />
        </div>
      ))}
    </div>
  ),
  stats: (
    <div className="mock-screen-inner">
      <div className="mock-header">Summary</div>
      <div className="mock-chart">
        {[60, 80, 45, 90, 70, 85].map((h, i) => (
          <div key={i} className="mock-bar" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mock-stat-row">
        <div className="mock-stat gold wide" />
        <div className="mock-stat wide" />
      </div>
    </div>
  ),
  habits: (
    <div className="mock-screen-inner">
      <div className="mock-header">Habits</div>
      {['💪 Gym', '💻 Code', '🙏 Prayer'].map((h, i) => (
        <div key={h} className="mock-habit-card" style={{ opacity: 1 - i * 0.12 }}>
          <span>{h.split(' ')[0]}</span>
          <div>
            <div className="mock-line" />
            <div className="mock-line short" />
          </div>
        </div>
      ))}
    </div>
  ),
  calendar: (
    <div className="mock-screen-inner">
      <div className="mock-header">Calendar</div>
      <div className="mock-grid">
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className={`mock-cell ${i % 3 === 0 ? 'done' : ''}`} />
        ))}
      </div>
    </div>
  ),
  diary: (
    <div className="mock-screen-inner">
      <div className="mock-header">Diary</div>
      <div className="mock-diary">
        <div className="mock-line" />
        <div className="mock-line" />
        <div className="mock-line short" />
        <div className="mock-line" />
        <div className="mock-line medium" />
      </div>
    </div>
  ),
};

export default function PhoneMockup({ screen = 'today', className = '', label }: PhoneMockupProps) {
  return (
    <div className={`phone-mockup ${className}`}>
      <div className="phone-frame">
        <div className="phone-notch" />
        {screens[screen]}
      </div>
      {label && <p className="mt-3 text-center text-xs font-medium text-[var(--muted)]">{label}</p>}
    </div>
  );
}
