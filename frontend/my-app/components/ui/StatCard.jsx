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
      border: 'border-[#D4AF37]/35 hover:border-[#D4AF37]',
      iconBg: 'bg-gradient-to-br from-[#D4AF37] to-[#996515] text-[#090D16]',
      glow: 'from-[#D4AF37]/20 to-transparent',
      badge: 'bg-[#D4AF37]/20 text-[#F3E5AB]',
    },
    maroon: {
      border: 'border-[#8C2234]/40 hover:border-[#8C2234]',
      iconBg: 'bg-gradient-to-br from-[#8C2234] to-[#4A0E18] text-[#F3E5AB]',
      glow: 'from-[#8C2234]/25 to-transparent',
      badge: 'bg-rose-950/60 text-rose-300',
    },
    navy: {
      border: 'border-blue-500/30 hover:border-blue-400',
      iconBg: 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-cyan-300',
      glow: 'from-blue-600/20 to-transparent',
      badge: 'bg-blue-950/60 text-blue-300',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-900 text-white',
      glow: 'from-emerald-600/25 to-transparent',
      badge: 'bg-emerald-950/60 text-emerald-300',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-800 text-white',
      glow: 'from-amber-500/25 to-transparent',
      badge: 'bg-amber-950/60 text-amber-300',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-400',
      iconBg: 'bg-gradient-to-br from-rose-600 to-rose-900 text-white',
      glow: 'from-rose-600/25 to-transparent',
      badge: 'bg-rose-950/60 text-rose-300',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-400',
      iconBg: 'bg-gradient-to-br from-purple-600 to-purple-900 text-white',
      glow: 'from-purple-600/25 to-transparent',
      badge: 'bg-purple-950/60 text-purple-300',
    },
    blue: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-900 text-white',
      glow: 'from-cyan-600/25 to-transparent',
      badge: 'bg-cyan-950/60 text-cyan-300',
    },
  };

  const scheme = colorMap[color] || colorMap.gold;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border ${scheme.border} bg-slate-900/80 p-5.5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Background ambient radial glow */}
      <div
        className={`absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl transition-all duration-300 group-hover:scale-125 group-hover:opacity-100 opacity-60 pointer-events-none`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="font-classic text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#D4AF37]">{title}</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl font-mono">
            {value !== undefined && value !== null ? value : '--'}
          </h3>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-400 truncate font-sans">{subtitle}</p>}
        </div>

        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${scheme.iconBg} border border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="relative z-10 mt-4 flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              trend.positive ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' : 'bg-rose-950/80 text-rose-300 border border-rose-700'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
          {trend.label && <span className="text-[11px] text-slate-400 font-normal">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
