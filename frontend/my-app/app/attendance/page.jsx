'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  AlertTriangle,
  History,
  CheckCheck,
  Calendar,
  Layers,
  Search,
  Check,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';

export default function AttendancePage() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Cohort Selection
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Sheet State
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  // Tab State: 'mark' | 'summary' | 'history'
  const [activeTab, setActiveTab] = useState('mark');
  const [historyList, setHistoryList] = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const canMark = hasRole('admin', 'faculty');

  // Load initial dropdowns
  useEffect(() => {
    const initDropdowns = async () => {
      try {
        const [dRes, cRes, sRes] = await Promise.all([
          api.get('/departments'),
          api.get('/courses'),
          api.get('/subjects'),
        ]);

        if (dRes.data.success && dRes.data.data.length > 0) {
          setDepartments(dRes.data.data);
          const firstDeptId = dRes.data.data[0]._id;
          setSelectedDept(firstDeptId);

          if (cRes.data.success && cRes.data.data.length > 0) {
            setCourses(cRes.data.data);
            const deptCourses = cRes.data.data.filter(
              (c) => String(c.department?._id || c.department) === String(firstDeptId)
            );
            const firstCourseId = deptCourses[0]?._id || cRes.data.data[0]._id;
            setSelectedCourse(firstCourseId);

            if (sRes.data.success && sRes.data.data.length > 0) {
              setSubjects(sRes.data.data);
              const courseSubjects = sRes.data.data.filter(
                (s) => String(s.course?._id || s.course) === String(firstCourseId)
              );
              setSelectedSubject(courseSubjects[0]?._id || sRes.data.data[0]._id);
            }
          }
        }
      } catch (err) {
        error('Failed to load attendance criteria.');
      }
    };

    initDropdowns();
  }, []);

  // Handle department change with cascading selection
  const handleDepartmentChange = (deptId) => {
    setSelectedDept(deptId);
    const deptCourses = courses.filter(
      (c) => String(c.department?._id || c.department) === String(deptId)
    );
    const newCourseId = deptCourses[0]?._id || (courses[0]?._id || '');
    setSelectedCourse(newCourseId);

    const courseSubjects = subjects.filter(
      (s) => String(s.course?._id || s.course) === String(newCourseId)
    );
    setSelectedSubject(courseSubjects[0]?._id || (subjects[0]?._id || ''));
  };

  // Handle course change with cascading subjects
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    const courseSubjects = subjects.filter(
      (s) => String(s.course?._id || s.course) === String(courseId)
    );
    if (courseSubjects.length > 0) {
      setSelectedSubject(courseSubjects[0]._id);
    }
  };

  // Fetch student mark sheet when filters change
  const fetchAttendanceSheet = async () => {
    if (!selectedDept || !selectedCourse || !selectedDate) return;

    setLoading(true);
    try {
      const res = await api.get('/attendance/sheet', {
        params: {
          department: selectedDept,
          course: selectedCourse,
          year: selectedYear,
          semester: selectedSemester,
          section: selectedSection,
          subject: selectedSubject,
          date: selectedDate,
        },
      });

      if (res.data.success) {
        setAttendanceRecords(res.data.data);
        setIsExisting(res.data.exists);
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark' && selectedDept && selectedCourse) {
      fetchAttendanceSheet();
    } else if (activeTab === 'history' && selectedDept) {
      fetchHistory();
    } else if (activeTab === 'summary' && selectedDept && selectedCourse) {
      fetchSummary();
    }
  }, [selectedDept, selectedCourse, selectedYear, selectedSemester, selectedSection, selectedSubject, selectedDate, activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/attendance/history', {
        params: {
          department: selectedDept,
          course: selectedCourse,
          subject: selectedSubject,
        },
      });
      if (res.data.success) setHistoryList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/attendance/summary', {
        params: {
          department: selectedDept,
          course: selectedCourse,
          year: selectedYear,
          semester: selectedSemester,
          section: selectedSection,
        },
      });
      if (res.data.success) setClassSummary(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = (index, newStatus) => {
    const updated = [...attendanceRecords];
    updated[index].status = newStatus;
    setAttendanceRecords(updated);
  };

  const handleMarkAll = (status) => {
    const updated = attendanceRecords.map((r) => ({ ...r, status }));
    setAttendanceRecords(updated);
    success(`Marked all ${attendanceRecords.length} students as ${status}!`);
  };

  const handleSaveAttendance = async () => {
    if (!canMark) {
      warning('Only faculty and administrators can record attendance.');
      return;
    }

    if (attendanceRecords.length === 0) {
      warning('No students in list to record attendance.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        department: selectedDept,
        course: selectedCourse,
        year: selectedYear === 'All' ? 'I Year' : selectedYear,
        semester: selectedSemester === 'All' ? 'Semester 1' : selectedSemester,
        section: selectedSection === 'All' ? 'A' : selectedSection,
        subject: selectedSubject || undefined,
        date: selectedDate,
        records: attendanceRecords,
      };

      const res = await api.post('/attendance/save', payload);
      if (res.data.success) {
        success('Class attendance saved & student profiles updated successfully!');
        setIsExisting(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = attendanceRecords.filter(
    (r) => r.status === 'Present' || r.status === 'On Duty'
  ).length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
  const odCount = attendanceRecords.filter((r) => r.status === 'On Duty').length;
  const totalCount = attendanceRecords.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 1000) / 10 : 0;

  const filteredRecords = attendanceRecords.filter((r) => {
    if (!searchStudent) return true;
    const q = searchStudent.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.registerNumber?.toLowerCase().includes(q) ||
      r.rollNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout
      title="Attendance & Daily Roster Governance"
      subtitle="Track daily student presence, subject attendance, and identify shortage candidates"
    >
      {/* Grand Neo-Classic Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B2E] via-[#162A45] to-[#4A0E18] p-6 md:p-8 text-white shadow-2xl border-2 border-[#C5A059]/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/60 bg-[#FAF0E6]/10 px-3.5 py-1 text-xs font-classic font-bold text-[#F3E5AB] mb-3 backdrop-blur-md">
              <CalendarCheck className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Institutional Attendance Governance</span>
            </div>
            <h2 className="font-classic text-xl md:text-3xl font-black tracking-wide text-white uppercase">
              Daily Classroom Attendance Register
            </h2>
            <p className="mt-1 text-xs md:text-sm text-[#E8E2D5]/90 font-sans max-w-xl">
              Select Department & Class stream to immediately mark student presence (Present, Absent, On-Duty) and synchronize talent discipline ratings.
            </p>
          </div>

          {/* Quick Date Indicator */}
          <div className="p-4 rounded-2xl border border-[#C5A059]/40 bg-[#0E1B2E]/60 backdrop-blur-md text-xs text-right">
            <span className="text-[10px] font-classic font-bold uppercase tracking-wider text-[#C5A059]">Active Date:</span>
            <p className="font-mono font-black text-lg text-white mt-0.5">{selectedDate}</p>
            <span className="text-[10px] text-emerald-400 font-bold">
              {isExisting ? '✓ Recorded in Database' : '⚡ Live Pending Submission'}
            </span>
          </div>
        </div>
      </div>

      {/* STEPPED SELECTION FILTER BAR */}
      <div className="mb-6 rounded-3xl border border-[#C5A059]/40 bg-white/95 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#6D1B29]" />
            <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
              Step 1 & 2: Select Department, Class & Date
            </h3>
          </div>
          <button
            onClick={fetchAttendanceSheet}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0E1B2E] bg-[#FAF0E6] hover:bg-[#FAF0E6]/80 rounded-xl border border-[#C5A059]/40 transition shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#6D1B29] uppercase mb-1">
              1. Department *
            </label>
            <select
              value={selectedDept}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#6D1B29] uppercase mb-1">
              2. Class / Degree Course *
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden"
            >
              {courses
                .filter(
                  (c) =>
                    !selectedDept ||
                    String(c.department?._id || c.department) === String(selectedDept)
                )
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
              Subject Unit
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden"
            >
              <option value="">-- All / General Class --</option>
              {subjects
                .filter(
                  (s) =>
                    !selectedCourse ||
                    String(s.course?._id || s.course) === String(selectedCourse)
                )
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectCode} - {s.subjectName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden"
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
            <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold font-mono text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 p-4.5 text-center shadow-xs">
          <span className="font-classic text-[10px] font-bold text-[#6D1B29] uppercase tracking-wider">Class Strength</span>
          <p className="text-2xl font-black font-mono text-[#0E1B2E] mt-1">{totalCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Enrolled Scholars</span>
        </div>
        <div className="rounded-3xl border border-emerald-300 bg-emerald-50/80 p-4.5 text-center shadow-xs">
          <span className="font-classic text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present</span>
          <p className="text-2xl font-black font-mono text-emerald-800 mt-1">{presentCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">In Attendance</span>
        </div>
        <div className="rounded-3xl border border-rose-300 bg-rose-50/80 p-4.5 text-center shadow-xs">
          <span className="font-classic text-[10px] font-bold text-rose-800 uppercase tracking-wider">Absent</span>
          <p className="text-2xl font-black font-mono text-rose-800 mt-1">{absentCount}</p>
          <span className="text-[10px] text-rose-600 font-bold">Unexcused / Absent</span>
        </div>
        <div className="rounded-3xl border border-[#C5A059]/50 bg-[#FAF0E6]/80 p-4.5 text-center shadow-xs">
          <span className="font-classic text-[10px] font-bold text-[#6D1B29] uppercase tracking-wider">Attendance %</span>
          <p className="text-2xl font-black font-mono text-[#6D1B29] mt-1">{attendanceRate}%</p>
          <span className="text-[10px] text-[#9A7B39] font-bold">OD Count: {odCount}</span>
        </div>
      </div>

      {/* TABS & BULK ACTIONS */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D5] pb-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F0EBE1] border border-[#C5A059]/30">
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'mark'
                ? 'bg-[#6D1B29] text-white shadow-sm font-classic'
                : 'text-[#5A6A80] hover:text-[#0E1B2E]'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Mark Attendance Sheet</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'summary'
                ? 'bg-[#0E1B2E] text-[#F3E5AB] shadow-sm font-classic'
                : 'text-[#5A6A80] hover:text-[#0E1B2E]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Class % Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-[#0E1B2E] text-[#F3E5AB] shadow-sm font-classic'
                : 'text-[#5A6A80] hover:text-[#0E1B2E]'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Session Logs</span>
          </button>
        </div>

        {/* Quick Bulk Action Buttons */}
        {activeTab === 'mark' && canMark && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 rounded-xl hover:bg-rose-100 transition shadow-2xs"
            >
              <XCircle className="h-4 w-4 text-rose-600" />
              <span>Mark All Absent</span>
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={saving || totalCount === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#6D1B29] hover:bg-[#8C2234] rounded-xl transition shadow-md disabled:opacity-50 font-classic"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isExisting ? 'Update Class Attendance' : 'Save Attendance Record'}</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ATTENDANCE ENTRY SHEET */}
      {activeTab === 'mark' && (
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4.5 border-b border-[#E8E2D5] bg-[#FBF9F5] gap-3">
            <div>
              <h4 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                Student Attendance Roster ({filteredRecords.length} Students)
              </h4>
              <p className="text-xs text-[#64748B]">
                Click Present / Absent / On-Duty button for each student, then click &quot;Save Attendance Record&quot;.
              </p>
            </div>

            {/* Quick Student Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or reg..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-[#0E1B2E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0E1B2E]">
              <thead className="bg-[#FAF0E6]/60 text-[10px] font-classic font-black uppercase tracking-wider text-[#6D1B29] border-b border-[#E8E2D5]">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Register No</th>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5 text-center">Attendance Status</th>
                  <th className="px-5 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-5 py-4 text-center text-slate-400">Loading student attendance roster...</td>
                    </tr>
                  ))
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => {
                    const originalIdx = attendanceRecords.findIndex((r) => r.studentId === record.studentId);
                    return (
                      <tr key={record.studentId || index} className="hover:bg-[#FAF0E6]/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">{index + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-[#6D1B29] bg-[#FAF0E6] px-2 py-0.5 rounded border border-[#C5A059]/30">
                            {record.registerNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">{record.rollNumber || '-'}</td>
                        <td className="px-5 py-3.5 font-bold text-[#0E1B2E]">{record.name}</td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(originalIdx, 'Present')}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                record.status === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(originalIdx, 'Absent')}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                record.status === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(originalIdx, 'On Duty')}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                record.status === 'On Duty'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              OD
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={record.remarks || ''}
                            onChange={(e) => {
                              const updated = [...attendanceRecords];
                              updated[originalIdx].remarks = e.target.value;
                              setAttendanceRecords(updated);
                            }}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-[#0E1B2E] bg-white focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No enrolled students found for the selected Department & Class. Choose a different department or class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS SUMMARY */}
      {activeTab === 'summary' && (
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 shadow-sm overflow-hidden">
          <div className="p-4.5 border-b border-[#E8E2D5] bg-[#FBF9F5]">
            <h4 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
              Class Attendance Aggregate & Shortage Analysis
            </h4>
            <p className="text-xs text-[#64748B]">Students below 75% attendance are flagged for condonation / remedial action</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0E1B2E]">
              <thead className="bg-[#FAF0E6]/60 text-[10px] font-classic font-black uppercase tracking-wider text-[#6D1B29] border-b border-[#E8E2D5]">
                <tr>
                  <th className="px-5 py-3.5">Register No</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5 text-center">Total Sessions</th>
                  <th className="px-5 py-3.5 text-center">Present</th>
                  <th className="px-5 py-3.5 text-center">Absent</th>
                  <th className="px-5 py-3.5 text-center">Attendance %</th>
                  <th className="px-5 py-3.5 text-center">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {classSummary.length > 0 ? (
                  classSummary.map((st) => {
                    const isShortage = st.percentage < 75;
                    return (
                      <tr key={st._id} className="hover:bg-[#FAF0E6]/30">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#6D1B29]">{st.registerNumber}</td>
                        <td className="px-5 py-3.5 font-bold text-[#0E1B2E]">{st.name}</td>
                        <td className="px-5 py-3.5 text-center font-mono">{st.totalSessions || 0}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-700">{st.presentSessions || 0}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-rose-700">{st.absentSessions || 0}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-black text-sm">
                          <span className={isShortage ? 'text-rose-700' : 'text-emerald-700'}>
                            {st.percentage || 0}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={isShortage ? 'danger' : 'gold'} size="sm">
                            {isShortage ? '⚠️ Shortage (<75%)' : '✓ Exam Eligible'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No attendance data recorded yet for this cohort.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SESSION HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 shadow-sm overflow-hidden">
          <div className="p-4.5 border-b border-[#E8E2D5] bg-[#FBF9F5]">
            <h4 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
              Historical Attendance Sessions
            </h4>
            <p className="text-xs text-[#64748B]">All past attendance dates recorded for this department & course</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0E1B2E]">
              <thead className="bg-[#FAF0E6]/60 text-[10px] font-classic font-black uppercase tracking-wider text-[#6D1B29] border-b border-[#E8E2D5]">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5 text-center">Total Strength</th>
                  <th className="px-5 py-3.5 text-center">Present</th>
                  <th className="px-5 py-3.5 text-center">Absent</th>
                  <th className="px-5 py-3.5 text-center">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {historyList.length > 0 ? (
                  historyList.map((h) => (
                    <tr key={h._id} className="hover:bg-[#FAF0E6]/30">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#6D1B29]">{h.date}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0E1B2E]">{h.subject?.subjectName || 'General Class'}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold">{h.total}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-700">{h.present}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-rose-700">{h.absent}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-[#6D1B29]">{h.percentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No historical sessions recorded for this class yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
