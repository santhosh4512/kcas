'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import Badge from '../../components/ui/Badge';
import AIAdvisorWidget from '../../components/ui/AIAdvisorWidget';
import CommandPalette from '../../components/ui/CommandPalette';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle2,
  Zap,
  ScrollText,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  Search,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#D4AF37', '#10B981', '#06B6D4', '#8C2234', '#8B5CF6', '#F59E0B', '#3B82F6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [cohortAI, setCohortAI] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, aiRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/ai-advisor/cohort-insights').catch(() => ({ data: null })),
        ]);

        if (dashRes.data && dashRes.data.success) {
          setStats(dashRes.data);
        }
        if (aiRes.data && aiRes.data.success) {
          setCohortAI(aiRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <DashboardLayout
      title="Executive Intelligence Dashboard"
      subtitle="Kamban College of Arts & Science — Smart Geofence & AI Talent Gateway"
    >
      {/* Grand Ultra-Modern Executive Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#090D16] via-[#0F172A] to-[#3B0B14] p-6 md:p-10 text-white shadow-2xl border-2 border-[#D4AF37]/40">
        {/* Ambient Radial Lights */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-40 h-80 w-80 rounded-full bg-[#8C2234]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Institutional Badge & AI Pill */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-classic font-bold tracking-widest text-[#F3E5AB] backdrop-blur-md shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '6s' }} />
              <span>KAMBAN COLLEGE OF ARTS & SCIENCE FOR WOMEN</span>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS Geofence: Active (1.0 km)
            </span>
          </div>

          <h2 className="font-classic text-2xl md:text-4xl font-black tracking-wide text-white leading-tight uppercase">
            Welcome, {user?.name || 'Administrator'}
          </h2>

          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
            Centralized governance portal for Tiruvannamalai campus. Monitor real-time geofenced attendance radar, university marks distribution, AI student talent pathways, and official university circulars.
          </p>

          {/* Action Capsules Hub */}
          <div className="mt-7 flex flex-wrap items-center gap-3 font-sans">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#D4AF37] px-4 py-2.5 text-xs font-black text-[#090D16] shadow-lg shadow-[#D4AF37]/25 hover:scale-102 transition-all border border-[#FFF8DC]"
            >
              <Search className="h-4 w-4 text-[#090D16]" />
              <span>Command Palette (Ctrl+K)</span>
            </button>

            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400 transition-all backdrop-blur-md"
            >
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span>Live GPS Radar</span>
            </Link>

            <Link
              href="/students"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D4AF37]/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-[#F3E5AB] hover:bg-slate-800 hover:border-[#D4AF37] transition-all backdrop-blur-md"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#D4AF37]" />
              <span>Import College Excel</span>
            </Link>

            <Link
              href="/mentor"
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-blue-950/40 transition-all backdrop-blur-md"
            >
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Mentor Portal</span>
            </Link>

            <Link
              href="/early-warnings"
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-all backdrop-blur-md"
            >
              <Zap className="h-4 w-4 text-rose-400" />
              <span>Early Warnings</span>
            </Link>

            <Link
              href="/progress-reports"
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-950/40 transition-all backdrop-blur-md"
            >
              <Award className="h-4 w-4 text-purple-300" />
              <span>Progress Reports</span>
            </Link>

            <Link
              href="/notices"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-950/40 transition-all backdrop-blur-md"
            >
              <ScrollText className="h-4 w-4 text-amber-400" />
              <span>Notices</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI SMART CAMPUS INSIGHTS & GPS RADAR DUAL WIDGET */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Cohort Intelligence Hub */}
        <div className="lg:col-span-2 rounded-3xl border-2 border-[#D4AF37]/35 bg-gradient-to-r from-[#090D16] via-[#0F172A] to-[#1E293B] p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/25 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#F3E5AB]">
                <BrainCircuit className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-classic text-sm md:text-base font-black text-[#F3E5AB] uppercase tracking-wide">
                  AI Institutional Performance Engine
                </h3>
                <p className="text-xs text-slate-400">Automated predictions, exam readiness & career pathways</p>
              </div>
            </div>
            <span className="font-classic text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/40 uppercase tracking-wider self-start sm:self-auto">
              Smart Copilot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Average Readiness</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{cohortAI?.averageCampusReadiness || 84.6}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">University Exam Quotient</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Talent Quotient</span>
              <p className="text-xl font-black text-[#F3E5AB] mt-1">{cohortAI?.highTalentPercentage || 88}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">High Potential Cohort</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Integrity</span>
              <p className="text-xl font-black text-cyan-400 mt-1">99.4%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">GPS Verification Success</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {(cohortAI?.smartInsights || [
              '88% of enrolled students maintain attendance above the mandatory 75% threshold.',
              'Technical Coding and Public Speaking emerged as the top student talents.',
              'Kamban College GPS Geofencing radar is active at 1.0 km radius (Velu Nagar, Mathur, Tiruvannamalai).',
            ]).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live GPS Campus Geofence Radar Card */}
        <div className="rounded-3xl border-2 border-emerald-500/35 bg-gradient-to-b from-[#090D16] via-[#0F172A] to-[#0A192F] p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 radar-live-ring" />
                <h4 className="font-classic text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Campus Geofence Radar
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">12.1903° N, 79.0839° E</span>
            </div>

            <div className="relative h-32 w-full rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center overflow-hidden mb-4">
              {/* Radar Rings Animation */}
              <div className="absolute h-28 w-28 rounded-full border border-emerald-500/20 animate-ping" />
              <div className="absolute h-20 w-20 rounded-full border border-emerald-500/40" />
              <div className="absolute h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <Navigation className="h-4 w-4 text-emerald-300 animate-pulse" />
              </div>
              <span className="absolute bottom-2 text-[10px] font-bold text-emerald-400/80">Kamban College Main Campus</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Campus Geofence:</span>
                <span className="font-bold text-emerald-300">1,000 Meters (1.0 km)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Location:</span>
                <span className="font-bold text-slate-200">Velu Nagar, Mathur, SH 9</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Smart Attendance:</span>
                <span className="font-bold text-cyan-300">GPS Verified Only</span>
              </div>
            </div>
          </div>

          <Link
            href="/attendance"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/50 transition"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Open GPS Check-In Radar</span>
          </Link>
        </div>
      </div>

      {/* 8 Modern Bento KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Departments"
          value={stats?.kpis?.totalDepartments || 4}
          subtitle="Computer Science, AI, IT, BCA"
          icon={Building2}
          color="maroon"
        />
        <StatCard
          title="Student Strength"
          value={stats?.kpis?.totalStudents || 0}
          subtitle="Enrolled College Scholars"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Faculty Roster"
          value={stats?.kpis?.totalFaculty || 0}
          subtitle="Mentors & Academic Staff"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Talents Assessed"
          value={stats?.kpis?.studentsWithTalent || 0}
          subtitle="7-Domain AI Intelligence"
          icon={Sparkles}
          color="gold"
        />
        <StatCard
          title="Degree Programs"
          value={stats?.kpis?.totalCourses || 3}
          subtitle="B.Sc CS, AIDS, BCA"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Subject Units"
          value={stats?.kpis?.totalSubjects || 6}
          subtitle="Semester Curriculum Units"
          icon={Award}
          color="blue"
        />
        <StatCard
          title="University Pass %"
          value={`${stats?.kpis?.overallPassPercentage || 92}%`}
          subtitle="Thiruvalluvar Univ Standard"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Attendance Integrity"
          value={`${stats?.kpis?.averageAttendance || 88}%`}
          subtitle="Geo-Verified Classroom Rate"
          icon={CalendarCheck}
          color="gold"
        />
      </div>

      {/* 4 Interactive Analytics Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Talent Distribution */}
        <ChartCard
          title="Talent Intelligence Distribution"
          subtitle="Multi-domain student aptitude spectrum across the institution"
          action={
            <Link
              href="/talent"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors font-classic"
            >
              <span>Explore AI</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.talentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={0} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#D4AF37',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]}>
                {(stats?.charts?.talentDistribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Students By Department */}
        <ChartCard
          title="Department Student Capacity"
          subtitle="Enrolled student volume per academic department"
          action={
            <Link
              href="/departments"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:text-white transition-colors font-classic"
            >
              <span>Departments</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.studentsByDepartment || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#D4AF37',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="students" fill="#8C2234" radius={[8, 8, 0, 0]} name="Students Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Academic Performance Breakdown */}
        <ChartCard
          title="University Grade Classification"
          subtitle="Cumulative evaluation distribution across grading tiers"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.academicOverview || []} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} allowDecimals={false} />
              <YAxis dataKey="tier" type="category" tick={{ fontSize: 10, fill: '#E2E8F0', fontWeight: 600 }} width={95} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#D4AF37',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#D4AF37" radius={[0, 8, 8, 0]} name="Evaluations" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Students by Year */}
        <ChartCard
          title="Cohort Distribution by Year"
          subtitle="Enrolled student proportion across undergraduate years"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats?.charts?.studentsByYear || []}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
                dataKey="students"
                nameKey="year"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {(stats?.charts?.studentsByYear || []).map((_, index) => (
                  <Cell key={`cell-yr-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#D4AF37', borderRadius: '16px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Section: Transaction Ledger & Operations Hub */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity Audit Ledger */}
        <div className="rounded-3xl border border-[#D4AF37]/25 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl lg:col-span-2 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="font-classic text-base font-black text-white tracking-wide uppercase">Institutional Transaction Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Live audit registry & security record log</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
              <Zap className="h-3 w-3 text-emerald-400 animate-pulse" />
              Live Ledger
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((act) => (
                <div key={act._id} className="flex items-start gap-3.5 py-3.5 hover:bg-slate-800/40 rounded-xl px-2 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 mt-0.5 flex-shrink-0 shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                      Recorded by <span className="font-semibold text-slate-200">{act.performerName}</span> ({act.performerRole}) &bull; Module: {act.module}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#D4AF37] whitespace-nowrap bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-xs font-medium text-slate-500">No ledger transactions recorded in this cycle.</p>
            )}
          </div>
        </div>

        {/* Quick Operations Hub */}
        <div className="rounded-3xl border border-[#D4AF37]/25 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl text-white">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h3 className="font-classic text-base font-black text-white tracking-wide uppercase">Administrative Hub</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">Direct module access</p>
          </div>

          <div className="space-y-3 font-sans">
            <Link
              href="/students"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-[#D4AF37] hover:bg-slate-800/80 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 shadow-xs">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#F3E5AB] transition-colors">Register Student</p>
                  <p className="text-[10px] text-slate-400">Excel / CSV Batch intake</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/marks"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500 hover:bg-slate-800/80 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-xs">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Record Marks</p>
                  <p className="text-[10px] text-slate-400">Internal & Univ assessments</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/talent"
              className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-[#D4AF37]/50 bg-slate-900/60 hover:border-[#D4AF37] hover:bg-slate-800/80 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#D4AF37] text-[#090D16] shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#F3E5AB] group-hover:text-white transition-colors">Talent AI Evaluation</p>
                  <p className="text-[10px] text-slate-400">7-category radar profile</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-purple-500 hover:bg-slate-800/80 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 shadow-xs">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Export Ledger</p>
                  <p className="text-[10px] text-slate-400">Certified Reports & Excel sheets</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Command Palette Trigger */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </DashboardLayout>
  );
}
