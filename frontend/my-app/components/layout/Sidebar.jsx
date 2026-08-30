'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/api';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const serverBase = (API_BASE_URL || '').replace(/\/api\/?$/, '');

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      label: 'Department Management',
      href: '/departments',
      icon: Building2,
      roles: ['admin'],
    },
    {
      label: 'Student Directory',
      href: '/students',
      icon: GraduationCap,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Faculty Registry',
      href: '/faculty',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Courses & Subjects',
      href: '/courses',
      icon: BookOpen,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Live Attendance',
      href: '/attendance',
      icon: CalendarCheck,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      label: 'Marks & Results',
      href: '/marks',
      icon: Award,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      label: 'Talent Intelligence',
      href: '/talent',
      icon: Sparkles,
      badge: 'AI Engine',
      roles: ['admin', 'faculty', 'student'],
    },
    {
      label: 'Talent Analytics',
      href: '/talent-analytics',
      icon: BarChart3,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Reports & Export',
      href: '/reports',
      icon: FileText,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Admin Governance',
      href: '/admins',
      icon: ShieldCheck,
      badge: 'Protected',
      roles: ['admin'],
    },
    {
      label: 'Settings & Profile',
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'faculty', 'student'],
    },
  ];

  // Filter based on logged in user role
  const visibleNav = navItems.filter((item) =>
    item.roles.some((r) => user && (user.role === r || user.role?.toLowerCase() === r))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#0E1B2E]/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-[#C5A059]/30 bg-[#0E1B2E] text-[#F5F2EB] transition-transform duration-300 lg:translate-x-0 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Classic Institutional Header */}
        <div className="flex h-22 items-center justify-between border-b border-[#C5A059]/25 px-5 bg-gradient-to-b from-[#162A45]/50 to-transparent">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border-2 border-[#C5A059] bg-white p-1 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="/assets/images/kcas-logo.png"
                alt="KCAS Crest"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-classic text-sm font-black uppercase tracking-wider text-[#F3E5AB] leading-tight group-hover:text-white transition-colors">
                Kamban College
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
                  Academic Portal
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-1.5 text-[#E8E2D5]/60 hover:bg-white/10 hover:text-white lg:hidden transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Identity Seal */}
        {user && (
          <div className="px-4 pt-4">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-2xl border border-[#C5A059]/30 bg-gradient-to-r from-[#162A45]/80 via-[#1A3252]/60 to-[#6D1B29]/40 p-3 hover:border-[#C5A059] transition-all duration-200 group shadow-md"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#FAF0E6] border-2 border-[#C5A059] text-[#6D1B29] font-bold text-xs flex items-center justify-center shadow-md">
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
                  <span className="font-classic font-bold text-sm">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-white group-hover:text-[#F3E5AB] transition-colors">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-[#C5A059]/20 text-[#F3E5AB] border border-[#C5A059]/40">
                    {user.role}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#C5A059]/70 group-hover:text-[#F3E5AB] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <div className="flex items-center justify-between px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059]/70">
            <span>Academic Registry</span>
            <span className="h-1 w-1 rounded-full bg-[#C5A059]" />
          </div>

          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6D1B29] to-[#8C2234] text-white border border-[#C5A059]/60 shadow-lg shadow-[#6D1B29]/40 font-bold'
                    : 'text-[#E8E2D5]/80 hover:bg-white/8 hover:text-white hover:border-l-2 hover:border-[#C5A059]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#C5A059] text-[#0E1B2E] shadow-sm'
                        : 'bg-white/5 text-[#C5A059] group-hover:bg-[#C5A059]/20 group-hover:text-[#F3E5AB]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#F3E5AB] text-[#0E1B2E] shadow-xs'
                        : 'bg-[#C5A059]/20 text-[#F3E5AB] border border-[#C5A059]/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer with Session Logout */}
        <div className="border-t border-[#C5A059]/25 p-3.5 bg-[#0A1422]">
          <button
            onClick={logout}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/60 transition-all duration-150 group"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Sign Out Session</span>
            </div>
            <span className="text-[10px] text-[#C5A059]/60 font-classic uppercase">Security</span>
          </button>
        </div>
      </aside>
    </>
  );
}


