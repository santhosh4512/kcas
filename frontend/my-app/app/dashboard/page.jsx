'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import Badge from '../../components/ui/Badge';
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

const COLORS = ['#6D1B29', '#C5A059', '#162A45', '#10b981', '#7c3aed', '#b91c1c', '#0891b2'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data && res.data.success) {
          setStats(res.data);
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
      title="Institutional Governance Dashboard"
      subtitle="Kamban College of Arts & Science — Academic Records & Talent Intelligence Gateway"
    >
      {/* Grand Neo-Classic Executive Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B2E] via-[#162A45] to-[#4A0E18] p-6 md:p-10 text-white shadow-2xl border-2 border-[#C5A059]/40">
        {/* Ambient Radial Lights */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#C5A059]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-40 h-80 w-80 rounded-full bg-[#6D1B29]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Institutional Seal Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/60 bg-[#FAF0E6]/10 px-4 py-1.5 text-xs font-classic font-bold tracking-widest text-[#F3E5AB] mb-4 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059] animate-spin" style={{ animationDuration: '6s' }} />
            <span>EXCELLENCE IN WOMEN'S HIGHER EDUCATION</span>
          </div>

          <h2 className="font-classic text-2xl md:text-4xl font-black tracking-wide text-white leading-tight uppercase">
            Welcome, {user?.name || 'Administrator'}
          </h2>
          
          <p className="mt-2 text-xs md:text-sm text-[#E8E2D5]/90 leading-relaxed font-sans max-w-2xl">
            Institutional overview for Kamban College. Track multi-department student strength, monitor verified classroom attendance, review university examination results, and cultivate innate student talents.
          </p>

          {/* Neo-Classic Action Capsules */}
          <div className="mt-7 flex flex-wrap items-center gap-3 font-sans">
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] via-[#DFB96E] to-[#C5A059] px-5 py-2.5 text-xs font-black text-[#0E1B2E] shadow-lg shadow-[#C5A059]/30 hover:scale-102 transition-all border border-[#F3E5AB]"
            >
              <Sparkles className="h-4 w-4 text-[#0E1B2E]" />
              <span>Talent Intelligence</span>
            </Link>

            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#C5A059]/40 bg-[#0E1B2E]/60 px-4 py-2.5 text-xs font-bold text-[#F3E5AB] hover:bg-[#FAF0E6]/15 hover:border-[#C5A059] transition-all backdrop-blur-md"
            >
              <CalendarCheck className="h-4 w-4 text-[#C5A059]" />
              <span>Mark Attendance</span>
            </Link>

            <Link
              href="/students"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#C5A059]/40 bg-[#0E1B2E]/60 px-4 py-2.5 text-xs font-bold text-[#F3E5AB] hover:bg-[#FAF0E6]/15 hover:border-[#C5A059] transition-all backdrop-blur-md"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span>Student Directory</span>
            </Link>

            <Link
              href="/marks"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#C5A059]/40 bg-[#0E1B2E]/60 px-4 py-2.5 text-xs font-bold text-[#F3E5AB] hover:bg-[#FAF0E6]/15 hover:border-[#C5A059] transition-all backdrop-blur-md"
            >
              <Award className="h-4 w-4 text-amber-300" />
              <span>Semester Grades</span>
            </Link>
          </div>
        </div>
      </div>

      {/* INSTITUTIONAL CIRCULARS & CAMPUS BULLETINS NOTICE HUB */}
      <div className="mb-8 rounded-3xl border-2 border-[#C5A059]/40 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#4A0E18] p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FAF0E6]/10 border border-[#C5A059] flex items-center justify-center text-[#F3E5AB]">
              <ScrollText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-classic text-sm md:text-base font-black text-[#F3E5AB] uppercase tracking-wide">
                Campus Circulars & Examination Bulletins
              </h3>
              <p className="text-xs text-[#E8E2D5]/80">Official notices affiliated to Thiruvalluvar University & KCAS Administration</p>
            </div>
          </div>
          <span className="font-classic text-[10px] font-bold text-[#F3E5AB] bg-[#FAF0E6]/10 px-3 py-1 rounded-full border border-[#C5A059]/40 uppercase tracking-wider self-start sm:self-auto">
            Academic Session 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-[#C5A059]/30 hover:bg-white/10 transition space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-300 uppercase">Examination</span>
              <span className="text-[10px] font-mono text-slate-300">Aug 2026</span>
            </div>
            <h4 className="font-bold text-white text-xs">Thiruvalluvar Univ End-Semester Exam Schedule</h4>
            <p className="text-[11px] text-[#E8E2D5]/80">Theory & Practical examination hall tickets issued. Verify internal (25) & external (75) grade entries.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-emerald-400/30 hover:bg-white/10 transition space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-300 uppercase">Attendance Condonation</span>
              <span className="text-[10px] font-mono text-slate-300">Active</span>
            </div>
            <h4 className="font-bold text-white text-xs">Mandatory 75% Minimum Attendance Cut-off</h4>
            <p className="text-[11px] text-[#E8E2D5]/80">Students with attendance shortage (&lt;75%) flagged in red in the Attendance module for remedial sessions.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-purple-400/30 hover:bg-white/10 transition space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-300 uppercase">Talent & Sports</span>
              <span className="text-[10px] font-mono text-slate-300">Upcoming</span>
            </div>
            <h4 className="font-bold text-white text-xs">Annual Inter-Collegiate Arts & Sports Meet</h4>
            <p className="text-[11px] text-[#E8E2D5]/80">Silambam, Athletics, Coding & Classical Dance nominations underway through the Talent Intelligence module.</p>
          </div>
        </div>
      </div>

      {/* 8 Classic & Modern Bento KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Departments"
          value={stats?.kpis?.totalDepartments}
          subtitle="Academic streams"
          icon={Building2}
          color="maroon"
        />
        <StatCard
          title="Student Strength"
          value={stats?.kpis?.totalStudents}
          subtitle="Active enrolled scholars"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Faculty Roster"
          value={stats?.kpis?.totalFaculty}
          subtitle="Professors & Lecturers"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Talents Assessed"
          value={stats?.kpis?.studentsWithTalent}
          subtitle="7-Domain intelligence"
          icon={Sparkles}
          color="gold"
        />
        <StatCard
          title="Degree Programs"
          value={stats?.kpis?.totalCourses}
          subtitle="UG & PG curriculum"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Subject Modules"
          value={stats?.kpis?.totalSubjects}
          subtitle="Semester syllabus units"
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Attendance Rate"
          value={stats?.kpis?.averageAttendance || '92.5%'}
          subtitle="Institutional consistency"
          icon={CalendarCheck}
          color="emerald"
          trend={{ positive: true, text: 'Above 75% mandate' }}
        />
        <StatCard
          title="Academic Merit"
          value={stats?.kpis?.averageAcademicPercentage || '82.4%'}
          subtitle="Aggregate examination score"
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Visual Analytics Bento Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Talent Distribution */}
        <ChartCard
          title="Student Talent Distribution"
          subtitle="Dominant cognitive & expressive competencies detected across students"
          action={
            <Link
              href="/talent-analytics"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#6D1B29] hover:text-[#C5A059] transition-colors font-classic"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.talentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d5" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#4a5568', fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #C5A059',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 10px 20px -3px rgba(14, 27, 46, 0.12)',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]}>
                {(stats?.charts?.talentDistribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              className="inline-flex items-center gap-1 text-xs font-bold text-[#6D1B29] hover:text-[#C5A059] transition-colors font-classic"
            >
              <span>Departments</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.studentsByDepartment || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d5" vertical={false} />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#4a5568', fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #C5A059',
                  boxShadow: '0 10px 20px -3px rgba(14, 27, 46, 0.12)',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="students" fill="#6D1B29" radius={[8, 8, 0, 0]} name="Students Count" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#4a5568' }} allowDecimals={false} />
              <YAxis dataKey="tier" type="category" tick={{ fontSize: 10, fill: '#1a202c', fontWeight: 600 }} width={95} />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #C5A059',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#C5A059" radius={[0, 8, 8, 0]} name="Evaluations" />
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
                  <Cell key={`cell-yr-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Section: Recent Audit Log & Quick Access Hub */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity Audit Ledger */}
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 p-6 backdrop-blur-md shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-4 mb-4">
            <div>
              <h3 className="font-classic text-base font-black text-[#0E1B2E] tracking-wide uppercase">Institutional Transaction Ledger</h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-sans">Live audit registry & security record log</p>
            </div>
            <Badge variant="royal" size="sm">
              <Zap className="h-3 w-3 text-[#F3E5AB]" />
              Live Feed
            </Badge>
          </div>

          <div className="divide-y divide-[#F0EBE1]">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((act) => (
                <div key={act._id} className="flex items-start gap-3.5 py-3.5 hover:bg-[#FAF0E6]/40 rounded-xl px-2 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF0E6] text-[#6D1B29] border border-[#C5A059]/50 mt-0.5 flex-shrink-0 shadow-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0E1B2E]">
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5 font-sans">
                      Recorded by <span className="font-semibold text-[#0E1B2E]">{act.performerName}</span> ({act.performerRole}) • Module: {act.module}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#6D1B29] whitespace-nowrap bg-[#FAF0E6] px-2.5 py-0.5 rounded-full border border-[#C5A059]/30 font-mono">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-xs font-medium text-[#94A3B8]">No ledger transactions recorded in this cycle.</p>
            )}
          </div>
        </div>

        {/* Quick Operations Hub */}
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 p-6 backdrop-blur-md shadow-sm">
          <div className="border-b border-[#E8E2D5] pb-4 mb-4">
            <h3 className="font-classic text-base font-black text-[#0E1B2E] tracking-wide uppercase">Administrative Hub</h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">Direct module access</p>
          </div>

          <div className="space-y-3 font-sans">
            <Link
              href="/students"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FBF9F5] hover:border-[#6D1B29] hover:bg-[#FAF0E6]/50 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#162A45]/10 text-[#162A45] border border-[#162A45]/30 shadow-xs">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0E1B2E] group-hover:text-[#6D1B29] transition-colors">Register Student</p>
                  <p className="text-[10px] text-[#64748B]">Single or Excel batch intake</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#C5A059] group-hover:text-[#6D1B29] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/marks"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FBF9F5] hover:border-[#C5A059] hover:bg-[#FAF0E6]/50 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0E1B2E] group-hover:text-emerald-900 transition-colors">Record Marks</p>
                  <p className="text-[10px] text-[#64748B]">Internal & University results</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#C5A059] group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/talent"
              className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-[#C5A059]/60 bg-[#FAF0E6]/60 hover:border-[#C5A059] hover:bg-[#FAF0E6] transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C5A059] text-[#0E1B2E] shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#6D1B29] group-hover:text-[#0E1B2E] transition-colors">Talent Evaluation</p>
                  <p className="text-[10px] text-[#64748B]">7-category assessment</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#6D1B29] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E8E2D5] bg-[#FBF9F5] hover:border-purple-300 hover:bg-purple-50/40 transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-300 shadow-xs">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0E1B2E] group-hover:text-purple-900 transition-colors">Export Ledger</p>
                  <p className="text-[10px] text-[#64748B]">Excel & Certified Printable PDFs</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#C5A059] group-hover:text-purple-800 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


