'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
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
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

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
      label: 'Student Management',
      href: '/students',
      icon: GraduationCap,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Faculty Management',
      href: '/faculty',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Course & Subject Management',
      href: '/courses',
      icon: BookOpen,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Attendance',
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
      label: 'Student Skill & Talent Intelligence',
      href: '/talent',
      icon: Sparkles,
      badge: 'Main Innovation',
      roles: ['admin', 'faculty', 'student'],
    },
    {
      label: 'Department Talent Analytics',
      href: '/talent-analytics',
      icon: BarChart3,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: FileText,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Admin Management',
      href: '/admins',
      icon: ShieldCheck,
      badge: 'Super Admin',
      roles: ['admin'],
    },
    {
      label: 'Settings',
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
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/90 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Institutional Branding Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <Image
                src="/assets/images/kcas-logo.png"
                alt="KCAS"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-tight text-slate-900 leading-tight">
                Kamban College
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                Department Portal
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Identity Chip */}
        {user && (
          <Link
            href="/settings"
            className="mx-4 mt-4 block rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 hover:bg-slate-100/80 transition group"
          >
            <div className="flex items-center gap-3">
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
                  user.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-slate-800 group-hover:text-[#701A28] transition">
                  {user.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-[#701A28]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            System Modules
          </div>

          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#701A28] text-white shadow-sm shadow-[#701A28]/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#701A28]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FAF0E6] text-[#701A28] border border-[#C5A059]/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer with Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
