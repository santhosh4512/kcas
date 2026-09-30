'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  AlertTriangle,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function FacultyWorkloadPage() {
  const [workloadList, setWorkloadList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkload = async () => {
    setLoading(true);
    try {
      const [workloadRes, deptsRes] = await Promise.all([
        api.get('/faculty-workload', {
          params: {
            department: selectedDept !== 'All' ? selectedDept : undefined,
            search: search || undefined,
          },
        }),
        api.get('/departments'),
      ]);

      if (workloadRes.data.success) {
        setWorkloadList(workloadRes.data.data || []);
      }
      if (deptsRes.data.success) {
        setDepartments(deptsRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading faculty workload:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, [selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkload();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Briefcase className="h-4 w-4" />
                <span>Academic Operations & Staff Performance</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Faculty Workload & Engagement Dashboard
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Comprehensive tracking of faculty subject allocations, student mentorship ratios, attendance entry completion, and pending GPS location alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0E1B2E] p-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty name, employee ID, designation..."
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-[#C5A059]" />
              <span className="text-[11px] font-bold text-white/70">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#F3E5AB] focus:outline-none"
              >
                <option value="All" className="bg-[#0E1B2E] text-white">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id} className="bg-[#0E1B2E] text-white">
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workload Cards / Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1B2E] shadow-2xl">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#C5A059]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
                <span>Loading faculty workload analytics...</span>
              </div>
            </div>
          ) : workloadList.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-3 text-sm font-bold text-white">No Faculty Records Found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-[10px] font-black uppercase tracking-wider text-[#C5A059]">
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Assigned Subjects</th>
                    <th className="py-3.5 px-4 text-center">Student Reach</th>
                    <th className="py-3.5 px-4 text-center">Mentored</th>
                    <th className="py-3.5 px-4 text-center">Attendance %</th>
                    <th className="py-3.5 px-4 text-center">Marks Entry %</th>
                    <th className="py-3.5 px-4 text-center">GPS Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {workloadList.map((f) => (
                    <tr key={f.facultyId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{f.name}</div>
                        <div className="text-[11px] text-[#C5A059]">{f.designation} • {f.employeeId}</div>
                        <div className="text-[10px] text-white/40">{f.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{f.department}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {f.assignedSubjects.length > 0 ? (
                            f.assignedSubjects.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A059]/15 text-[#F3E5AB] border border-[#C5A059]/30"
                              >
                                {s.code} ({s.name})
                              </span>
                            ))
                          ) : (
                            <span className="text-white/40 italic">General Department Faculty</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {f.studentReachCount} Students
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#C5A059]">
                        {f.mentoredStudentsCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-400">
                          <span>{f.attendanceCompletionPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold text-[#F3E5AB]">
                          <span>{f.marksCompletionPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {f.unreadAlertsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
                            {f.unreadAlertsCount} Unread
                          </span>
                        ) : (
                          <span className="text-white/40 text-[11px]">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
