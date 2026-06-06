import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                className={`${className} flex justify-between items-center text-left w-full cursor-pointer hover:bg-slate-100 active:bg-slate-200`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{selectedOption?.label || 'Select...'}</span>
                <ChevronDown size={16} className={`ml-2 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-[1.5px] border-slate-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden animate-slideDown">
                    <ul className="max-h-60 overflow-y-auto m-0 p-1 list-none">
                        {options.map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none
                                        ${option.value === value 
                                            ? 'bg-brand text-white' 
                                            : 'bg-transparent text-slate-700 hover:bg-slate-50 hover:text-brand'
                                        }`}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
