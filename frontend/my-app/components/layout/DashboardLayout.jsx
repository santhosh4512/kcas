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
      <div className="flex min-h-screen items-center justify-center bg-[#0E1B2E] text-[#F5F2EB] relative overflow-hidden">
        {/* Ambient classic glow */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#6D1B29]/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#C5A059]/25 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center gap-4 p-9 rounded-3xl border border-[#C5A059]/30 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="relative flex items-center justify-center">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] border-r-[#DFB96E]" />
            <div className="absolute h-7 w-7 rounded-full bg-[#C5A059]/20" />
          </div>
          <div className="text-center">
            <p className="font-classic text-sm font-bold tracking-widest text-[#F3E5AB] uppercase">Kamban College of Arts & Science</p>
            <p className="text-xs text-[#E8E2D5]/70 mt-1 font-sans">Verifying institutional credentials...</p>
          </div>
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
      <div className="flex min-h-screen classic-modern-canvas">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex flex-1 flex-col lg:pl-72">
          <Header setMobileOpen={setMobileOpen} title="Restricted Area" />
          <main className="flex-1 p-6 md:p-8">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#C5A059]/40 bg-white p-12 text-center shadow-lg">
              <div className="h-14 w-14 rounded-2xl bg-[#FAF0E6] text-[#6D1B29] border border-[#C5A059]/50 flex items-center justify-center mb-4 shadow-sm font-classic text-2xl font-black">
                !
              </div>
              <h3 className="font-classic text-xl font-bold text-[#0E1B2E]">Institutional Clearance Required</h3>
              <p className="mt-2 text-xs text-[#4A5568] max-w-md">
                Your role <span className="font-bold uppercase text-[#6D1B29]">({user.role})</span> does not possess administrative access privileges for this sector.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen classic-modern-canvas font-sans antialiased text-[#1A202C] relative selection:bg-[#6D1B29] selection:text-[#FAF0E6]">
      {/* Neo-classic background subtle lighting */}
      <div className="fixed top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#C5A059]/10 via-[#6D1B29]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-72 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#0E1B2E]/5 via-[#162A45]/5 to-transparent blur-3xl pointer-events-none" />

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-1 flex-col lg:pl-72 transition-all duration-300 min-h-screen">
        <Header setMobileOpen={setMobileOpen} title={title} subtitle={subtitle} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


