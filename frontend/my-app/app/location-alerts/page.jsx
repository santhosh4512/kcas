'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  MapPin,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  ExternalLink,
  User,
  Building2,
  Calendar,
  Compass,
  Check,
  XCircle,
  FileText,
  Navigation,
} from 'lucide-react';

export default function LocationAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, unread: 0, highSeverity: 0, resolved: 0 });
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/location-alerts', {
        params: {
          status: statusFilter,
          severity: severityFilter,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setAlerts(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching location alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlerts();
  };

  const openAlertModal = async (alert) => {
    setSelectedAlert(alert);
    setResolutionNotes(alert.resolutionNotes || '');
    setModalOpen(true);
    // Mark as read in background
    if (alert.status === 'Unread') {
      try {
        await api.get(`/location-alerts/${alert._id}`);
        fetchAlerts();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedAlert) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/location-alerts/${selectedAlert._id}/status`, {
        status: newStatus,
        resolutionNotes,
      });
      if (res.data.success) {
        setToastMsg(`Alert marked as ${newStatus}`);
        setModalOpen(false);
        fetchAlerts();
        setTimeout(() => setToastMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error updating alert status:', err);
      alert(err.response?.data?.message || 'Failed to update alert');
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'High':
        return 'bg-rose-900/40 text-rose-300 border-rose-500/40';
      case 'Medium':
        return 'bg-amber-900/40 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-900/40 text-blue-300 border-blue-500/40';
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Unread':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
      case 'Under Review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Dismissed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Toast Notification */}
        {toastMsg && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-bounce">
            <Check className="h-5 w-5" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <ShieldAlert className="h-4 w-4" />
                <span>Geofencing Intelligence & Verification</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                GPS Location Alerts & Notifications
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Real-time automated alerts generated when students attempt GPS-verified attendance outside the authorized Kamban College campus geofence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAlerts}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Compass className="h-4 w-4" />
                <span>Refresh Radar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stat Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#0E1B2E] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/60">Total Alerts</span>
              <MapPin className="h-4 w-4 text-[#C5A059]" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">{summary.total}</div>
            <p className="text-[10px] text-white/40 mt-1">Logged GPS attempts</p>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-[#0E1B2E] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400">Unread Alerts</span>
              <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-400">{summary.unread}</div>
            <p className="text-[10px] text-rose-300/60 mt-1">Requires review</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-[#0E1B2E] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">High Distance (&gt;10km)</span>
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-400">{summary.highSeverity}</div>
            <p className="text-[10px] text-amber-300/60 mt-1">Far from college campus</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-[#0E1B2E] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Resolved Alerts</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400">{summary.resolved}</div>
            <p className="text-[10px] text-emerald-300/60 mt-1">Reviewed by faculty</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0E1B2E] p-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, register number, or faculty..."
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-[#C5A059]" />
              <span className="text-[11px] font-bold text-white/70">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#F3E5AB] focus:outline-none"
              >
                <option value="All" className="bg-[#0E1B2E] text-white">All Statuses</option>
                <option value="Unread" className="bg-[#0E1B2E] text-white">Unread</option>
                <option value="Under Review" className="bg-[#0E1B2E] text-white">Under Review</option>
                <option value="Resolved" className="bg-[#0E1B2E] text-white">Resolved</option>
                <option value="Dismissed" className="bg-[#0E1B2E] text-white">Dismissed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5">
              <span className="text-[11px] font-bold text-white/70">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#F3E5AB] focus:outline-none"
              >
                <option value="All" className="bg-[#0E1B2E] text-white">All Severities</option>
                <option value="High" className="bg-[#0E1B2E] text-white">High</option>
                <option value="Medium" className="bg-[#0E1B2E] text-white">Medium</option>
                <option value="Low" className="bg-[#0E1B2E] text-white">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E1B2E] shadow-xl">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#C5A059]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
                <span>Loading location alerts...</span>
              </div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 opacity-60" />
              <h3 className="mt-3 text-sm font-bold text-white">No GPS Location Alerts Found</h3>
              <p className="mt-1 text-xs text-white/50">All students are checking in within campus geofence parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-[10px] font-black uppercase tracking-wider text-[#C5A059]">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Class / Dept</th>
                    <th className="py-3.5 px-4">Distance from College</th>
                    <th className="py-3.5 px-4">Assigned Faculty</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {alerts.map((alt) => (
                    <tr key={alt._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{alt.studentName}</div>
                        <div className="text-[11px] font-mono text-[#C5A059]">{alt.registerNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{alt.department?.code || 'CS'}</div>
                        <div className="text-[10px] text-white/50">{alt.year} • Sec {alt.section}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-rose-400">
                          <Navigation className="h-3.5 w-3.5" />
                          <span>{(alt.distanceFromCampusMeters / 1000).toFixed(2)} km</span>
                        </div>
                        <div className="text-[10px] text-white/40">Max: {alt.allowedRadiusMeters}m</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{alt.facultyName}</div>
                        <div className="text-[10px] text-[#C5A059]">Faculty Reviewer</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{alt.date}</div>
                        <div className="text-[10px] text-white/50">{alt.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(alt.severity)}`}>
                          {alt.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(alt.status)}`}>
                          {alt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openAlertModal(alt)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#F3E5AB] hover:bg-[#C5A059] hover:text-[#0E1B2E] transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspection Modal */}
        {modalOpen && selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 lg:p-8 shadow-2xl space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-classic text-lg font-black text-[#F3E5AB]">GPS Location Alert Inspection</h3>
                    <p className="text-xs text-white/60">Factual Geolocation Attempt Details & Faculty Review</p>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Notice Banner */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-200 space-y-1">
                <div className="font-bold flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Student attendance attempt detected outside permitted campus radius.</span>
                </div>
                <p className="text-[11px] text-rose-200/80">
                  Note: Attendance was not automatically recorded. This report provides raw GPS verification coordinates so faculty/admin can evaluate legitimate remote requests or make manual adjustments.
                </p>
              </div>

              {/* Student & Attempt Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-black/30 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Student Name:</span>
                  <strong className="text-white text-sm">{selectedAlert.studentName}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Register Number:</span>
                  <strong className="text-white font-mono">{selectedAlert.registerNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Department & Course:</span>
                  <span className="text-white">{selectedAlert.department?.name || 'Department'} • {selectedAlert.course?.courseName || 'Course'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Assigned Faculty / Mentor:</span>
                  <span className="text-white font-bold">{selectedAlert.facultyName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Distance from College:</span>
                  <strong className="text-rose-400 text-sm">{(selectedAlert.distanceFromCampusMeters / 1000).toFixed(2)} km</strong> (Allowed: {selectedAlert.allowedRadiusMeters}m)
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Attempt Timestamp:</span>
                  <span className="text-white">{selectedAlert.date} at {selectedAlert.time}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Student Device GPS:</span>
                  <span className="font-mono text-white/80">
                    {selectedAlert.userCoordinates?.latitude?.toFixed(5)}, {selectedAlert.userCoordinates?.longitude?.toFixed(5)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block">Kamban College GPS:</span>
                  <span className="font-mono text-white/80">12.19058, 79.08378</span>
                </div>
              </div>

              {/* Google Maps External Link */}
              <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-white/70">View student attempt location on live map:</span>
                <a
                  href={`https://www.google.com/maps?q=${selectedAlert.userCoordinates?.latitude},${selectedAlert.userCoordinates?.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#C5A059] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Google Maps</span>
                </a>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#C5A059]">Faculty / Reviewer Notes:</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter remarks or resolution details (e.g., 'Student on permitted sports meet with OD approval' or 'Reviewed and confirmed unauthorized attempt')..."
                  className="w-full h-20 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Under Review')}
                  disabled={actionLoading}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
                >
                  Mark Under Review
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Dismissed')}
                  disabled={actionLoading}
                  className="rounded-xl border border-gray-500/40 bg-gray-500/10 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-gray-500/20"
                >
                  Dismiss Alert
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Resolved')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-black text-white shadow-lg hover:brightness-110"
                >
                  <Check className="h-4 w-4" />
                  <span>Resolve Alert</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
