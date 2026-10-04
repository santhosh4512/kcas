import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const base = 'inline-flex items-center gap-1.5 font-bold rounded-full border transition-all';
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-xs font-black',
  };

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-300',
    gold: 'bg-[#FAF0E6] text-[#6D1B29] border-[#C5A059] font-black shadow-2xs',
    royal: 'bg-gradient-to-r from-[#6D1B29] to-[#0E1B2E] text-[#F3E5AB] border border-[#C5A059] font-bold shadow-2xs',
    maroon: 'bg-[#FAF0E6] text-[#6D1B29] border-[#6D1B29]/40 font-bold',
    navy: 'bg-blue-50 text-blue-800 border-blue-200 font-bold',
    primary: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    warning: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    danger: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    purple: 'bg-purple-50 text-purple-800 border-purple-200 font-bold',
    talent: 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 text-amber-950 border border-amber-300 font-black shadow-2xs',
  };

  return (
    <span className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
