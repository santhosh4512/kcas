'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  TrendingDown,
  Sparkles,
  MessageSquare,
  Clock,
} from 'lucide-react';

export default function EarlyWarningsPage() {
  const { user } = useAuth();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [mentorNote, setMentorNote] = useState('');
  const [newStatus, setNewStatus] = useState('Under Review');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const fetchWarnings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/warnings', { params });
      if (res.data.success) {
        setWarnings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching warning alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, [severityFilter, statusFilter]);

  const runAutomatedScan = async () => {
    setScanning(true);
    setActionMessage({ text: '', type: '' });
    try {
      const res = await api.post('/warnings/scan');
      if (res.data.success) {
        setActionMessage({
          text: `✅ ${res.data.message}`,
          type: 'success',
        });
        fetchWarnings();
      }
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.message || 'Failed to run warning scan',
        type: 'error',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateAction = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      const res = await api.patch(`/warnings/${selectedAlert._id}/action`, {
        status: newStatus,
        note: mentorNote,
      });
      if (res.data.success) {
        setActionMessage({ text: 'Mentor action logged successfully!', type: 'success' });
        setSelectedAlert(null);
        setMentorNote('');
        fetchWarnings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating warning');
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#6D1B29] to-[#162A45] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F3E5AB] mb-1">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>AI Predictive Student Protection Engine</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Early Warning & Academic Intervention System
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Automatically identifies students with attendance shortages (&lt;75%), declining grades, consecutive absences, or arrears, notifying faculty and mentors immediately.
              </p>
            </div>

            <button
              onClick={runAutomatedScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Analyzing Records...' : 'Run Automated System Scan'}</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionMessage.text && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage({ text: '', type: '' })} className="text-white/60 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-[#C5A059]/20 bg-[#0E1B2E]/90 p-4 backdrop-blur-md">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C5A059]/60" />
            <input
              type="text"
              placeholder="Search student, reg no, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWarnings()}
              className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45]/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="Critical">🔴 Critical Alert</option>
              <option value="High">🟡 High Risk</option>
              <option value="Moderate">🔵 Moderate</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Parent Contacted">Parent Contacted</option>
              <option value="Remedial Action">Remedial Action</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Warnings List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0E1B2E]">
            <div className="flex items-center gap-3 text-sm text-[#C5A059]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <span>Scanning student records...</span>
            </div>
          </div>
        ) : warnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/20 bg-[#0E1B2E]/60 p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
            <h3 className="font-classic text-lg font-bold text-white">All Students On Track</h3>
            <p className="mt-1 text-xs text-[#E8E2D5]/60 max-w-sm">
              No early warning indicators detected for the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {warnings.map((w) => (
              <div
                key={w._id}
                className="flex flex-col justify-between rounded-3xl border border-[#C5A059]/30 bg-gradient-to-br from-[#162A45]/90 via-[#0E1B2E] to-[#1A3252]/70 p-5 shadow-xl hover:border-[#C5A059] transition-all duration-300"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getSeverityBadge(
                          w.severity
                        )}`}
                      >
                        {w.severity}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-[#E8E2D5] border border-white/10">
                        {w.alertType}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded-lg border border-[#C5A059]/30">
                      Status: {w.status}
                    </span>
                  </div>

                  {/* Student Profile Info */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                    <div>
                      <h3 className="font-classic text-base font-bold text-white">
                        {w.student?.name || w.studentName}
                      </h3>
                      <p className="text-xs text-[#C5A059] font-mono">
                        {w.student?.registerNumber || w.registerNumber} • {w.student?.department?.name || 'Department'}
                      </p>
                    </div>
                    {w.attendancePercentage > 0 && (
                      <div className="text-right">
                        <span className="text-xs text-[#E8E2D5]/60 block">Attendance</span>
                        <span className="font-black text-rose-400 text-sm">{w.attendancePercentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Reason Details */}
                  <p className="text-xs text-rose-200/90 bg-rose-950/20 p-3 rounded-2xl border border-rose-800/30 leading-relaxed">
                    ⚠️ {w.reason}
                  </p>

                  {/* Mentor Notes History */}
                  {(w.mentorNotes || []).length > 0 && (
                    <div className="mt-3 space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5 text-[11px]">
                      <span className="text-[#C5A059] font-bold block">Mentor Interaction Log:</span>
                      {w.mentorNotes.slice(-2).map((note, idx) => (
                        <p key={idx} className="text-[#E8E2D5]/80">
                          • <span className="font-semibold text-white">{note.authorName}:</span> {note.note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] text-[#E8E2D5]/60 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Mentor: {w.mentor?.name || 'Dr. S. Kanimozhi'}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAlert(w);
                      setNewStatus(w.status);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-[#0E1B2E] px-3.5 py-1.5 text-xs font-black shadow-md hover:brightness-110 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Log Intervention</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mentor Intervention Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  <h3 className="font-classic text-lg font-bold text-[#F3E5AB]">
                    Mentor Intervention: {selectedAlert.student?.name}
                  </h3>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAction} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Intervention Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Parent Contacted">Parent Contacted</option>
                    <option value="Remedial Action">Remedial Action Assigned</option>
                    <option value="Resolved">Resolved (Attendance / Grades Improved)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Mentor Counseling Note / Remedial Plan *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Document student counseling, parent phone discussion, remedial class assignment, or improvement agreement..."
                    value={mentorNote}
                    onChange={(e) => setMentorNote(e.target.value)}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-2 text-xs font-black text-[#0E1B2E] shadow-md hover:brightness-110"
                  >
                    Save Intervention Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
