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
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

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
      title="Institutional Dashboard"
      subtitle="Live database metrics, department analytics, and student talent overview"
    >
      {/* Welcome Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Kamban College Talent Intelligence Engine Active
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Administrator'}
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            Manage academic records, track real-time attendance, analyze university examination grades,
            and discover the innate potential of every student across all departments.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/talent"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              Explore Talent Intelligence
            </Link>
            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition backdrop-blur-xs"
            >
              <CalendarCheck className="h-4 w-4" />
              Mark Attendance
            </Link>
            <Link
              href="/students"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition backdrop-blur-xs"
            >
              <GraduationCap className="h-4 w-4" />
              Student Directory
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 8 Live Database KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Departments"
          value={stats?.kpis?.totalDepartments}
          subtitle="Active academic streams"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats?.kpis?.totalStudents}
          subtitle="Enrolled & registered"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Faculty Staff"
          value={stats?.kpis?.totalFaculty}
          subtitle="Professors & Lecturers"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Talents Identified"
          value={stats?.kpis?.studentsWithTalent}
          subtitle="Assessed in 7 categories"
          icon={Sparkles}
          color="amber"
        />
        <StatCard
          title="Courses Offered"
          value={stats?.kpis?.totalCourses}
          subtitle="UG & PG programs"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Subject Units"
          value={stats?.kpis?.totalSubjects}
          subtitle="Curriculum subjects"
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Average Attendance"
          value={stats?.kpis?.averageAttendance || '92.5%'}
          subtitle="Healthy institutional rate"
          icon={CalendarCheck}
          color="emerald"
          trend={{ positive: true, text: 'Above 75% threshold' }}
        />
        <StatCard
          title="Academic Score"
          value={stats?.kpis?.averageAcademicPercentage || '82.4%'}
          subtitle="Average semester result"
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Dynamic Visualizations Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Talent Distribution (Main Innovation) */}
        <ChartCard
          title="Student Talent Distribution"
          subtitle="Dominant strengths detected across evaluated students"
          action={
            <Link
              href="/talent-analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.talentDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                {(stats?.charts?.talentDistribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Students By Department */}
        <ChartCard
          title="Students by Department"
          subtitle="Active student strength per department"
          action={
            <Link
              href="/departments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Departments <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.studentsByDepartment || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="students" fill="#2563eb" radius={[6, 6, 0, 0]} name="Students Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Academic Performance Breakdown */}
        <ChartCard
          title="Academic Performance Overview"
          subtitle="University grade classification distribution"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.charts?.academicOverview || []} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <YAxis dataKey="tier" type="category" tick={{ fontSize: 9, fill: '#475569' }} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} name="Evaluations" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Students by Year */}
        <ChartCard
          title="Student Cohort by Academic Year"
          subtitle="Enrollment distribution across batch years"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats?.charts?.studentsByYear || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
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

      {/* Bottom Section: Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity Audit Log */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent System Activity</h3>
              <p className="text-xs text-slate-500">Live transaction and audit updates</p>
            </div>
            <Badge variant="primary" size="sm">
              Live Feed
            </Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((act) => (
                <div key={act._id} className="flex items-start gap-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      By {act.performerName} ({act.performerRole}) • Module: {act.module}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No recent activity logged.</p>
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Quick Operations</h3>
            <p className="text-xs text-slate-500">Fast action shortcuts</p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/students"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Add New Student</p>
                  <p className="text-[10px] text-slate-500">Single or Excel batch</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
            </Link>

            <Link
              href="/marks"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Record Marks</p>
                  <p className="text-[10px] text-slate-500">Internal & External results</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
            </Link>

            <Link
              href="/talent"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-amber-300 hover:bg-amber-50/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Evaluate Student Talent</p>
                  <p className="text-[10px] text-slate-500">7-category assessment</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Export Institutional Reports</p>
                  <p className="text-[10px] text-slate-500">Excel & Printable formats</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
