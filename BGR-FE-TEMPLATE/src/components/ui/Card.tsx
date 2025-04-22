import React from 'react';
import { tw } from '../../utils/tw-merge';

// Types
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  as?: React.ElementType;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// Components
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={tw('rounded-lg border border-gray-200 bg-white shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={tw('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={tw('text-lg font-semibold text-gray-900', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={tw('text-sm text-gray-500', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={tw('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={tw('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
