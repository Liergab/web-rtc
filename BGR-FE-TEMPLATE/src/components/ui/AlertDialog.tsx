import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AlertDialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialogProvider');
  }
  return context;
}

interface AlertDialogProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = (open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setUncontrolledOpen(open);
    }
  };
  
  return (
    <AlertDialogContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogTrigger({
  children,
  className = '',
  ...props
}: AlertDialogTriggerProps) {
  const { setOpen, triggerRef } = useAlertDialog();
  
  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={() => setOpen(true)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({
  children,
  className = '',
  ...props
}: AlertDialogContentProps) {
  const { open, setOpen, contentRef } = useAlertDialog();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);
  
  // Handle click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node) &&
          overlayRef.current && overlayRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [contentRef, setOpen]);
  
  // Handle body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  if (!open) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className={`relative bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full transform transition-all ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogHeader({
  children,
  className = '',
  ...props
}: AlertDialogHeaderProps) {
  return (
    <div
      className={`mb-4 text-center sm:text-left ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogFooter({
  children,
  className = '',
  ...props
}: AlertDialogFooterProps) {
  return (
    <div
      className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogTitle({
  children,
  className = '',
  ...props
}: AlertDialogTitleProps) {
  return (
    <h2
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogDescription({
  children,
  className = '',
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <p
      className={`mt-2 text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogCancel({
  children,
  className = '',
  ...props
}: AlertDialogCancelProps) {
  const { setOpen } = useAlertDialog();
  
  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className={`inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogAction({
  children,
  className = '',
  onClick,
  ...props
}: AlertDialogActionProps) {
  const { setOpen } = useAlertDialog();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(false);
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`mb-2 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mb-0 sm:w-auto ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 