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
  Building2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hod: '',
    description: '',
    status: 'Active',
  });
  const [formLoading, setFormLoading] = useState(false);

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/departments', { params });
      if (res.data && res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({ name: '', code: '', hod: '', description: '', status: 'Active' });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      hod: dept.hod,
      description: dept.description || '',
      status: dept.status,
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (dept) => {
    setSelectedDept(dept);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (dept) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.hod) {
      warning('Please fill in all required fields (Name, Code, HOD).');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/departments', formData);
      if (res.data && res.data.success) {
        success('Department created successfully!');
        setIsCreateOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.hod) {
      warning('Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.put(`/departments/${selectedDept._id}`, formData);
      if (res.data && res.data.success) {
        success('Department updated successfully!');
        setIsEditOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update department.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDept) return;
    setFormLoading(true);
    try {
      const res = await api.delete(`/departments/${selectedDept._id}`);
      if (res.data && res.data.success) {
        success('Department deleted successfully.');
        setIsDeleteOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      header: 'Department Code',
      key: 'code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Department Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[10px] text-slate-400">ID: {row.departmentId}</p>
        </div>
      ),
    },
    {
      header: 'Head of Department (HOD)',
      key: 'hod',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-800">{row.hod}</span>,
    },
    {
      header: 'Strength',
      key: 'studentCount',
      render: (row) => (
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
            {row.studentCount || 0} Students
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            {row.facultyCount || 0} Faculty
          </span>
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
            onClick={() => handleOpenView(row)}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Eye className="h-4 w-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Department"
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleOpenDelete(row)}
                title="Delete Department"
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
      title="Department Management"
      subtitle="Create, configure and manage academic departments and leadership"
    >
      {/* Top Banner & Action */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Total {departments.length} academic departments registered in the institution.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        onSearchChange={setSearch}
        searchPlaceholder="Search department by name, code or HOD..."
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        }
      />

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Academic Department"
        subtitle="Configure department details and assign HOD"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. B.Sc Computer Science"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Head of Department (HOD) *
              </label>
              <input
                type="text"
                required
                value={formData.hod}
                onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                placeholder="e.g. Dr. K. Anitha"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of department scope, research focus, and curriculum..."
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
              <option value="Inactive">Inactive</option>
            </select>
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
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Department"
        subtitle={`Updating details for ${selectedDept?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 uppercase focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">HOD Name *</label>
              <input
                type="text"
                required
                value={formData.hod}
                onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <option value="Inactive">Inactive</option>
            </select>
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
              Update Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Department Information"
        subtitle={selectedDept?.name}
      >
        {selectedDept && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-semibold">Department Code</span>
                <p className="text-base font-bold text-blue-700">{selectedDept.code}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Department ID</span>
                <p className="text-sm font-semibold text-slate-800">{selectedDept.departmentId}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Head of Department</span>
                <p className="text-sm font-bold text-slate-900">{selectedDept.hod}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Status</span>
                <div className="mt-1">
                  <Badge variant={selectedDept.status === 'Active' ? 'success' : 'default'}>
                    {selectedDept.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-semibold">About / Description</span>
              <p className="mt-1 text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {selectedDept.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-slate-500 font-medium">Students</span>
                <p className="text-lg font-bold text-blue-700">{selectedDept.studentCount || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-slate-500 font-medium">Faculty</span>
                <p className="text-lg font-bold text-indigo-700">{selectedDept.facultyCount || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-slate-500 font-medium">Programs</span>
                <p className="text-lg font-bold text-emerald-700">{selectedDept.courseCount || 0}</p>
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

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete "${selectedDept?.name}" (${selectedDept?.code})? If active students or subjects exist under this department, deletion will be blocked.`}
        confirmText="Yes, Delete Department"
        loading={formLoading}
      />
    </DashboardLayout>
  );
}
