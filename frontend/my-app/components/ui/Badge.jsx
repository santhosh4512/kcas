import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const base = 'inline-flex items-center gap-1.5 font-bold rounded-full border tracking-wider transition-all';
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-[9px]',
    md: 'px-3 py-1 text-[11px]',
    lg: 'px-4 py-1.5 text-xs',
  };

  const variants = {
    default: 'bg-[#F5F2EB] text-[#0E1B2E] border-[#C5A059]/30',
    gold: 'bg-[#FAF0E6] text-[#6D1B29] border-[#C5A059] font-extrabold shadow-2xs',
    royal: 'bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] text-[#F3E5AB] border border-[#C5A059]/60 shadow-sm font-classic tracking-widest',
    maroon: 'bg-[#6D1B29]/10 text-[#6D1B29] border-[#6D1B29]/40 font-bold',
    navy: 'bg-[#0E1B2E]/10 text-[#0E1B2E] border-[#162A45]/40 font-bold',
    primary: 'bg-[#162A45] text-[#F3E5AB] border border-[#C5A059]/40',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    danger: 'bg-rose-50 text-rose-800 border-rose-300',
    purple: 'bg-purple-50 text-purple-800 border-purple-300',
    talent: 'bg-gradient-to-r from-[#FAF0E6] via-amber-50 to-[#FAF0E6] text-[#6D1B29] border-2 border-[#C5A059] font-classic font-black shadow-xs',
  };

  return (
    <span className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}


