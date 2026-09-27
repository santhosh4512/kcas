'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ExternalLink, ShieldCheck, Search, Sparkles, Command } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/api';
import Link from 'next/link';
import CommandPalette from '../ui/CommandPalette';

export default function Header({ setMobileOpen, title, subtitle }) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const serverBase = (API_BASE_URL || '').replace(/\/api\/?$/, '');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) + ' • ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#D4AF37]/25 bg-[#090D16]/90 px-4 sm:px-6 md:px-8 backdrop-blur-xl transition-all shadow-xl text-white">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-[#D4AF37]/40 bg-slate-900 p-2 text-[#F3E5AB] hover:bg-slate-800 lg:hidden shadow-xs transition"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-classic text-base sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight uppercase">
                {title || 'Institutional Portal'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#F3E5AB]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live Gateway
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-md mt-0.5 font-sans">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center/Right: Quick Search Capsule, Public Link & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Command Search Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition shadow-sm group"
          >
            <Search className="h-3.5 w-3.5 text-[#D4AF37] group-hover:scale-110 transition" />
            <span className="text-[11px] font-medium">Quick Search / Action...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold text-[#D4AF37] bg-slate-800 rounded border border-slate-700">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>

          {/* Live Date/Time Capsule */}
          {timeStr && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D4AF37]/25 bg-slate-900/60 text-[11px] font-bold text-[#F3E5AB] shadow-2xs">
              <span className="text-[#D4AF37]">🏛️</span>
              <span>{timeStr}</span>
            </div>
          )}

          {/* Public Portal Shortcut */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F3E5AB] hover:text-white border border-[#D4AF37]/40 bg-slate-900/80 rounded-xl hover:bg-slate-800 shadow-2xs transition group"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#D4AF37] group-hover:text-white transition-colors" />
            <span>Public Site</span>
          </Link>

          {/* User Profile Pill */}
          {user && (
            <Link
              href="/settings"
              className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#D4AF37]/30 hover:opacity-90 transition group"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-900 border-2 border-[#D4AF37] text-[#D4AF37] font-classic font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                {user.profilePhoto || user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      (user.profilePhoto || user.avatar).startsWith('http') || (user.profilePhoto || user.avatar).startsWith('data:')
                        ? (user.profilePhoto || user.avatar)
                        : `${serverBase}${(user.profilePhoto || user.avatar).startsWith('/') ? '' : '/'}${user.profilePhoto || user.avatar}`
                    }
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight group-hover:text-[#F3E5AB] transition-colors">
                  {user.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-[#D4AF37]" />
                  <p className="text-[10px] font-bold text-[#D4AF37] capitalize">{user.role}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
