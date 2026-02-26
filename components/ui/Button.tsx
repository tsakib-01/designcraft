import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?:    'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-100 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:   'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm hover:shadow-glow-md',
      secondary: 'bg-surface-400 hover:bg-surface-500 text-white',
      ghost:     'hover:bg-surface-300 text-gray-300 hover:text-white',
      danger:    'bg-red-600 hover:bg-red-500 text-white',
      outline:   'border border-surface-500 hover:border-brand-500 text-gray-300 hover:text-white hover:bg-surface-300',
    };

    const sizes = {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
