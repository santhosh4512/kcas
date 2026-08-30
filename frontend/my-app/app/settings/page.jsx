'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useNotification } from '../../lib/NotificationContext';
import {
  ShieldCheck,
  UserCircle,
  Database,
  Server,
  Building2,
  Lock,
  KeyRound,
  Users,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  Layers,
  Save,
  CheckSquare,
  Camera,
} from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'view_students', label: 'View Student Directory', desc: 'Browse student profiles and directory' },
  { id: 'edit_students', label: 'Edit Students', desc: 'Create and update student information' },
  { id: 'view_attendance', label: 'View Attendance', desc: 'Inspect daily class attendance sheets' },
  { id: 'manage_attendance', label: 'Manage Attendance', desc: 'Record and update attendance sessions' },
  { id: 'view_marks', label: 'View Marks & Results', desc: 'View university semester grades' },
  { id: 'manage_marks', label: 'Manage Marks', desc: 'Enter and update examination marks' },
  { id: 'view_talent', label: 'View Talent Intelligence', desc: 'Inspect 7-category radar profiles' },
  { id: 'manage_talent', label: 'Evaluate Talent', desc: 'Score capabilities and manage skills' },
  { id: 'view_reports', label: 'View Reports', desc: 'Generate institutional reports' },
  { id: 'export_reports', label: 'Export Reports', desc: 'Download Excel sheets & transcripts' },
];

