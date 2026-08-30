'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../lib/AuthContext';

export default function DashboardLayout({ children, title, subtitle, allowedRoles = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role authorization if restricted
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex flex-1 flex-col lg:pl-72">
          <Header setMobileOpen={setMobileOpen} title="Access Denied" />
          <main className="flex-1 p-6 md:p-8">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center">
              <h3 className="text-lg font-bold text-rose-900">Unauthorized Access</h3>
              <p className="mt-1 text-xs text-rose-700">
                Your account role ({user.role}) does not have permission to view this module.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-1 flex-col lg:pl-72 transition-all duration-300">
        <Header setMobileOpen={setMobileOpen} title={title} subtitle={subtitle} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
