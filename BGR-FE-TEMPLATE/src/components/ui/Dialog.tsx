import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: DialogProps) {
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
    <DialogContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function DialogTrigger({
  children,
  asChild = false,
  className = '',
  ...props
}: DialogTriggerProps) {
  const { setOpen, triggerRef } = useDialog();
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref: triggerRef,
      onClick: () => setOpen(true),
      ...props
    });
  }
  
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

interface DialogPortalProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogPortal({ children, className = '' }: DialogPortalProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DialogOverlay({ className = '', ...props }: DialogOverlayProps) {
  const { setOpen } = useDialog();
  
  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all ${className}`}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({
  children,
  className = '',
  ...props
}: DialogContentProps) {
  const { open, setOpen, contentRef } = useDialog();
  
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
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={`relative z-50 grid w-full max-w-lg scale-100 gap-4 bg-white p-6 shadow-lg sm:rounded-lg opacity-100 transform-none ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  );
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({
  children,
  className = '',
  ...props
}: DialogHeaderProps) {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({
  children,
  className = '',
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({
  children,
  className = '',
  ...props
}: DialogTitleProps) {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function DialogDescription({
  children,
  className = '',
  ...props
}: DialogDescriptionProps) {
  return (
    <p
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function DialogClose({
  className = '',
  ...props
}: DialogCloseProps) {
  const { setOpen } = useDialog();
  
  return (
    <button
      type="button"
      className={`absolute right-4 top-4 inline-flex items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      onClick={() => setOpen(false)}
      {...props}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  );
} 