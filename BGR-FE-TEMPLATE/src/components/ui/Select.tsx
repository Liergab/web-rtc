import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  disabled: boolean;
  onValueChange?: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a Select');
  }
  return context;
}

interface SelectProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Select({
  children,
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  disabled = false,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isValueControlled = controlledValue !== undefined;
  const isOpenControlled = controlledOpen !== undefined;
  
  const value = isValueControlled ? controlledValue : uncontrolledValue;
  const open = isOpenControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = (open: boolean) => {
    if (isOpenControlled) {
      onOpenChange?.(open);
    } else {
      setUncontrolledOpen(open);
    }
  };
  
  const setValue = (value: string) => {
    if (isValueControlled) {
      onValueChange?.(value);
    } else {
      setUncontrolledValue(value);
    }
    
    onValueChange?.(value);
    setOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open, setOpen]);
  
  // Close dropdown when pressing Escape
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);
  
  return (
    <SelectContext.Provider 
      value={{ 
        open, 
        setOpen, 
        value, 
        setValue, 
        disabled, 
        onValueChange, 
        triggerRef, 
        contentRef 
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  placeholder?: string;
}

export function SelectTrigger({
  className = '',
  children,
  placeholder,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, value, disabled, triggerRef } = useSelect();
  
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled}
      ref={triggerRef}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children || (value ? null : placeholder && <span className="text-gray-500">{placeholder}</span>)}
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
        className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
}

interface SelectValueProps {
  className?: string;
  placeholder?: string;
}

export function SelectValue({ className = '', placeholder }: SelectValueProps) {
  const { value } = useSelect();
  
  return (
    <span className={`block truncate ${value ? '' : 'text-gray-500'} ${className}`}>
      {value || placeholder}
    </span>
  );
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function SelectContent({
  className = '',
  children,
  align = 'start',
  sideOffset = 4,
  ...props
}: SelectContentProps) {
  const { open, contentRef, triggerRef } = useSelect();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Position the dropdown based on the trigger element
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    
    const updatePosition = () => {
      if (!triggerRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Basic positioning below the trigger
      let left = triggerRect.left + scrollX;
      if (align === 'center') {
        left = left + (triggerRect.width / 2 - (position.width / 2 || triggerRect.width / 2));
      } else if (align === 'end') {
        left = left + triggerRect.width - (position.width || triggerRect.width);
      }
      
      setPosition({
        top: triggerRect.bottom + scrollY + sideOffset,
        left,
        width: triggerRect.width,
      });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, triggerRef, align, sideOffset, position.width]);
  
  // Update width after content is rendered
  useEffect(() => {
    if (!open || !contentRef.current) return;
    
    const updateWidth = () => {
      if (!contentRef.current) return;
      setPosition(prev => ({ ...prev, width: contentRef.current?.offsetWidth || prev.width }));
    };
    
    updateWidth();
  }, [open, contentRef]);
  
  if (!open) return null;
  
  return (
    <div
      ref={contentRef}
      role="listbox"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex: 50,
      }}
      className={`border border-gray-200 bg-white rounded-md shadow-lg overflow-hidden max-h-60 outline-none ${className}`}
      {...props}
    >
      <div className="overflow-y-auto p-1">{children}</div>
    </div>
  );
}

interface SelectItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  className?: string;
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export function SelectItem({
  className = '',
  children,
  value,
  disabled = false,
  ...props
}: SelectItemProps) {
  const { value: selectedValue, setValue, disabled: selectDisabled } = useSelect();
  const isSelected = selectedValue === value;
  const isDisabled = disabled || selectDisabled;
  
  return (
    <li
      role="option"
      aria-selected={isSelected}
      data-value={value}
      data-disabled={isDisabled || undefined}
      className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        isSelected ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
      } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'} ${className}`}
      onClick={() => {
        if (!isDisabled) {
          setValue(value);
        }
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
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
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </span>
      <span className="truncate">{children}</span>
    </li>
  );
}

interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function SelectGroup({ className = '', children, ...props }: SelectGroupProps) {
  return (
    <div
      role="group"
      className={`p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function SelectLabel({ className = '', children, ...props }: SelectLabelProps) {
  return (
    <div
      className={`px-2 py-1.5 text-xs font-medium text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SelectSeparator({ className = '', ...props }: SelectSeparatorProps) {
  return (
    <div
      className={`-mx-1 my-1 h-px bg-gray-200 ${className}`}
      {...props}
    />
  );
} 