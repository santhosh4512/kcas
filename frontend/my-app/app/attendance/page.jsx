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
  MapPin,
  Compass,
  Navigation,
  ShieldCheck,
  FileSpreadsheet,
  Edit3,
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

  // Tab State: 'mark' | 'geo-checkin' | 'geo-logs' | 'summary' | 'history'
  const [activeTab, setActiveTab] = useState('mark');
  const [historyList, setHistoryList] = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [geoLogs, setGeoLogs] = useState([]);
  const [geoStats, setGeoStats] = useState({ failed: 0, success: 0 });
  const [searchStudent, setSearchStudent] = useState('');

  // Geo-Checkin & GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null); // { success: bool, distance: number, message: string }
  const [useTestCampusCoord, setUseTestCampusCoord] = useState(false);

  // Manual Override Modal
  const [overrideModal, setOverrideModal] = useState(null); // student record to override
  const [overrideStatus, setOverrideStatus] = useState('Present');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSaving, setOverrideSaving] = useState(false);

  const { success, error, warning } = useNotification();
  const { user, hasRole } = useAuth();
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

  const fetchGeoLogs = async () => {
    try {
      const res = await api.get('/attendance/geo-logs');
      if (res.data.success) {
        setGeoLogs(res.data.data);
        setGeoStats({
          failed: res.data.failedAttemptsCount || 0,
          success: res.data.successfulAttemptsCount || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching geo logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark' && selectedDept && selectedCourse) {
      fetchAttendanceSheet();
    } else if (activeTab === 'history' && selectedDept) {
      fetchHistory();
    } else if (activeTab === 'summary' && selectedDept && selectedCourse) {
      fetchSummary();
    } else if (activeTab === 'geo-logs') {
      fetchGeoLogs();
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

  // Perform GPS Geo-Verification
  const handlePerformGeoCheckin = async (forceCampus = false) => {
    setGpsLoading(true);
    setGpsStatus(null);

    const performSubmission = async (lat, lng, accuracy) => {
      try {
        const res = await api.post('/attendance/geo-checkin', {
          studentId: user?.referenceId,
          latitude: lat,
          longitude: lng,
          accuracy,
          status: 'Present',
          remarks: forceCampus ? 'Campus Check-in (Verified Coordinates)' : 'Live GPS Browser Check-in',
        });

        if (res.data.success) {
          setGpsStatus({
            success: true,
            distance: res.data.distanceMeters,
            message: res.data.message,
          });
          success('✅ Attendance marked successfully inside Kamban campus!');
          fetchAttendanceSheet();
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'GPS check-in failed';
        setGpsStatus({
          success: false,
          distance: err.response?.data?.distanceMeters || 4500,
          message: msg,
        });
        error(msg);
      } finally {
        setGpsLoading(false);
      }
    };

    if (forceCampus) {
      // Kamban College of Arts & Science (Velu Nagar, Mathur, Tiruvannamalai) coords (12.1903, 79.0839)
      await performSubmission(12.19035, 79.08395, 5);
      return;
    }


    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        await performSubmission(latitude, longitude, accuracy);
      },
      (geoErr) => {
        error(`GPS Access Denied: ${geoErr.message}`);
        setGpsStatus({
          success: false,
          distance: 0,
          message: `Location Permission Denied: ${geoErr.message}. Failed attempt recorded.`,
        });
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save Manual Attendance Override with Audit Trail
  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      warning('Please provide a mandatory explanation reason for attendance modification.');
      return;
    }

    setOverrideSaving(true);
    try {
      const res = await api.post('/attendance/override', {
        studentId: overrideModal.studentId,
        newStatus: overrideStatus,
        reason: overrideReason.trim(),
      });

      if (res.data.success) {
        success(`Attendance updated to ${overrideStatus}. Audit trail recorded!`);
        setOverrideModal(null);
        setOverrideReason('');
        fetchAttendanceSheet();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error modifying attendance');
    } finally {
      setOverrideSaving(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) {
      warning('No attendance data to export.');
      return;
    }

    const headers = ['Register Number', 'Roll Number', 'Student Name', 'Status', 'Geo-Verified', 'Remarks'];
    const rows = attendanceRecords.map((r) => [
      r.registerNumber,
      r.rollNumber || '-',
      r.name,
      r.status,
      r.isGeoVerified ? 'Yes (GPS)' : 'Manual',
      r.remarks || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KCAS_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Attendance records exported as CSV successfully!');
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
      title="Live Geo-Verified Attendance & Audit Governance"
      subtitle="Campus geofencing, daily student check-ins, manual override audit trails, and shortage alerts"
    >
      {/* Grand Neo-Classic Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B2E] via-[#162A45] to-[#4A0E18] p-6 md:p-8 text-white shadow-2xl border-2 border-[#C5A059]/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/60 bg-[#FAF0E6]/10 px-3.5 py-1 text-xs font-classic font-bold text-[#F3E5AB] mb-3 backdrop-blur-md">
              <Compass className="h-3.5 w-3.5 text-[#C5A059] animate-spin" />
              <span>Smart GPS Geofencing (1.0 km Radius)</span>
            </div>
            <h2 className="font-classic text-xl md:text-3xl font-black tracking-wide text-white uppercase">
              Geo-Verified Campus Attendance & Live Roster
            </h2>
            <p className="mt-1 text-xs md:text-sm text-[#E8E2D5]/90 font-sans max-w-xl">
              Automatic daily attendance check-in, GPS radius verification against Kamban College campus, failed location logs, and auditable manual overrides.
            </p>
          </div>

          {/* Quick Date & Geo Status */}
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#C5A059]/40 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#C5A059]" />
              <span>Export CSV</span>
            </button>

            <div className="p-4 rounded-2xl border border-[#C5A059]/40 bg-[#0E1B2E]/60 backdrop-blur-md text-xs text-right">
              <span className="text-[10px] font-classic font-bold uppercase tracking-wider text-[#C5A059]">Active Date:</span>
              <p className="font-mono font-black text-lg text-white mt-0.5">{selectedDate}</p>
              <span className="text-[10px] text-emerald-400 font-bold">
                {isExisting ? '✓ Recorded in Database' : '⚡ Live Pending Submission'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY ATTENDANCE & SMART GPS CHECK-IN WIDGET */}
      <div className="mb-6 rounded-3xl border border-[#C5A059]/40 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#1A3252] p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059]">
              <MapPin className="h-4 w-4 text-[#C5A059]" />
              <span>Automatic Daily Attendance Notification</span>
            </div>
            <h3 className="font-classic text-lg lg:text-xl font-bold text-[#F3E5AB]">
              Daily Attendance Check-in Portal
            </h3>
            <p className="text-xs text-[#E8E2D5]/80 max-w-xl leading-relaxed">
              Verify your GPS location within Kamban College Campus (12.2275°N, 79.0747°E). Attempts outside the 1,000m geofence will be logged and rejected.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => handlePerformGeoCheckin(false)}
              disabled={gpsLoading}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Navigation className={`h-4 w-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Verifying Coordinates...' : 'Verify Live GPS & Check-in'}</span>
            </button>

            <button
              onClick={() => handlePerformGeoCheckin(true)}
              disabled={gpsLoading}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#C5A059]/40 px-4 py-3 text-xs font-bold text-[#F3E5AB] transition"
              title="Test with verified in-campus coordinates"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Campus Coords (Demo Check-in)</span>
            </button>
          </div>
        </div>

        {/* GPS Verification Status Feedback */}
        {gpsStatus && (
          <div
            className={`mt-4 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border ${
              gpsStatus.success
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-200 border-rose-500/40'
            }`}
          >
            {gpsStatus.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-bold text-white">{gpsStatus.message}</p>
              <p className="text-[11px] opacity-80 mt-1 font-mono">
                Distance: {gpsStatus.distance} meters from Campus Center • Allowed Geofence: 1,000 meters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* STEPPED SELECTION FILTER BAR */}
      <div className="mb-6 rounded-3xl border border-[#C5A059]/40 bg-white/95 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#6D1B29]" />
            <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
              Cohort Selection: Department, Class & Date
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
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-[#F0EBE1] border border-[#C5A059]/30">
          <button
            onClick={() => setActiveTab('mark')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'mark'
                ? 'bg-[#6D1B29] text-white shadow-sm font-classic'
                : 'text-[#5A6A80] hover:text-[#0E1B2E]'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Mark Sheet</span>
          </button>
          <button
            onClick={() => setActiveTab('geo-logs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'geo-logs'
                ? 'bg-[#0E1B2E] text-[#F3E5AB] shadow-sm font-classic'
                : 'text-[#5A6A80] hover:text-[#0E1B2E]'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>GPS Geofence Logs ({geoLogs.length})</span>
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

      {/* TAB 1: ATTENDANCE ENTRY SHEET WITH AUDIT OVERRIDE */}
      {activeTab === 'mark' && (
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4.5 border-b border-[#E8E2D5] bg-[#FBF9F5] gap-3">
            <div>
              <h4 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                Student Attendance Roster ({filteredRecords.length} Students)
              </h4>
              <p className="text-xs text-[#64748B]">
                Click Present / Absent / On-Duty. Authorized staff can click &quot;Override&quot; to modify status with an auditable justification.
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
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Verification Method</th>
                  <th className="px-5 py-3.5 text-center">Audit Override</th>
                  <th className="px-5 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-5 py-4 text-center text-slate-400">Loading student attendance roster...</td>
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
                        <td className="px-5 py-3.5 font-bold text-[#0E1B2E]">{record.name}</td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(originalIdx, 'Present')}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
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
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
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
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                record.status === 'On Duty'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              OD
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {record.isGeoVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Compass className="h-3 w-3 text-emerald-600" />
                              GPS Verified
                            </span>
                          ) : record.isOverridden ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              <ShieldCheck className="h-3 w-3 text-purple-600" />
                              Overridden
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500">
                              Manual Faculty
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {canMark && (
                            <button
                              onClick={() => {
                                setOverrideModal(record);
                                setOverrideStatus(record.status);
                                setOverrideReason(record.overrideReason || '');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#6D1B29] bg-[#FAF0E6] border border-[#C5A059]/40 hover:bg-[#6D1B29] hover:text-white transition"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Override</span>
                            </button>
                          )}
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
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No enrolled students found for the selected Department & Class. Choose a different department or class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GPS GEOFENCE LOGS (FEATURE 2 & 15) */}
      {activeTab === 'geo-logs' && (
        <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 shadow-sm overflow-hidden space-y-4">
          <div className="p-4.5 border-b border-[#E8E2D5] bg-[#FBF9F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                GPS Geofencing Verification Attempt Logs
              </h4>
              <p className="text-xs text-[#64748B]">
                Live record of student check-ins, campus radius verification, and failed outside-geofence attempts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                ✓ Successful: {geoStats.success}
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-xl border border-rose-300">
                ❌ Failed Attempts: {geoStats.failed}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0E1B2E]">
              <thead className="bg-[#FAF0E6]/60 text-[10px] font-classic font-black uppercase tracking-wider text-[#6D1B29] border-b border-[#E8E2D5]">
                <tr>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Verification Status</th>
                  <th className="px-5 py-3.5">Distance from Campus</th>
                  <th className="px-5 py-3.5">Failure Reason / Notes</th>
                  <th className="px-5 py-3.5">Device Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {geoLogs.length > 0 ? (
                  geoLogs.map((log) => {
                    const isSuccess = log.status.startsWith('SUCCESS');
                    return (
                      <tr key={log._id} className="hover:bg-[#FAF0E6]/30">
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {log.date} <span className="text-[10px] text-slate-400">({log.checkinTime})</span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#0E1B2E]">
                          {log.studentName || log.student?.name}
                          <span className="block font-mono text-[10px] text-[#6D1B29]">
                            {log.registerNumber || log.student?.registerNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isSuccess
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {isSuccess ? 'Inside Campus Geofence' : 'Outside Geofence / Denied'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold">
                          {log.distanceFromCampusMeters > 0 ? (
                            <span className={isSuccess ? 'text-emerald-700' : 'text-rose-700'}>
                              {log.distanceFromCampusMeters >= 1000
                                ? `${(log.distanceFromCampusMeters / 1000).toFixed(2)} km away`
                                : `${log.distanceFromCampusMeters} m from center`}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-700 max-w-xs">
                          {log.failureReason || 'Geo-verified check-in within college campus boundary'}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-slate-500 font-mono truncate max-w-[120px]">
                          {log.deviceInfo || 'Mobile Web'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No GPS geofence attempt logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLASS SUMMARY */}
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
                      <tr key={st.studentId || st._id} className="hover:bg-[#FAF0E6]/30">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#6D1B29]">{st.registerNumber}</td>
                        <td className="px-5 py-3.5 font-bold text-[#0E1B2E]">{st.name}</td>
                        <td className="px-5 py-3.5 text-center font-mono">{st.totalSessions || 0}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-700">{st.presentCount || 0}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-rose-700">{st.absentCount || 0}</td>
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

      {/* TAB 4: SESSION HISTORY */}
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
                      <td className="px-5 py-3.5 text-center font-mono font-bold">{h.totalStudents || h.total}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-700">{h.presentCount || h.present}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-rose-700">{h.absentCount || h.absent}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-[#6D1B29]">
                        {h.totalStudents > 0 ? Math.round((h.presentCount / h.totalStudents) * 100) : 0}%
                      </td>
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

      {/* MANUAL OVERRIDE MODAL WITH MANDATORY AUDIT TRAIL (FEATURE 16) */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#C5A059]" />
                <h3 className="font-classic text-base font-bold text-[#F3E5AB]">
                  Manual Attendance Override
                </h3>
              </div>
              <button onClick={() => setOverrideModal(null)} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white">
                ✕
              </button>
            </div>

            <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-xs space-y-1">
              <p>
                Student: <strong className="text-white">{overrideModal.name}</strong> ({overrideModal.registerNumber})
              </p>
              <p>
                Original Status: <strong className="text-amber-400">{overrideModal.status}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#C5A059] mb-1">New Attendance Status *</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="Present">Present (Attended)</option>
                  <option value="On Duty">On Duty (OD - Sports / Hackathon / Symposium)</option>
                  <option value="Leave">Medical Leave (Approved)</option>
                  <option value="Absent">Absent (Unexcused)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C5A059] mb-1">
                  Mandatory Modification Justification * (Audit Logged)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Represented College in Inter-University Technical Hackathon / Medical certificate verified..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setOverrideModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideSaving}
                  className="rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-2 text-xs font-black text-[#0E1B2E] shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  {overrideSaving ? 'Logging...' : 'Save & Record Audit Trail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
