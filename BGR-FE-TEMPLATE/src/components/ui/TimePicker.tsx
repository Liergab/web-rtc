import React, { useState, useRef, useEffect } from 'react';

interface Time {
  hours: number;
  minutes: number;
  period?: 'AM' | 'PM';
}

interface TimePickerProps {
  value?: Time;
  onChange?: (time: Time | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  use24Hour?: boolean;
  clearable?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 20 | 30;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className = '',
  use24Hour = false,
  clearable = true,
  minuteStep = 15
}: TimePickerProps) {
  const [time, setTime] = useState<Time | undefined>(value);
  const [open, setOpen] = useState(false);
  const timePickerRef = useRef<HTMLDivElement>(null);
  
  // Generate hours options
  const hoursOptions = Array.from(
    { length: use24Hour ? 24 : 12 },
    (_, i) => use24Hour ? i : (i === 0 ? 12 : i)
  );
  
  // Generate minutes options
  const minutesOptions = Array.from(
    { length: 60 / minuteStep },
    (_, i) => i * minuteStep
  );
  
  // Format time to display
  const formatTime = (time: Time | undefined): string => {
    if (!time) return '';
    
    const formattedHours = time.hours.toString().padStart(2, '0');
    const formattedMinutes = time.minutes.toString().padStart(2, '0');
    
    if (use24Hour) {
      return `${formattedHours}:${formattedMinutes}`;
    } else {
      return `${formattedHours}:${formattedMinutes} ${time.period}`;
    }
  };
  
  // Handle hour change
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hours = parseInt(e.target.value, 10);
    if (time) {
      const newTime = { ...time, hours };
      setTime(newTime);
      onChange?.(newTime);
    } else {
      const newTime = { 
        hours, 
        minutes: 0,
        period: use24Hour ? undefined : 'AM'
      };
      setTime(newTime);
      onChange?.(newTime);
    }
  };
  
  // Handle minute change
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const minutes = parseInt(e.target.value, 10);
    if (time) {
      const newTime = { ...time, minutes };
      setTime(newTime);
      onChange?.(newTime);
    } else {
      const newTime = { 
        hours: use24Hour ? 0 : 12, 
        minutes,
        period: use24Hour ? undefined : 'AM'
      };
      setTime(newTime);
      onChange?.(newTime);
    }
  };
  
  // Handle period change (AM/PM)
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value as 'AM' | 'PM';
    if (time) {
      const newTime = { ...time, period };
      setTime(newTime);
      onChange?.(newTime);
    } else {
      const newTime = { 
        hours: 12, 
        minutes: 0,
        period
      };
      setTime(newTime);
      onChange?.(newTime);
    }
  };
  
  // Handle clear button click
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTime(undefined);
    onChange?.(undefined);
  };
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node)) {
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
    <div className={`relative inline-block w-full ${className}`} ref={timePickerRef}>
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
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className={!time ? 'text-gray-500' : ''}>
            {time ? formatTime(time) : placeholder}
          </span>
        </div>
        
        <div className="flex items-center">
          {clearable && time && (
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={handleClear}
              aria-label="Clear time"
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
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="flex items-center justify-center space-x-2">
            {/* Hour select */}
            <div className="w-full">
              <label className="block text-xs text-gray-500 mb-1">Hour</label>
              <select
                className="w-full rounded-md border border-gray-300 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={time?.hours ?? (use24Hour ? 0 : 12)}
                onChange={handleHourChange}
              >
                {hoursOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Minute select */}
            <div className="w-full">
              <label className="block text-xs text-gray-500 mb-1">Minute</label>
              <select
                className="w-full rounded-md border border-gray-300 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={time?.minutes ?? 0}
                onChange={handleMinuteChange}
              >
                {minutesOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            
            {/* AM/PM select, only if not using 24 hour format */}
            {!use24Hour && (
              <div className="w-full">
                <label className="block text-xs text-gray-500 mb-1">Period</label>
                <select
                  className="w-full rounded-md border border-gray-300 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={time?.period ?? 'AM'}
                  onChange={handlePeriodChange}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 