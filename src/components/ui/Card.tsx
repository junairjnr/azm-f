import { type ComponentPropsWithoutRef, type ElementType } from 'react';
import { cn, cardVariants, type CardVariant } from '@/lib/cn';

type CardOwnProps = {
  variant?: CardVariant;
  hover?: boolean;
  shine?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

type CardProps<T extends ElementType = 'div'> = CardOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps | 'as'>;

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card<T extends ElementType = 'div'>({
  variant = 'liquid',
  hover = true,
  shine = true,
  padding = 'md',
  as,
  className,
  children,
  ...props
}: CardProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        'relative overflow-hidden rounded-2xl',
        cardVariants[variant],
        shine && variant.startsWith('liquid') && 'card-shine',
        hover && 'card-hover',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative z-[2] mb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--foreground)]', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-[var(--muted)]', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative z-[2]', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative z-[2] mt-4 flex items-center gap-2', className)} {...props} />;
}

export default Card;
