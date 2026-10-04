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
      className={`flex flex-col rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs transition-all duration-300 hover:shadow-md text-slate-800 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 md:text-lg tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs font-semibold text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="relative flex-1 w-full min-h-[260px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs rounded-2xl">
            <div className="flex flex-col items-center gap-2.5">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-transparent border-t-[#6D1B29] border-r-emerald-500" />
              <p className="text-xs font-semibold text-slate-500">Loading analytics...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
