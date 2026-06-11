import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const dropdownRef = useRef(null);

    // Initialize calendar view to selected date if exists
    useEffect(() => {
        if (value) {
            const [year, month, day] = value.split('-');
            setCurrentDate(new Date(year, month - 1, day));
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);

        const days = [];
        // Add empty slots for days before the 1st
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        // Add actual days
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }
        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        onChange(`${year}-${month}-${formattedDay}`);
        setIsOpen(false);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const formattedValue = value ? new Date(value.split('-')[0], value.split('-')[1] - 1, value.split('-')[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                className={`flex items-center justify-between w-full text-left bg-white transition-all duration-200 cursor-pointer ${className} ${isOpen ? 'border-brand ring-2 ring-brand/10' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}>
                    {value ? formattedValue : 'Select Date'}
                </span>
                <CalendarIcon size={16} className={value ? 'text-brand' : 'text-slate-400'} />
            </button>

            {isOpen && (
                <div className="absolute z-[200] mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 p-4 w-[280px] right-0 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-black text-slate-800">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wide py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {generateCalendar().map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} />;
                            
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = value === dateStr;
                            
                            const today = new Date();
                            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelectDate(day)}
                                    className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold cursor-pointer transition-all mx-auto border-none
                                        ${isSelected 
                                            ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,43,114,0.3)]' 
                                            : isToday
                                                ? 'bg-slate-100 text-brand'
                                                : 'bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                        <button 
                            type="button" 
                            className="text-[12px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer bg-transparent border-none p-1"
                            onClick={() => { onChange(''); setIsOpen(false); }}
                        >
                            Clear
                        </button>
                        <button 
                            type="button" 
                            className="text-[12px] font-bold text-brand hover:text-brand-hover cursor-pointer bg-transparent border-none p-1"
                            onClick={() => {
                                const today = new Date();
                                onChange(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                                setIsOpen(false);
                            }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
