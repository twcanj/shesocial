// Simple DatePicker for testing
import React, { useState } from 'react';

interface SimpleDatePickerProps {
  value: Date | string;
  onChange: (date: Date) => void;
  className?: string;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    console.log('SimpleDatePicker clicked');
    setIsOpen(!isOpen);
  };
  
  const formatDate = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="relative">
      <div 
        className={`input-luxury flex items-center cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <span>{formatDate(value)}</span>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 p-4 rounded shadow-lg z-[9999]">
          <div className="text-center">Simple Calendar (Testing)</div>
          <button 
            className="w-full mt-2 bg-luxury-gold text-white p-2 rounded"
            onClick={() => {
              onChange(new Date());
              setIsOpen(false);
            }}
          >
            Use Today's Date
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleDatePicker;
