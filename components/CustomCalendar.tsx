import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ isOpen, onClose, startDate, endDate, onChange }) => {
  // Initialize view based on current date or selected start date
  const [currentDate, setCurrentDate] = useState(startDate ? new Date(startDate) : new Date());
  
  // Internal selection state to handle range picking logic
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (isOpen) {
      setTempStart(startDate);
      setTempEnd(endDate);
      // If we have both dates, reset step to start for a new selection, 
      // or if we have no dates, start at start.
      setSelectingStep('start'); 
    }
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Adjust for Monday start (Turkey standard)
  // Standard: 0(Sun), 1(Mon)... -> Target: 0(Mon), 6(Sun)
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    // Construct date string YYYY-MM-DD in local time
    // Important: Avoid timezone shifts by creating date from components
    const selected = new Date(year, month, day);
    const dateStr = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;

    if (selectingStep === 'start') {
      setTempStart(dateStr);
      setTempEnd(''); // Clear end date when picking new start
      setSelectingStep('end');
    } else {
      // Logic: If clicked date is before start date, it becomes the new start date
      if (new Date(dateStr) < new Date(tempStart)) {
        setTempStart(dateStr);
        setTempEnd('');
        setSelectingStep('end');
      } else {
        setTempEnd(dateStr);
        // Both selected, we can auto-apply or let user click "Uygula"
        // For smoother UX, let's keep it in state until "Uygula" or auto-update parent
        onChange(tempStart, dateStr);
        // Optional: Close immediately? No, let user confirm or see range.
        // onClose(); 
      }
    }
  };

  const isSelected = (day: number) => {
    const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return currentStr === tempStart || currentStr === tempEnd;
  };

  const isInRange = (day: number) => {
    if (!tempStart || !tempEnd) return false;
    const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return currentStr > tempStart && currentStr < tempEnd;
  };

  const isPast = (day: number) => {
     const today = new Date();
     today.setHours(0,0,0,0);
     const checkDate = new Date(year, month, day);
     return checkDate < today;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Calendar Container - Explicitly White Theme */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tarih Seç</h3>
            <p className="text-sm text-gray-500">
              {tempStart ? new Date(tempStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : 'Başlangıç'} 
              {' - '}
              {tempEnd ? new Date(tempEnd).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : 'Bitiş'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronLeft size={24} />
            </button>
            <span className="text-lg font-bold text-gray-900">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-2">
            {/* Empty cells for start of month */}
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const inRange = isInRange(day);
              const disabled = isPast(day);

              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-10 w-full flex items-center justify-center text-sm font-medium transition-all relative rounded-full
                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-900'}
                    ${selected ? 'bg-primary-600 !text-white hover:!bg-primary-700 shadow-md scale-105 z-10' : ''}
                    ${inRange ? 'bg-primary-50 !text-primary-700 rounded-none first:rounded-l-full last:rounded-r-full' : ''}
                    ${selected && tempStart && tempEnd && day === parseInt(tempStart.split('-')[2]) ? 'rounded-r-none' : ''}
                    ${selected && tempStart && tempEnd && day === parseInt(tempEnd.split('-')[2]) ? 'rounded-l-none' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <button 
              onClick={() => { setTempStart(''); setTempEnd(''); setSelectingStep('start'); }}
              className="text-sm text-gray-500 font-medium hover:text-gray-900 px-4"
            >
              Temizle
            </button>
            <button 
              onClick={() => {
                 if(tempStart && tempEnd) {
                     onChange(tempStart, tempEnd);
                     onClose();
                 } else {
                     alert("Lütfen başlangıç ve bitiş tarihlerini seçiniz.");
                 }
              }}
              className={`
                 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-200
                 ${(!tempStart || !tempEnd) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700 hover:scale-105 active:scale-95'}
              `}
            >
              Uygula
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;