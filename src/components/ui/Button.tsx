import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex min-h-11 items-center justify-center whitespace-nowrap font-medium transition-all duration-200 touch-manipulation select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] shadow-lg shadow-indigo-500/30':
              variant === 'primary',
            'bg-slate-200 text-slate-900 hover:bg-slate-300 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]': variant === 'danger',
            'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white': variant === 'ghost',
          },
          {
            'px-3.5 py-2 text-sm rounded-lg': size === 'sm',
            'px-4 py-2.5 text-base sm:text-sm rounded-xl': size === 'md',
            'px-6 py-3 text-base sm:text-lg rounded-2xl': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
