import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const base = 'inline-flex items-center font-semibold rounded-full border tracking-wide transition';
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gold: 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-sm',
    talent: 'bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 text-slate-800 border-amber-300/60 font-semibold',
  };

  return (
    <span className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
