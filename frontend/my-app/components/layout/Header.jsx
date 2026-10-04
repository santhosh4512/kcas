'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ExternalLink, ShieldCheck, Search, Command, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/api';
import api from '../../lib/api';
import Link from 'next/link';
import CommandPalette from '../ui/CommandPalette';

export default function Header({ setMobileOpen, title, subtitle }) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const serverBase = (API_BASE_URL || '').replace(/\/api\/?$/, '');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }) + ' • ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || user.role === 'student') return;

    const fetchAlertCount = async () => {
      try {
        const res = await api.get('/location-alerts?status=Unread&limit=1');
        if (res.data.success && res.data.summary) {
          setUnreadAlerts(res.data.summary.unread || 0);
        }
      } catch (err) {
        // quiet catch
      }
    };

    fetchAlertCount();
    const alertInterval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(alertInterval);
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 md:px-8 backdrop-blur-md transition-all shadow-xs text-slate-900">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 lg:hidden shadow-xs transition"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-classic text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-wide leading-tight uppercase">
                {title || 'Institutional Portal'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Gateway
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-md mt-0.5 font-sans">
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
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition shadow-2xs group"
          >
            <Search className="h-3.5 w-3.5 text-[#6D1B29] group-hover:scale-110 transition" />
            <span className="text-[11px] font-semibold">Quick Search / Action...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 bg-white rounded border border-slate-300">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>

          {/* GPS Location Alerts Quick Trigger for Faculty/Admin */}
          {user?.role !== 'student' && (
            <Link
              href="/location-alerts"
              className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition shadow-2xs"
              title="GPS Location Alerts"
            >
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-lg animate-pulse">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </Link>
          )}

          {/* Live Date/Time Capsule */}
          {timeStr && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 shadow-2xs">
              <span className="text-[#6D1B29]">🏛️</span>
              <span>{timeStr}</span>
            </div>
          )}

          {/* Public Portal Shortcut */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:text-[#6D1B29] border border-slate-200 bg-slate-50 rounded-xl hover:bg-slate-100 shadow-2xs transition group"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#6D1B29] group-hover:scale-110 transition-transform" />
            <span>Public Site</span>
          </Link>

          {/* User Profile Pill */}
          {user && (
            <Link
              href="/settings"
              className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-90 transition group"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#6D1B29] border-2 border-[#C5A059] text-[#F3E5AB] font-classic font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
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
                <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#6D1B29] transition-colors">
                  {user.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-[#6D1B29]" />
                  <p className="text-[10px] font-extrabold text-[#6D1B29] uppercase tracking-wider">{user.role}</p>
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
