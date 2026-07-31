import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { CurrencyCode } from '../types/admin';

interface CurrencyDropdownProps {
  activeCurrency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  className?: string;
  darkVariant?: boolean;
}

const CURRENCY_OPTIONS: { code: CurrencyCode; name: string; symbol: string }[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  activeCurrency,
  onChangeCurrency,
  className = '',
  darkVariant = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = CURRENCY_OPTIONS.find((c) => c.code === activeCurrency) || CURRENCY_OPTIONS[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
          darkVariant
            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-[#1B2A4A]'
        }`}
        aria-label="Select Currency"
      >
        <Globe className="w-3.5 h-3.5 text-[#D1B464] shrink-0" />
        <span className="hidden sm:inline">Currencies</span>
        <span className="sm:hidden">Currency</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
            darkVariant ? 'bg-[#D1B464] text-[#1B2A4A]' : 'bg-[#1B2A4A] text-[#D1B464]'
          }`}
        >
          {activeOption.symbol} {activeOption.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white text-[#1B2A4A] shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Choose Store Currency
          </div>
          {CURRENCY_OPTIONS.map((option) => {
            const isSelected = activeCurrency === option.code;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  onChangeCurrency(option.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold hover:bg-[#D1B464]/10 transition-colors cursor-pointer text-left ${
                  isSelected ? 'text-[#1B2A4A] font-bold bg-gray-50' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-[#1B2A4A] font-bold text-[11px] flex items-center justify-center border border-gray-200">
                    {option.symbol}
                  </span>
                  <div>
                    <div className="font-bold leading-tight">{option.code}</div>
                    <div className="text-[10px] text-gray-400 font-normal leading-tight">{option.name}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#D1B464]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
