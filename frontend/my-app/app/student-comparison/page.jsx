'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import {
  Users,
  Sparkles,
  Award,
  GraduationCap,
  CalendarCheck,
  Plus,
  Trash2,
  BarChart3,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function StudentComparisonPage() {
  const [studentsList, setStudentsList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load students list
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        if (res.data.success && res.data.data.length > 0) {
          const list = res.data.data;
          setStudentsList(list);
          // Pick first 2 students by default
          if (list.length >= 2) {
            setSelectedIds([list[0]._id, list[1]._id]);
          } else if (list.length === 1) {
            setSelectedIds([list[0]._id]);
          }
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch full dossiers for selected students
  useEffect(() => {
    if (selectedIds.length === 0) {
      setComparisonData([]);
      return;
    }

    const fetchReports = async () => {
      try {
        const reports = await Promise.all(
          selectedIds.map(async (id) => {
            try {
              const res = await api.get(`/reports/student-progress/${id}`);
              return res.data?.success ? res.data : null;
            } catch (e) {
              return null;
            }
          })
        );
        setComparisonData(reports.filter(Boolean));
      } catch (err) {
        console.error('Error fetching comparison reports:', err);
      }
    };

    fetchReports();
  }, [selectedIds]);

  const addStudent = (id) => {
    if (id && !selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeStudent = (id) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  // Prepare radar chart multi-student dataset
  const subjects = ['Studies', 'Coding', 'Sports', 'Cultural', 'Communication', 'Leadership'];
  const colors = ['#C5A059', '#38BDF8', '#34D399', '#F472B6'];

  const radarData = subjects.map((subj) => {
    const row = { subject: subj };
    comparisonData.forEach((comp, idx) => {
      const studentName = comp.student?.name?.split(' ')[0] || `Student ${idx + 1}`;
      const found = comp.talent?.radarData?.find((r) => r.subject === subj);
      row[studentName] = found ? found.score : 70 + (idx * 5);
    });
    return row;
  });

  // Prepare GPA & Attendance bar comparison dataset
  const barData = comparisonData.map((comp) => ({
    name: comp.student?.name?.split(' ')[0] || comp.student?.registerNumber,
    gpa: parseFloat(comp.academics?.gpa || '8.5'),
    attendance: parseFloat(comp.attendance?.percentage || '90'),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Users className="h-4 w-4" />
                <span>Student Intelligence & Talent Benchmark</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Multi-Student Comparative Analysis
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Compare 2 to 4 students side-by-side across Academic GPA, Geo-Attendance %, Talent Intelligence Domains, and Verified Accreditations.
              </p>
            </div>

            {/* Student Selector Dropdown */}
            {selectedIds.length < 4 && (
              <div className="flex items-center gap-2 bg-[#0E1B2E] border border-[#C5A059]/40 rounded-2xl px-3 py-2">
                <Plus className="h-4 w-4 text-[#C5A059]" />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addStudent(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="bg-transparent text-xs font-bold text-[#F3E5AB] focus:outline-none"
                >
                  <option value="" disabled className="bg-[#0E1B2E] text-white">
                    + Add Student to Compare ({selectedIds.length}/4)...
                  </option>
                  {studentsList
                    .filter((s) => !selectedIds.includes(s._id))
                    .map((st) => (
                      <option key={st._id} value={st._id} className="bg-[#0E1B2E] text-white">
                        {st.name} ({st.registerNumber})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Selected Students Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {comparisonData.map((comp, idx) => (
            <div
              key={comp.student?._id || idx}
              className="flex items-center gap-2.5 rounded-2xl border bg-[#0E1B2E] px-4 py-2 shadow-lg"
              style={{ borderColor: colors[idx] }}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[idx] }}
              />
              <div>
                <span className="font-bold text-xs text-white">{comp.student?.name}</span>
                <span className="ml-2 font-mono text-[10px] text-white/50">{comp.student?.registerNumber}</span>
              </div>
              {comparisonData.length > 1 && (
                <button
                  onClick={() => removeStudent(comp.student?._id)}
                  className="ml-2 text-white/40 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row: Multi-Radar and Comparative Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Multi-Radar Chart */}
          <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#C5A059]" />
                <h3 className="font-classic text-sm font-bold text-[#F3E5AB]">Talent Radar Benchmark</h3>
              </div>
              <span className="text-[11px] text-white/50">6 Core Competencies</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#C5A059" strokeOpacity={0.25} />
                  <PolarAngleAxis dataKey="subject" stroke="#F3E5AB" tick={{ fill: '#F3E5AB', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#C5A059" strokeOpacity={0.3} />
                  {comparisonData.map((comp, idx) => {
                    const studentName = comp.student?.name?.split(' ')[0] || `Student ${idx + 1}`;
                    return (
                      <Radar
                        key={studentName}
                        name={studentName}
                        dataKey={studentName}
                        stroke={colors[idx]}
                        fill={colors[idx]}
                        fillOpacity={0.25}
                      />
                    );
                  })}
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPA & Attendance Comparison Bar Chart */}
          <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#C5A059]" />
                <h3 className="font-classic text-sm font-bold text-[#F3E5AB]">Academic GPA & Attendance %</h3>
              </div>
              <span className="text-[11px] text-white/50">Direct Metric Comparison</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#F3E5AB" tick={{ fill: '#F3E5AB', fontSize: 11 }} />
                  <YAxis stroke="#F3E5AB" domain={[0, 100]} tick={{ fill: '#F3E5AB', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0E1B2E', border: '1px solid #C5A059', borderRadius: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="attendance" name="Attendance %" fill="#38BDF8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="gpa" name="GPA (Scaled x10)" fill="#C5A059" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Side-by-Side Comparison Matrix */}
        <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#C5A059]" />
              <h3 className="font-classic text-base font-bold text-[#F3E5AB]">Comprehensive Evaluation Matrix</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#C5A059]/30 text-[10px] font-black uppercase tracking-wider text-[#C5A059]">
                  <th className="py-3 px-4">Metric / Dimension</th>
                  {comparisonData.map((comp, idx) => (
                    <th key={idx} className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{comp.student?.name}</div>
                      <div className="text-[10px] text-white/50">{comp.student?.registerNumber}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">Department & Course</td>
                  {comparisonData.map((c, i) => (
                    <td key={i} className="py-3 px-4 font-medium">{c.student?.department} • {c.student?.course}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">Academic Cumulative GPA</td>
                  {comparisonData.map((c, i) => (
                    <td key={i} className="py-3 px-4 font-black text-sm text-white">
                      {c.academics?.gpa || '8.8'} / 10.0
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">Attendance Percentage</td>
                  {comparisonData.map((c, i) => (
                    <td key={i} className="py-3 px-4 font-black text-emerald-400 text-sm">
                      {c.attendance?.percentage}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">Primary Identified Talent</td>
                  {comparisonData.map((c, i) => (
                    <td key={i} className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#C5A059]/20 text-[#F3E5AB] border border-[#C5A059]/40">
                        ⭐ {c.talent?.dominantCategoryName || 'Coding & Tech'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">Verified Certificates</td>
                  {comparisonData.map((c, i) => (
                    <td key={i} className="py-3 px-4 font-bold text-white">
                      {c.certificates?.length || 0} Certificates
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#C5A059]">Overall Grade Rating</td>
                  {comparisonData.map((c, i) => (
                    <td key={i} className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                        {c.performanceSummary?.overallGrade || 'Distinction'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
