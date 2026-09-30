'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import {
  Download,
  Upload,
  Database,
  ShieldAlert,
  CheckCircle2,
  FileJson,
  AlertTriangle,
  RefreshCw,
  Lock,
} from 'lucide-react';

export default function BackupRestorePage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [parsedBackup, setParsedBackup] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Handle Export Backup JSON
  const handleExportBackup = async () => {
    setExportLoading(true);
    try {
      const res = await api.get('/backup/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kcas_complete_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting backup:', err);
      alert('Failed to export backup. Please ensure admin privileges.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle file select for restore
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        if (!json.data) {
          alert('Invalid backup JSON format. Missing data object.');
          setParsedBackup(null);
          return;
        }
        setParsedBackup(json);
      } catch (err) {
        alert('Invalid JSON file. Please upload a valid KCAS backup JSON file.');
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!parsedBackup || !confirmChecked) return;

    setRestoreLoading(true);
    try {
      const res = await api.post('/backup/restore', {
        backupPayload: parsedBackup,
      });
      if (res.data.success) {
        setRestoreResult(res.data);
      }
    } catch (err) {
      console.error('Error restoring backup:', err);
      alert(err.response?.data?.message || 'Restore failed.');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Database className="h-4 w-4" />
                <span>Disaster Recovery & Data Archival</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Database Backup & Data Restoration
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Securely generate full database snapshots and restore collections with complete validation and automatic audit trail logging.
              </p>
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="rounded-2xl border border-[#C5A059]/30 bg-[#0E1B2E] p-4 text-xs text-[#E8E2D5]/90 flex items-start gap-3">
          <Lock className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-bold block mb-0.5">Privacy & Security Guardrails</strong>
            <span>All exported backup JSON files exclude raw passwords and sensitive hash secrets. Restoring data updates existing records safely by unique keys (Register No, Employee ID, Subject Code).</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-classic text-base font-bold text-[#F3E5AB]">Generate Full Database Backup</h3>
                <p className="text-xs text-white/50">Export all collections into an offline JSON archive</p>
              </div>
            </div>

            <p className="text-xs text-white/70">
              Generates a verified snapshot including all Students, Faculty, Departments, Courses, Subjects, Attendance records, Marks, Talent scores, Location alerts, and Certificates.
            </p>

            <button
              onClick={handleExportBackup}
              disabled={exportLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {exportLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Compiling Database Snapshot...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Backup JSON File</span>
                </>
              )}
            </button>
          </div>

          {/* Restore Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-classic text-base font-bold text-[#F3E5AB]">Restore Database from Archive</h3>
                <p className="text-xs text-white/50">Upload and merge data from a valid KCAS JSON backup</p>
              </div>
            </div>

            <form onSubmit={handleRestoreSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#C5A059] block mb-1.5">Select Backup File (.json):</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full text-xs text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[#C5A059] file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#0E1B2E] hover:file:brightness-110 cursor-pointer"
                />
              </div>

              {parsedBackup && (
                <div className="rounded-2xl bg-black/40 p-4 border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-[#F3E5AB]">Backup Preview:</div>
                  <div className="text-[11px] text-white/70">
                    Exported: {parsedBackup.metadata?.exportedAt || 'Unknown'} by {parsedBackup.metadata?.exportedBy || 'Admin'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-emerald-300 font-mono pt-1">
                    <div>Students: {parsedBackup.data?.students?.length || 0}</div>
                    <div>Faculty: {parsedBackup.data?.faculty?.length || 0}</div>
                    <div>Attendance: {parsedBackup.data?.attendance?.length || 0}</div>
                    <div>Marks: {parsedBackup.data?.marks?.length || 0}</div>
                  </div>
                </div>
              )}

              {parsedBackup && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="confirmRestore"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#C5A059]"
                  />
                  <label htmlFor="confirmRestore" className="text-xs text-white/80 select-none">
                    I confirm and wish to restore/merge this dataset into the active database.
                  </label>
                </div>
              )}

              {parsedBackup && (
                <button
                  type="submit"
                  disabled={!confirmChecked || restoreLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-black text-white shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                >
                  {restoreLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Restoring Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Execute Database Restore</span>
                    </>
                  )}
                </button>
              )}
            </form>

            {restoreResult && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs text-emerald-200 space-y-1">
                <div className="font-bold">✅ Database Restore Completed Successfully!</div>
                <div className="font-mono text-[11px]">
                  Restored Counts: {JSON.stringify(restoreResult.restoredCounts)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
