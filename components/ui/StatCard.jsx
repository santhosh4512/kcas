import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      iconBg: 'bg-blue-600 text-white',
      border: 'border-blue-100',
      text: 'text-blue-700',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconBg: 'bg-amber-600 text-white',
      border: 'border-amber-100',
      text: 'text-amber-700',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconBg: 'bg-rose-600 text-white',
      border: 'border-rose-100',
      text: 'text-rose-700',
    },
    purple: {
      bg: 'bg-purple-50/70',
      iconBg: 'bg-purple-600 text-white',
      border: 'border-purple-100',
      text: 'text-purple-700',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      iconBg: 'bg-indigo-600 text-white',
      border: 'border-indigo-100',
      text: 'text-indigo-700',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border ${scheme.border} bg-white p-5 shadow-sm transition duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {value !== undefined ? value : '--'}
          </h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${scheme.iconBg} shadow-sm`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium text-slate-600">
          <span className={`mr-1 font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
          {trend.label && <span className="text-slate-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
