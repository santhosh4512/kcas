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
import { useNotification } from '../../lib/NotificationContext';
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
  FileCheck2,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  ClipboardList,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#D4AF37', '#10B981', '#06B6D4', '#8C2234', '#8B5CF6', '#F59E0B', '#3B82F6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { success, error, warning } = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [markingGps, setMarkingGps] = useState(false);
  const [gpsCheckinResult, setGpsCheckinResult] = useState(null);

  const isStudent = user?.role === 'student';

  const fetchDashboard = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Student Quick GPS Attendance Mark
  const handleQuickGpsAttendance = async () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      return;
    }

    setMarkingGps(true);
    setGpsCheckinResult(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const res = await api.post('/attendance/geo-checkin', {
            latitude,
            longitude,
            accuracy,
            status: 'Present',
          });

          if (res.data.success) {
            success(`✅ ${res.data.message}`);
            setGpsCheckinResult({
              success: true,
              message: res.data.message,
              distance: res.data.distanceMeters,
            });
            fetchDashboard();
          }
        } catch (err) {
          if (err.response?.status === 422 && err.response?.data?.requiresLateReason) {
            warning('You are marking attendance after 9:00 AM. Please proceed to the Attendance module to enter your late reason.');
            window.location.href = '/attendance';
            return;
          }
          const msg = err.response?.data?.message || 'Attendance cannot be marked because you are outside the permitted college location.';
          error(msg);
          setGpsCheckinResult({
            success: false,
            message: msg,
          });
        } finally {
          setMarkingGps(false);
        }
      },
      (geoErr) => {
        error(`GPS permission error: ${geoErr.message}`);
        setMarkingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 9-Domain Radar data for student
  const studentRadarData = stats?.myTalent?.categoryScores
    ? [
        { subject: 'Academic', score: stats.myTalent.categoryScores.studies || 0, fullMark: 100 },
        { subject: 'Silambam', score: stats.myTalent.categoryScores.silambam || 0, fullMark: 100 },
        { subject: 'Coding/Tech', score: stats.myTalent.categoryScores.technical || 0, fullMark: 100 },
        { subject: 'Dance', score: stats.myTalent.categoryScores.dance || 0, fullMark: 100 },
        { subject: 'Sports', score: stats.myTalent.categoryScores.sports || 0, fullMark: 100 },
        { subject: 'Communication', score: stats.myTalent.categoryScores.communication || 0, fullMark: 100 },
        { subject: 'Leadership', score: stats.myTalent.categoryScores.leadership || 0, fullMark: 100 },
        { subject: 'Cultural', score: stats.myTalent.categoryScores.cultural || 0, fullMark: 100 },
      ]
    : [
        { subject: 'Academic', score: 93, fullMark: 100 },
        { subject: 'Silambam', score: 95, fullMark: 100 },
        { subject: 'Coding/Tech', score: 90, fullMark: 100 },
        { subject: 'Dance', score: 82, fullMark: 100 },
        { subject: 'Sports', score: 85, fullMark: 100 },
        { subject: 'Communication', score: 78, fullMark: 100 },
        { subject: 'Leadership', score: 80, fullMark: 100 },
        { subject: 'Cultural', score: 75, fullMark: 100 },
      ];

  return (
    <DashboardLayout
      title={isStudent ? 'My Academic & Talent Dashboard' : 'Executive Intelligence Dashboard'}
      subtitle="Kamban College of Arts and Science for Women — CDMS Platform"
    >
      {/* =========================================================================
          HERO BANNER
      ========================================================================= */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#090D16] via-[#0F172A] to-[#3B0B14] p-6 md:p-10 text-white shadow-2xl border-2 border-[#D4AF37]/40">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-40 h-80 w-80 rounded-full bg-[#8C2234]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-classic font-bold tracking-widest text-[#F3E5AB] backdrop-blur-md shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '6s' }} />
              <span>KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN</span>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS Geofence: 1,000m (9:00 AM – 2:30 PM)
            </span>
          </div>

          <h2 className="font-classic text-2xl md:text-4xl font-black tracking-wide text-white leading-tight uppercase">
            Welcome, {user?.name || 'Academic Scholar'}
          </h2>

          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
            {isStudent
              ? `You are logged in to your private student portal. Review your verified attendance rate, university marks, 9-domain talent radar, and faculty notices.`
              : `Centralized department governance portal for Tiruvannamalai campus. Monitor real-time geofenced attendance, university marks, student talent discovery, and academic alerts.`}
          </p>

          {/* Quick Action Capsules */}
          <div className="mt-7 flex flex-wrap items-center gap-3 font-sans">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#D4AF37] px-4 py-2.5 text-xs font-black text-[#090D16] shadow-lg shadow-[#D4AF37]/25 hover:scale-102 transition-all border border-[#FFF8DC]"
            >
              <Search className="h-4 w-4 text-[#090D16]" />
              <span>Quick Navigation (Ctrl+K)</span>
            </button>

            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400 transition-all backdrop-blur-md"
            >
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span>{isStudent ? 'My Attendance & GPS' : 'Attendance & GPS'}</span>
            </Link>

            <Link
              href="/marks"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D4AF37]/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-[#F3E5AB] hover:bg-slate-800 hover:border-[#D4AF37] transition-all backdrop-blur-md"
            >
              <Award className="h-4 w-4 text-[#D4AF37]" />
              <span>{isStudent ? 'My Marks & Results' : 'Marks & Results'}</span>
            </Link>

            <Link
              href="/talent"
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-950/40 transition-all backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span>{isStudent ? 'My Talent Intelligence' : 'Talent Intelligence'}</span>
            </Link>

            <Link
              href="/progress-reports"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-900/80 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-950/40 transition-all backdrop-blur-md"
            >
              <ClipboardList className="h-4 w-4 text-cyan-300" />
              <span>{isStudent ? 'My Progress Report' : 'Progress Reports'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STUDENT SPECIFIC VIEW
      ========================================================================= */}
      {isStudent ? (
        <div className="space-y-8">
          {/* Top 4 Bento KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">My Attendance</span>
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <CalendarCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900">{stats?.myAttendance?.percentage || 94}%</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Today: {stats?.myAttendance?.todayStatus || 'Present'}</span>
                <span className="font-bold text-emerald-600">{stats?.myAttendance?.status || 'Healthy'}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D4AF37]/40 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Academic Average</span>
                <div className="rounded-xl bg-amber-100 p-2 text-[#701A28]">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900">{stats?.myAcademics?.academicAverage || 93}%</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Passed: {stats?.myAcademics?.passedCount || 4} Subjects</span>
                <span className="font-bold text-emerald-600">Exemplary</span>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Primary Strength</span>
                <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xl font-black text-purple-900 truncate">
                {stats?.myTalent?.primaryTalent?.[0]?.displayName || 'Silambam (95%)'}
              </p>
              <div className="mt-2 text-xs text-slate-500 truncate">
                Secondary: {stats?.myTalent?.secondaryStrength?.[0]?.displayName || 'Coding (90%)'}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Certificates & Awards</span>
                <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
                  <FileCheck2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900">{stats?.myCertificatesCount || 2}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Verified Accreditations</span>
                <span className="font-bold text-cyan-600">State Level</span>
              </div>
            </div>
          </div>

          {/* Quick GPS Check-In Radar + My Profile Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GPS Check-in Card */}
            <div className="rounded-3xl border-2 border-emerald-500/35 bg-gradient-to-b from-[#090D16] via-[#0F172A] to-[#0A192F] p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h4 className="font-classic text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Live GPS Attendance Check-In
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">12.1906° N, 79.0838° E</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Allowed Campus Geofence: <strong>1,000 Meters</strong>. Timing: <strong>9:00 AM – 2:30 PM</strong>.
                </p>

                {gpsCheckinResult && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-bold border ${
                      gpsCheckinResult.success
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    {gpsCheckinResult.message}
                  </div>
                )}
              </div>

              <button
                onClick={handleQuickGpsAttendance}
                disabled={markingGps}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/50 transition disabled:opacity-50"
              >
                <Navigation className="h-4 w-4" />
                <span>{markingGps ? 'Verifying Coordinates...' : 'Mark Present (GPS Check)'}</span>
              </button>
            </div>

            {/* 9-Domain Talent Radar Chart Card */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#701A28]" />
                  <h3 className="font-bold text-sm text-slate-900">My 9-Domain Talent Intelligence Radar</h3>
                </div>
                <Link href="/talent" className="text-xs font-bold text-[#701A28] hover:underline flex items-center gap-1">
                  Full Evaluation <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={studentRadarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 9 }} />
                    <Radar name="My Score" dataKey="score" stroke="#701A28" fill="#701A28" fillOpacity={0.4} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Suggestions */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-500">Talent Development Pathway:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 text-xs text-slate-700">
                  {(stats?.myTalent?.suggestions || [
                    'Advanced traditional weapon rotation & sparring masterclasses',
                    'State Level Silambam Championship participation',
                    'Full stack coding hackathon leadership',
                  ]).slice(0, 2).map((sugg, i) => (
                    <div key={i} className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{sugg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Marks & Subjects Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Enrolled Subjects & Latest University Marks</h3>
                <p className="text-xs text-slate-500">B.Sc. Computer Science • Semester 3</p>
              </div>
              <Link href="/marks" className="text-xs font-bold text-[#701A28] hover:underline">
                View All Results →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Subject Code</th>
                    <th className="p-3">Subject Name</th>
                    <th className="p-3">Internal (25)</th>
                    <th className="p-3">External (75)</th>
                    <th className="p-3">Total (100)</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.myAcademics?.marks?.length ? stats.myAcademics.marks : [
                    { subjectCode: 'CS301', subjectName: 'Data Structures & Algorithms', internalMark: 22, externalMark: 66, totalMark: 88, grade: 'A+', resultStatus: 'Pass' },
                    { subjectCode: 'CS302', subjectName: 'Database Management Systems', internalMark: 23, externalMark: 69, totalMark: 92, grade: 'O', resultStatus: 'Pass' },
                    { subjectCode: 'CS303', subjectName: 'Operating Systems & Linux', internalMark: 21, externalMark: 64, totalMark: 85, grade: 'A+', resultStatus: 'Pass' },
                    { subjectCode: 'CS304', subjectName: 'Computer Networks', internalMark: 24, externalMark: 70, totalMark: 94, grade: 'O', resultStatus: 'Pass' },
                  ]).map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-700">{m.subjectCode}</td>
                      <td className="p-3 font-semibold text-slate-900">{m.subjectName}</td>
                      <td className="p-3 text-slate-600">{m.internalMark}/25</td>
                      <td className="p-3 text-slate-600">{m.externalMark}/75</td>
                      <td className="p-3 font-bold text-slate-900">{m.totalMark}/100</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-200 text-[10px]">
                          {m.grade}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                          {m.resultStatus || 'Pass'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            FACULTY & ADMIN VIEW
        ========================================================================= */
        <div className="space-y-8">
          {/* Bento KPI Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Enrolled Students"
              value={stats?.kpis?.totalStudents || 0}
              subtitle="All Active Academic Cohorts"
              icon={GraduationCap}
              color="emerald"
            />
            <StatCard
              title="Today's Present"
              value={stats?.kpis?.todayPresent || 0}
              subtitle={`Late: ${stats?.kpis?.todayLate || 0} • Absent: ${stats?.kpis?.todayAbsent || 0}`}
              icon={CalendarCheck}
              color="amber"
            />
            <StatCard
              title="GPS Location Alerts"
              value={stats?.kpis?.locationAlertsCount || 0}
              subtitle="Geofence Exceptions & Alerts"
              icon={AlertTriangle}
              color="rose"
            />
            <StatCard
              title="Talent Profiled"
              value={stats?.kpis?.studentsWithTalent || 0}
              subtitle="Evaluated across 9 domains"
              icon={Sparkles}
              color="maroon"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Department-Wise Student Strength" subtitle="Live cohort distribution">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats?.charts?.studentsByDepartment || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#701A28" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Dominant Student Talent Categories" subtitle="Aggregated institutional strengths">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats?.charts?.talentDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </DashboardLayout>
  );
}
