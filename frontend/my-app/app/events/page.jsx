'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  CalendarDays,
  Plus,
  Search,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Filter,
} from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop',
    description: '',
    eventDate: '',
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    venue: 'Main Auditorium / Lab 2',
    organizer: 'Department of Computer Science',
    maxParticipants: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'faculty');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, statusFilter]);

  const handleRegister = async (eventId) => {
    try {
      setActionMessage({ text: '', type: '' });
      const res = await api.post(`/events/${eventId}/register`, {
        studentId: user?.referenceId,
      });
      if (res.data.success) {
        setActionMessage({ text: res.data.message, type: 'success' });
        fetchEvents();
      }
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.message || 'Failed to register for event.',
        type: 'error',
      });
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      setActionMessage({ text: '', type: '' });
      const res = await api.post(`/events/${eventId}/cancel-registration`, {
        studentId: user?.referenceId,
      });
      if (res.data.success) {
        setActionMessage({ text: 'Registration cancelled.', type: 'success' });
        fetchEvents();
      }
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Error cancelling registration', type: 'error' });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/events', formData);
      if (res.data.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          type: 'Workshop',
          description: '',
          eventDate: '',
          startTime: '09:30 AM',
          endTime: '04:30 PM',
          venue: 'Main Auditorium / Lab 2',
          organizer: 'Department of Computer Science',
          maxParticipants: 100,
        });
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const isUserRegistered = (event) => {
    if (!user || !user.referenceId) return false;
    return (event.participants || []).some(
      (p) => String(p.student?._id || p.student) === String(user.referenceId) && p.status !== 'Cancelled'
    );
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
                <span>Department Extracurricular & Tech Arena</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Event Management & Symposium Hub
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Seminars, workshops, 24-hour hackathons, cultural festivals, sports tournaments, and 1-click registration.
              </p>
            </div>

            {isStaffOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule New Event</span>
              </button>
            )}
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
              placeholder="Search workshops, hackathons, sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
              className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45]/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Event Types</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Sports">Sports Meet</option>
              <option value="Cultural">Cultural Fest</option>
              <option value="Symposium">Symposium</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0E1B2E]">
            <div className="flex items-center gap-3 text-sm text-[#C5A059]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <span>Loading campus events...</span>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#C5A059]/20 bg-[#0E1B2E]/60 p-12 text-center">
            <Trophy className="h-12 w-12 text-[#C5A059]/40 mb-3" />
            <h3 className="font-classic text-lg font-bold text-white">No Events Found</h3>
            <p className="mt-1 text-xs text-[#E8E2D5]/60 max-w-sm">
              No events match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const registered = isUserRegistered(event);
              const activeParticipants = (event.participants || []).filter((p) => p.status !== 'Cancelled');
              const isFull = activeParticipants.length >= event.maxParticipants;

              return (
                <div
                  key={event._id}
                  className="flex flex-col justify-between rounded-3xl border border-[#C5A059]/30 bg-gradient-to-br from-[#162A45]/80 via-[#0E1B2E] to-[#1A3252]/60 p-5 shadow-xl hover:border-[#C5A059] transition-all duration-300 group"
                >
                  <div>
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C5A059]/20 text-[#F3E5AB] border border-[#C5A059]/40">
                        {event.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          event.status === 'Upcoming'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <h3 className="font-classic text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors leading-snug">
                      {event.title}
                    </h3>

                    <p className="mt-2 text-xs text-[#E8E2D5]/70 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata Specs */}
                    <div className="mt-4 space-y-2 text-xs text-[#E8E2D5]/80 bg-black/20 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span className="font-bold text-white">{event.eventDate}</span>
                        <span>•</span>
                        <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                        <span className="text-[#C5A059]">Organizer:</span>
                        <span className="font-semibold text-white truncate max-w-[160px]">{event.organizer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Participation Action Footer */}
                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#E8E2D5]/70">
                      <Users className="h-3.5 w-3.5 text-[#C5A059]" />
                      <span className="font-bold text-white">{activeParticipants.length}</span>
                      <span>/ {event.maxParticipants} slots</span>
                    </div>

                    {user?.role === 'student' ? (
                      registered ? (
                        <button
                          onClick={() => handleCancelRegistration(event._id)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 transition-all group/btn"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 group-hover/btn:hidden" />
                          <span className="group-hover/btn:hidden">Registered</span>
                          <span className="hidden group-hover/btn:inline">Cancel Slot</span>
                        </button>
                      ) : isFull ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                          Slots Full
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(event._id)}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-[#0E1B2E] px-4 py-1.5 text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all"
                        >
                          <span>1-Click Register</span>
                        </button>
                      )
                    ) : (
                      <span className="text-[11px] font-bold text-[#C5A059]">
                        {activeParticipants.length} Registrations
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="font-classic text-lg font-bold text-[#F3E5AB]">Schedule Campus Event</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KCAS Women AI Hackathon 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Sports">Sports Meet</option>
                      <option value="Cultural">Cultural Fest</option>
                      <option value="Symposium">Symposium</option>
                      <option value="Webinar">Webinar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    >
                    </input>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Auditorium"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Max Capacity</label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Event objectives, agenda, eligibility, prizes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
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
                    {submitting ? 'Creating...' : 'Create Event'}
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
