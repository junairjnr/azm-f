import { Card, CardContent } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card variant="liquid-gold" shine padding="md" className="group">
      <CardContent>
        <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
        <p className="mt-2 text-3xl font-bold gold-text transition-transform group-hover:scale-105">
          {value}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
