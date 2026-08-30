'use client';

import React from 'react';
import { Menu, Bell, Search, UserCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';

export default function Header({ setMobileOpen, title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md md:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 md:text-xl tracking-tight leading-tight">
            {title || 'Dashboard'}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Quick actions, Live Status & Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Public Portal
        </Link>

        {/* User Chip */}
        {user && (
          <Link
            href="/settings"
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-90 transition group"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#FAF0E6] border border-[#C5A059]/40 text-[#701A28] font-bold text-xs flex items-center justify-center shadow-2xs">
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
                user.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#701A28] transition">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
