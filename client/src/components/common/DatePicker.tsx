// Luxury DatePicker Component
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface DatePickerProps {
  value: Date | string;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export interface DatePickerHandle {
  open: () => void;
  close: () => void;
}

const DatePicker = forwardRef<DatePickerHandle, DatePickerProps>(({
  value,
  onChange,
  placeholder = '選擇日期',
  className = '',
  showTime = true,
  minDate,
  maxDate,
  disabled = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (value) {
      const date = new Date(value);
      const hours = date.getHours();
      const minutes = Math.round(date.getMinutes() / 15) * 15;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return '12:00';
  });
  const [currentView, setCurrentView] = useState<'days' | 'months' | 'years'>('days');
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  // Close the date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update the selected date when the value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentDate(date);
      if (showTime) {
        const hours = date.getHours();
        const minutes = Math.round(date.getMinutes() / 15) * 15;
        setSelectedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
  }, [value, showTime]);

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    if (showTime) {
      return `${year}/${month}/${day} ${selectedTime}`;
    }
    
    return `${year}/${month}/${day}`;
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Handle month change
  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // Handle year change
  const changeYear = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + increment);
    setCurrentDate(newDate);
  };

  // Handle date selection
  const selectDate = (day: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    
    if (showTime && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      newDate.setHours(hours, minutes);
    }
    
    setSelectedDate(newDate);
    onChange(newDate);
    
    if (!showTime) {
      setIsOpen(false);
    }
  };

  // Round minutes to nearest 15-minute interval
  const roundToNearest15Minutes = (minutes: number): number => {
    return Math.round(minutes / 15) * 15;
  };

  // Handle time selection
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, inputMinutes] = e.target.value.split(':').map(Number);
    const roundedMinutes = roundToNearest15Minutes(inputMinutes);
    const roundedTime = `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
    
    setSelectedTime(roundedTime);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, roundedMinutes);
      onChange(newDate);
    }
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (selectedDate) {
      setIsOpen(false);
    }
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Render calendar days
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentDate.getMonth() && 
        selectedDate.getFullYear() === currentDate.getFullYear();
      
      const isToday = new Date().getDate() === day && 
        new Date().getMonth() === currentDate.getMonth() && 
        new Date().getFullYear() === currentDate.getFullYear();
      
      const isDisabled = isDateDisabled(date);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && selectDate(day)}
          disabled={isDisabled}
          className={`
            h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all
            ${isSelected ? 'bg-luxury-gold text-luxury-midnight-black' : 'text-luxury-platinum'}
            ${isToday && !isSelected ? 'border border-luxury-gold text-luxury-gold' : ''}
            ${isDisabled ? 'text-luxury-platinum/30 cursor-not-allowed' : 'hover:bg-luxury-gold/20'}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  // Render months
  const renderMonths = () => {
    const months = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    return months.map((month, index) => {
      const isSelected = selectedDate && selectedDate.getMonth() === index && 
        selectedDate.getFullYear() === currentDate.getFullYear();
      
      return (
        <button
          key={month}
          type="button"
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(index);
            setCurrentDate(newDate);
            setCurrentView('days');
          }}
          className={`
            h-12 rounded-md flex items-center justify-center text-sm transition-all
            ${isSelected ? 'bg-luxury-gold text-white' : 'hover:bg-luxury-gold/10'}
          `}
        >
          {month}
        </button>
      );
    });
  };

  // Render years
  const renderYears = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 6;
    const years = [];
    
    for (let year = startYear; year < startYear + 12; year++) {
      const isSelected = selectedDate && selectedDate.getFullYear() === year;
      
      years.push(
        <button
          key={year}
          type="button"
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(year);
            setCurrentDate(newDate);
            setCurrentView('months');
          }}
          className={`
            h-12 rounded-md flex items-center justify-center text-sm transition-all
            ${isSelected ? 'bg-luxury-gold text-white' : 'hover:bg-luxury-gold/10'}
          `}
        >
          {year}
        </button>
      );
    }
    
    return years;
  };

  // Render header based on current view
  const renderHeader = () => {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    if (currentView === 'days') {
      return (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-full hover:bg-luxury-gold/20 text-luxury-platinum"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('months')}
            className="font-medium hover:bg-luxury-gold/20 px-2 py-1 rounded text-luxury-platinum"
          >
            {monthNames[currentDate.getMonth()]}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('years')}
            className="font-medium hover:bg-luxury-gold/20 px-2 py-1 rounded text-luxury-platinum"
          >
            {currentDate.getFullYear()}
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="p-1 rounded-full hover:bg-luxury-gold/20 text-luxury-platinum"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      );
    } else if (currentView === 'months') {
      return (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => changeYear(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('years')}
            className="font-medium hover:bg-gray-100 px-2 py-1 rounded"
          >
            {currentDate.getFullYear()}
          </button>
          <button
            type="button"
            onClick={() => changeYear(1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setFullYear(newDate.getFullYear() - 12);
              setCurrentDate(newDate);
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="font-medium">
            {currentDate.getFullYear() - 6} - {currentDate.getFullYear() + 5}
          </span>
          <button
            type="button"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setFullYear(newDate.getFullYear() + 12);
              setCurrentDate(newDate);
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      );
    }
  };

  // Handle click on the date picker input
  const handleInputClick = () => {
    console.log('DatePicker clicked, current state:', { isOpen, selectedDate, currentDate });
    if (!disabled) {
      console.log('Setting isOpen to:', !isOpen);
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={datePickerRef} style={{position: 'relative', zIndex: 100}}>
      <div 
        className={`w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold flex items-center cursor-pointer ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={handleInputClick}
        style={{position: 'relative', zIndex: 100}}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxury-gold/60 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`flex-grow ${!selectedDate ? 'text-luxury-platinum/60' : 'text-luxury-platinum'}`}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxury-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-[9999] mt-1 bg-luxury-midnight-black border border-luxury-gold/30 rounded-lg shadow-luxury p-4 w-72" style={{zIndex: 9999}}>
          {/* Debug message */}
          <div style={{display: 'none'}}>{(() => { console.log('Rendering calendar dropdown'); return ''; })()}</div>
          {renderHeader()}
          
          {currentView === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-luxury-platinum/60">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {renderDays()}
              </div>
            </>
          )}
          
          {currentView === 'months' && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {renderMonths()}
            </div>
          )}
          
          {currentView === 'years' && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {renderYears()}
            </div>
          )}
          
          {showTime && currentView === 'days' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-luxury-platinum mb-1">
                時間
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full bg-luxury-midnight-black/50 border border-luxury-gold/30 rounded-lg px-4 py-2 text-luxury-platinum focus:outline-none focus:border-luxury-gold"
              />
            </div>
          )}
          
          {currentView === 'days' && (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setSelectedDate(now);
                  setCurrentDate(now);
                  if (showTime) {
                    const hours = now.getHours();
                    const roundedMinutes = Math.round(now.getMinutes() / 15) * 15;
                    setSelectedTime(`${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`);
                    now.setMinutes(roundedMinutes);
                  }
                  onChange(now);
                }}
                className="text-sm text-luxury-gold hover:underline"
              >
                今天
              </button>
              
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 bg-luxury-gold text-white rounded-md text-sm hover:bg-luxury-gold/90 transition-colors"
              >
                確認
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default DatePicker;
