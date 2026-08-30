'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import api, { API_BASE_URL } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useNotification } from '../../lib/NotificationContext';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Search,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Lock,
  Crown,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

const MASTER_ADMIN_EMAIL = 'santhoshsiva754@gmail.com';

export default function AdminManagementPage() {
  const { user } = useAuth();
  const { success, error, warning } = useNotification();
  const isAdmin = user && (user.role === 'admin' || user.role?.toLowerCase() === 'admin');

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form Loading States
  const [formLoading, setFormLoading] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    profilePhoto: '',
    designation: 'Department Administrator',
  });
  const [showCreatePass, setShowCreatePass] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    designation: '',
    status: 'Active',
    profilePhoto: '',
  });

  // Password Reset Form State
  const [passForm, setPassForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);

  // Fetch Admins List
  const fetchAdmins = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await api.get('/admins');
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load administrator accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [isAdmin]);

  // Open Handlers
  const handleOpenCreate = () => {
    setCreateForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      status: 'Active',
      profilePhoto: '',
      designation: 'Department Administrator',
    });
    setShowCreatePass(false);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      name: admin.name || '',
      phone: admin.phone || '',
      designation: admin.designation || 'Administrator',
      status: admin.status || 'Active',
      profilePhoto: admin.profilePhoto || admin.avatar || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenPassword = (admin) => {
    setSelectedAdmin(admin);
    setPassForm({ password: '', confirmPassword: '' });
    setShowPass(false);
    setIsPassOpen(true);
  };

  const handleOpenDelete = (admin) => {
    if (admin.email === MASTER_ADMIN_EMAIL) {
      warning('The Master Primary Administrator account cannot be deleted.');
      return;
    }
    if (admin._id === user?.id || admin._id === user?._id) {
      warning('You cannot delete your own active session account.');
      return;
    }
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  // Submit Handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      warning('Please fill in all required fields.');
      return;
    }

    if (createForm.password.length < 6) {
      warning('Password must be at least 6 characters in length.');
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      warning('Password and Confirm Password do not match.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/admins', createForm);
      if (res.data.success) {
        success('New Administrator account created successfully.');
        setIsCreateOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create administrator account.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name) {
      warning('Admin name cannot be empty.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.put(`/admins/${selectedAdmin._id}`, editForm);
      if (res.data.success) {
        success('Administrator profile updated successfully.');
        setIsEditOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update administrator profile.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.password || passForm.password.length < 6) {
      warning('Password must be at least 6 characters in length.');
      return;
    }

    if (passForm.password !== passForm.confirmPassword) {
      warning('Password confirmation does not match.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.put(`/admins/${selectedAdmin._id}/password`, passForm);
      if (res.data.success) {
        success(`Password updated for ${selectedAdmin.name}.`);
        setIsPassOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update admin password.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    if (admin.email === MASTER_ADMIN_EMAIL) {
      warning('The Master Primary Administrator account cannot be deactivated.');
      return;
    }
    if (admin._id === user?.id || admin._id === user?._id) {
      warning('You cannot deactivate your own active session account.');
      return;
    }

    try {
      const res = await api.patch(`/admins/${admin._id}/toggle-status`);
      if (res.data.success) {
        success(res.data.message);
        fetchAdmins();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to toggle administrator status.');
    }
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      const res = await api.delete(`/admins/${selectedAdmin._id}`);
      if (res.data.success) {
        success(`Admin account (${selectedAdmin.name}) removed.`);
        setIsDeleteOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete administrator.');
    } finally {
      setFormLoading(false);
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

  // Filtered Admins
  const filteredAdmins = admins.filter((adm) => {
    const matchesSearch =
      (adm.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (adm.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (adm.phone || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || adm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Strict Role Protection Banner if not Admin
  if (!isAdmin) {
    return (
      <DashboardLayout
        title="Access Denied"
        subtitle="Institutional Security Gateway"
      >
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-rose-200 bg-rose-50 text-center max-w-xl mx-auto my-12 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-white mb-4 shadow-md">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-rose-900 mb-2">
            Restricted Administrator Zone
          </h2>
          <p className="text-xs text-rose-700 leading-relaxed mb-6">
            You do not possess the required **ADMIN** privileges to view, create, or manage administrative accounts. This attempt has been logged for security compliance.
          </p>
          <a
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-[#701A28] text-white text-xs font-bold hover:bg-[#58111A] transition shadow-xs"
          >
            Return to Dashboard
          </a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Management & Security Center"
      subtitle="Exclusive institutional portal to provision, configure, and manage system Administrators"
    >
      {/* Top Metric Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Admins
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#701A28]/10 text-[#701A28]">
              <Crown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{admins.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Authorized system administrators</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Admins
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            {admins.filter((a) => a.status === 'Active').length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Live authenticated accounts</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Primary Super Admin
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C5A059]/20 text-[#701A28]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-900 truncate">
            {MASTER_ADMIN_EMAIL}
          </p>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Protected Root Authority</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Security Protocol
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-900">Bcrypt + JWT (SHA-256)</p>
          <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">Audit-logged operations</p>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admins by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-[#701A28] focus:outline-hidden shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdmins}
            title="Refresh Admin List"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#701A28] hover:bg-[#58111A] rounded-xl transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">
            Registered Administrators ({filteredAdmins.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Role strictly set to <span className="font-mono font-bold text-[#701A28]">ADMIN</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Official Email</th>
                <th className="px-5 py-3.5">Contact Phone</th>
                <th className="px-5 py-3.5">Designation</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Loading administrator records...
                  </td>
                </tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => {
                  const photoUrl = getFullImageUrl(admin.profilePhoto || admin.avatar);
                  const isMaster = admin.email === MASTER_ADMIN_EMAIL;
                  const isCurrent = admin._id === user?.id || admin._id === user?._id;
                  const initials = admin.name
                    ? admin.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'AD';

                  return (
                    <tr key={admin._id} className="hover:bg-slate-50/70 transition">
                      {/* Admin Photo & Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#FAF0E6] border border-[#C5A059]/40 text-[#701A28] font-bold text-xs flex items-center justify-center shadow-2xs">
                            {photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoUrl}
                                alt={admin.name}
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
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{admin.name}</p>
                              {isMaster && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                                  <Crown className="h-3 w-3" /> Master
                                </span>
                              )}
                              {isCurrent && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-[#701A28]">
                              Role: ADMIN
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{admin.email}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{admin.phone || 'Not specified'}</span>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-200">
                          {admin.designation || 'Administrator'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          disabled={isMaster || isCurrent}
                          title={isMaster ? 'Master admin status cannot be changed' : 'Click to toggle status'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                            admin.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          } disabled:opacity-75 disabled:cursor-not-allowed`}
                        >
                          {admin.status === 'Active' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            title="Edit Admin Information"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenPassword(admin)}
                            title="Change Admin Password"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          {!isMaster && !isCurrent && (
                            <button
                              onClick={() => handleOpenDelete(admin)}
                              title="Delete Admin Account"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No administrators found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: ADD ADMINISTRATOR
      ========================================================================= */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Administrator"
        subtitle="Create an institutional Admin account with full system governance"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Profile Photo Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block font-bold text-slate-700 mb-2">
              Admin Profile Photo (Optional)
            </label>
            <ProfilePhotoUpload
              value={createForm.profilePhoto}
              onChange={(url) => setCreateForm({ ...createForm, profilePhoto: url })}
              name={createForm.name || 'New Admin'}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Dr. R. Malathi"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="malathi@kcas.edu.in"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="9488029091"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={createForm.designation}
                onChange={(e) =>
                  setCreateForm({ ...createForm, designation: e.target.value })
                }
                placeholder="e.g. Vice Principal / Admin Officer"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showCreatePass ? 'text' : 'password'}
                  required
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 p-2.5 pr-9 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePass(!showCreatePass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCreatePass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <input
                type={showCreatePass ? 'text' : 'password'}
                required
                value={createForm.confirmPassword}
                onChange={(e) =>
                  setCreateForm({ ...createForm, confirmPassword: e.target.value })
                }
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Role</label>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-[#701A28] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                ADMIN (Fixed Governance Role)
              </div>
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#701A28] hover:bg-[#58111A] rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {formLoading && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Create Administrator
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: EDIT ADMINISTRATOR
      ========================================================================= */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Administrator Profile"
        subtitle={`Updating account details of ${selectedAdmin?.name}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {/* Profile Photo Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block font-bold text-slate-700 mb-2">
              Admin Profile Photo
            </label>
            <ProfilePhotoUpload
              value={editForm.profilePhoto}
              onChange={(url) => setEditForm({ ...editForm, profilePhoto: url })}
              name={editForm.name || 'Admin'}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={selectedAdmin?.email || ''}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-500 bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="9488029091"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={editForm.designation}
                onChange={(e) =>
                  setEditForm({ ...editForm, designation: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Status</label>
            <select
              value={editForm.status}
              disabled={selectedAdmin?.email === MASTER_ADMIN_EMAIL}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#701A28] hover:bg-[#58111A] rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {formLoading && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Update Administrator
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 3: CHANGE ADMIN PASSWORD
      ========================================================================= */}
      <Modal
        isOpen={isPassOpen}
        onClose={() => setIsPassOpen(false)}
        title="Change Administrator Password"
        subtitle={`Set new secure password for ${selectedAdmin?.name} (${selectedAdmin?.email})`}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Password *</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={passForm.password}
                onChange={(e) => setPassForm({ ...passForm, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 p-2.5 pr-9 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={passForm.confirmPassword}
              onChange={(e) =>
                setPassForm({ ...passForm, confirmPassword: e.target.value })
              }
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPassOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {formLoading && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Save New Password
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 4: DELETE ADMIN CONFIRMATION
      ========================================================================= */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Revoke & Delete Administrator Account"
        message={`Are you sure you want to permanently delete administrator account for ${selectedAdmin?.name} (${selectedAdmin?.email})? All institutional governance rights will be revoked.`}
        confirmText="Delete Admin Account"
        variant="danger"
        loading={formLoading}
      />
    </DashboardLayout>
  );
}
