import React from 'react';
import { tw } from '../../utils/tw-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional label for the input
   */
  label?: string;
  /**
   * Helper text to be displayed below the input
   */
  helperText?: string;
  /**
   * Error message to be displayed below the input
   */
  error?: string;
  /**
   * Whether the input is full width
   */
  fullWidth?: boolean;
  /**
   * Class name for the label
   */
  labelClassName?: string;
  /**
   * Class name for the container
   */
  containerClassName?: string;
  /**
   * Class name for the helper text
   */
  helperTextClassName?: string;
  /**
   * Whether the input is in a success state
   */
  isSuccess?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      type = 'text',
      labelClassName,
      containerClassName,
      helperTextClassName,
      isSuccess = false,
      ...props
    },
    ref
  ) => {
    // Base classes for the input
    const baseClasses =
      'block px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-avocado-500)] sm:text-sm';

    // Additional classes based on the input state
    const stateClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : isSuccess
        ? 'border-green-300 text-green-900 placeholder-green-400 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 placeholder-gray-400 focus:border-[var(--color-avocado-500)]';

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes
    const inputClasses = tw(baseClasses, stateClasses, widthClasses, className);

    return (
      <div className={tw('mb-4', containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className={tw('block text-sm font-medium text-gray-700 mb-1', labelClassName)}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-description` : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${props.id}-description`}
            className={tw('mt-1 text-sm text-gray-500', helperTextClassName)}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
