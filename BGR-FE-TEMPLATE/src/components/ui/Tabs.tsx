import React, { createContext, useContext, useState, useEffect } from 'react';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component');
  }
  return context;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children?: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  className = '',
  children,
  ...props
}: TabsProps) {
  const [tabValue, setTabValue] = useState(value || defaultValue);
  
  useEffect(() => {
    if (value !== undefined) {
      setTabValue(value);
    }
  }, [value]);
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value: tabValue, setValue: handleValueChange, orientation }}>
      <div 
        className={`w-full ${orientation === 'vertical' ? 'flex' : ''} ${className}`}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function TabsList({ className = '', children, ...props }: TabsListProps) {
  const { orientation } = useTabs();
  
  return (
    <div
      role="tablist"
      className={`flex ${
        orientation === 'horizontal' 
          ? 'flex-row border-b border-gray-200' 
          : 'flex-col border-r border-gray-200 pr-2'
      } ${className}`}
      data-orientation={orientation}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function TabsTrigger({
  value,
  className = '',
  children,
  disabled = false,
  ...props
}: TabsTriggerProps) {
  const { value: selectedValue, setValue, orientation } = useTabs();
  const isSelected = selectedValue === value;
  
  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`panel-${value}`}
      data-state={isSelected ? 'active' : 'inactive'}
      data-orientation={orientation}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        orientation === 'horizontal'
          ? `px-4 py-2 -mb-px ${
              isSelected
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
            }`
          : `px-4 py-2 -mr-px ${
              isSelected
                ? 'border-r-2 border-blue-500 text-blue-600'
                : 'border-r-2 border-transparent text-gray-500 hover:text-gray-700'
            }`
      } ${className}`}
      onClick={() => !disabled && setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export function TabsContent({
  value,
  className = '',
  children,
  ...props
}: TabsContentProps) {
  const { value: selectedValue, orientation } = useTabs();
  const isSelected = selectedValue === value;
  
  if (!isSelected) return null;
  
  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      data-state={isSelected ? 'active' : 'inactive'}
      data-orientation={orientation}
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        orientation === 'vertical' ? 'flex-1 pl-6' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 