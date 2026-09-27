import React from 'react';

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = '',
  loading = false,
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border border-[#D4AF37]/25 bg-slate-900/80 p-5 md:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-2xl text-white ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-black text-white md:text-lg tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs font-medium text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="relative flex-1 w-full min-h-[260px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs rounded-2xl">
            <div className="flex flex-col items-center gap-2.5">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-transparent border-t-[#D4AF37] border-r-emerald-400" />
              <p className="text-xs font-semibold text-slate-400">Loading live analytics...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
