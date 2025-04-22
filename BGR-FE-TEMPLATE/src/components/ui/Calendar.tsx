import React, { useState } from 'react';

interface CalendarProps {
  month?: Date;
  onDateChange?: (date: Date) => void;
  selected?: Date | Date[];
  className?: string;
  disabled?: boolean | ((date: Date) => boolean);
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

// Helper functions
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const isDateInArray = (date: Date, array: Date[]) => {
  return array.some((d) => isSameDay(d, date));
};

const isDateDisabled = (
  date: Date,
  disabled?: boolean | ((date: Date) => boolean),
  minDate?: Date,
  maxDate?: Date,
) => {
  if (typeof disabled === 'boolean') return disabled;
  if (typeof disabled === 'function') return disabled(date);
  if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
  if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
  return false;
};

export function Calendar({
  month = new Date(),
  onDateChange,
  selected,
  className = '',
  disabled = false,
  minDate,
  maxDate,
  weekStartsOn = 0,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(month.getFullYear(), month.getMonth(), 1));
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date, disabled, minDate, maxDate)) return;
    onDateChange?.(date);
  };
  
  // Generate calendar grid
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Adjust for week start day
    const offset = (firstDayOfMonth - weekStartsOn + 7) % 7;
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < offset; i++) {
      const date = new Date(year, month, -offset + i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: Array.isArray(selected) 
          ? isDateInArray(date, selected) 
          : selected ? isSameDay(date, selected) : false,
        isDisabled: isDateDisabled(date, disabled, minDate, maxDate),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: Array.isArray(selected) 
          ? isDateInArray(date, selected) 
          : selected ? isSameDay(date, selected) : false,
        isDisabled: isDateDisabled(date, disabled, minDate, maxDate),
      });
    }
    
    // Add days for the next month to complete the grid (6 rows x 7 days = 42 cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: Array.isArray(selected) 
          ? isDateInArray(date, selected) 
          : selected ? isSameDay(date, selected) : false,
        isDisabled: isDateDisabled(date, disabled, minDate, maxDate),
      });
    }
    
    return days;
  };
  
  // Adjust day names array based on weekStartsOn
  const orderedDays = [...DAYS.slice(weekStartsOn), ...DAYS.slice(0, weekStartsOn)];
  
  // Get calendar days
  const calendarDays = renderCalendarDays();
  
  return (
    <div className={`w-full p-3 bg-white border border-gray-200 rounded-md shadow-sm ${className}`}>
      {/* Calendar header - Month and year navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous month"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 className="text-lg font-semibold">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next month"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {orderedDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day.date)}
            disabled={day.isDisabled}
            className={`
              py-1.5 rounded-md text-sm
              ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
              ${day.isToday ? 'border border-blue-300' : ''}
              ${day.isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
              ${day.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={day.date.toDateString()}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
} 