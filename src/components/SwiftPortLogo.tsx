import React from "react";

interface SwiftPortLogoProps {
  className?: string;
  iconOnly?: boolean;
  theme?: "light" | "dark";
}

export default function SwiftPortLogo({ className = "", iconOnly = false, theme = "light" }: SwiftPortLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic Animated Vector Brand Mark */}
      <div className="relative p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md shadow-orange-100 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform duration-200">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 text-white transform -rotate-12 transition-transform duration-300"
        >
          {/* Fast Delivery Box with Isometric Speed lines */}
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col text-left select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-base font-black tracking-tight font-sans ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Swift<span className="text-orange-500">Port</span>
            </span>
            <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-100 font-black px-1.5 py-0.5 rounded-md font-mono shrink-0">
              PRO
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono tracking-wider font-bold uppercase shrink-0 mt-0.5">
            Intra-City Logistics
          </span>
        </div>
      )}
    </div>
  );
}
