'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';

export default function Header({ setMobileOpen, title, subtitle }) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');

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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#C5A059]/30 bg-white/90 px-4 sm:px-6 md:px-8 backdrop-blur-md transition-all shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-[#C5A059]/40 bg-[#FAF0E6]/50 p-2 text-[#0E1B2E] hover:bg-[#FAF0E6] lg:hidden shadow-xs transition"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-classic text-base sm:text-lg md:text-xl font-black text-[#0E1B2E] tracking-wide leading-tight uppercase">
              {title || 'Institutional Portal'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#C5A059]/50 bg-[#FAF0E6] px-2.5 py-0.5 text-[10px] font-bold text-[#6D1B29]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              Live Gateway
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-[#5A6A80] hidden sm:block truncate max-w-md mt-0.5 font-sans">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Date, Public Link & User Seal */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Date/Time capsule */}
        {timeStr && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#C5A059]/30 bg-[#FAF0E6]/60 text-[11px] font-bold text-[#0E1B2E] shadow-2xs">
            <span className="text-[#C5A059]">🏛️</span>
            <span>{timeStr}</span>
          </div>
        )}

        {/* Public Portal Shortcut */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0E1B2E] hover:text-[#6D1B29] border border-[#C5A059]/40 bg-white rounded-xl hover:bg-[#FAF0E6] shadow-2xs transition group"
        >
          <ExternalLink className="h-3.5 w-3.5 text-[#C5A059] group-hover:text-[#6D1B29] transition-colors" />
          <span>Public Website</span>
        </Link>

        {/* User Pill */}
        {user && (
          <Link
            href="/settings"
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#C5A059]/30 hover:opacity-90 transition group"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#FAF0E6] border-2 border-[#C5A059] text-[#6D1B29] font-classic font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              {user.profilePhoto || user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    (user.profilePhoto || user.avatar).startsWith('http') || (user.profilePhoto || user.avatar).startsWith('data:')
                      ? (user.profilePhoto || user.avatar)
                      : `http://localhost:5001${(user.profilePhoto || user.avatar).startsWith('/') ? '' : '/'}${user.profilePhoto || user.avatar}`
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
              <p className="text-xs font-bold text-[#0E1B2E] leading-tight group-hover:text-[#6D1B29] transition-colors">
                {user.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-[#C5A059]" />
                <p className="text-[10px] font-semibold text-[#6D1B29] capitalize">{user.role}</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}


