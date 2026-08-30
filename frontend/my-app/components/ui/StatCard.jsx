import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'gold',
  onClick,
}) {
  const colorMap = {
    gold: {
      border: 'border-[#C5A059]/40 hover:border-[#C5A059]',
      iconBg: 'bg-[#C5A059] text-[#0E1B2E]',
      glow: 'from-[#C5A059]/15 to-transparent',
      badge: 'bg-[#FAF0E6] text-[#6D1B29]',
    },
    maroon: {
      border: 'border-[#6D1B29]/30 hover:border-[#6D1B29]',
      iconBg: 'bg-[#6D1B29] text-[#FAF0E6]',
      glow: 'from-[#6D1B29]/15 to-transparent',
      badge: 'bg-[#FAF0E6] text-[#6D1B29]',
    },
    navy: {
      border: 'border-[#162A45]/30 hover:border-[#162A45]',
      iconBg: 'bg-[#0E1B2E] text-[#F3E5AB]',
      glow: 'from-[#0E1B2E]/15 to-transparent',
      badge: 'bg-slate-100 text-[#0E1B2E]',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-700 text-white',
      glow: 'from-emerald-600/15 to-transparent',
      badge: 'bg-emerald-50 text-emerald-800',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      iconBg: 'bg-amber-600 text-white',
      glow: 'from-amber-500/15 to-transparent',
      badge: 'bg-amber-50 text-amber-800',
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      iconBg: 'bg-rose-700 text-white',
      glow: 'from-rose-600/15 to-transparent',
      badge: 'bg-rose-50 text-rose-800',
    },
    purple: {
      border: 'border-purple-200 hover:border-purple-400',
      iconBg: 'bg-purple-800 text-white',
      glow: 'from-purple-600/15 to-transparent',
      badge: 'bg-purple-50 text-purple-800',
    },
    blue: {
      border: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-[#162A45] text-[#C5A059]',
      glow: 'from-blue-600/15 to-transparent',
      badge: 'bg-blue-50 text-blue-800',
    },
  };

  const scheme = colorMap[color] || colorMap.gold;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border ${scheme.border} bg-white/95 p-5.5 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Background ambient radial glow */}
      <div
        className={`absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl transition-all duration-300 group-hover:scale-125 group-hover:opacity-100 opacity-60 pointer-events-none`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="font-classic text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#6D1B29]">{title}</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-[#0E1B2E] md:text-3xl font-mono">
            {value !== undefined && value !== null ? value : '--'}
          </h3>
          {subtitle && <p className="mt-1 text-xs font-medium text-[#64748B] truncate font-sans">{subtitle}</p>}
        </div>

        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${scheme.iconBg} border border-[#C5A059]/40 shadow-md transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="relative z-10 mt-4 flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              trend.positive ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
          {trend.label && <span className="text-[11px] text-[#64748B] font-normal">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}

