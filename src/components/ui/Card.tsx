import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          {
            'bg-white': variant === 'default',
            'bg-white border-2 border-slate-200': variant === 'bordered',
            'bg-white shadow-xl shadow-slate-200/50': variant === 'elevated',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';