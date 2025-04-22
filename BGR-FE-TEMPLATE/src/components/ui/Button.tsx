import React from 'react';
import { tw } from '../../utils/tw-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the button takes up the full width
   */
  fullWidth?: boolean;
  /**
   * Whether the button is currently loading
   */
  isLoading?: boolean;
  /**
   * Content to display when button is in loading state
   */
  loadingText?: string;
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    // Base classes for all buttons
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-avocado-500)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    // Classes for different variants
    const variantClasses = {
      default: 'bg-gray-900 text-white hover:bg-gray-800',
      primary: 'bg-[var(--color-avocado-600)] text-white hover:bg-[var(--color-avocado-500)]',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
      ghost: 'bg-transparent hover:bg-gray-100',
      link: 'bg-transparent underline-offset-4 hover:underline text-[var(--color-avocado-600)] p-0 h-auto',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
    };

    // Classes for different sizes
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-10 px-4 py-2 text-sm rounded-md',
      lg: 'h-12 px-6 py-3 text-base rounded-lg',
    };

    // Classes for full width
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes using the tw utility
    const buttonClasses = tw(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    );

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || isLoading} {...props}>
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
