import Logo from '@/components/Logo';

export function SplashScreen() {
  return (
    <div className="splash-screen flex min-h-screen flex-col items-center justify-center px-6">
      <Logo variant="full" size="xl" animate priority />
      <p className="mt-10 text-sm text-[var(--muted)]">Loading your dashboard...</p>
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--gold)]"
            style={{ animation: `pulse-gold 1.5s infinite ${i * 0.25}s` }}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-2 h-9 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}
