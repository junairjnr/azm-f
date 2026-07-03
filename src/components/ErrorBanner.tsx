import { Card, CardContent } from '@/components/ui/Card';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <Card variant="glass" shine={false} padding="md" hover={false} className="mb-6 border-red-300/30">
      <CardContent>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="card-neo mt-3 rounded-xl px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400"
          >
            Try again
          </button>
        )}
      </CardContent>
    </Card>
  );
}
