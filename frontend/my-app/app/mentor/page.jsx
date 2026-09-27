'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  UserCheck,
  GraduationCap,
  AlertTriangle,
  FileCheck2,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mentor/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching mentor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  const mentees = data?.mentees || [];
  const filteredMentees = mentees.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.registerNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'atRisk' && m.status === 'Needs Attention') ||
      (filterStatus === 'onTrack' && m.status === 'On Track');
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Faculty Advisory & Mentorship Portal</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Mentor Ward Management & Progress Tracker
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Advisor: <strong className="text-white">{data?.mentorInfo?.name || user?.name || 'Dr. S. Kanimozhi'}</strong> ({data?.mentorInfo?.designation || 'Associate Professor & Senior Mentor'})
              </p>
            </div>

            <Link
              href="/early-warnings"
              className="flex items-center gap-2 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 px-5 py-3 text-xs font-black shadow-lg hover:bg-rose-500/30 active:scale-95 transition-all"
            >
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Review {data?.activeWarningsCount || 0} Risk Flags</span>
            </Link>
          </div>
        </div>

        {/* Metrics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E8E2D5]/70">Assigned Mentees</span>
              <GraduationCap className="h-5 w-5 text-[#C5A059]" />
            </div>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-white">{data?.totalMentees || 0}</div>
            <p className="text-[11px] text-[#C5A059] mt-1 font-semibold">Active Wards</p>
          </div>

          <div className="rounded-3xl border border-rose-500/30 bg-[#0E1B2E] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">Need Attention</span>
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-rose-400">{data?.atRiskMentees || 0}</div>
            <p className="text-[11px] text-rose-300/70 mt-1 font-semibold">Attendance / Marks Risk</p>
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-[#0E1B2E] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Pending Certificates</span>
              <FileCheck2 className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-amber-300">{data?.pendingCertificates || 0}</div>
            <p className="text-[11px] text-amber-300/70 mt-1 font-semibold">Awaiting Mentor Approval</p>
          </div>

          <div className="rounded-3xl border border-emerald-500/30 bg-[#0E1B2E] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">On Track Wards</span>
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl lg:text-3xl font-black text-emerald-300">
              {(data?.totalMentees || 0) - (data?.atRiskMentees || 0)}
            </div>
            <p className="text-[11px] text-emerald-300/70 mt-1 font-semibold">Healthy Progress</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-[#C5A059]/20 bg-[#0E1B2E]/90 p-4 backdrop-blur-md">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C5A059]/60" />
            <input
              type="text"
              placeholder="Search mentee name or reg number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45]/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === 'all' ? 'bg-[#C5A059] text-[#0E1B2E]' : 'bg-[#162A45] text-white hover:bg-white/10'
              }`}
            >
              All Mentees ({mentees.length})
            </button>
            <button
              onClick={() => setFilterStatus('atRisk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === 'atRisk'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/40'
              }`}
            >
              ⚠️ Needs Attention ({data?.atRiskMentees || 0})
            </button>
            <button
              onClick={() => setFilterStatus('onTrack')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === 'onTrack'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40'
              }`}
            >
              On Track
            </button>
          </div>
        </div>

        {/* Mentees Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0E1B2E]">
            <div className="flex items-center gap-3 text-sm text-[#C5A059]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <span>Loading assigned mentees list...</span>
            </div>
          </div>
        ) : filteredMentees.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#C5A059]/20 bg-[#0E1B2E]/60 p-12 text-center">
            <GraduationCap className="h-12 w-12 text-[#C5A059]/40 mb-3" />
            <h3 className="font-classic text-lg font-bold text-white">No Mentees Found</h3>
            <p className="mt-1 text-xs text-[#E8E2D5]/60 max-w-sm">
              No assigned students matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMentees.map((mentee) => (
              <div
                key={mentee._id}
                className="flex flex-col justify-between rounded-3xl border border-[#C5A059]/30 bg-gradient-to-br from-[#162A45]/90 via-[#0E1B2E] to-[#1A3252]/70 p-5 shadow-xl hover:border-[#C5A059] transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-black text-[#C5A059]">
                      {mentee.registerNumber}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        mentee.status === 'Needs Attention'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {mentee.status}
                    </span>
                  </div>

                  <h3 className="font-classic text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors">
                    {mentee.name}
                  </h3>
                  <p className="text-xs text-[#E8E2D5]/70">
                    {mentee.department} • {mentee.year} Sec {mentee.section}
                  </p>

                  {/* Vitals Stats Box */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-2xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-[#E8E2D5]/60 block uppercase font-bold">Attendance</span>
                      <span
                        className={`font-black text-sm ${
                          mentee.attendancePct >= 75 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {mentee.attendancePct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#E8E2D5]/60 block uppercase font-bold">Average Marks</span>
                      <span
                        className={`font-black text-sm ${
                          mentee.failCount > 0 ? 'text-rose-400' : 'text-[#F3E5AB]'
                        }`}
                      >
                        {mentee.avgMarks}% {mentee.failCount > 0 && `(${mentee.failCount} Arrears)`}
                      </span>
                    </div>
                  </div>

                  {/* Talents Summary */}
                  {(mentee.talents || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mentee.talents.map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#C5A059]/15 text-[#F3E5AB] border border-[#C5A059]/30"
                        >
                          <Award className="h-2.5 w-2.5 text-[#C5A059]" />
                          {t.skillName} ({t.category})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Link to Dossier */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#E8E2D5]/60">
                    <Phone className="h-3 w-3 text-[#C5A059]" />
                    <span>{mentee.phone || '98765 43210'}</span>
                  </div>

                  <Link
                    href={`/progress-reports?studentId=${mentee._id}`}
                    className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-[#0E1B2E] px-3.5 py-1.5 text-xs font-black shadow-md hover:brightness-110 transition-all"
                  >
                    <span>Full Dossier</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
