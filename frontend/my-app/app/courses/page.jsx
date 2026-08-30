'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  BookOpen,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Award,
  Search,
} from 'lucide-react';

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'subjects'
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState({ type: 'course', id: null, name: '' });

  // Forms
  const [courseForm, setCourseForm] = useState({
    courseName: '',
    courseCode: '',
    department: '',
    duration: '3 Years (6 Semesters)',
    courseType: 'Undergraduate (UG)',
    status: 'Active',
  });

  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    course: '',
    department: '',
    semester: 'Semester 1',
    credits: 4,
    faculty: '',
    status: 'Active',
  });

  const [formLoading, setFormLoading] = useState(false);

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, subjectsRes, deptsRes, facRes] = await Promise.all([
        api.get('/courses', { params: { department: selectedDeptFilter, search } }),
        api.get('/subjects', { params: { department: selectedDeptFilter, search } }),
        api.get('/departments'),
        api.get('/faculty'),
      ]);

      if (coursesRes.data.success) setCourses(coursesRes.data.data);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.data);
      if (deptsRes.data.success) setDepartments(deptsRes.data.data);
      if (facRes.data.success) setFacultyList(facRes.data.data);
    } catch (err) {
      error('Failed to load courses and subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDeptFilter, search]);

  // Course Modal Handlers
  const handleOpenCreateCourse = () => {
    setEditingItem(null);
    setCourseForm({
      courseName: '',
      courseCode: '',
      department: departments[0]?._id || '',
      duration: '3 Years (6 Semesters)',
      courseType: 'Undergraduate (UG)',
      status: 'Active',
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingItem(course);
    setCourseForm({
      courseName: course.courseName,
      courseCode: course.courseCode,
      department: course.department?._id || course.department || '',
      duration: course.duration,
      courseType: course.courseType,
      status: course.status,
    });
    setIsCourseModalOpen(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.courseName || !courseForm.courseCode || !courseForm.department) {
      warning('Please fill in Course Name, Code, and Department.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingItem) {
        await api.put(`/courses/${editingItem._id}`, courseForm);
        success('Course updated successfully!');
      } else {
        await api.post('/courses', courseForm);
        success('Course created successfully!');
      }
      setIsCourseModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Error saving course.');
    } finally {
      setFormLoading(false);
    }
  };

  // Subject Modal Handlers
  const handleOpenCreateSubject = () => {
    setEditingItem(null);
    setSubjectForm({
      subjectCode: '',
      subjectName: '',
      course: courses[0]?._id || '',
      department: departments[0]?._id || '',
      semester: 'Semester 1',
      credits: 4,
      faculty: '',
      status: 'Active',
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub) => {
    setEditingItem(sub);
    setSubjectForm({
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      course: sub.course?._id || sub.course || '',
      department: sub.department?._id || sub.department || '',
      semester: sub.semester,
      credits: sub.credits,
      faculty: sub.faculty?._id || sub.faculty || '',
      status: sub.status,
    });
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.subjectCode || !subjectForm.subjectName || !subjectForm.course || !subjectForm.department) {
      warning('Please fill in all required subject fields.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingItem) {
        await api.put(`/subjects/${editingItem._id}`, subjectForm);
        success('Subject updated successfully!');
      } else {
        await api.post('/subjects', subjectForm);
        success('Subject created successfully!');
      }
      setIsSubjectModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Error saving subject.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (type, item) => {
    setDeleteTarget({
      type,
      id: item._id,
      name: type === 'course' ? item.courseName : item.subjectName,
    });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      if (deleteTarget.type === 'course') {
        await api.delete(`/courses/${deleteTarget.id}`);
        success('Course deleted successfully.');
      } else {
        await api.delete(`/subjects/${deleteTarget.id}`);
        success('Subject deleted successfully.');
      }
      setIsDeleteOpen(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setFormLoading(false);
    }
  };

  // Course Columns
  const courseColumns = [
    {
      header: 'Course Code',
      key: 'courseCode',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
          {row.courseCode}
        </span>
      ),
    },
    {
      header: 'Program Name',
      key: 'courseName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.courseName}</p>
          <p className="text-[10px] text-slate-500">{row.duration}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department',
      render: (row) => (
        <span className="font-semibold text-slate-700">
          {row.department?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Type',
      key: 'courseType',
      render: (row) => (
        <Badge variant={row.courseType.includes('UG') ? 'primary' : 'purple'} size="sm">
          {row.courseType}
        </Badge>
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
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEditCourse(row)}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleOpenDelete('course', row)}
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

  // Subject Columns
  const subjectColumns = [
    {
      header: 'Subject Code',
      key: 'subjectCode',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
          {row.subjectCode}
        </span>
      ),
    },
    {
      header: 'Subject Name',
      key: 'subjectName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.subjectName}</p>
          <p className="text-[10px] text-slate-500">{row.course?.courseName}</p>
        </div>
      ),
    },
    {
      header: 'Semester & Credits',
      key: 'semester',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.semester}</span>
          <span className="ml-2 text-slate-500">({row.credits} Credits)</span>
        </div>
      ),
    },
    {
      header: 'Assigned Faculty',
      key: 'faculty',
      render: (row) => (
        <span className="font-medium text-slate-800">
          {row.faculty?.name ? (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {row.faculty.name}
            </span>
          ) : (
            <span className="text-slate-400 italic">Not Assigned</span>
          )}
        </span>
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
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEditSubject(row)}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleOpenDelete('subject', row)}
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
      title="Courses & Subjects"
      subtitle="Curriculum catalog, credit allocations, and faculty subject assignments"
    >
      {/* Tabs */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'courses'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            Degree Programs ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'subjects'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Curriculum Subjects ({subjects.length})
          </button>
        </div>

        {isAdmin && (
          <div>
            {activeTab === 'courses' ? (
              <button
                onClick={handleOpenCreateCourse}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Course Program
              </button>
            ) : (
              <button
                onClick={handleOpenCreateSubject}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Subject Unit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Component */}
      <div className="mb-4">
        <DataTable
          columns={activeTab === 'courses' ? courseColumns : subjectColumns}
          data={activeTab === 'courses' ? courses : subjects}
          loading={loading}
          onSearchChange={setSearch}
          searchPlaceholder={
            activeTab === 'courses'
              ? 'Search programs by code or name...'
              : 'Search subjects by code or title...'
          }
          filterComponent={
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          }
        />
      </div>

      {/* COURSE CREATE/EDIT MODAL */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingItem ? 'Edit Course Program' : 'Add Degree Program'}
        subtitle="Configure degree curriculum structure and duration"
      >
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
            <input
              type="text"
              required
              value={courseForm.courseName}
              onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
              placeholder="e.g. Bachelor of Science in Computer Science"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={courseForm.courseCode}
                onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                placeholder="e.g. BSC-CS"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={courseForm.department}
                onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program Type</label>
              <select
                value={courseForm.courseType}
                onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={courseForm.duration}
                onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                placeholder="e.g. 3 Years (6 Semesters)"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
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
              {editingItem ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SUBJECT CREATE/EDIT MODAL */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingItem ? 'Edit Subject Unit' : 'Add Subject Unit'}
        subtitle="Specify curriculum details, semester, and faculty allocation"
      >
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectForm.subjectCode}
                onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                placeholder="e.g. CS101"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Title *</label>
              <input
                type="text"
                required
                value={subjectForm.subjectName}
                onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                placeholder="e.g. Python Programming"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={subjectForm.department}
                onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree Program *</label>
              <select
                required
                value={subjectForm.course}
                onChange={(e) => setSubjectForm({ ...subjectForm, course: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="">Select Program</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseName} ({c.courseCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester *</label>
              <select
                value={subjectForm.semester}
                onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={10}
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assign Faculty Member
            </label>
            <select
              value={subjectForm.faculty}
              onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            >
              <option value="">-- No Faculty Assigned (Optional) --</option>
              {facultyList.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.employeeId} - {f.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {formLoading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {editingItem ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget.type === 'course' ? 'Course Program' : 'Subject Unit'}`}
        message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        loading={formLoading}
      />
    </DashboardLayout>
  );
}
