'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
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
} from 'lucide-react';

export default function AttendancePage() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Cohort Selection
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('I Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Sheet State
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  // Tab State: 'mark' | 'history' | 'summary'
  const [activeTab, setActiveTab] = useState('mark');
  const [historyList, setHistoryList] = useState([]);
  const [classSummary, setClassSummary] = useState([]);

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
          setSelectedDept(dRes.data.data[0]._id);
        }
        if (cRes.data.success && cRes.data.data.length > 0) {
          setCourses(cRes.data.data);
          setSelectedCourse(cRes.data.data[0]._id);
        }
        if (sRes.data.success && sRes.data.data.length > 0) {
          setSubjects(sRes.data.data);
          setSelectedSubject(sRes.data.data[0]._id);
        }
      } catch (err) {
        error('Failed to load attendance criteria.');
      }
    };

    initDropdowns();
  }, []);

  // Fetch student mark sheet when filters change
  const fetchAttendanceSheet = async () => {
    if (!selectedDept || !selectedCourse || !selectedSubject || !selectedDate) return;

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
      error('Failed to fetch class attendance sheet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark') {
      fetchAttendanceSheet();
    } else if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'summary') {
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
    success(`Marked all students as ${status}.`);
  };

  const handleSaveAttendance = async () => {
    if (!canMark) {
      warning('Only faculty and administrators can record attendance.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        department: selectedDept,
        course: selectedCourse,
        year: selectedYear,
        semester: selectedSemester,
        section: selectedSection,
        subject: selectedSubject,
        date: selectedDate,
        records: attendanceRecords,
      };

      const res = await api.post('/attendance/save', payload);
      if (res.data.success) {
        success('Class attendance saved successfully!');
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
  const totalCount = attendanceRecords.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 1000) / 10 : 0;

  return (
    <DashboardLayout
      title="Attendance Management"
      subtitle="Track daily student presence, subject attendance, and identify shortages"
    >
      {/* Top Filter Selection Panel */}
      <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-blue-600" />
          Select Class Cohort & Subject
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Course Program</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseName} ({c.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="I Year">I Year</option>
              <option value="II Year">II Year</option>
              <option value="III Year">III Year</option>
              <option value="IV Year">IV Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
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
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 font-medium text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'mark'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            Class Mark Sheet
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            Class % Summary
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History className="h-4 w-4" />
            Session History
          </button>
        </div>

        {activeTab === 'mark' && canMark && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Present
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={saving || totalCount === 0}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isExisting ? 'Update Attendance' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: MARK SHEET */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Live Attendance Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Strength</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase">Present</span>
              <p className="text-2xl font-bold text-emerald-700 mt-0.5">{presentCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-center">
              <span className="text-[11px] font-semibold text-rose-700 uppercase">Absent</span>
              <p className="text-2xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
              <span className="text-[11px] font-semibold text-blue-700 uppercase">Daily Attendance</span>
              <p className="text-2xl font-bold text-blue-700 mt-0.5">{attendanceRate}%</p>
            </div>
          </div>

          {/* Student Mark Sheet Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Student List for {selectedDate}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Click on status buttons to toggle presence
                </p>
              </div>
              {isExisting && (
                <Badge variant="primary" size="sm">
                  ✓ Recorded Session
                </Badge>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Register No</th>
                    <th className="px-5 py-3">Roll No</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3 text-center">Attendance Status</th>
                    <th className="px-5 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                        Loading student mark sheet...
                      </td>
                    </tr>
                  ) : attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record, index) => (
                      <tr key={record.studentId || index} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3 font-semibold text-slate-400">{index + 1}</td>
                        <td className="px-5 py-3 font-mono font-bold text-blue-700">
                          {record.registerNumber}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-700">{record.rollNumber}</td>
                        <td className="px-5 py-3 font-bold text-slate-900">{record.name}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(index, 'Present')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                                record.status === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusToggle(index, 'Absent')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                                record.status === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusToggle(index, 'On Duty')}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-xs transition ${
                                record.status === 'On Duty'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              OD
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            value={record.remarks || ''}
                            onChange={(e) => {
                              const updated = [...attendanceRecords];
                              updated[index].remarks = e.target.value;
                              setAttendanceRecords(updated);
                            }}
                            placeholder="Optional remark..."
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                        No active students found in this cohort.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS ATTENDANCE SUMMARY & SHORTAGE */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Cumulative Class Attendance Rate
                </h4>
                <p className="text-[11px] text-slate-500">
                  Total sessions tracked with color-coded status badges
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Register No</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3 text-center">Total Sessions</th>
                    <th className="px-5 py-3 text-center">Present</th>
                    <th className="px-5 py-3 text-center">Attendance %</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classSummary.map((st) => (
                    <tr key={st.studentId} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3 font-mono font-bold text-blue-700">
                        {st.registerNumber}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">{st.name}</td>
                      <td className="px-5 py-3 text-center font-medium">{st.totalSessions}</td>
                      <td className="px-5 py-3 text-center font-semibold text-emerald-700">
                        {st.presentCount}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-extrabold text-sm text-slate-900">{st.percentage}%</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge
                          variant={
                            st.status === 'Healthy'
                              ? 'success'
                              : st.status === 'Warning'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {st.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SESSION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800">Recorded Attendance Sessions</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Total Students</th>
                    <th className="px-5 py-3">Present</th>
                    <th className="px-5 py-3">Absent</th>
                    <th className="px-5 py-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyList.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3 font-semibold text-slate-900">{h.date}</td>
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {h.subject?.subjectName} ({h.subject?.subjectCode})
                      </td>
                      <td className="px-5 py-3">{h.totalStudents}</td>
                      <td className="px-5 py-3 font-bold text-emerald-700">{h.presentCount}</td>
                      <td className="px-5 py-3 font-bold text-rose-700">{h.absentCount}</td>
                      <td className="px-5 py-3 text-slate-500">{h.markedBy?.name || 'Admin'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
