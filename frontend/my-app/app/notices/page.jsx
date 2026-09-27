'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  BellRing,
  Pin,
  Search,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  Clock,
  Sparkles,
  Share2,
  CheckCircle,
} from 'lucide-react';

export default function NoticeBoardPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Circular',
    priority: 'Normal',
    targetAudience: 'All',
    isPinned: false,
    expiresAt: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'faculty');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/notices', { params });
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [categoryFilter, priorityFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.post('/notices', formData);
      if (res.data.success) {
        setMessage({ text: 'Notice published successfully!', type: 'success' });
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'Circular',
          priority: 'Normal',
          targetAudience: 'All',
          isPinned: false,
          expiresAt: '',
        });
        fetchNotices();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to publish notice.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting notice');
    }
  };

  const copyNoticeLink = (notice) => {
    navigator.clipboard.writeText(`${window.location.origin}/notices#${notice._id}`);
    setCopiedId(notice._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Normal':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Institutional Broadcast Channel</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Smart Notice Board & Digital Circulars
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Official circulars, examination alerts, placement drives, deadlines, and departmental announcements in real-time.
              </p>
            </div>

            {isStaffOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Publish New Circular</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-[#C5A059]/20 bg-[#0E1B2E]/90 p-4 backdrop-blur-md">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C5A059]/60" />
            <input
              type="text"
              placeholder="Search circulars, exams, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45]/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Circular">Circular</option>
              <option value="Exam">Exam Alert</option>
              <option value="Placement">Placement</option>
              <option value="Event">Event</option>
              <option value="Deadline">Deadline</option>
              <option value="Holiday">Holiday</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">🔴 Urgent</option>
              <option value="High">🟡 High</option>
              <option value="Normal">🔵 Normal</option>
            </select>
          </div>
        </div>

        {/* Notices Feed */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0E1B2E]">
            <div className="flex items-center gap-3 text-sm text-[#C5A059]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <span>Fetching latest digital circulars...</span>
            </div>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#C5A059]/20 bg-[#0E1B2E]/60 p-12 text-center">
            <BellRing className="h-12 w-12 text-[#C5A059]/40 mb-3" />
            <h3 className="font-classic text-lg font-bold text-white">No Circulars Found</h3>
            <p className="mt-1 text-xs text-[#E8E2D5]/60 max-w-sm">
              There are currently no active announcements matching your query filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((notice) => (
              <div
                key={notice._id}
                id={notice._id}
                className={`relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 hover:shadow-xl ${
                  notice.isPinned
                    ? 'border-[#C5A059] bg-gradient-to-br from-[#162A45] via-[#0E1B2E] to-[#1A3252]'
                    : 'border-white/10 bg-[#0E1B2E]/80 hover:border-[#C5A059]/40'
                }`}
              >
                {/* Notice Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityBadge(
                          notice.priority
                        )}`}
                      >
                        {notice.priority}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-[#E8E2D5] border border-white/10">
                        <Tag className="h-3 w-3 text-[#C5A059]" />
                        {notice.category}
                      </span>
                      {notice.targetAudience && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#6D1B29]/40 text-rose-300 border border-[#6D1B29]/60">
                          For: {notice.targetAudience}
                        </span>
                      )}
                    </div>

                    {notice.isPinned && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-lg border border-[#C5A059]/30">
                        <Pin className="h-3 w-3 fill-[#C5A059]" />
                        <span>PINNED</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-classic text-base font-bold text-[#F3E5AB] leading-snug">
                    {notice.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-[#E8E2D5]/80 whitespace-pre-line leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                {/* Notice Footer */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#E8E2D5]/60">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="font-bold text-[#C5A059] truncate max-w-[140px]">{notice.postedByName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyNoticeLink(notice)}
                      title="Share link"
                      className="p-1.5 rounded-lg text-[#E8E2D5]/60 hover:bg-white/10 hover:text-white transition"
                    >
                      {copiedId === notice._id ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {isStaffOrAdmin && (
                      <button
                        onClick={() => handleDeleteNotice(notice._id)}
                        title="Delete notice"
                        className="p-1.5 rounded-lg text-rose-400/70 hover:bg-rose-950/40 hover:text-rose-300 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Publish Notice */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="font-classic text-lg font-bold text-[#F3E5AB]">Publish Official Circular</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {message.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleCreateNotice} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Circular Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. End Semester Exam Timetable Announcement"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    >
                      <option value="Circular">Circular</option>
                      <option value="Exam">Exam Alert</option>
                      <option value="Placement">Placement Drive</option>
                      <option value="Event">Event</option>
                      <option value="Deadline">Deadline</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    >
                      <option value="Normal">🔵 Normal</option>
                      <option value="High">🟡 High</option>
                      <option value="Urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="All">All (Students, Faculty & Staff)</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Content / Announcement Details *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter full announcement details, requirements, instructions..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinNotice"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded accent-[#C5A059]"
                  />
                  <label htmlFor="pinNotice" className="text-xs font-bold text-white cursor-pointer flex items-center gap-1">
                    <Pin className="h-3 w-3 text-[#C5A059]" /> Pin this notice to the top of the feed
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-2 text-xs font-black text-[#0E1B2E] shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? 'Publishing...' : 'Publish Circular'}
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
