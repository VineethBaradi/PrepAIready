
import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'neo';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false, 
    className, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none';
    
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-md hover:shadow-lg active:shadow',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      glass: 'glass-btn text-foreground',
      neo: 'neo-btn text-foreground'
    };
    
    const sizeStyles = {
      sm: 'text-xs h-8 px-3',
      md: 'text-sm h-10 px-4',
      lg: 'text-base h-12 px-6'
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          'active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
