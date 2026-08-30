'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ExcelUploadModal from '../../components/ui/ExcelUploadModal';
import Badge from '../../components/ui/Badge';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import api, { API_BASE_URL } from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  Users,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Briefcase,
  BookOpen,
  Award,
} from 'lucide-react';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFaculty, setTotalFaculty] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    qualification: '',
    designation: 'Assistant Professor',
    department: '',
    email: '',
    phone: '',
    experience: '2 Years',
    specialization: 'General',
    status: 'Active',
    profilePhoto: '',
  });

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      if (departmentFilter !== 'All') params.department = departmentFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const [facRes, deptRes] = await Promise.all([
        api.get('/faculty', { params }),
        api.get('/departments'),
      ]);

      if (facRes.data.success) {
        setFaculty(facRes.data.data);
        setTotalPages(facRes.data.totalPages || 1);
        setTotalFaculty(facRes.data.total || 0);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
    } catch (err) {
      error('Failed to fetch faculty list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [currentPage, departmentFilter, statusFilter, search]);

  const handleOpenCreate = () => {
    setFormData({
      employeeId: `EMP${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      qualification: '',
      designation: 'Assistant Professor',
      department: departments[0]?._id || '',
      email: '',
      phone: '',
      experience: '2 Years',
      specialization: 'General',
      status: 'Active',
      profilePhoto: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setSelectedFaculty(fac);
    setFormData({
      employeeId: fac.employeeId,
      name: fac.name,
      qualification: fac.qualification,
      designation: fac.designation,
      department: fac.department?._id || fac.department || '',
      email: fac.email,
      phone: fac.phone,
      experience: fac.experience || '1 Year',
      specialization: fac.specialization || 'General',
      status: fac.status || 'Active',
      profilePhoto: fac.profilePhoto || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (fac) => {
    setSelectedFaculty(fac);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (fac) => {
    setSelectedFaculty(fac);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await api.post('/faculty', formData);
      if (res.data && res.data.success) {
        success('Faculty member registered successfully.');
        setIsCreateOpen(false);
        fetchFaculty();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create faculty.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await api.put(`/faculty/${selectedFaculty._id}`, formData);
      if (res.data && res.data.success) {
        success('Faculty details updated successfully.');
        setIsEditOpen(false);
        fetchFaculty();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update faculty.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      const res = await api.delete(`/faculty/${selectedFaculty._id}`);
      if (res.data && res.data.success) {
        success('Faculty record deleted.');
        setIsDeleteOpen(false);
        fetchFaculty();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete faculty.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/faculty/export', {
        params: { department: departmentFilter, status: statusFilter },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'KCAS_Faculty_Directory.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Faculty directory exported to Excel.');
    } catch (err) {
      error('Failed to export faculty Excel file.');
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const backendOrigin = API_BASE_URL.replace(/\/api$/, '');
    return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const columns = [
    {
      header: 'Employee ID',
      key: 'employeeId',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
          {row.employeeId}
        </span>
      ),
    },
    {
      header: 'Faculty Member',
      key: 'name',
      sortable: true,
      render: (row) => {
        const photoUrl = getFullImageUrl(row.profilePhoto);
        const initials = row.name
          ? row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'FC';

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-[#701A28]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
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
              <p className="text-[10px] text-slate-500">{row.qualification}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Department & Designation',
      key: 'department',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.department?.name || 'Unassigned'}</p>
          <p className="text-[10px] text-blue-600 font-medium">{row.designation}</p>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      key: 'email',
      render: (row) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-slate-400" />
            <span className="text-[11px]">{row.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-slate-400" />
            <span className="text-[11px]">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Experience',
      key: 'experience',
      render: (row) => <span className="font-medium text-slate-700">{row.experience}</span>,
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
            onClick={() => handleOpenView(row)}
            title="View Faculty Profile"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="h-4 w-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Faculty"
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleOpenDelete(row)}
                title="Delete Faculty"
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
      title="Faculty Management"
      subtitle="Staff profiles, designations, qualifications, and curriculum allocations"
    >
      {/* Action Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Total {totalFaculty} faculty members registered across all departments.
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

          {isAdmin && (
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
                Add Faculty
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={faculty}
        loading={loading}
        totalItems={totalFaculty}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty by name, employee ID, email or specialization..."
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        }
      />

      {/* EXCEL UPLOAD MODAL */}
      <ExcelUploadModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        title="Upload Faculty via Excel (.xlsx)"
        templateUrl="/faculty/template"
        previewUrl="/faculty/preview-excel"
        importUrl="/faculty/import"
        onSuccess={fetchFaculty}
        entityName="Faculty Staff"
      />

      {/* CREATE FACULTY MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Faculty Member"
        subtitle="Create faculty profile with institutional credentials"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">Faculty Profile Photo</label>
            <ProfilePhotoUpload
              value={formData.profilePhoto}
              onChange={(url) => setFormData({ ...formData, profilePhoto: url })}
              name={formData.name || 'Faculty Member'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. K. Anitha"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Assistant Professor"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualification *</label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. M.Sc., M.Phil., Ph.D"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 5 Years"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="anitha@kcas.edu.in"
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
                placeholder="9840123456"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specialization & Research</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Machine Learning, Cloud Computing"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
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
              Save Faculty Member
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT FACULTY MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Faculty Member"
        subtitle={`Updating profile of ${selectedFaculty?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">Faculty Profile Photo</label>
            <ProfilePhotoUpload
              value={formData.profilePhoto}
              onChange={(url) => setFormData({ ...formData, profilePhoto: url })}
              name={formData.name || 'Faculty Member'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                disabled
                value={formData.employeeId}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-500 bg-slate-100 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Name *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
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
              Update Faculty
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW FACULTY MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Faculty Member Profile"
        subtitle={selectedFaculty?.name}
      >
        {selectedFaculty && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-sm flex items-center justify-center">
                {getFullImageUrl(selectedFaculty.profilePhoto) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFullImageUrl(selectedFaculty.profilePhoto)}
                    alt={selectedFaculty.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  selectedFaculty.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedFaculty.name}</h3>
                <p className="text-xs font-semibold text-indigo-700">{selectedFaculty.designation}</p>
                <p className="text-[11px] text-slate-500">{selectedFaculty.qualification}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-semibold">Employee ID</span>
                <p className="text-sm font-mono font-bold text-indigo-700">{selectedFaculty.employeeId}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Department</span>
                <p className="text-sm font-semibold text-slate-800">{selectedFaculty.department?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Email</span>
                <p className="text-xs font-semibold text-slate-800">{selectedFaculty.email}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Phone</span>
                <p className="text-xs font-semibold text-slate-800">{selectedFaculty.phone}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Experience</span>
                <p className="text-xs font-semibold text-slate-800">{selectedFaculty.experience}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Specialization</span>
                <p className="text-xs font-semibold text-slate-800">{selectedFaculty.specialization}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Faculty Record"
        message={`Are you sure you want to delete "${selectedFaculty?.name}" (${selectedFaculty?.employeeId})? This will also remove the corresponding login account.`}
        confirmText="Yes, Delete Faculty"
        loading={formLoading}
      />
    </DashboardLayout>
  );
}
