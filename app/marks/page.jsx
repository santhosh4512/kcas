'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ExcelUploadModal from '../../components/ui/ExcelUploadModal';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  Award,
  Plus,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  BookOpen,
} from 'lucide-react';

export default function MarksPage() {
  const [marks, setMarks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Filters & Pagination
  const [deptFilter, setDeptFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    semester: 'Semester 1',
    internalMark: 20,
    externalMark: 60,
  });
  const [formLoading, setFormLoading] = useState(false);

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const canEdit = hasRole('admin', 'faculty');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 25 };
      if (deptFilter !== 'All') params.department = deptFilter;
      if (courseFilter !== 'All') params.course = courseFilter;
      if (semesterFilter !== 'All') params.semester = semesterFilter;
      if (subjectFilter !== 'All') params.subject = subjectFilter;
      if (resultFilter !== 'All') params.resultStatus = resultFilter;
      if (search) params.search = search;

      const [marksRes, deptsRes, crsRes, subsRes, stusRes] = await Promise.all([
        api.get('/marks', { params }),
        api.get('/departments'),
        api.get('/courses'),
        api.get('/subjects'),
        api.get('/students', { params: { limit: 100 } }),
      ]);

      if (marksRes.data.success) {
        setMarks(marksRes.data.data);
        setTotalPages(marksRes.data.totalPages || 1);
        setTotalRecords(marksRes.data.total || 0);
        setAnalytics(marksRes.data.analytics);
      }
      if (deptsRes.data.success) setDepartments(deptsRes.data.data);
      if (crsRes.data.success) setCourses(crsRes.data.data);
      if (subsRes.data.success) setSubjects(subsRes.data.data);
      if (stusRes.data.success) setStudents(stusRes.data.data);
    } catch (err) {
      error('Failed to load marks and results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, deptFilter, courseFilter, semesterFilter, subjectFilter, resultFilter, search]);

  const handleOpenEntry = () => {
    setFormData({
      studentId: students[0]?._id || '',
      subjectId: subjects[0]?._id || '',
      semester: 'Semester 1',
      internalMark: 22,
      externalMark: 65,
    });
    setIsEntryOpen(true);
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subjectId) {
      warning('Please select a student and subject.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/marks', formData);
      if (res.data.success) {
        success('Marks recorded & university grade computed!');
        setIsEntryOpen(false);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error recording marks.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    try {
      const res = await api.delete(`/marks/${deleteTarget._id}`);
      if (res.data.success) {
        success('Mark entry deleted.');
        setIsDeleteOpen(false);
        fetchData();
      }
    } catch (err) {
      error('Failed to delete mark record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/marks/export', {
        params: {
          department: deptFilter,
          course: courseFilter,
          semester: semesterFilter,
          subject: subjectFilter,
          resultStatus: resultFilter,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'KCAS_Marks_and_Results.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Marks and university results exported to Excel.');
    } catch (err) {
      error('Failed to export marks Excel.');
    }
  };

  const columns = [
    {
      header: 'Register No',
      key: 'registerNumber',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
          {row.registerNumber}
        </span>
      ),
    },
    {
      header: 'Student Name',
      key: 'studentName',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-900">{row.studentName}</span>,
    },
    {
      header: 'Subject Unit',
      key: 'subjectName',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.subjectName}</p>
          <p className="text-[10px] font-mono text-slate-400">{row.subjectCode}</p>
        </div>
      ),
    },
    {
      header: 'Internal (25)',
      key: 'internalMark',
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.internalMark} / 25</span>
      ),
    },
    {
      header: 'External (75)',
      key: 'externalMark',
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.externalMark} / 75</span>
      ),
    },
    {
      header: 'Total (100)',
      key: 'totalMark',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-sm text-slate-900">{row.totalMark}</span>
      ),
    },
    {
      header: 'Grade',
      key: 'grade',
      render: (row) => (
        <Badge
          variant={
            row.grade === 'O' || row.grade === 'A+' || row.grade === 'A'
              ? 'success'
              : row.grade === 'RA'
              ? 'danger'
              : 'primary'
          }
          size="sm"
        >
          {row.grade}
        </Badge>
      ),
    },
    {
      header: 'Result',
      key: 'resultStatus',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 font-bold text-xs ${
            row.resultStatus === 'Pass' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {row.resultStatus === 'Pass' ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {row.resultStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div>
          {canEdit && (
            <button
              onClick={() => {
                setDeleteTarget(row);
                setIsDeleteOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Marks & Semester Results"
      subtitle="Record internal/external marks, calculate university grades, and Excel processing"
    >
      {/* Analytics KPI Row */}
      {analytics && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Evaluations</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{analytics.totalEvaluated}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase">Passed</span>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{analytics.passCount}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-center">
            <span className="text-[11px] font-semibold text-rose-700 uppercase">Re-Appear (Arrear)</span>
            <p className="text-2xl font-bold text-rose-700 mt-0.5">{analytics.failCount}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
            <span className="text-[11px] font-semibold text-blue-700 uppercase">Pass Rate</span>
            <p className="text-2xl font-bold text-blue-700 mt-0.5">{analytics.passPercentage}%</p>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Total {totalRecords} examination marks recorded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export Excel
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => setIsExcelOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
              >
                <Upload className="h-4 w-4 text-emerald-600" />
                Upload Excel
              </button>

              <button
                onClick={handleOpenEntry}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Enter Marks
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Marks Table */}
      <DataTable
        columns={columns}
        data={marks}
        loading={loading}
        totalItems={totalRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onSearchChange={setSearch}
        searchPlaceholder="Search marks by student name, register number or subject..."
        filterComponent={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code}
                </option>
              ))}
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Results</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail (RA)</option>
            </select>
          </div>
        }
      />

      {/* EXCEL UPLOAD MODAL */}
      <ExcelUploadModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        title="Upload Marks via Excel (.xlsx)"
        templateUrl="/marks/template"
        previewUrl="/marks/preview-excel"
        importUrl="/marks/import"
        onSuccess={fetchData}
        entityName="Marks Records"
      />

      {/* ENTER MARKS MODAL */}
      <Modal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        title="Record Semester Examination Marks"
        subtitle="Automatic calculation of total, university grade, and result"
      >
        <form onSubmit={handleEntrySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.registerNumber} - {s.name} ({s.department?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Subject *</label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectCode} - {sub.subjectName} ({sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Mark (Max 25) *
              </label>
              <input
                type="number"
                min={0}
                max={25}
                required
                value={formData.internalMark}
                onChange={(e) =>
                  setFormData({ ...formData, internalMark: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                External Mark (Max 75) *
              </label>
              <input
                type="number"
                min={0}
                max={75}
                required
                value={formData.externalMark}
                onChange={(e) =>
                  setFormData({ ...formData, externalMark: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Computed Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Computed Total:</span>
              <p className="text-base font-bold text-slate-900">
                {Number(formData.internalMark || 0) + Number(formData.externalMark || 0)} / 100
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Result Status:</span>
              <p className="font-bold text-emerald-600">
                {Number(formData.externalMark || 0) >= 30 &&
                Number(formData.internalMark || 0) + Number(formData.externalMark || 0) >= 40
                  ? 'PASS'
                  : 'FAIL (RA)'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEntryOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {formLoading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Save Mark & Result
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Mark Record"
        message={`Are you sure you want to delete the mark record for ${deleteTarget?.studentName} in ${deleteTarget?.subjectCode}?`}
        confirmText="Yes, Delete"
        loading={formLoading}
      />
    </DashboardLayout>
  );
}
