'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChartCard from '../../components/ui/ChartCard';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import {
  BarChart3,
  Sparkles,
  Trophy,
  Users,
  Award,
  BookOpen,
  Dumbbell,
  Palette,
  Code2,
  MessageSquare,
  Crown,
  Filter,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function DepartmentTalentAnalyticsPage() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Cohort Filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [analyticsData, setAnalyticsData] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { error } = useNotification();

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [dRes, cRes] = await Promise.all([api.get('/departments'), api.get('/courses')]);
        if (dRes.data.success) setDepartments(dRes.data.data);
        if (cRes.data.success) setCourses(cRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        department: selectedDept,
        course: selectedCourse,
        year: selectedYear,
        semester: selectedSemester,
        section: selectedSection,
        category: categoryFilter,
      };

      const res = await api.get('/talent/analytics', { params });
      if (res.data.success) {
        setAnalyticsData(res.data.analytics);
        setTopStudents(res.data.topStudents || []);
      }
    } catch (err) {
      error('Failed to compute department talent analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, selectedCourse, selectedYear, selectedSemester, selectedSection, categoryFilter]);

  return (
    <DashboardLayout
      title="Department Talent Analytics"
      subtitle="Cohort strength distribution, dominant talent calculation, and institutional analytics"
    >
      {/* Filter Control Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Cohort Analytics Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Course Program</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Programs</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseName} ({c.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Years</option>
              <option value="I Year">I Year</option>
              <option value="II Year">II Year</option>
              <option value="III Year">III Year</option>
              <option value="IV Year">IV Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Semesters</option>
              {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Highlight Focus</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Disciplines</option>
              <option value="Sports">Sports Strength</option>
              <option value="Technical">Technical Strength</option>
              <option value="Arts">Arts Strength</option>
              <option value="Communication">Communication</option>
              <option value="Studies">Studies Focus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dominant Department Talent Card & Synthesized Dynamic Sentence */}
      {analyticsData && (
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-blue-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                Department Dominance Result
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                Dominant Cohort Talent: {analyticsData.dominantTalent}
              </h2>
              {/* Dynamic Sentence synthesized in backend from real DB data */}
              <p className="mt-2 text-xs md:text-sm text-slate-200 font-medium leading-relaxed italic bg-white/10 p-3.5 rounded-2xl border border-white/15">
                &ldquo;{analyticsData.groupSummary}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[220px]">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-300">Cohort Size</span>
                <p className="text-2xl font-black text-white">{analyticsData.totalStudents}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-300">Dominance Rate</span>
                <p className="text-2xl font-black text-white">{analyticsData.dominantPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Category Average Benchmarks */}
      {analyticsData?.categoryAverageScores && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { key: 'studies', label: 'Studies', icon: BookOpen, color: 'text-blue-600' },
            { key: 'sports', label: 'Sports', icon: Dumbbell, color: 'text-emerald-600' },
            { key: 'arts', label: 'Arts & Culture', icon: Palette, color: 'text-purple-600' },
            { key: 'technical', label: 'Technical', icon: Code2, color: 'text-indigo-600' },
            { key: 'communication', label: 'Communication', icon: MessageSquare, color: 'text-amber-600' },
            { key: 'leadership', label: 'Leadership', icon: Crown, color: 'text-rose-600' },
            { key: 'other', label: 'Other Skills', icon: Award, color: 'text-slate-600' },
          ].map((cat) => {
            const Icon = cat.icon;
            const avg = analyticsData.categoryAverageScores[cat.key] || 0;
            return (
              <div
                key={cat.key}
                className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs text-center"
              >
                <div className="flex items-center justify-center mb-1">
                  <Icon className={`h-4 w-4 ${cat.color}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {cat.label}
                </span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{avg}%</p>
                <span className="text-[9px] text-slate-400">Cohort Average</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Talent Category Breakdown Count */}
        <ChartCard
          title="Talent Category Breakdown (Student Count)"
          subtitle="Number of students identifying each field as primary strength"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analyticsData?.distribution || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                {(analyticsData?.distribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Percentage Share Distribution */}
        <ChartCard
          title="Talent Percentage Distribution"
          subtitle="Proportional representation of talent categories"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.distribution?.filter((d) => d.count > 0) || []}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
                dataKey="count"
                nameKey="category"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {(analyticsData?.distribution || []).map((_, index) => (
                  <Cell key={`cell-p-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Performing Students Table in Selected Group */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Talent Champions in Selected Cohort
            </h3>
            <p className="text-xs text-slate-500">Highest scoring individuals across all categories</p>
          </div>
          <Badge variant="gold" size="sm">
            🏆 Top Ranked
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Register No</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Primary Talent Field</th>
                <th className="px-5 py-3">Top Score</th>
                <th className="px-5 py-3">Secondary Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topStudents.map((st, idx) => (
                <tr key={st._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="px-5 py-3 font-mono font-bold text-blue-700">
                    {st.registerNumber}
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-900">{st.studentName}</td>
                  <td className="px-5 py-3">
                    <Badge variant="talent" size="sm">
                      {st.dominantCategoryName}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-extrabold text-sm text-slate-900">
                    {st.highestScore}%
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {st.secondaryStrength?.[0]?.displayName ? (
                      `${st.secondaryStrength[0].displayName} (${st.secondaryStrength[0].score}%)`
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
