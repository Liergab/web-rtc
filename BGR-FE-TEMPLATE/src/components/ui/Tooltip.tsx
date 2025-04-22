import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface TooltipProviderContextValue {
  delayDuration: number;
  skipDelayDuration: number;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue>({
  delayDuration: 700,
  skipDelayDuration: 300,
});

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function TooltipProvider({
  children,
  delayDuration = 700,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration, skipDelayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  );
}

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  content: React.ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a Tooltip');
  }
  return context;
}

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  children,
  content,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLElement>(null);
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
    <TooltipContext.Provider value={{ open, setOpen, content, triggerRef, contentRef }}>
      {children}
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactElement;
  asChild?: boolean;
}

export function TooltipTrigger({ children, asChild = false, ...props }: TooltipTriggerProps) {
  const { setOpen, triggerRef } = useTooltip();
  const { delayDuration, skipDelayDuration } = useContext(TooltipProviderContext);
  
  let showTimeout: number | undefined;
  let hideTimeout: number | undefined;
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    clearTimeout(hideTimeout);
    showTimeout = window.setTimeout(() => {
      setOpen(true);
    }, delayDuration);
    
    children.props.onMouseEnter?.(e);
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    clearTimeout(showTimeout);
    hideTimeout = window.setTimeout(() => {
      setOpen(false);
    }, skipDelayDuration);
    
    children.props.onMouseLeave?.(e);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    setOpen(true);
    children.props.onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setOpen(false);
    children.props.onBlur?.(e);
  };
  
  useEffect(() => {
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);
  
  if (asChild) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ...props,
    });
  }
  
  return React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ...props,
  });
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function TooltipContent({
  className = '',
  side = 'top',
  align = 'center',
  sideOffset = 4,
  ...props
}: TooltipContentProps) {
  const { open, content, contentRef, triggerRef } = useTooltip();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Position the tooltip based on the trigger element
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    
    const updatePosition = () => {
      if (!triggerRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
      
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Calculate position based on side and align
      let top = 0;
      let left = 0;
      
      switch (side) {
        case 'top':
          top = triggerRect.top - contentRect.height - sideOffset + scrollY;
          break;
        case 'right':
          left = triggerRect.right + sideOffset + scrollX;
          break;
        case 'bottom':
          top = triggerRect.bottom + sideOffset + scrollY;
          break;
        case 'left':
          left = triggerRect.left - contentRect.width - sideOffset + scrollX;
          break;
      }
      
      switch (align) {
        case 'start':
          if (side === 'top' || side === 'bottom') {
            left = triggerRect.left + scrollX;
          } else {
            top = triggerRect.top + scrollY;
          }
          break;
        case 'center':
          if (side === 'top' || side === 'bottom') {
            left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + scrollX;
          } else {
            top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2) + scrollY;
          }
          break;
        case 'end':
          if (side === 'top' || side === 'bottom') {
            left = triggerRect.right - contentRect.width + scrollX;
          } else {
            top = triggerRect.bottom - contentRect.height + scrollY;
          }
          break;
      }
      
      setPosition({ top, left });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, side, align, sideOffset, triggerRef]);
  
  if (!open) return null;
  
  // Get arrow position and styling
  const getArrowStyle = () => {
    let arrowStyle: React.CSSProperties = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      transform: 'rotate(45deg)',
      backgroundColor: 'white',
    };
    
    switch (side) {
      case 'top':
        arrowStyle = {
          ...arrowStyle,
          bottom: '-4px',
          left: '50%',
          marginLeft: '-4px',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'right':
        arrowStyle = {
          ...arrowStyle,
          left: '-4px',
          top: '50%',
          marginTop: '-4px',
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'bottom':
        arrowStyle = {
          ...arrowStyle,
          top: '-4px',
          left: '50%',
          marginLeft: '-4px',
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'left':
        arrowStyle = {
          ...arrowStyle,
          right: '-4px',
          top: '50%',
          marginTop: '-4px',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        };
        break;
    }
    
    return arrowStyle;
  };
  
  return (
    <div
      ref={contentRef}
      role="tooltip"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
      }}
      className={`z-50 overflow-hidden rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border border-gray-200 ${className}`}
      data-side={side}
      {...props}
    >
      <div style={getArrowStyle()} className="tooltip-arrow" />
      {content}
    </div>
  );
} 