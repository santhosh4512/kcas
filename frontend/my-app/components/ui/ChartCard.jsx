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
    <div className={`flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md md:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 md:text-lg">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="relative flex-1 w-full min-h-[260px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              <p className="text-xs font-medium text-slate-500">Loading chart data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
