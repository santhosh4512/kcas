'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Eye,
  Calendar,
  Layers,
  Activity,
  FileText,
  XCircle,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: {
          page,
          limit: 25,
          module: moduleFilter !== 'All' ? moduleFilter : undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const modulesList = [
    'All',
    'GPS Location Alerts',
    'Attendance',
    'Students',
    'Faculty',
    'Marks & Results',
    'Settings',
    'Backup & Restore',
    'Authentication',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Security Compliance & Governance</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                System Audit Trail & Security Logs
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Immutable chronological log of all critical system actions including GPS alert reviews, attendance overrides, marks modifications, and administrative settings.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#C5A059] uppercase block">Total Audit Events</span>
              <span className="text-2xl font-black text-white">{total} Entries</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0E1B2E] p-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by description, action, or user name..."
              className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-[#C5A059]" />
              <span className="text-[11px] font-bold text-white/70">Module:</span>
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-bold text-[#F3E5AB] focus:outline-none"
              >
                {modulesList.map((m) => (
                  <option key={m} value={m} className="bg-[#0E1B2E] text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1B2E] shadow-2xl">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#C5A059]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
                <span>Loading system audit logs...</span>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-3 text-sm font-bold text-white">No Audit Records Found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-[10px] font-black uppercase tracking-wider text-[#C5A059]">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Performer</th>
                    <th className="py-3.5 px-4">Module</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-white/60 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{log.performerName || log.performedBy?.name || 'System'}</div>
                        <div className="text-[10px] uppercase font-bold text-[#C5A059]">{log.performerRole || 'admin'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A059]/15 text-[#F3E5AB] border border-[#C5A059]/30">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[11px] text-white">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-white/80 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[#F3E5AB] hover:bg-[#C5A059] hover:text-[#0E1B2E] transition-all"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 text-xs text-white/60">
              <div>Page {page} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-white/10 px-3 py-1.5 font-bold hover:bg-white/10 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-white/10 px-3 py-1.5 font-bold hover:bg-white/10 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 lg:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-classic text-base font-bold text-[#F3E5AB]">Audit Event Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-white/60 hover:text-white"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-white/90">
                <p><strong>Action:</strong> <span className="font-mono text-[#C5A059]">{selectedLog.action}</span></p>
                <p><strong>Module:</strong> {selectedLog.module}</p>
                <p><strong>Performer:</strong> {selectedLog.performerName} ({selectedLog.performerRole})</p>
                <p><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toISOString()}</p>
                <p><strong>Description:</strong> {selectedLog.description}</p>
                {selectedLog.ipAddress && <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>}
              </div>

              {selectedLog.details && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#C5A059]">Payload Details:</span>
                  <pre className="max-h-48 overflow-y-auto rounded-xl bg-black/60 p-3 text-[11px] font-mono text-emerald-300 border border-white/10">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
