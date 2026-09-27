import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const base = 'inline-flex items-center gap-1.5 font-bold rounded-full border tracking-wider transition-all';
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-[9px]',
    md: 'px-3 py-1 text-[11px]',
    lg: 'px-4 py-1.5 text-xs',
  };

  const variants = {
    default: 'bg-slate-800/80 text-slate-200 border-slate-700',
    gold: 'bg-[#D4AF37]/20 text-[#F3E5AB] border-[#D4AF37]/60 font-extrabold shadow-sm',
    royal: 'bg-gradient-to-r from-[#090D16] via-[#1E293B] to-[#581C28] text-[#F3E5AB] border border-[#D4AF37]/70 shadow-sm font-classic tracking-widest',
    maroon: 'bg-[#8C2234]/25 text-rose-300 border-[#8C2234]/50 font-bold',
    navy: 'bg-blue-950/60 text-cyan-300 border-blue-800/60 font-bold',
    primary: 'bg-slate-900 text-[#F3E5AB] border border-[#D4AF37]/50',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-700/80',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
    talent: 'bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 text-[#F3E5AB] border border-[#D4AF37] font-classic font-bold shadow-xs',
  };

  return (
    <span className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
