import React from 'react';
import { Package, ChevronRight } from 'lucide-react';

interface FloatingTrackOrderCardProps {
  onClick: () => void;
}

export const FloatingTrackOrderCard: React.FC<FloatingTrackOrderCardProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 animate-fade-in">
      <button
        onClick={onClick}
        type="button"
        className="group flex items-center gap-3 bg-[#1B2A4A] text-white p-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border-2 border-[#D1B464]/60 hover:border-[#D1B464] hover:bg-[#23375e] transition-all cursor-pointer backdrop-blur-md active:scale-95"
        title="Track Your Order Status"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D1B464] text-[#1B2A4A] flex items-center justify-center font-extrabold shadow-md shrink-0 group-hover:rotate-6 transition-transform">
          <Package className="w-5 h-5" />
        </div>
        <div className="text-left pr-1 hidden min-[360px]:block">
          <div className="text-[9px] font-black uppercase tracking-widest text-[#D1B464]">Direct Factory</div>
          <div className="text-xs font-bold text-white flex items-center gap-1 leading-tight">
            Track Order <ChevronRight className="w-3.5 h-3.5 text-[#D1B464] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
};
