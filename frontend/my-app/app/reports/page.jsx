'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  GraduationCap,
  Users,
  CalendarCheck,
  Award,
  Sparkles,
  BarChart3,
  MapPin,
  MessageSquarePlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  HelpCircle,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { user, hasRole } = useAuth();
  const isStudent = hasRole('student');
  const canManageReports = hasRole('faculty', 'admin');

  const [activeMainTab, setActiveMainTab] = useState(isStudent ? 'grievances' : 'institutional'); // 'institutional' | 'grievances'

  // Institutional Reports State
  const [reportType, setReportType] = useState('students');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [search, setSearch] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student Grievance / Issue Reports State
  const [studentReports, setStudentReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    category: 'Attendance Issue',
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Faculty Resolution Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState('Resolved');
  const [facultyRemarks, setFacultyRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  const { success, error, warning } = useNotification();

  const reportTypes = [
    { id: 'students', label: 'Student Directory Report', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty Directory Report', icon: Users },
    { id: 'attendance', label: 'Attendance & Shortage Report', icon: CalendarCheck },
    { id: 'gps-alerts', label: 'GPS Location Alerts Audit Report', icon: MapPin },
    { id: 'marks', label: 'Semester Examination Marks Report', icon: Award },
    { id: 'talent', label: 'Student Talent Intelligence Report', icon: Sparkles },
    { id: 'certificates', label: 'Verified Certificates Report', icon: FileText },
    { id: 'early-warnings', label: 'Early Warning Radar Report', icon: FileText },
    { id: 'events', label: 'Events & Workshops Report', icon: BarChart3 },
  ];

  useEffect(() => {
    if (isStudent) {
      setActiveMainTab('grievances');
    }
  }, [isStudent]);

  // Fetch Meta for institutional reports
  useEffect(() => {
    if (canManageReports) {
      const fetchMeta = async () => {
        try {
          const [dRes, cRes] = await Promise.all([api.get('/departments'), api.get('/courses')]);
          if (dRes.data.success) setDepartments(dRes.data.data);
          if (cRes.data.success) setCourses(cRes.data.data);
        } catch (err) {}
      };
      fetchMeta();
    }
  }, [canManageReports]);

  // Fetch Institutional Report Data
  const fetchReport = async () => {
    if (!canManageReports || activeMainTab !== 'institutional') return;
    setLoading(true);
    try {
      const params = {
        department: selectedDept,
        course: selectedCourse,
        year: selectedYear,
        search,
      };

      const res = await api.get(`/reports/${reportType}`, { params });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageReports && activeMainTab === 'institutional') {
      fetchReport();
    }
  }, [reportType, selectedDept, selectedCourse, selectedYear, search, activeMainTab]);

  // Fetch Student Grievance Reports
  const fetchStudentReports = async () => {
    setReportLoading(true);
    try {
      const res = await api.get('/student-reports');
      if (res.data.success) {
        setStudentReports(res.data.data);
      }
    } catch (err) {
      error('Failed to load student reports.');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'grievances') {
      fetchStudentReports();
    }
  }, [activeMainTab]);

  // Submit new grievance (student)
  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    if (!submitForm.title.trim() || !submitForm.description.trim()) {
      warning('Please enter title and detailed description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/student-reports', submitForm);
      if (res.data.success) {
        success('Issue report submitted successfully to Department Faculty!');
        setIsSubmitModalOpen(false);
        setSubmitForm({ category: 'Attendance Issue', title: '', description: '' });
        fetchStudentReports();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve Grievance (Faculty/Admin)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    setResolving(true);
    try {
      const res = await api.patch(`/student-reports/${selectedGrievance._id}/status`, {
        status: resolutionStatus,
        facultyRemarks,
      });
      if (res.data.success) {
        success(`Report marked as ${resolutionStatus}`);
        setIsResolutionOpen(false);
        fetchStudentReports();
      }
    } catch (err) {
      error('Failed to update report status.');
    } finally {
      setResolving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      error('No data available to export.');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(reportData.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report_Data');
      XLSX.writeFile(wb, `${reportData.reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      success('Report exported to Excel successfully.');
    } catch (err) {
      error('Failed to export Excel.');
    }
  };

  return (
    <DashboardLayout
      title="Reports & Grievance Resolution"
      subtitle="Official institutional reports, academic auditing, and student issue redressal"
    >
      {/* Top Main Navigation Tabs */}
      <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
          {canManageReports && (
            <button
              onClick={() => setActiveMainTab('institutional')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeMainTab === 'institutional'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              Institutional Audit Reports
            </button>
          )}

          <button
            onClick={() => setActiveMainTab('grievances')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeMainTab === 'grievances'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquarePlus className="h-4 w-4" />
            {isStudent ? 'My Issue & Grievance Reports' : 'Student Grievance Registry'}
          </button>
        </div>

        {isStudent && activeMainTab === 'grievances' && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Submit New Issue Report
          </button>
        )}
      </div>

      {/* TAB 1: INSTITUTIONAL REPORTS (Faculty / Admin) */}
      {activeMainTab === 'institutional' && canManageReports && (
        <div>
          {/* Report Type Selector Tabs - Hidden during print */}
          <div className="print:hidden mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
            {reportTypes.map((rt) => {
              const Icon = rt.icon;
              const isActive = reportType === rt.id;
              return (
                <button
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {rt.label}
                </button>
              );
            })}
          </div>

          {/* Filter Controls - Hidden during print */}
          <div className="print:hidden mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-xl border border-slate-200 p-2 font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-xl border border-slate-200 p-2 font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Years</option>
                <option value="I Year">I Year</option>
                <option value="II Year">II Year</option>
                <option value="III Year">III Year</option>
                <option value="IV Year">IV Year</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search in report..."
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
              >
                <Download className="h-4 w-4 text-slate-500" />
                Export Excel
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
              >
                <Printer className="h-4 w-4" />
                Print Report
              </button>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-xs print:border-none print:p-0 print:shadow-none">
            {/* Printable Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6 text-center">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">
                KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN
              </h2>
              <p className="text-[11px] font-semibold text-slate-600">
                Recognized u/s 2(f) & 12(B) of UGC Act 1956 • NAAC Accredited • Affiliated to Thiruvalluvar University
              </p>
              <p className="text-[10px] text-slate-500">
                Thenmathur, Tiruvannamalai – 606 603, Tamil Nadu, India
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs">
                <span className="font-extrabold text-blue-900 uppercase tracking-wide text-sm">
                  {reportData?.title || 'Institutional Report'}
                </span>
                <span className="text-slate-500">
                  Generated On: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Report Content Table */}
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500">
                Generating real-time institutional report...
              </div>
            ) : reportData?.data?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/80 text-[11px] font-bold uppercase text-slate-800 border-b border-slate-300">
                    <tr>
                      <th className="p-3">#</th>
                      {reportData.headers?.map((h, i) => (
                        <th key={i} className="p-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="p-3">
                            {typeof val === 'string' && val.includes('Dominant') ? (
                              <Badge variant="gold" size="sm">{val}</Badge>
                            ) : typeof val === 'string' && (val === 'Pass' || val.includes('Healthy')) ? (
                              <span className="font-bold text-emerald-700">{val}</span>
                            ) : typeof val === 'string' && (val === 'Fail' || val.includes('Shortage')) ? (
                              <span className="font-bold text-rose-700">{val}</span>
                            ) : (
                              val
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No records matched the selected report filters.
              </div>
            )}

            {/* Printable Footer Signatures */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div>
                <p className="border-t border-slate-400 pt-1 w-40 text-center">Prepared By</p>
              </div>
              <div>
                <p className="border-t border-slate-400 pt-1 w-40 text-center">Head of Department</p>
              </div>
              <div>
                <p className="border-t border-slate-400 pt-1 w-40 text-center">Principal / Controller</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT GRIEVANCES & ISSUE REPORTS */}
      {activeMainTab === 'grievances' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isStudent ? 'My Submitted Issues & Redressal Status' : 'Student Grievance & Issue Registry'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isStudent
                    ? 'Track the real-time review status and faculty responses to your submitted tickets'
                    : 'Review and resolve student-submitted academic, attendance, and technical grievances'}
                </p>
              </div>
            </div>

            {reportLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading issue reports...</div>
            ) : studentReports.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No issue reports found.
              </div>
            ) : (
              <div className="space-y-4">
                {studentReports.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {item.status === 'Resolved' && <CheckCircle2 className="h-3 w-3" />}
                          {item.status === 'Under Review' && <Clock className="h-3 w-3" />}
                          {item.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {item.status === 'Submitted' && <AlertCircle className="h-3 w-3" />}
                          {item.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Submitted: {new Date(item.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                      {canManageReports && item.student && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          Student: <span className="font-bold text-slate-800">{item.studentName}</span> ({item.registerNumber})
                        </p>
                      )}

                      {item.facultyRemarks && (
                        <div className="mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                          <span className="font-bold text-amber-900">Faculty Response: </span>
                          <span className="text-amber-800">{item.facultyRemarks}</span>
                        </div>
                      )}
                    </div>

                    {canManageReports && (
                      <div className="shrink-0">
                        <button
                          onClick={() => {
                            setSelectedGrievance(item);
                            setResolutionStatus(item.status || 'Resolved');
                            setFacultyRemarks(item.facultyRemarks || '');
                            setIsResolutionOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                        >
                          Review & Update
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT SUBMISSION MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Student Issue / Grievance"
        subtitle="Report an attendance discrepancy, academic issue, or general request directly to faculty"
      >
        <form onSubmit={handleSubmitGrievance} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Category *</label>
            <select
              value={submitForm.category}
              onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="Attendance Issue">Attendance Issue</option>
              <option value="Academic Issue">Academic Issue</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Other Request">Other Request</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
            <input
              type="text"
              value={submitForm.title}
              onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
              placeholder="e.g. GPS attendance missed due to network timeout on 04/10"
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              value={submitForm.description}
              onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
              placeholder="Provide complete details, date, subject, or reasons for review..."
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* FACULTY RESOLUTION MODAL */}
      <Modal
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
        title="Review & Resolve Student Grievance"
        subtitle={selectedGrievance ? `${selectedGrievance.studentName} • ${selectedGrievance.category}` : ''}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          {selectedGrievance && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">{selectedGrievance.title}</p>
              <p className="text-slate-600">{selectedGrievance.description}</p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status *</label>
            <select
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:outline-hidden"
            >
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty Remarks & Decision *</label>
            <textarea
              rows={3}
              value={facultyRemarks}
              onChange={(e) => setFacultyRemarks(e.target.value)}
              placeholder="e.g. Verified attendance log and approved adjustment."
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResolutionOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
            >
              {resolving ? 'Updating...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
