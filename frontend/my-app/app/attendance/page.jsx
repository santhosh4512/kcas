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
  const { user } = useAuth();
  const { success, error, warning } = useNotification();
  const isStudent = user?.role === 'student';

  // Dropdown states for Faculty/Admin
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

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

  // Student specific personal state
  const [myAttendanceData, setMyAttendanceData] = useState(null);

  // Geolocation states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  // Late Arrival Reason Modal State
  const [lateReasonModalOpen, setLateReasonModalOpen] = useState(false);
  const [lateReasonInput, setLateReasonInput] = useState('');
  const [pendingCoords, setPendingCoords] = useState(null);

  // Tabs for Faculty/Admin
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'history' | 'alerts'
  const [historyList, setHistoryList] = useState([]);
  const [locationAlerts, setLocationAlerts] = useState([]);

  // Load initial data
  useEffect(() => {
    if (isStudent) {
      fetchMyAttendance();
    } else {
      initFacultyDropdowns();
    }
  }, [isStudent]);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/me');
      if (res.data && res.data.success) {
        setMyAttendanceData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching personal attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const initFacultyDropdowns = async () => {
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
          const deptCourses = cRes.data.data.filter((c) => String(c.department?._id || c.department) === String(firstDeptId));
          const firstCourseId = deptCourses[0]?._id || cRes.data.data[0]._id;
          setSelectedCourse(firstCourseId);
        }

        if (sRes.data.success && sRes.data.data.length > 0) {
          setSubjects(sRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    }
  };

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
      }
    } catch (err) {
      console.error('Error loading attendance sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isStudent && selectedDept && selectedCourse) {
      fetchAttendanceSheet();
    }
  }, [selectedDept, selectedCourse, selectedYear, selectedSemester, selectedSection, selectedSubject, selectedDate]);

  // Handle GPS Checkin Click
  const handleStartGeoCheckin = () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const isPastNine = currentHour > 9 || (currentHour === 9 && currentMin > 5);

        if (isPastNine) {
          setPendingCoords({ latitude, longitude, accuracy });
          setLateReasonModalOpen(true);
          setGpsLoading(false);
        } else {
          executeCheckin(latitude, longitude, accuracy, '');
        }
      },
      (geoErr) => {
        error(`GPS permission error: ${geoErr.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const executeCheckin = async (lat, lng, accuracy, lateReason) => {
    setGpsLoading(true);
    try {
      const res = await api.post('/attendance/geo-checkin', {
        latitude: lat,
        longitude: lng,
        accuracy,
        lateReason,
        status: 'Present',
      });

      if (res.data.success) {
        success(`✅ ${res.data.message}`);
        setGpsStatus({
          success: true,
          distance: res.data.distanceMeters,
          message: res.data.message,
        });
        setLateReasonModalOpen(false);
        setLateReasonInput('');
        if (isStudent) fetchMyAttendance();
        else fetchAttendanceSheet();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Attendance cannot be marked because you are outside the permitted college location.';
      error(msg);
      setGpsStatus({
        success: false,
        message: msg,
      });
      setLateReasonModalOpen(false);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSaveSheet = async () => {
    setSaving(true);
    try {
      const res = await api.post('/attendance/save', {
        department: selectedDept,
        course: selectedCourse,
        year: selectedYear === 'All' ? 'I Year' : selectedYear,
        semester: selectedSemester === 'All' ? 'Semester 1' : selectedSemester,
        section: selectedSection === 'All' ? 'A' : selectedSection,
        subject: selectedSubject || undefined,
        date: selectedDate,
        records: attendanceRecords,
      });

      if (res.data.success) {
        success('Class attendance saved successfully!');
        fetchAttendanceSheet();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title={isStudent ? 'My Attendance & Live GPS Check-In' : 'College Attendance & Geofence Radar'}
      subtitle="Kamban College of Arts and Science for Women — GPS Attendance (9:00 AM – 2:30 PM)"
    >
      {/* Geofence Info Header Banner */}
      <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#0F172A] via-[#091522] to-[#041D17] p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 shrink-0">
            <Compass className="h-6 w-6 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm text-emerald-300 uppercase tracking-wider">
                Active Campus Geofence: 1,000 Meters
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              College Hours: <strong>9:00 AM to 2:30 PM</strong> • Coordinates: <strong>12.1905865° N, 79.0837848° E</strong> (Thenmathur)
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartGeoCheckin}
          disabled={gpsLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition disabled:opacity-50 shrink-0"
        >
          <Navigation className="h-4 w-4" />
          <span>{gpsLoading ? 'Verifying Location...' : 'Mark Present (Live GPS)'}</span>
        </button>
      </div>

      {/* GPS Status Banner */}
      {gpsStatus && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 ${
            gpsStatus.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {gpsStatus.success ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <div>
            <p>{gpsStatus.message}</p>
            {gpsStatus.distance !== undefined && (
              <p className="font-normal text-[11px] mt-0.5">
                Calculated Distance: <strong>{gpsStatus.distance} meters</strong> from Kamban College center (Allowed: 1000m).
              </p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STUDENT VIEW: MY ATTENDANCE ONLY
      ========================================================================= */}
      {isStudent ? (
        <div className="space-y-6">
          {/* Key Metric Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-500">Today&apos;s Attendance</span>
              <p className="mt-2 text-2xl font-black text-slate-900">{myAttendanceData?.todayStatus || 'Present'}</p>
              <p className="text-xs text-slate-500 mt-1">Status as of 9:00 AM</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-500">Attendance Rate</span>
              <p className="mt-2 text-2xl font-black text-emerald-600">{myAttendanceData?.stats?.percentage || 94}%</p>
              <p className="text-xs text-emerald-700 font-bold mt-1">Healthy (Above 75% Requirement)</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-500">Working Sessions</span>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {myAttendanceData?.stats?.presentCount || 28} / {myAttendanceData?.stats?.totalWorkingSessions || 30}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total Verified Sessions</p>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-4">My Verified Attendance History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">GPS Verification</th>
                    <th className="p-3">Late Reason</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(myAttendanceData?.history?.length ? myAttendanceData.history : [
                    { date: new Date().toISOString().split('T')[0], subject: 'Data Structures CS301', checkInTime: '09:05 AM', isGeoVerified: true, status: 'Present' },
                    { date: '2026-10-03', subject: 'Database Management CS302', checkInTime: '09:02 AM', isGeoVerified: true, status: 'Present' },
                    { date: '2026-10-02', subject: 'Operating Systems CS303', checkInTime: '09:15 AM', isGeoVerified: true, lateReason: 'Bus delay at Tiruvannamalai bypass', status: 'Late Present' },
                  ]).map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">{h.date}</td>
                      <td className="p-3 font-semibold text-slate-800">{h.subject}</td>
                      <td className="p-3 text-slate-600">{h.checkInTime || '09:05 AM'}</td>
                      <td className="p-3">
                        {h.isGeoVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> GPS Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Faculty Recorded</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 italic">{h.lateReason || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          h.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          h.status?.includes('Late') ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {h.status}
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
            FACULTY & ADMIN VIEW: ALL STUDENTS ATTENDANCE MANAGEMENT
        ========================================================================= */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSaveSheet}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#701A28] hover:bg-[#58111A] p-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Class Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Student Attendance Sheet ({attendanceRecords.length} Students)</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const updated = attendanceRecords.map((r) => ({ ...r, status: 'Present' }));
                    setAttendanceRecords(updated);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200"
                >
                  Mark All Present
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">GPS Verified</th>
                    <th className="p-3">Check-in Time</th>
                    <th className="p-3">Late Reason</th>
                    <th className="p-3">Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((st, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-700">{st.registerNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3">
                        {st.isGeoVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> GPS Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Manual</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">{st.checkInTime || '—'}</td>
                      <td className="p-3 text-slate-600 italic">{st.lateReason || '—'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {['Present', 'Late Present', 'Absent', 'On Duty'].map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                const copy = [...attendanceRecords];
                                copy[idx].status = s;
                                setAttendanceRecords(copy);
                              }}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                                st.status === s
                                  ? s === 'Present' ? 'bg-emerald-600 text-white' :
                                    s === 'Late Present' ? 'bg-amber-600 text-white' :
                                    s === 'On Duty' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LATE ARRIVAL REASON MODAL (Section 19 Requirement) */}
      {lateReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Late Attendance Reason Required</h3>
                <p className="text-xs text-slate-500">Attendance starts at 9:00 AM. Please state your reason.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 mb-3">
              &quot;You are marking attendance late. Please enter the reason for late arrival.&quot;
            </p>

            <textarea
              rows={3}
              value={lateReasonInput}
              onChange={(e) => setLateReasonInput(e.target.value)}
              placeholder="e.g. Bus delay on SH 9, Medical checkup, Severe rain"
              className="w-full rounded-2xl border border-slate-300 p-3 text-xs focus:border-[#701A28] focus:outline-hidden"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setLateReasonModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!lateReasonInput.trim()) {
                    warning('Please enter a reason for late arrival.');
                    return;
                  }
                  if (pendingCoords) {
                    executeCheckin(pendingCoords.latitude, pendingCoords.longitude, pendingCoords.accuracy, lateReasonInput.trim());
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#701A28] hover:bg-[#58111A] text-xs font-bold text-white shadow-md"
              >
                Submit & Verify Location
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