export default function SettingsPage() {
  const { user, token, setSession } = useAuth();
  const { success, error, warning } = useNotification();
  const isAdmin = user?.role === 'admin';

  // Tabs: 'profile' | 'staff' | 'audit' | 'system'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'staff' : 'profile');

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: '',
    designation: '',
    phone: '',
    profilePhoto: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        designation: user.designation || '',
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || user.avatar || '',
      });
    }
  }, [user]);

  // Staff Management State (Admin)
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Create Staff Modal State
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [createStaffForm, setCreateStaffForm] = useState({
    name: '',
    employeeId: '',
    email: '',
    temporaryPassword: 'KCAS@' + new Date().getFullYear(),
    department: '',
    designation: 'Assistant Professor',
    permissions: [
      'view_students',
      'view_attendance',
      'manage_attendance',
      'view_marks',
      'manage_marks',
      'view_talent',
      'manage_talent',
      'view_reports',
    ],
    status: 'Active',
  });
  const [createStaffLoading, setCreateStaffLoading] = useState(false);

  // Edit Permissions Modal State
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);
  const [editStaffLoading, setEditStaffLoading] = useState(false);

  // Reset Password Modal State
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [resetTargetStaff, setResetTargetStaff] = useState(null);
  const [newTempPassword, setNewTempPassword] = useState('KCAS@' + new Date().getFullYear());
  const [resetLoading, setResetLoading] = useState(false);

  // Change Password Form State (Current User)
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);

  // Audit Logs State (Admin)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Fetch Staff & Departments for Admin
  const fetchStaffData = async () => {
    if (!isAdmin) return;
    setStaffLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        api.get('/staff'),
        api.get('/departments'),
      ]);
      if (staffRes.data.success) setStaffList(staffRes.data.data);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
        if (deptRes.data.data.length > 0 && !createStaffForm.department) {
          setCreateStaffForm((prev) => ({ ...prev, department: deptRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStaffLoading(false);
    }
  };

  // Fetch Audit Logs for Admin
  const fetchAuditLogs = async () => {
    if (!isAdmin) return;
    setAuditLoading(true);
    try {
      const res = await api.get('/audit-logs?limit=30');
      if (res.data.success) setAuditLogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'staff') fetchStaffData();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  // Handle Create Staff Submit
  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    if (!createStaffForm.name || !createStaffForm.email || !createStaffForm.employeeId) {
      warning('Please fill in all required fields.');
      return;
    }

    setCreateStaffLoading(true);
    try {
      const res = await api.post('/staff', createStaffForm);
      if (res.data.success) {
        success(res.data.message);
        setIsCreateStaffOpen(false);
        setCreateStaffForm({
          name: '',
          employeeId: '',
          email: '',
          temporaryPassword: 'KCAS@' + new Date().getFullYear(),
          department: departments[0]?._id || '',
          designation: 'Assistant Professor',
          permissions: [
            'view_students',
            'view_attendance',
            'manage_attendance',
            'view_marks',
            'manage_marks',
            'view_talent',
            'manage_talent',
            'view_reports',
          ],
          status: 'Active',
        });
        fetchStaffData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setCreateStaffLoading(false);
    }
  };

  // Handle Edit Permissions
  const handleOpenEditPermissions = (staffItem) => {
    setEditingStaff(staffItem);
    setEditPermissions(staffItem.permissions || []);
    setIsEditStaffOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!editingStaff) return;
    setEditStaffLoading(true);
    try {
      const res = await api.put(`/staff/${editingStaff._id}`, {
        permissions: editPermissions,
      });
      if (res.data.success) {
        success('Staff permissions updated successfully.');
        setIsEditStaffOpen(false);
        fetchStaffData();
      }
    } catch (err) {
      error('Failed to update staff permissions.');
    } finally {
      setEditStaffLoading(false);
    }
  };

  // Handle Toggle Staff Status
  const handleToggleStaffStatus = async (staffId) => {
    try {
      const res = await api.patch(`/staff/${staffId}/toggle-status`);
      if (res.data.success) {
        success(res.data.message);
        fetchStaffData();
      }
    } catch (err) {
      error('Failed to toggle staff status.');
    }
  };

  // Handle Reset Staff Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetTargetStaff) return;
    setResetLoading(true);
    try {
      const res = await api.post(`/staff/${resetTargetStaff._id}/reset-password`, {
        temporaryPassword: newTempPassword,
      });
      if (res.data.success) {
        success(res.data.message);
        setIsResetPassOpen(false);
      }
    } catch (err) {
      error('Failed to reset staff password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Change Password (Current User)
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) {
      warning('New password must be at least 6 characters.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      warning('New password confirmation does not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.post('/auth/change-password', passForm);
      if (res.data.success) {
        success('Your password has been changed successfully.');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Handle Save Profile & Photo Submit
  const handleSaveProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name) {
      warning('Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      if (res.data.success) {
        success('Profile information and photo updated successfully!');
        if (res.data.user && token) {
          setSession(token, res.data.user);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Settings & Staff Account Management"
      subtitle="Staff credential provisioning, permission control, security logs, and institutional configurations"
    >
      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'staff'
                ? 'bg-[#701A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Staff Account Management
          </button>
        )}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'profile'
              ? 'bg-[#701A28] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCircle className="h-4 w-4" />
          User Profile & Photo
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'audit'
                ? 'bg-[#701A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-4 w-4" />
            System Audit Trail
          </button>
        )}
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'system'
              ? 'bg-[#701A28] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="h-4 w-4" />
          Institutional Telemetry
        </button>
      </div>

      {/* =========================================================================
          TAB 1: STAFF ACCOUNT MANAGEMENT (ADMIN ONLY)
      ========================================================================= */}
      {isAdmin && activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#350812] text-white shadow-md">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-[#E2B86E]" />
                Staff & Faculty Account Provisioning
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Admin-exclusive credential generation. Staff accounts are issued with temporary passwords and must update on first login.
              </p>
            </div>

            <button
              onClick={() => setIsCreateStaffOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-950 bg-[#E2B86E] hover:bg-amber-300 rounded-xl transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Create Staff Account
            </button>
          </div>

          {/* Staff Directory Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Active Staff Accounts ({staffList.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Employee ID</th>
                    <th className="px-5 py-3">Staff Name</th>
                    <th className="px-5 py-3">Email & Department</th>
                    <th className="px-5 py-3">Assigned Permissions</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        Loading staff credentials...
                      </td>
                    </tr>
                  ) : staffList.length > 0 ? (
                    staffList.map((staff) => (
                      <tr key={staff._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3 font-mono font-bold text-teal-700">
                          {staff.employeeId || 'KCAS-FAC'}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-slate-900">{staff.name}</p>
                          <span className="text-[10px] text-slate-400">{staff.designation}</span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-700">{staff.email}</p>
                          <span className="text-[10px] font-semibold text-blue-600">
                            {staff.department?.name || 'Departmental'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-700">
                            {staff.permissions?.length || 0} Capabilities
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleToggleStaffStatus(staff._id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                              staff.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {staff.status === 'Active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditPermissions(staff)}
                              title="Edit Capabilities / Permissions"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-[11px] flex items-center gap-1"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Permissions
                            </button>
                            <button
                              onClick={() => {
                                setResetTargetStaff(staff);
                                setNewTempPassword('KCAS@' + new Date().getFullYear());
                                setIsResetPassOpen(true);
                              }}
                              title="Generate New Temporary Password"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition font-semibold text-[11px] flex items-center gap-1"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Reset Pass
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        No staff accounts created yet. Click &apos;Create Staff Account&apos; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: USER PROFILE & PHOTO MANAGEMENT
      ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile Photo & Details Editor */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-[#701A28]" />
                Profile Information & Photo
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your institutional account name, title, and profile picture.
              </p>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="space-y-5">
              {/* Profile Photo Upload */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-3">
                  Account Profile Photo
                </label>
                <ProfilePhotoUpload
                  value={profileForm.profilePhoto}
                  onChange={(url) => setProfileForm({ ...profileForm, profilePhoto: url })}
                  name={profileForm.name || user?.name || 'User'}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-500 bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation / Role Title</label>
                  <input
                    type="text"
                    value={profileForm.designation}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, designation: e.target.value })
                    }
                    placeholder="e.g. System Administrator"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="9488029091"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#701A28] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#701A28] hover:bg-[#58111A] rounded-xl transition shadow-xs disabled:opacity-60"
                >
                  {profileLoading ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile & Photo
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Account Metadata & Change Password */}
          <div className="lg:col-span-5 space-y-6">
            {/* Account Role Metadata Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Account Credentials
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase">Institutional Role</span>
                  <Badge variant="primary" size="sm" className="capitalize">
                    <ShieldCheck className="h-3 w-3 mr-1 inline" />
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase">Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </span>
                </div>
                {user?.employeeId && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-semibold uppercase">Employee ID</span>
                    <span className="font-mono font-bold text-teal-700">{user.employeeId}</span>
                  </div>
                )}
              </div>
            </div>

          {/* Change Password Form Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Update your private password to keep your account secure.
            </p>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passForm.currentPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, currentPassword: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passForm.confirmPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-60"
                >
                  {passLoading && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* =========================================================================
          TAB 3: SYSTEM AUDIT TRAIL (ADMIN ONLY)
      ========================================================================= */}
      {isAdmin && activeTab === 'audit' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Institutional Activity Audit Trail</h4>
              <p className="text-[11px] text-slate-500">Live immutable logs of administrative operations</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{auditLogs.length} Events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                      Loading audit events...
                    </td>
                  </tr>
                ) : auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-bold text-blue-700">{log.action}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[10px] text-slate-700">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {log.user?.name || log.performerName || 'System'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-md truncate">
                        {log.description || log.details?.message || JSON.stringify(log.details || '')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: INSTITUTIONAL TELEMETRY
      ========================================================================= */}
      {activeTab === 'system' && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Institutional Accreditations</h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="text-base font-black text-slate-900">
                KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN
              </p>
              <p className="font-semibold text-blue-800">
                Recognized u/s 2(f) & 12(B) of UGC Act 1956 • Accredited by NAAC • Permanently Affiliated to Thiruvalluvar University • An ISO 9001:2015 Certified Institution
              </p>
              <p className="text-[11px] text-slate-500">
                Thenmathur, Tiruvannamalai – 606 603, Tamil Nadu, India • Phone: 04175 – 255401 • Cell: 9488029091 • Email: kcastvmalai@gmail.com
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
              <Database className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Database</span>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">MongoDB & Mongoose</p>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-center">
              <Server className="h-6 w-6 text-teal-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Backend API</span>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">Node.js / Express REST</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <ShieldCheck className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-500 uppercase">Frontend SaaS</span>
              <p className="font-bold text-slate-900 mt-0.5 text-sm">Next.js & Tailwind CSS</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE STAFF ACCOUNT (ADMIN)
      ========================================================================= */}
      <Modal
        isOpen={isCreateStaffOpen}
        onClose={() => setIsCreateStaffOpen(false)}
        title="Create Faculty / Staff Login Account"
        subtitle="Generate credentials with temporary password and granular access rights"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateStaffSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Staff Full Name *</label>
              <input
                type="text"
                required
                value={createStaffForm.name}
                onChange={(e) =>
                  setCreateStaffForm({ ...createStaffForm, name: e.target.value })
                }
                placeholder="e.g. Dr. Priya Kumar"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={createStaffForm.employeeId}
                onChange={(e) =>
                  setCreateStaffForm({
                    ...createStaffForm,
                    employeeId: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. KCAS-FAC-008"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={createStaffForm.email}
                onChange={(e) =>
                  setCreateStaffForm({ ...createStaffForm, email: e.target.value })
                }
                placeholder="priya@kcas.edu.in"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Temporary Password *
              </label>
              <input
                type="text"
                required
                value={createStaffForm.temporaryPassword}
                onChange={(e) =>
                  setCreateStaffForm({
                    ...createStaffForm,
                    temporaryPassword: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-teal-800 bg-teal-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={createStaffForm.department}
                onChange={(e) =>
                  setCreateStaffForm({ ...createStaffForm, department: e.target.value })
                }
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
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <select
                value={createStaffForm.designation}
                onChange={(e) =>
                  setCreateStaffForm({ ...createStaffForm, designation: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Head of Department">Head of Department (HOD)</option>
              </select>
            </div>
          </div>

          {/* Granular Permissions Checkboxes */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Granular System Capabilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const checked = createStaffForm.permissions.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className="flex items-start gap-2 p-2 rounded-xl hover:bg-white transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCreateStaffForm({
                            ...createStaffForm,
                            permissions: [...createStaffForm.permissions, perm.id],
                          });
                        } else {
                          setCreateStaffForm({
                            ...createStaffForm,
                            permissions: createStaffForm.permissions.filter(
                              (p) => p !== perm.id
                            ),
                          });
                        }
                      }}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">{perm.label}</p>
                      <p className="text-[10px] text-slate-400">{perm.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateStaffOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStaffLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {createStaffLoading && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Create Account & Generate Credentials
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL: EDIT STAFF PERMISSIONS
      ========================================================================= */}
      <Modal
        isOpen={isEditStaffOpen}
        onClose={() => setIsEditStaffOpen(false)}
        title="Update Staff Capabilities & Permissions"
        subtitle={editingStaff ? `${editingStaff.name} (${editingStaff.email})` : ''}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const checked = editPermissions.includes(perm.id);
              return (
                <label
                  key={perm.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditPermissions([...editPermissions, perm.id]);
                      } else {
                        setEditPermissions(editPermissions.filter((p) => p !== perm.id));
                      }
                    }}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <div>
                    <p className="font-bold text-slate-800">{perm.label}</p>
                    <p className="text-[11px] text-slate-400">{perm.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsEditStaffOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePermissions}
              disabled={editStaffLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: RESET STAFF TEMPORARY PASSWORD
      ========================================================================= */}
      <Modal
        isOpen={isResetPassOpen}
        onClose={() => setIsResetPassOpen(false)}
        title="Reset Staff Temporary Password"
        subtitle={resetTargetStaff ? `Target: ${resetTargetStaff.name}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Enter a new temporary password for this faculty member. They will be mandated to change it upon their next login.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Temporary Password *</label>
            <input
              type="text"
              required
              value={newTempPassword}
              onChange={(e) => setNewTempPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-teal-800 bg-teal-50 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResetPassOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs"
            >
              Confirm Password Reset
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
