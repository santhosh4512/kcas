'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ExcelUploadModal from '../../components/ui/ExcelUploadModal';
import AIAdvisorWidget from '../../components/ui/AIAdvisorWidget';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  GraduationCap,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Sparkles,
  CalendarCheck,
  Award,
  Filter,
  CreditCard,
  Printer,
  QrCode,
  BrainCircuit,
} from 'lucide-react';


export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [deptFilter, setDeptFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [idCardStudent, setIdCardStudent] = useState(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorStudentId, setAdvisorStudentId] = useState(null);


  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    registerNumber: '',
    rollNumber: '',
    name: '',
    gender: 'Female',
    dob: '2005-01-01',
    email: '',
    phone: '',
    address: 'Tiruvannamalai, Tamil Nadu',
    department: '',
    course: '',
    year: 'I Year',
    semester: 'Semester 1',
    section: 'A',
    parentName: '',
    parentPhone: '',
    status: 'Active',
  });

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const isAdminOrFaculty = hasRole('admin', 'faculty');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      if (deptFilter !== 'All') params.department = deptFilter;
      if (courseFilter !== 'All') params.course = courseFilter;
      if (yearFilter !== 'All') params.year = yearFilter;
      if (sectionFilter !== 'All') params.section = sectionFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const [stuRes, deptRes, crsRes] = await Promise.all([
        api.get('/students', { params }),
        api.get('/departments'),
        api.get('/courses'),
      ]);

      if (stuRes.data.success) {
        setStudents(stuRes.data.data);
        setTotalPages(stuRes.data.totalPages || 1);
        setTotalStudents(stuRes.data.total || 0);
      }
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (crsRes.data.success) setCourses(crsRes.data.data);
    } catch (err) {
      error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, deptFilter, courseFilter, yearFilter, sectionFilter, statusFilter, search]);

  const handleOpenCreate = () => {
    setFormData({
      registerNumber: `24UBCS${Math.floor(100 + Math.random() * 900)}`,
      rollNumber: `CS24${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      gender: 'Female',
      dob: '2005-01-01',
      email: '',
      phone: '',
      address: 'Tiruvannamalai, Tamil Nadu',
      department: departments[0]?._id || '',
      course: courses[0]?._id || '',
      year: 'I Year',
      semester: 'Semester 1',
      section: 'A',
      parentName: '',
      parentPhone: '',
      status: 'Active',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setSelectedStudent(stu);
    setFormData({
      registerNumber: stu.registerNumber,
      rollNumber: stu.rollNumber,
      name: stu.name,
      gender: stu.gender || 'Female',
      dob: stu.dob || '2005-01-01',
      email: stu.email,
      phone: stu.phone,
      address: stu.address || 'Tiruvannamalai',
      department: stu.department?._id || stu.department || '',
      course: stu.course?._id || stu.course || '',
      year: stu.year,
      semester: stu.semester,
      section: stu.section,
      parentName: stu.parentName || '',
      parentPhone: stu.parentPhone || '',
      status: stu.status,
    });
    setIsEditOpen(true);
  };

  const handleOpenProfile = async (stu) => {
    setSelectedStudent(stu);
    setIsProfileOpen(true);
    setProfileLoading(true);
    try {
      const res = await api.get(`/students/${stu._id}`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      error('Failed to load 360 student profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenDelete = (stu) => {
    setSelectedStudent(stu);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.registerNumber || !formData.email || !formData.department || !formData.course) {
      warning('Please fill in all mandatory fields.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        success('Student registered successfully!');
        setIsCreateOpen(false);
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error creating student.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await api.put(`/students/${selectedStudent._id}`, formData);
      if (res.data.success) {
        success('Student profile updated successfully!');
        setIsEditOpen(false);
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error updating student.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      const res = await api.delete(`/students/${selectedStudent._id}`);
      if (res.data.success) {
        success('Student and related records deleted.');
        setIsDeleteOpen(false);
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error deleting student.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/students/export', {
        params: {
          department: deptFilter,
          course: courseFilter,
          year: yearFilter,
          section: sectionFilter,
          status: statusFilter,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'KCAS_Student_Directory.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Student directory exported to Excel.');
    } catch (err) {
      error('Failed to export students.');
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
      header: 'Student Profile',
      key: 'name',
      sortable: true,
      render: (row) => {
        const photo = row.photoUrl || row.profilePhoto;
        const initials = row.name
          ? row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'ST';

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#FAF0E6] border border-[#C5A059]/40 text-[#701A28] font-bold text-xs flex items-center justify-center shadow-2xs">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={row.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{row.name}</p>
              <p className="text-[10px] text-slate-400">Roll No: {row.rollNumber}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Cohort / Stream',
      key: 'department',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.department?.name || 'Computer Science'}</p>
          <p className="text-[10px] text-slate-500">
            {row.year} • {row.section ? `Sec ${row.section}` : 'Sec A'}
          </p>
        </div>
      ),
    },
    {
      header: 'Faculty Mentor',
      key: 'mentor',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">
            {row.mentor?.name || row.mentorName || 'Dr. S. Kanimozhi'}
          </p>
          <p className="text-[10px] text-slate-400">Assigned Mentor</p>
        </div>
      ),
    },
    {
      header: 'Performance & Att.',
      key: 'attendanceMarks',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Attendance">
            Att: {row.initialAttendance !== undefined ? `${row.initialAttendance}%` : '85%'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Marks">
            Mark: {row.initialMarks !== undefined ? `${row.initialMarks}%` : '75%'}
          </span>
        </div>
      ),
    },
    {
      header: 'Talent Strength',
      key: 'talentScore',
      render: (row) => {
        const talent = row.talentScore;
        if (!talent || !talent.dominantCategoryName || talent.dominantCategoryName === 'Not Evaluated') {
          return (
            <span className="text-slate-500 text-xs">
              {Array.isArray(row.skills) && row.skills.length > 0 ? row.skills.slice(0, 2).join(', ') : 'Coding & Problem Solving'}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="talent" size="sm">
              <Sparkles className="h-3 w-3 mr-1 text-amber-500 inline" />
              {talent.dominantCategoryName} ({talent.highestScore}%)
            </Badge>
          </div>
        );
      },
    },

    {
      header: 'Contact',
      key: 'phone',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p className="text-[11px]">{row.phone}</p>
          <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setAdvisorStudentId(row._id);
              setIsAdvisorOpen(true);
            }}
            title="AI Smart Performance & Career Advisor"
            className="p-1.5 text-[#D4AF37] hover:text-white hover:bg-[#D4AF37]/20 rounded-lg transition"
          >
            <BrainCircuit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenProfile(row)}
            title="View 360 Student Profile"
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setIdCardStudent(row);
              setIsIdCardOpen(true);
            }}
            title="Generate Official Student ID Card"
            className="p-1.5 text-[#D4AF37] hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <CreditCard className="h-4 w-4" />
          </button>

          {isAdminOrFaculty && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Student"
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleOpenDelete(row)}
                title="Delete Student"
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
      title="Student Management"
      subtitle="Student registry, enrollment profiles, and Excel batch management"
    >
      {/* Top Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Total {totalStudents} students registered in the institution database.
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

          {isAdminOrFaculty && (
            <>
              <button
                onClick={() => setIsExcelOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-2xs"
              >
                <Upload className="h-4 w-4 text-emerald-600" />
                Upload Excel
              </button>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Student DataTable */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        totalItems={totalStudents}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onSearchChange={setSearch}
        searchPlaceholder="Search student by name, register number, roll number, email..."
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
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-[#0E1B2E] focus:outline-hidden"
            >
              <option value="All">All Years</option>
              <option value="I Year">I Year</option>
              <option value="II Year">II Year</option>
              <option value="III Year">III Year</option>
              <option value="IV Year">IV Year</option>
            </select>
          </div>
        }
      />

      {/* EXCEL UPLOAD MODAL */}
      <ExcelUploadModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        title="Upload Students via Excel (.xlsx)"
        templateUrl="/students/template"
        previewUrl="/students/preview-excel"
        importUrl="/students/import"
        onSuccess={fetchStudents}
        entityName="Students"
      />

      {/* CREATE STUDENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Enroll New Student"
        subtitle="Create student profile with academic stream details"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Register Number *</label>
              <input
                type="text"
                required
                value={formData.registerNumber}
                onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Kanimozhi R"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree Course *</label>
              <select
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseName} ({c.courseCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="I Year">I Year</option>
                <option value="II Year">II Year</option>
                <option value="III Year">III Year</option>
                <option value="IV Year">IV Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map(
                  (sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@kcas.edu.in"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="e.g. Rajendran M"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Contact Phone</label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="9443322110"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
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
              Enroll Student
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Profile"
        subtitle={`Updating information for ${selectedStudent?.name}`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Register Number</label>
              <input
                type="text"
                disabled
                value={formData.registerNumber}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-500 bg-slate-100 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="I Year">I Year</option>
                <option value="II Year">II Year</option>
                <option value="III Year">III Year</option>
                <option value="IV Year">IV Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
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
              Update Student
            </button>
          </div>
        </form>
      </Modal>

      {/* STUDENT 360 PROFILE VIEW */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Student 360° Profile & Talent Overview"
        subtitle={selectedStudent ? `${selectedStudent.name} (${selectedStudent.registerNumber})` : ''}
        maxWidth="max-w-4xl"
      >
        {profileLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <p className="text-xs font-medium text-slate-500 mt-2">Loading student 360 data...</p>
          </div>
        ) : profileData ? (
          <div className="space-y-6 text-xs">
            {/* Header Hero */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#350812] text-white gap-4 shadow-md">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/20 text-white font-bold text-2xl border border-[#C5A059]/40 backdrop-blur-xs flex items-center justify-center">
                  {profileData.student.photoUrl || profileData.student.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileData.student.photoUrl || profileData.student.profilePhoto}
                      alt={profileData.student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profileData.student.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{profileData.student.name}</h3>
                  <p className="text-xs text-amber-200">
                    Reg: <span className="font-mono font-bold text-white">{profileData.student.registerNumber}</span> • Roll: {profileData.student.rollNumber}
                  </p>
                  <p className="text-[11px] text-blue-300 mt-0.5">
                    {profileData.student.department?.name} ({profileData.student.year})
                  </p>
                </div>
              </div>

              {profileData.talent && (
                <div className="rounded-xl border border-amber-400/40 bg-amber-500/20 p-3 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    🏆 Primary Talent Strength
                  </span>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {profileData.talent.dominantCategoryName} ({profileData.talent.highestScore}%)
                  </p>
                </div>
              )}
            </div>

            {/* Performance KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Academic Average</span>
                <p className="text-xl font-bold text-blue-700 mt-0.5">
                  {profileData.academic?.academicAverage || 0}%
                </p>
                <p className="text-[10px] text-slate-400">
                  {profileData.academic?.passedCount} of {profileData.academic?.totalSubjects} subjects passed
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Attendance Rate</span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  {profileData.attendance?.attendancePercentage || 0}%
                </p>
                <Badge variant={profileData.attendance?.status === 'Healthy' ? 'success' : 'warning'} size="sm" className="mt-0.5">
                  {profileData.attendance?.status} Attendance
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Specific Skills Recorded</span>
                <p className="text-xl font-bold text-purple-700 mt-0.5">
                  {profileData.skills?.length || 0}
                </p>
                <p className="text-[10px] text-slate-400">Verified institutional achievements</p>
              </div>
            </div>

            {/* Talent Narrative Summary */}
            {profileData.talent?.calculatedSummary && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60">
                <h5 className="font-bold text-blue-900 flex items-center gap-1.5 mb-1 text-xs">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Talent Intelligence Assessment:
                </h5>
                <p className="text-slate-700 leading-relaxed italic">
                  &ldquo;{profileData.talent.calculatedSummary}&rdquo;
                </p>
              </div>
            )}

            {/* Specific Skills List */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2">Verified Talents & Skills:</h5>
              {profileData.skills?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profileData.skills.map((sk) => (
                    <div key={sk._id} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{sk.skillName}</span>
                        <Badge variant="primary" size="sm">{sk.skillLevel}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Category: <span className="font-semibold text-slate-700">{sk.category}</span> • Score: {sk.percentage}%
                      </p>
                      {sk.achievement && (
                        <p className="text-[10px] text-emerald-700 font-medium mt-1">
                          🏅 {sk.achievement}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No specific talent skills recorded yet.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <a
                href={`/marks`}
                className="px-4 py-2 text-xs font-bold text-[#6D1B29] bg-[#FAF0E6] border border-[#C5A059]/40 hover:bg-[#F3E5AB]/40 rounded-xl transition flex items-center gap-1.5 font-classic"
              >
                <Award className="h-4 w-4 text-[#C5A059]" />
                <span>View Semester Marksheets & Results</span>
              </a>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0E1B2E] hover:bg-[#162A45] rounded-xl transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* OFFICIAL STUDENT PHOTO ID CARD MODAL */}
      <Modal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        title="Official Student Identity Card"
        subtitle={idCardStudent ? `${idCardStudent.name} (${idCardStudent.registerNumber})` : ''}
        maxWidth="max-w-md"
      >
        {idCardStudent ? (
          <div className="space-y-4 font-sans">
            {/* ID Card Front Plate */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-[#C5A059] bg-gradient-to-br from-[#0E1B2E] via-[#162A45] to-[#4A0E18] p-5 text-white shadow-xl">
              {/* Institution Header */}
              <div className="flex items-center gap-3 border-b border-[#C5A059]/40 pb-3">
                <div className="h-11 w-11 rounded-xl bg-white p-1 border border-[#C5A059] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/kcas-logo.png" alt="KCAS" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h4 className="font-classic text-xs font-black text-[#F3E5AB] uppercase tracking-wide">
                    Kamban College of Arts & Science
                  </h4>
                  <p className="text-[9px] text-[#E8E2D5]">Affiliated to Thiruvalluvar University • NAAC Accredited</p>
                  <span className="text-[8px] font-bold text-[#C5A059] uppercase tracking-widest">
                    Student Identity Card
                  </span>
                </div>
              </div>

              {/* Student Bio Grid */}
              <div className="flex items-center gap-4 py-4">
                <div className="h-20 w-20 rounded-2xl bg-white/10 border-2 border-[#C5A059] flex items-center justify-center font-bold text-2xl text-[#F3E5AB] shadow-md shrink-0">
                  {idCardStudent.name?.charAt(0)}
                </div>

                <div className="space-y-1 text-xs">
                  <h3 className="font-black text-sm text-white uppercase">{idCardStudent.name}</h3>
                  <p className="text-[11px] font-mono font-bold text-[#C5A059]">
                    REG: {idCardStudent.registerNumber}
                  </p>
                  <p className="text-[10px] text-slate-200">
                    <span className="font-bold text-[#C5A059]">COURSE:</span> {idCardStudent.course?.courseName || 'Degree'}
                  </p>
                  <p className="text-[10px] text-slate-200">
                    <span className="font-bold text-[#C5A059]">DEPT:</span> {idCardStudent.department?.name || 'Department'}
                  </p>
                  <p className="text-[10px] text-slate-200">
                    <span className="font-bold text-[#C5A059]">ROLL:</span> {idCardStudent.rollNumber} • <span className="font-bold text-[#C5A059]">SEC:</span> {idCardStudent.section}
                  </p>
                </div>
              </div>

              {/* ID Card Footer & Barcode Simulator */}
              <div className="flex items-center justify-between border-t border-[#C5A059]/40 pt-3 text-[9px] text-[#E8E2D5]">
                <div>
                  <span className="font-bold text-[#C5A059] block">VALID TILL:</span>
                  <span>2024 - 2027</span>
                </div>

                <div className="text-center font-mono font-bold text-[8px] text-slate-300">
                  <div className="tracking-widest bg-white/20 px-2 py-0.5 rounded border border-white/20">
                    ||||| |||| ||||| ||||
                  </div>
                  <span>{idCardStudent.registerNumber}</span>
                </div>

                <div className="text-right">
                  <span className="font-classic text-[8px] text-[#F3E5AB] font-bold block">
                    Principal
                  </span>
                  <span className="italic text-[8px] text-slate-400">Authorized Sign</span>
                </div>
              </div>
            </div>

            {/* Print & Close Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0E1B2E] bg-white border border-[#C5A059] rounded-xl hover:bg-[#FAF0E6] transition shadow-2xs font-classic"
              >
                <Printer className="h-4 w-4 text-[#C5A059]" />
                <span>Print Official ID Card</span>
              </button>

              <button
                type="button"
                onClick={() => setIsIdCardOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0E1B2E] hover:bg-[#162A45] rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${selectedStudent?.name} (${selectedStudent?.registerNumber})? This will permanently delete student credentials, marks, attendance, and talent records.`}
        confirmText="Yes, Delete Student"
        loading={formLoading}
      />

      {/* AI Smart Student Advisor & Career Copilot Modal */}
      <AIAdvisorWidget
        isOpen={isAdvisorOpen}
        studentId={advisorStudentId}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </DashboardLayout>
  );
}

