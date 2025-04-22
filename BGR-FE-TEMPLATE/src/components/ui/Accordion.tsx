import React, { createContext, useContext, useState } from 'react';
import { tw } from '../../utils/tw-merge';

// Types
type AccordionItemContextValue = {
  open: boolean;
  value: string;
  onOpenChange: (open: boolean) => void;
};

type AccordionContextValue = {
  value: string | null;
  onValueChange: (value: string) => void;
  collapsible: boolean;
  type: 'single' | 'multiple';
  multiple: string[];
  onMultipleValueChange: (value: string) => void;
};

type AccordionProps = {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

type AccordionItemProps = {
  value: string;
  className?: string;
  children?: React.ReactNode;
};

type AccordionTriggerProps = {
  className?: string;
  children: React.ReactNode;
};

type AccordionContentProps = {
  className?: string;
  children?: React.ReactNode;
};

// Contexts
const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);
const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

// Hooks
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion');
  }
  return context;
};

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('useAccordionItem must be used within an AccordionItem');
  }
  return context;
};

// Component: Accordion
export function Accordion({
  type = 'single',
  collapsible = false,
  value,
  defaultValue,
  onValueChange,
  className = '',
  children,
  ...props
}: AccordionProps) {
  const [singleValue, setSingleValue] = useState<string | null>(
    value !== undefined ? value : defaultValue || null
  );
  const [multipleValue, setMultipleValue] = useState<string[]>(
    value !== undefined ? [value] : defaultValue ? [defaultValue] : []
  );

  const handleValueChange = (itemValue: string) => {
    if (type === 'single') {
      const newValue = singleValue === itemValue && collapsible ? null : itemValue;
      setSingleValue(newValue);
      onValueChange?.(newValue || '');
    } else {
      const newValue = [...multipleValue];
      const index = newValue.indexOf(itemValue);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(itemValue);
      }
      setMultipleValue(newValue);
    }
  };

  const handleMultipleValueChange = (itemValue: string) => {
    const newValue = [...multipleValue];
    const index = newValue.indexOf(itemValue);
    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(itemValue);
    }
    setMultipleValue(newValue);
    onValueChange?.(itemValue);
  };

  return (
    <AccordionContext.Provider
      value={{
        value: singleValue,
        onValueChange: handleValueChange,
        collapsible,
        type,
        multiple: multipleValue,
        onMultipleValueChange: handleMultipleValueChange,
      }}
    >
      <div className={`divide-y divide-gray-200 rounded-md ${className}`} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Component: AccordionItem
export function AccordionItem({ value, className = '', children, ...props }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  
  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  const { type, multiple } = context;
  const open = type === 'single' 
    ? context.value === value 
    : multiple.includes(value);

  const handleOpenChange = (openState: boolean) => {
    if (type === 'single') {
      context.onValueChange(value);
    } else {
      context.onMultipleValueChange(value);
    }
  };

  return (
    <AccordionItemContext.Provider value={{ open, value, onOpenChange: handleOpenChange }}>
      <div 
        className={`border-b border-gray-200 last:border-0 ${className}`} 
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// Component: AccordionTrigger
export function AccordionTrigger({ className = '', children, ...props }: AccordionTriggerProps) {
  const itemContext = useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }
  
  const { open, onOpenChange } = itemContext;

  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between py-4 px-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-50 ${className}`}
      onClick={() => onOpenChange(!open)}
      aria-expanded={open}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      <span>{children}</span>
      <span className="ml-2 flex-shrink-0 transition-transform duration-200 ease-out" data-state={open ? 'open' : 'closed'}>
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
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </button>
  );
}

// Component: AccordionContent
export function AccordionContent({ className = '', children, ...props }: AccordionContentProps) {
  const itemContext = useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }
  
  const { open } = itemContext;

  return (
    <div
      className={`overflow-hidden text-sm transition-all ${
        open ? 'max-h-96' : 'max-h-0'
      } ${className}`}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      <div className="pb-4 pt-0 px-4">{children}</div>
    </div>
  );
}
