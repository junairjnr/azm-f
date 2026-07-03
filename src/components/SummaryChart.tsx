'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { SummaryData } from '@/types';
import { formatDisplayDate } from '@/lib/auth';

interface SummaryChartProps {
  data: SummaryData['chartData'];
}

export default function SummaryChart({ data }: SummaryChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatDisplayDate(item.date).split(',')[0],
  }));

  return (
    <Card variant="neo" shine={false} padding="md" className="h-80 w-full">
      <CardHeader>
        <CardTitle>Daily Completion</CardTitle>
      </CardHeader>
      <CardContent className="h-[85%]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                color: 'var(--foreground)',
                backdropFilter: 'blur(12px)',
              }}
            />
            <Bar dataKey="completed" fill="#D4AF37" radius={[8, 8, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
