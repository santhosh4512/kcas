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
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  BookOpen,
  Sparkles,
  Printer,
  FileSpreadsheet,
  Grid,
  ListFilter,
  Save,
  CheckCheck,
  UserCheck,
  TrendingUp,
  GraduationCap,
  Eye,
  RefreshCw,
  Layers,
  Check,
  ChevronRight,
  User,
} from 'lucide-react';

export default function MarksPage() {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'ledger' | 'batch'
  const [marks, setMarks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Filters & Pagination for Ledger
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
  const [editTarget, setEditTarget] = useState(null);

  // Student Transcript Modal
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Step-by-Step Mark Entry State (Wizard & Modal)
  const [wizardDept, setWizardDept] = useState('');
  const [wizardCourse, setWizardCourse] = useState('');
  const [wizardStudent, setWizardStudent] = useState('');
  const [wizardSemester, setWizardSemester] = useState('Semester 1');
  const [wizardSubject, setWizardSubject] = useState('');
  const [wizardInternal, setWizardInternal] = useState(20);
  const [wizardExternal, setWizardExternal] = useState(60);
  const [wizardStudentSearch, setWizardStudentSearch] = useState('');
  const [wizardSaving, setWizardSaving] = useState(false);

  // Batch Class Mark Entry State
  const [batchDept, setBatchDept] = useState('');
  const [batchCourse, setBatchCourse] = useState('');
  const [batchSemester, setBatchSemester] = useState('Semester 1');
  const [batchSubject, setBatchSubject] = useState('');
  const [batchRows, setBatchRows] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const canEdit = hasRole('admin', 'faculty');

  // Compute Grade & Pass/Fail dynamically
  const calculateGradeInfo = (internal, external) => {
    const int = Number(internal) || 0;
    const ext = Number(external) || 0;
    const total = int + ext;
    const isPassed = ext >= 30 && total >= 40;

    let grade = 'RA';
    if (isPassed) {
      if (total >= 90) grade = 'O';
      else if (total >= 80) grade = 'A+';
      else if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B+';
      else if (total >= 50) grade = 'B';
      else grade = 'C';
    }

    return {
      total,
      grade,
      resultStatus: isPassed ? 'Pass' : 'Fail',
      isPassed,
    };
  };

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
        api.get('/students', { params: { limit: 200 } }),
      ]);

      if (marksRes.data.success) {
        setMarks(marksRes.data.data);
        setTotalPages(marksRes.data.totalPages || 1);
        setTotalRecords(marksRes.data.total || 0);
        setAnalytics(marksRes.data.analytics);
      }
      if (deptsRes.data.success && deptsRes.data.data.length > 0) {
        setDepartments(deptsRes.data.data);
        const firstDeptId = deptsRes.data.data[0]._id;

        if (!wizardDept) {
          setWizardDept(firstDeptId);
          setBatchDept(firstDeptId);

          if (crsRes.data.success && crsRes.data.data.length > 0) {
            const deptCourses = crsRes.data.data.filter(
              (c) => String(c.department?._id || c.department) === String(firstDeptId)
            );
            const firstCourseId = deptCourses[0]?._id || crsRes.data.data[0]._id;
            setWizardCourse(firstCourseId);
            setBatchCourse(firstCourseId);

            if (subsRes.data.success && subsRes.data.data.length > 0) {
              const courseSubjects = subsRes.data.data.filter(
                (s) => String(s.course?._id || s.course) === String(firstCourseId)
              );
              setWizardSubject(courseSubjects[0]?._id || subsRes.data.data[0]._id);
              setBatchSubject(courseSubjects[0]?._id || subsRes.data.data[0]._id);
            }

            if (stusRes.data.success && stusRes.data.data.length > 0) {
              const classStudents = stusRes.data.data.filter(
                (st) =>
                  String(st.department?._id || st.department) === String(firstDeptId) &&
                  String(st.course?._id || st.course) === String(firstCourseId)
              );
              if (classStudents.length > 0) {
                setWizardStudent(classStudents[0]._id);
              }
            }
          }
        }
      }
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

  // Step 1: Department change in Wizard
  const handleWizardDeptChange = (deptId) => {
    setWizardDept(deptId);
    const deptCourses = courses.filter(
      (c) => String(c.department?._id || c.department) === String(deptId)
    );
    const newCourseId = deptCourses[0]?._id || (courses[0]?._id || '');
    setWizardCourse(newCourseId);

    const courseSubjects = subjects.filter(
      (s) => String(s.course?._id || s.course) === String(newCourseId)
    );
    setWizardSubject(courseSubjects[0]?._id || (subjects[0]?._id || ''));

    const classStudents = students.filter(
      (st) =>
        (!deptId || String(st.department?._id || st.department) === String(deptId)) &&
        (!newCourseId || String(st.course?._id || st.course) === String(newCourseId))
    );
    setWizardStudent(classStudents[0]?._id || '');
  };

  // Step 2: Class/Course change in Wizard
  const handleWizardCourseChange = (courseId) => {
    setWizardCourse(courseId);
    const courseSubjects = subjects.filter(
      (s) => String(s.course?._id || s.course) === String(courseId)
    );
    setWizardSubject(courseSubjects[0]?._id || (subjects[0]?._id || ''));

    const classStudents = students.filter(
      (st) =>
        (!wizardDept || String(st.department?._id || st.department) === String(wizardDept)) &&
        (!courseId || String(st.course?._id || st.course) === String(courseId))
    );
    setWizardStudent(classStudents[0]?._id || '');
  };

  // Step 4: Submit single mark entry from wizard
  const handleWizardSubmit = async (e) => {
    e?.preventDefault();
    if (!wizardStudent) {
      warning('Please select a student.');
      return;
    }
    if (!wizardSubject) {
      warning('Please select a subject unit.');
      return;
    }

    setWizardSaving(true);
    try {
      const payload = {
        studentId: wizardStudent,
        subjectId: wizardSubject,
        semester: wizardSemester,
        internalMark: wizardInternal,
        externalMark: wizardExternal,
      };

      const res = await api.post('/marks', payload);
      if (res.data.success) {
        success('Marks saved & university grade computed successfully!');
        fetchData();
        if (isEntryOpen) setIsEntryOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error saving marks.');
    } finally {
      setWizardSaving(false);
    }
  };

  // Batch Class Mark Entry State handlers
  const handleBatchDeptChange = (deptId) => {
    setBatchDept(deptId);
    const deptCourses = courses.filter(
      (c) => String(c.department?._id || c.department) === String(deptId)
    );
    const newCourseId = deptCourses[0]?._id || (courses[0]?._id || '');
    setBatchCourse(newCourseId);

    const courseSubjects = subjects.filter(
      (s) => String(s.course?._id || s.course) === String(newCourseId)
    );
    setBatchSubject(courseSubjects[0]?._id || (subjects[0]?._id || ''));
  };

  const handleBatchCourseChange = (courseId) => {
    setBatchCourse(courseId);
    const courseSubjects = subjects.filter(
      (s) => String(s.course?._id || s.course) === String(courseId)
    );
    if (courseSubjects.length > 0) {
      setBatchSubject(courseSubjects[0]._id);
    }
  };

  const loadBatchClassSheet = async () => {
    if (!batchDept || !batchCourse) return;

    setBatchLoading(true);
    try {
      const stuParams = { limit: 150 };
      if (batchDept && batchDept !== 'All') stuParams.department = batchDept;
      if (batchCourse && batchCourse !== 'All') stuParams.course = batchCourse;

      const [studentsRes, existingMarksRes] = await Promise.all([
        api.get('/students', { params: stuParams }),
        batchSubject
          ? api.get('/marks', {
              params: {
                subject: batchSubject,
                semester: batchSemester,
                limit: 200,
              },
            })
          : Promise.resolve({ data: { success: true, data: [] } }),
      ]);

      const classStudents = studentsRes.data.data || [];
      const existingMarks = existingMarksRes.data?.data || [];
      const markMap = {};
      existingMarks.forEach((m) => {
        const sId = m.student?._id || m.student;
        markMap[sId] = m;
      });

      const initialRows = classStudents.map((stu) => {
        const exist = markMap[stu._id];
        return {
          studentId: stu._id,
          registerNumber: stu.registerNumber,
          name: stu.name,
          rollNumber: stu.rollNumber,
          internalMark: exist ? exist.internalMark : 20,
          externalMark: exist ? exist.externalMark : 55,
          markId: exist ? exist._id : null,
        };
      });

      setBatchRows(initialRows);
    } catch (err) {
      console.error('Error loading class marks sheet:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'batch' && batchDept && batchCourse) {
      loadBatchClassSheet();
    }
  }, [batchDept, batchCourse, batchSemester, batchSubject, activeTab]);

  const handleBatchMarkChange = (index, field, value) => {
    const val = Number(value);
    const updated = [...batchRows];
    updated[index][field] = val;
    setBatchRows(updated);
  };

  const handleSaveBatchMarks = async () => {
    if (!batchSubject || batchRows.length === 0) {
      warning('Please ensure a subject is selected and students are listed.');
      return;
    }

    setBatchSaving(true);
    try {
      const payload = {
        subjectId: batchSubject,
        semester: batchSemester,
        records: batchRows.map((r) => ({
          studentId: r.studentId,
          internalMark: r.internalMark,
          externalMark: r.externalMark,
        })),
      };

      const res = await api.post('/marks/batch', payload);
      if (res.data.success) {
        success(`Successfully saved & computed grades for ${batchRows.length} students!`);
        fetchData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save batch marks.');
    } finally {
      setBatchSaving(false);
    }
  };

  const handleOpenEntry = () => {
    setEditTarget(null);
    setIsEntryOpen(true);
  };

  const handleOpenEdit = (markRow) => {
    setEditTarget(markRow);
    const sDept = markRow.department?._id || markRow.department || '';
    const sCourse = markRow.course?._id || markRow.course || '';
    setWizardDept(sDept);
    setWizardCourse(sCourse);
    setWizardSemester(markRow.semester || 'Semester 1');
    setWizardSubject(markRow.subject?._id || markRow.subject || '');
    setWizardStudent(markRow.student?._id || markRow.student || '');
    setWizardInternal(markRow.internalMark);
    setWizardExternal(markRow.externalMark);
    setIsEntryOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleOpenTranscript = async (studentId) => {
    setIsTranscriptOpen(true);
    setTranscriptLoading(true);
    try {
      const res = await api.get(`/marks/student/${studentId}`);
      if (res.data.success) {
        setTranscriptData(res.data);
      }
    } catch (err) {
      error('Failed to generate student transcript.');
    } finally {
      setTranscriptLoading(false);
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
      link.setAttribute('download', 'KCAS_Official_Examination_Ledger.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Examination ledger exported to Excel.');
    } catch (err) {
      error('Failed to export marks Excel.');
    }
  };

  // Filtered Students for the selected Department & Class in Wizard
  const wizardFilteredStudents = students.filter(
    (st) =>
      (!wizardDept || String(st.department?._id || st.department) === String(wizardDept)) &&
      (!wizardCourse || String(st.course?._id || st.course) === String(wizardCourse)) &&
      (!wizardStudentSearch ||
        st.name?.toLowerCase().includes(wizardStudentSearch.toLowerCase()) ||
        st.registerNumber?.toLowerCase().includes(wizardStudentSearch.toLowerCase()) ||
        st.rollNumber?.toLowerCase().includes(wizardStudentSearch.toLowerCase()))
  );

  const selectedStudentObj = students.find((s) => String(s._id) === String(wizardStudent));

  const columns = [
    {
      header: 'Register No',
      key: 'registerNumber',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => handleOpenTranscript(row.student?._id || row.student)}
          className="font-mono font-bold text-[#6D1B29] bg-[#FAF0E6] px-2.5 py-1 rounded-lg border border-[#C5A059]/40 hover:border-[#C5A059] transition shadow-2xs group flex items-center gap-1.5"
          title="Click to view Official Marksheet Transcript"
        >
          <span>{row.registerNumber}</span>
          <Eye className="h-3 w-3 text-[#C5A059] opacity-70 group-hover:opacity-100" />
        </button>
      ),
    },
    {
      header: 'Student Name',
      key: 'studentName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0E1B2E]">{row.studentName}</p>
          <p className="text-[10px] text-[#64748B] font-medium font-sans">
            {row.department?.name || 'Department'} • {row.semester}
          </p>
        </div>
      ),
    },
    {
      header: 'Subject Unit',
      key: 'subjectName',
      render: (row) => (
        <div>
          <p className="font-bold text-[#0E1B2E]">{row.subjectName}</p>
          <span className="text-[10px] font-mono font-bold text-[#C5A059] bg-[#0E1B2E]/5 px-1.5 py-0.5 rounded border border-[#C5A059]/30">
            {row.subjectCode}
          </span>
        </div>
      ),
    },
    {
      header: 'Internal (25)',
      key: 'internalMark',
      render: (row) => (
        <span className="font-mono font-bold text-[#0E1B2E] bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          {row.internalMark} <span className="text-slate-400 font-normal">/25</span>
        </span>
      ),
    },
    {
      header: 'External (75)',
      key: 'externalMark',
      render: (row) => (
        <span className="font-mono font-bold text-[#0E1B2E] bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          {row.externalMark} <span className="text-slate-400 font-normal">/75</span>
        </span>
      ),
    },
    {
      header: 'Total (100)',
      key: 'totalMark',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-black text-sm text-[#0E1B2E] bg-[#FAF0E6]/80 px-2.5 py-1 rounded-lg border border-[#C5A059]/40">
          {row.totalMark}
        </span>
      ),
    },
    {
      header: 'Grade',
      key: 'grade',
      render: (row) => (
        <Badge
          variant={
            row.grade === 'O' || row.grade === 'A+' || row.grade === 'A'
              ? 'gold'
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
          className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-0.5 rounded-full border ${
            row.resultStatus === 'Pass'
              ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
              : 'text-rose-800 bg-rose-50 border-rose-300'
          }`}
        >
          {row.resultStatus === 'Pass' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
          )}
          {row.resultStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenTranscript(row.student?._id || row.student)}
            title="Generate Student Marksheet"
            className="p-1.5 text-[#0E1B2E] hover:text-[#6D1B29] hover:bg-[#FAF0E6] rounded-lg transition"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Mark Record"
                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(row);
                  setIsDeleteOpen(true);
                }}
                title="Delete Mark Record"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Examination & Marks Governance"
      subtitle="Thiruvalluvar University grading, step-by-step mark entry, & official academic transcripts"
    >
      {/* Grand Neo-Classic Examination Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B2E] via-[#162A45] to-[#4A0E18] p-6 md:p-8 text-white shadow-2xl border-2 border-[#C5A059]/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/60 bg-[#FAF0E6]/10 px-3.5 py-1 text-xs font-classic font-bold text-[#F3E5AB] mb-3 backdrop-blur-md">
              <Award className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Official University Marks & Results Registry</span>
            </div>
            <h2 className="font-classic text-xl md:text-3xl font-black tracking-wide text-white uppercase">
              Semester Grade & Result Ledger
            </h2>
            <p className="mt-1 text-xs md:text-sm text-[#E8E2D5]/90 font-sans max-w-xl">
              Step-by-step departmental student mark entry with Thiruvalluvar University grading standard (O, A+, A, B+, B, C, RA).
            </p>
          </div>

          {/* Quick Grading Legend */}
          <div className="p-4 rounded-2xl border border-[#C5A059]/40 bg-[#0E1B2E]/60 backdrop-blur-md text-xs space-y-1.5">
            <p className="font-classic font-bold text-[#F3E5AB] uppercase tracking-wider text-[10px]">
              University Grading Scheme:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-[#E8E2D5]">
              <div><span className="font-bold text-amber-300">O</span>: 90 - 100%</div>
              <div><span className="font-bold text-amber-300">A+</span>: 80 - 89%</div>
              <div><span className="font-bold text-emerald-300">A</span>: 70 - 79%</div>
              <div><span className="font-bold text-emerald-300">B+</span>: 60 - 69%</div>
              <div><span className="font-bold text-blue-300">B / C</span>: 40 - 59%</div>
              <div><span className="font-bold text-rose-300">RA</span>: Re-Appear (&lt;40)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      {analytics && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 p-4.5 text-center shadow-xs">
            <span className="font-classic text-[10px] font-bold text-[#6D1B29] uppercase tracking-wider">Total Evaluations</span>
            <p className="text-2xl font-black font-mono text-[#0E1B2E] mt-1">{analytics.totalEvaluated}</p>
            <span className="text-[10px] text-slate-400 font-medium">Recorded papers</span>
          </div>
          <div className="rounded-3xl border border-emerald-300 bg-emerald-50/70 p-4.5 text-center shadow-xs">
            <span className="font-classic text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Passed Units</span>
            <p className="text-2xl font-black font-mono text-emerald-800 mt-1">{analytics.passCount}</p>
            <span className="text-[10px] text-emerald-600 font-bold">Cleared examinations</span>
          </div>
          <div className="rounded-3xl border border-rose-300 bg-rose-50/70 p-4.5 text-center shadow-xs">
            <span className="font-classic text-[10px] font-bold text-rose-800 uppercase tracking-wider">Re-Appear (Arrear)</span>
            <p className="text-2xl font-black font-mono text-rose-800 mt-1">{analytics.failCount}</p>
            <span className="text-[10px] text-rose-600 font-bold">Pending remedial attempts</span>
          </div>
          <div className="rounded-3xl border border-[#C5A059]/50 bg-[#FAF0E6]/80 p-4.5 text-center shadow-xs">
            <span className="font-classic text-[10px] font-bold text-[#6D1B29] uppercase tracking-wider">Overall Pass Rate</span>
            <p className="text-2xl font-black font-mono text-[#6D1B29] mt-1">{analytics.passPercentage}%</p>
            <span className="text-[10px] text-[#9A7B39] font-bold">Average: {analytics.avgPercentage}%</span>
          </div>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D5] pb-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F0EBE1] border border-[#C5A059]/30">
          {canEdit && (
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'wizard'
                  ? 'bg-[#6D1B29] text-white shadow-sm font-classic'
                  : 'text-[#5A6A80] hover:text-[#0E1B2E]'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Step-by-Step Mark Entry</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#0E1B2E] text-[#F3E5AB] shadow-sm font-classic'
                : 'text-[#5A6A80] hover:text-[#0E1B2E]'
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span>Official Grade Ledger</span>
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setActiveTab('batch');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'batch'
                  ? 'bg-[#0E1B2E] text-[#F3E5AB] shadow-sm font-classic'
                  : 'text-[#5A6A80] hover:text-[#0E1B2E]'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Class Spreadsheet Sheet</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0E1B2E] bg-white border border-[#C5A059]/40 rounded-xl hover:bg-[#FAF0E6] transition shadow-2xs"
          >
            <Download className="h-4 w-4 text-[#C5A059]" />
            <span>Export Ledger</span>
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => setIsExcelOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
              >
                <Upload className="h-4 w-4 text-emerald-600" />
                <span>Upload Excel</span>
              </button>

              <button
                onClick={handleOpenEntry}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0E1B2E] bg-[#C5A059] hover:bg-[#DFB96E] rounded-xl transition shadow-md font-classic"
              >
                <Plus className="h-4 w-4 text-[#0E1B2E]" />
                <span>Quick Record Modal</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB 0: STEP-BY-STEP MARK ENTRY WIZARD (MAIN REQUESTED FLOW) */}
      {activeTab === 'wizard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: 3 STEPS (Department ➔ Class ➔ Student) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* STEP 1: CHOOSE DEPARTMENT */}
              <div className="p-5 rounded-3xl border border-[#C5A059]/40 bg-white/95 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3 border-b border-[#E8E2D5] pb-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6D1B29] text-white font-mono font-bold text-xs">
                    1
                  </span>
                  <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                    Select Department
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {departments.map((d) => {
                    const isSelected = String(d._id) === String(wizardDept);
                    return (
                      <button
                        key={d._id}
                        type="button"
                        onClick={() => handleWizardDeptChange(d._id)}
                        className={`flex items-center justify-between p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'border-[#6D1B29] bg-[#6D1B29] text-white shadow-md'
                            : 'border-slate-200 bg-slate-50 hover:bg-[#FAF0E6]/50 text-[#0E1B2E]'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{d.name}</p>
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                            Code: {d.code}
                          </span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-amber-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: CHOOSE CLASS / DEGREE COURSE */}
              <div className="p-5 rounded-3xl border border-[#C5A059]/40 bg-white/95 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3 border-b border-[#E8E2D5] pb-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6D1B29] text-white font-mono font-bold text-xs">
                    2
                  </span>
                  <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                    Select Class / Degree Course
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {courses
                    .filter((c) => !wizardDept || String(c.department?._id || c.department) === String(wizardDept))
                    .map((c) => {
                      const isSelected = String(c._id) === String(wizardCourse);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => handleWizardCourseChange(c._id)}
                          className={`flex items-center justify-between p-3 rounded-2xl text-left border transition-all ${
                            isSelected
                              ? 'border-[#0E1B2E] bg-[#0E1B2E] text-[#F3E5AB] shadow-md'
                              : 'border-slate-200 bg-slate-50 hover:bg-[#FAF0E6]/50 text-[#0E1B2E]'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs">{c.courseName}</p>
                            <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#C5A059]' : 'text-slate-500'}`}>
                              {c.courseCode}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-[#C5A059]" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* STEP 3: CHOOSE STUDENT NAME */}
              <div className="p-5 rounded-3xl border border-[#C5A059]/40 bg-white/95 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 border-b border-[#E8E2D5] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6D1B29] text-white font-mono font-bold text-xs">
                      3
                    </span>
                    <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                      Select Student ({wizardFilteredStudents.length} Scholars)
                    </h3>
                  </div>

                  {/* Student Search */}
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student name/reg..."
                      value={wizardStudentSearch}
                      onChange={(e) => setWizardStudentSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-[#0E1B2E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {wizardFilteredStudents.length > 0 ? (
                    wizardFilteredStudents.map((st) => {
                      const isSelected = String(st._id) === String(wizardStudent);
                      return (
                        <button
                          key={st._id}
                          type="button"
                          onClick={() => setWizardStudent(st._id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-left border transition-all ${
                            isSelected
                              ? 'border-[#6D1B29] bg-[#FAF0E6] shadow-sm'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-[#6D1B29] text-white' : 'bg-slate-100 text-[#0E1B2E]'
                              }`}
                            >
                              {st.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[#0E1B2E]">{st.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Reg: <span className="font-bold text-[#6D1B29]">{st.registerNumber}</span> • Roll: {st.rollNumber}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs font-bold text-[#6D1B29] bg-[#C5A059]/20 px-2.5 py-1 rounded-full border border-[#C5A059]/40">
                              <Check className="h-3.5 w-3.5" /> Selected
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic py-6 text-center">
                      No enrolled students found for the selected Department & Class.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: STEP 4: ENTER SUBJECT & MARKS */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl border-2 border-[#C5A059] bg-white/95 shadow-lg sticky top-24">
                <div className="flex items-center gap-2.5 mb-4 border-b border-[#E8E2D5] pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C5A059] text-[#0E1B2E] font-mono font-black text-xs">
                    4
                  </span>
                  <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                    Enter Subject Marks
                  </h3>
                </div>

                {/* Selected Student Banner */}
                {selectedStudentObj ? (
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#0E1B2E] to-[#4A0E18] text-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#C5A059] uppercase">Candidate Selected</span>
                        <h4 className="font-bold text-sm text-white">{selectedStudentObj.name}</h4>
                        <p className="text-[11px] font-mono text-[#F3E5AB]">
                          {selectedStudentObj.registerNumber} • Roll: {selectedStudentObj.rollNumber}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-[#C5A059]/40 text-[#C5A059] font-bold">
                        {selectedStudentObj.name?.charAt(0)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    ⚠️ Please select a student from Step 3 on the left.
                  </div>
                )}

                <form onSubmit={handleWizardSubmit} className="space-y-4 text-xs font-sans">
                  {/* Semester & Subject Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
                      Semester
                    </label>
                    <select
                      value={wizardSemester}
                      onChange={(e) => setWizardSemester(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-[#0E1B2E]"
                    >
                      {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
                      Subject Unit *
                    </label>
                    <select
                      required
                      value={wizardSubject}
                      onChange={(e) => setWizardSubject(e.target.value)}
                      className="w-full rounded-xl border border-[#C5A059] bg-[#FAF0E6]/30 p-2.5 font-bold text-[#6D1B29] focus:outline-hidden"
                    >
                      <option value="">-- Choose Subject Unit --</option>
                      {subjects
                        .filter((s) => !wizardCourse || String(s.course?._id || s.course) === String(wizardCourse))
                        .map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.subjectCode} - {sub.subjectName} ({sub.semester})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Mark Inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
                        Internal (Max 25) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={25}
                        required
                        value={wizardInternal}
                        onChange={(e) => setWizardInternal(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-center text-sm text-[#0E1B2E] bg-white shadow-2xs focus:border-[#6D1B29]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
                        External (Max 75) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={75}
                        required
                        value={wizardExternal}
                        onChange={(e) => setWizardExternal(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-center text-sm text-[#0E1B2E] bg-white shadow-2xs focus:border-[#6D1B29]"
                      />
                    </div>
                  </div>

                  {/* Computed Live Result Card */}
                  {(() => {
                    const preview = calculateGradeInfo(wizardInternal, wizardExternal);
                    return (
                      <div className="p-4 rounded-2xl bg-[#FAF0E6] border border-[#C5A059]/40 flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <span className="text-[#6D1B29] font-bold uppercase text-[10px]">Computed Total & Grade:</span>
                          <p className="text-lg font-black font-mono text-[#0E1B2E] mt-0.5">
                            {preview.total} / 100 <span className="text-xs font-sans font-bold text-[#6D1B29]">({preview.grade} Grade)</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[#6D1B29] font-bold uppercase text-[10px]">Result:</span>
                          <p className={`font-black text-sm ${preview.isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {preview.resultStatus === 'Pass' ? 'PASSED' : 'RE-APPEAR (RA)'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={wizardSaving || !wizardStudent || !wizardSubject}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-classic font-bold text-xs text-white bg-[#6D1B29] hover:bg-[#8C2234] transition shadow-md disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{wizardSaving ? 'Saving...' : 'Save & Record Mark'}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 1: OFFICIAL GRADE LEDGER */}
      {activeTab === 'ledger' && (
        <DataTable
          columns={columns}
          data={marks}
          loading={loading}
          totalItems={totalRecords}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSearchChange={setSearch}
          searchPlaceholder="Search marks by student name, register number or subject code..."
          filterComponent={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCourseFilter('All');
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-[#C5A059]/40 bg-white py-2 px-3 text-xs font-semibold text-[#0E1B2E] focus:outline-hidden"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-[#C5A059]/40 bg-white py-2 px-3 text-xs font-semibold text-[#0E1B2E] focus:outline-hidden"
              >
                <option value="All">All Classes / Courses</option>
                {courses
                  .filter((c) => deptFilter === 'All' || String(c.department?._id || c.department) === String(deptFilter))
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
              </select>

              <select
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-[#0E1B2E] focus:outline-hidden"
              >
                <option value="All">All Semesters</option>
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={resultFilter}
                onChange={(e) => {
                  setResultFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-[#0E1B2E] focus:outline-hidden"
              >
                <option value="All">All Results</option>
                <option value="Pass">Pass Only</option>
                <option value="Fail">Re-Appear (RA) Only</option>
              </select>
            </div>
          }
        />
      )}

      {/* TAB 2: LIVE CLASS MARK ENTRY GRID */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          {/* Cohort & Subject Selection Bar */}
          <div className="rounded-3xl border border-[#C5A059]/40 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3 mb-4">
              <div>
                <h3 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">Select Course & Subject for Classroom Mark Sheet</h3>
                <p className="text-xs text-[#64748B]">Students in the selected department & class appear automatically</p>
              </div>
              <button
                onClick={loadBatchClassSheet}
                disabled={batchLoading}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0E1B2E] hover:bg-[#162A45] rounded-xl transition shadow-xs disabled:opacity-60 font-classic"
              >
                <RefreshCw className={`h-4 w-4 ${batchLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Roster</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">Department</label>
                <select
                  value={batchDept}
                  onChange={(e) => handleBatchDeptChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#0E1B2E] font-medium"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">Class / Degree Course</label>
                <select
                  value={batchCourse}
                  onChange={(e) => handleBatchCourseChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#0E1B2E] font-medium"
                >
                  {courses
                    .filter((c) => !batchDept || String(c.department?._id || c.department) === String(batchDept))
                    .map((c) => (
                      <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">Semester</label>
                <select
                  value={batchSemester}
                  onChange={(e) => setBatchSemester(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#0E1B2E] font-medium"
                >
                  {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">Subject Unit *</label>
                <select
                  value={batchSubject}
                  onChange={(e) => setBatchSubject(e.target.value)}
                  className="w-full rounded-xl border border-[#C5A059] bg-[#FAF0E6]/30 p-2.5 text-xs font-bold text-[#6D1B29]"
                >
                  {subjects
                    .filter((s) => !batchCourse || String(s.course?._id || s.course) === String(batchCourse))
                    .map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subjectCode} - {sub.subjectName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Class Marks Table */}
          <div className="rounded-3xl border border-[#C5A059]/30 bg-white/95 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4.5 border-b border-[#E8E2D5] bg-[#FBF9F5] gap-3">
              <div>
                <h4 className="font-classic text-sm font-black text-[#0E1B2E] uppercase">
                  Class Mark Sheet ({batchRows.length} Enrolled Scholars)
                </h4>
                <p className="text-xs text-[#64748B]">
                  Type internal (max 25) & external (max 75) marks. Total, grade & results compute dynamically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveBatchMarks}
                  disabled={batchSaving || batchRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#6D1B29] hover:bg-[#8C2234] rounded-xl transition shadow-md disabled:opacity-60 font-classic"
                >
                  <Save className="h-4 w-4" />
                  <span>{batchSaving ? 'Saving...' : 'Save & Publish Marks'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#0E1B2E]">
                <thead className="bg-[#FAF0E6]/60 text-[10px] font-classic font-black uppercase tracking-wider text-[#6D1B29] border-b border-[#E8E2D5]">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Register No</th>
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5">Internal (Max 25)</th>
                    <th className="px-5 py-3.5">External (Max 75)</th>
                    <th className="px-5 py-3.5">Total (100)</th>
                    <th className="px-5 py-3.5">Grade</th>
                    <th className="px-5 py-3.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {batchLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-5 py-4 text-center text-slate-400">Loading student roster...</td>
                      </tr>
                    ))
                  ) : batchRows.length > 0 ? (
                    batchRows.map((row, idx) => {
                      const gradeInfo = calculateGradeInfo(row.internalMark, row.externalMark);
                      return (
                        <tr key={row.studentId} className="hover:bg-[#FAF0E6]/30 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-[#6D1B29] bg-[#FAF0E6] px-2 py-0.5 rounded border border-[#C5A059]/30">
                              {row.registerNumber}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-[#0E1B2E]">{row.name}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={25}
                                value={row.internalMark}
                                onChange={(e) => handleBatchMarkChange(idx, 'internalMark', e.target.value)}
                                className="w-18 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono font-bold text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden text-center bg-white shadow-2xs"
                              />
                              <span className="text-slate-400 text-[10px]">/25</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={75}
                                value={row.externalMark}
                                onChange={(e) => handleBatchMarkChange(idx, 'externalMark', e.target.value)}
                                className="w-18 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono font-bold text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden text-center bg-white shadow-2xs"
                              />
                              <span className="text-slate-400 text-[10px]">/75</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-black text-sm text-[#0E1B2E] bg-[#FAF0E6] px-2 py-0.5 rounded-md border border-[#C5A059]/40">
                              {gradeInfo.total}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={gradeInfo.isPassed ? 'gold' : 'danger'} size="sm">
                              {gradeInfo.grade}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-xs ${
                                gradeInfo.isPassed ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {gradeInfo.isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                              {gradeInfo.resultStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                        No students found for this Department and Course. Select another department/class to view students.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL STUDENT MARKSHEET / TRANSCRIPT MODAL */}
      <Modal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        title="Official Academic Transcript & Marksheet"
        subtitle={transcriptData?.student ? `${transcriptData.student.name} (${transcriptData.student.registerNumber})` : ''}
        maxWidth="max-w-4xl"
      >
        {transcriptLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#C5A059] border-t-transparent" />
            <p className="text-xs font-bold text-[#6D1B29] mt-3 font-classic">Compiling Official University Marksheet...</p>
          </div>
        ) : transcriptData ? (
          <div className="space-y-6 text-xs font-sans">
            {/* Marksheet Institutional Header */}
            <div className="p-6 rounded-3xl border-2 border-[#C5A059]/50 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#4A0E18] text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#C5A059]/30 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white p-1 border-2 border-[#C5A059] flex items-center justify-center shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/images/kcas-logo.png" alt="KCAS" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-classic text-base font-black text-[#F3E5AB] uppercase">
                      Kamban College of Arts & Science
                    </h3>
                    <p className="text-[11px] text-[#E8E2D5]">Tiruvannamalai, Tamil Nadu • Affiliated to Thiruvalluvar University</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-classic text-[10px] font-bold uppercase tracking-widest text-[#C5A059] bg-[#FAF0E6]/10 px-3 py-1 rounded-full border border-[#C5A059]/40">
                    Official Grade Transcript
                  </span>
                </div>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[#C5A059] font-bold text-[10px] uppercase">Candidate Name</span>
                  <p className="font-bold text-white text-sm mt-0.5">{transcriptData.student?.name}</p>
                </div>
                <div>
                  <span className="text-[#C5A059] font-bold text-[10px] uppercase">Register Number</span>
                  <p className="font-mono font-bold text-[#F3E5AB] text-sm mt-0.5">{transcriptData.student?.registerNumber}</p>
                </div>
                <div>
                  <span className="text-[#C5A059] font-bold text-[10px] uppercase">Department</span>
                  <p className="font-bold text-white mt-0.5">{transcriptData.student?.department?.name}</p>
                </div>
                <div>
                  <span className="text-[#C5A059] font-bold text-[10px] uppercase">Degree Course</span>
                  <p className="font-bold text-white mt-0.5">{transcriptData.student?.course?.courseName}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[#FAF0E6] border border-[#C5A059]/40">
                <span className="text-[10px] font-bold text-[#6D1B29] uppercase">Evaluations</span>
                <p className="text-xl font-black font-mono text-[#0E1B2E] mt-0.5">{transcriptData.summary?.totalEvaluations}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Papers Cleared</span>
                <p className="text-xl font-black font-mono text-emerald-800 mt-0.5">{transcriptData.summary?.passedEvaluations}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF0E6] border border-[#C5A059]/40">
                <span className="text-[10px] font-bold text-[#6D1B29] uppercase">Cumulative Average</span>
                <p className="text-xl font-black font-mono text-[#6D1B29] mt-0.5">{transcriptData.summary?.overallPercentage}%</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300">
                <span className="text-[10px] font-bold text-[#0E1B2E] uppercase">Academic Standing</span>
                <p className="text-xs font-black text-[#0E1B2E] mt-1.5">{transcriptData.summary?.resultStatus}</p>
              </div>
            </div>

            {/* Semester-wise Marksheets */}
            {Object.keys(transcriptData.semesterMarks || {}).map((sem) => (
              <div key={sem} className="rounded-2xl border border-[#C5A059]/30 bg-white overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-[#FAF0E6]/70 border-b border-[#E8E2D5] flex items-center justify-between">
                  <h4 className="font-classic font-black text-xs text-[#6D1B29] uppercase">{sem} Examination Results</h4>
                  <span className="text-[10px] font-bold text-[#0E1B2E]">Thiruvalluvar University Pattern</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F5] text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2">Subject Code</th>
                      <th className="px-4 py-2">Subject Title</th>
                      <th className="px-4 py-2 text-center">Internal (25)</th>
                      <th className="px-4 py-2 text-center">External (75)</th>
                      <th className="px-4 py-2 text-center">Total (100)</th>
                      <th className="px-4 py-2 text-center">Grade</th>
                      <th className="px-4 py-2 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transcriptData.semesterMarks[sem].map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-mono font-bold text-[#6D1B29]">{m.subjectCode}</td>
                        <td className="px-4 py-2.5 font-semibold text-[#0E1B2E]">{m.subjectName}</td>
                        <td className="px-4 py-2.5 text-center font-mono">{m.internalMark}</td>
                        <td className="px-4 py-2.5 text-center font-mono">{m.externalMark}</td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold text-[#0E1B2E]">{m.totalMark}</td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge variant={m.resultStatus === 'Pass' ? 'gold' : 'danger'} size="sm">
                            {m.grade}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold">
                          <span className={m.resultStatus === 'Pass' ? 'text-emerald-700' : 'text-rose-700'}>
                            {m.resultStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Print & Close Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0E1B2E] bg-white border border-[#C5A059] rounded-xl hover:bg-[#FAF0E6] transition shadow-2xs font-classic"
              >
                <Printer className="h-4 w-4 text-[#C5A059]" />
                <span>Print Official Marksheet</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTranscriptOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0E1B2E] hover:bg-[#162A45] rounded-xl transition"
              >
                Close Marksheet
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

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

      {/* STEP-BY-STEP CASCADING INDIVIDUAL ENTER / EDIT MARKS MODAL */}
      <Modal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        title={editTarget ? "Edit Semester Examination Marks" : "Record Semester Examination Marks"}
        subtitle="Department ➔ Class / Course ➔ Subject ➔ Student Name ➔ Marks"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleWizardSubmit} className="space-y-4 font-sans text-xs">
          {/* Step 1 & 2: Department & Class/Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF0E6]/50 border border-[#C5A059]/30">
            <div>
              <label className="block text-[11px] font-bold text-[#6D1B29] uppercase mb-1">
                1. Select Department *
              </label>
              <select
                required
                disabled={!!editTarget}
                value={wizardDept}
                onChange={(e) => handleWizardDeptChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#0E1B2E] font-medium focus:border-[#6D1B29] focus:outline-hidden shadow-2xs"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6D1B29] uppercase mb-1">
                2. Select Class / Degree Course *
              </label>
              <select
                required
                disabled={!!editTarget}
                value={wizardCourse}
                onChange={(e) => handleWizardCourseChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#0E1B2E] font-medium focus:border-[#6D1B29] focus:outline-hidden shadow-2xs"
              >
                <option value="">-- Choose Class / Course --</option>
                {courses
                  .filter((c) => !wizardDept || String(c.department?._id || c.department) === String(wizardDept))
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Step 3: Semester & Subject Unit Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div>
              <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
                3. Semester
              </label>
              <select
                value={wizardSemester}
                onChange={(e) => setWizardSemester(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-[#0E1B2E] font-medium focus:border-[#6D1B29] focus:outline-hidden shadow-2xs"
              >
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
                4. Select Subject Unit *
              </label>
              <select
                required
                disabled={!!editTarget}
                value={wizardSubject}
                onChange={(e) => setWizardSubject(e.target.value)}
                className="w-full rounded-xl border border-[#C5A059] bg-[#FAF0E6]/30 p-2.5 text-xs font-bold text-[#6D1B29] focus:border-[#6D1B29] focus:outline-hidden shadow-2xs"
              >
                <option value="">-- Choose Subject --</option>
                {subjects
                  .filter((sub) => !wizardCourse || String(sub.course?._id || sub.course) === String(wizardCourse))
                  .map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.subjectCode} - {sub.subjectName} ({sub.semester})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Step 4: Student Selection from that specific class */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-[11px] font-bold text-[#0E1B2E] uppercase mb-1">
              5. Select Student from this Class *
            </label>
            <select
              required
              disabled={!!editTarget}
              value={wizardStudent}
              onChange={(e) => setWizardStudent(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden shadow-2xs"
            >
              <option value="">-- Choose Student from Selected Class --</option>
              {wizardFilteredStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.registerNumber} - {s.name} ({s.rollNumber ? `Roll: ${s.rollNumber}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Step 5: Mark Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0E1B2E] mb-1">
                Internal Mark (Max 25) *
              </label>
              <input
                type="number"
                min={0}
                max={25}
                required
                value={wizardInternal}
                onChange={(e) => setWizardInternal(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0E1B2E] mb-1">
                External Mark (Max 75) *
              </label>
              <input
                type="number"
                min={0}
                max={75}
                required
                value={wizardExternal}
                onChange={(e) => setWizardExternal(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-[#0E1B2E] focus:border-[#6D1B29] focus:outline-hidden bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* Live Computed Grade Card */}
          {(() => {
            const preview = calculateGradeInfo(wizardInternal, wizardExternal);
            return (
              <div className="p-4 rounded-2xl bg-[#FAF0E6] border border-[#C5A059]/40 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="text-[#6D1B29] font-bold uppercase text-[10px]">Computed Total & Grade:</span>
                  <p className="text-lg font-black font-mono text-[#0E1B2E] mt-0.5">
                    {preview.total} / 100 <span className="text-xs font-sans font-bold text-[#6D1B29]">({preview.grade} Grade)</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[#6D1B29] font-bold uppercase text-[10px]">Result Standard:</span>
                  <p className={`font-black text-sm ${preview.isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {preview.resultStatus === 'Pass' ? 'PASSED' : 'RE-APPEAR (RA)'}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEntryOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={wizardSaving || !wizardStudent || !wizardSubject}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#6D1B29] hover:bg-[#8C2234] rounded-xl transition shadow-sm disabled:opacity-60 font-classic"
            >
              {wizardSaving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              <span>{editTarget ? 'Update Mark & Recalculate' : 'Save Mark & Compute Grade'}</span>
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
        loading={loading}
      />
    </DashboardLayout>
  );
}
