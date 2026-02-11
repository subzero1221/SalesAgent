"use client";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function PageSizeSelector({
  pageSize,
  setPageSize,
  setPage,
  totalCount,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [20, 50, 100];

  return (
    <div className="flex items-center bg-white rounded-[2.2rem] border border-gray-100 shadow-2xl shadow-gray-200/60 p-1.5 transition-all">
      {/* Total Count Display */}
      <div className="px-8 py-2 border-r border-gray-100 flex flex-col items-center justify-center min-w-[110px]">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 leading-none mb-1.5">
          სულ
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-black leading-none">
            {totalCount}
          </span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            ნივთი
          </span>
        </div>
      </div>

      {/* Dropdown Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-8 py-3.5 flex items-center cursor-pointer gap-4 hover:bg-gray-50 rounded-[1.8rem] transition-all group"
        >
          <span className="text-base font-black text-black uppercase tracking-tight">
            {pageSize} პროდუქტი
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-300 transition-transform duration-500 ${
              isOpen ? "rotate-180 text-black" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-3 w-44 bg-white rounded-[1.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
              {options.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setPage(1);
                    setIsOpen(false);
                  }}
                  className={`w-full cursor-pointer px-5 py-3.5 text-left text-[10px] font-black rounded-2xl transition-all flex items-center justify-between uppercase tracking-widest ${
                    pageSize === size
                      ? "bg-black text-white"
                      : "hover:bg-gray-50 text-gray-400 hover:text-black"
                  }`}
                >
                  {size} ცალი
                  {pageSize === size && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
