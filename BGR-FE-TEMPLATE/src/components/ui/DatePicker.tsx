import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from './Calendar';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  format?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
  minDate,
  maxDate,
  clearable = true,
  format = 'MM/dd/yyyy'
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [open, setOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    
    const replacers: Record<string, () => string> = {
      'yyyy': () => date.getFullYear().toString(),
      'MM': () => (date.getMonth() + 1).toString().padStart(2, '0'),
      'M': () => (date.getMonth() + 1).toString(),
      'dd': () => date.getDate().toString().padStart(2, '0'),
      'd': () => date.getDate().toString(),
    };
    
    return format.replace(/yyyy|MM|M|dd|d/g, (match) => {
      return replacers[match] ? replacers[match]() : match;
    });
  };
  
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    onChange?.(newDate);
    setOpen(false);
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onChange?.(undefined);
  };
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div className={`relative inline-block w-full ${className}`} ref={datePickerRef}>
      <div
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md 
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'}
          ${open ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
        `}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-2 text-gray-500"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className={!date ? 'text-gray-500' : ''}>
            {date ? formatDate(date) : placeholder}
          </span>
        </div>
        
        <div className="flex items-center">
          {clearable && date && (
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={handleClear}
              aria-label="Clear date"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          
          <div className="pl-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`${open ? 'rotate-180' : ''} transition-transform duration-200 text-gray-500`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      {open && (
        <div className="absolute z-10 mt-1 w-full">
          <Calendar
            month={date || new Date()}
            selected={date}
            onDateChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
} 