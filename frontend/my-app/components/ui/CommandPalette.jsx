'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
  ClipboardList,
  FileCheck2,
  BellRing,
  Award,
  GraduationCap,
  Users,
  Building2,
  FileText,
  X,
  Command,
  ArrowRight,
} from 'lucide-react';
import api from '../../lib/api';

export default function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickNav = [
    { label: 'Smart Notice Board', href: '/notices', icon: BellRing, tag: 'Campus Circulars' },
    { label: 'Live GPS Geo-Attendance', href: '/attendance', icon: CalendarCheck, tag: 'Smart Geofence' },
    { label: 'Early Warning Radar', href: '/early-warnings', icon: AlertTriangle, tag: 'Intervention Alerts' },
    { label: 'Consolidated Progress Reports', href: '/progress-reports', icon: ClipboardList, tag: '360° Profile' },
    { label: 'Certificate Verification Hub', href: '/certificates', icon: FileCheck2, tag: 'NPTEL & Awards' },
    { label: 'Events & Hackathons', href: '/events', icon: Award, tag: 'Symposiums' },
    { label: 'Student Directory & Excel Import', href: '/students', icon: GraduationCap, tag: 'Registry' },
    { label: 'Faculty Mentor Dashboard', href: '/mentor', icon: Users, tag: 'Advising' },
    { label: 'Department Analytics', href: '/departments', icon: Building2, tag: 'UG & PG Streams' },
  ];

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or props
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live student search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/students?search=${encodeURIComponent(query)}&limit=5`);
        if (res.data && res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-[#D4AF37]/50 bg-[#0F172A] shadow-2xl shadow-[#D4AF37]/10 text-white">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#D4AF37]/20 bg-slate-900/90">
          <Search className="h-5 w-5 text-[#D4AF37] mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, departments, features, or jump to page (Ctrl + K)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-800 rounded border border-slate-700">ESC</kbd>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Dynamic Student Search Results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] mb-2 px-1">
                Matching Student Records
              </p>
              <div className="space-y-1.5">
                {searchResults.map((st) => (
                  <button
                    key={st._id}
                    onClick={() => {
                      router.push(`/progress-reports?id=${st._id}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-[#D4AF37]/50 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#F3E5AB]">
                        {st.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-[#F3E5AB]">{st.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {st.registerNumber} &bull; {st.department?.name || 'CS'} &bull; {st.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Att: {st.initialAttendance || 85}%
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Nav Command Shortcuts */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 px-1">
              Quick Navigation & Tools
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickNav.map((nav, idx) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      router.push(nav.href);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-800/80 border border-slate-700/60 hover:border-[#D4AF37]/50 text-left transition group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{nav.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{nav.tag}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Kamban College of Arts and Science — Academic Gateway</span>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.2 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-300">Enter</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
