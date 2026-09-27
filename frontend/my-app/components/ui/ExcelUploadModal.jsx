'use client';

import React, { useState, useRef } from 'react';
import Modal from './Modal';
import Badge from './Badge';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';

export default function ExcelUploadModal({
  isOpen,
  onClose,
  title = 'Upload Excel / CSV Student File',
  templateUrl = '/students/template',
  previewUrl = '/students/preview-excel',
  importUrl = '/students/import',
  onSuccess,
  entityName = 'Students',
}) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Select & Template, 2: Preview & Validation, 3: Completed
  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const fileInputRef = useRef(null);
  const { success, error, warning } = useNotification();

  const handleReset = () => {
    setFile(null);
    setStep(1);
    setValidationData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (
        !selected.name.endsWith('.xlsx') &&
        !selected.name.endsWith('.xls') &&
        !selected.name.endsWith('.csv')
      ) {
        error('Please select an Excel or CSV file (.xlsx, .xls, .csv)');
        return;
      }
      setFile(selected);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(templateUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KCAS_${entityName}_Template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Template downloaded successfully');
    } catch (err) {
      error('Failed to download Excel template');
    }
  };

  const handlePreviewAndValidate = async () => {
    if (!file) {
      warning('Please choose an Excel file to upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(previewUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        setValidationData(res.data.data);
        setStep(2);
        if (res.data.data.errorCount > 0) {
          warning(
            `Validated: ${res.data.data.validCount} valid rows, ${res.data.data.errorCount} rows with errors.`
          );
        } else {
          success(`All ${res.data.data.validCount} rows validated successfully! Ready to import.`);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to parse and validate Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationData || validationData.validRecords.length === 0) {
      warning('There are no valid records to import.');
      return;
    }

    setLoading(true);
    try {
      const recordsToImport = validationData.validRecords.map((r) => r.data);
      const res = await api.post(importUrl, { records: recordsToImport });

      if (res.data && res.data.success) {
        success(res.data.message || `Successfully imported ${recordsToImport.length} ${entityName}!`);
        setStep(3);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="max-w-4xl">
      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4 text-white">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step >= 1 ? 'bg-[#D4AF37] text-[#090D16]' : 'bg-slate-800 text-slate-400'
            }`}
          >
            1
          </div>
          <span className="text-xs font-semibold text-slate-300">Upload & Template</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step >= 2 ? 'bg-[#D4AF37] text-[#090D16]' : 'bg-slate-800 text-slate-400'
            }`}
          >
            2
          </div>
          <span className="text-xs font-semibold text-slate-300">Validate & Preview</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step === 3 ? 'bg-emerald-500 text-[#090D16]' : 'bg-slate-800 text-slate-400'
            }`}
          >
            3
          </div>
          <span className="text-xs font-semibold text-slate-300">Completed</span>
        </div>
      </div>

      {/* STEP 1: Upload File & Template Download */}
      {step === 1 && (
        <div className="space-y-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-[#D4AF37]/30 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-[#090D16] shadow-sm font-bold">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Standard College Student Template</h4>
                <p className="text-[11px] text-slate-400">
                  Pre-formatted .xlsx with Register No, Name, Dept, Mentor, Att %, Marks %, and Skills.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#D4AF37] bg-slate-800 border border-[#D4AF37]/40 rounded-xl hover:bg-slate-700 transition shadow-xs whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4AF37]/40 rounded-3xl p-8 text-center cursor-pointer hover:border-[#D4AF37] hover:bg-slate-800/40 transition bg-slate-900/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 mb-3 shadow-md">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-white">
              {file ? file.name : 'Click to browse or drag & drop College Student Excel sheet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Auto-maps all headers (.xlsx, .xls, .csv)</p>
            {file && (
              <Badge variant="gold" className="mt-3">
                Selected: {(file.size / 1024).toFixed(1)} KB
              </Badge>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreviewAndValidate}
              disabled={!file || loading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#090D16] bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              Validate & Preview Data
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Preview Validation Results */}
      {step === 2 && validationData && (
        <div className="space-y-5 text-white">
          {/* Validation KPI Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-700 bg-slate-900 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Rows</span>
              <p className="text-2xl font-black text-white mt-0.5">{validationData.totalRows}</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Valid Rows</span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{validationData.validCount}</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-950/40 text-center">
              <span className="text-[11px] font-bold text-rose-400 uppercase">Errors / Duplicates</span>
              <p className="text-2xl font-black text-rose-400 mt-0.5">{validationData.errorCount}</p>
            </div>
          </div>

          {/* Errors Section if any */}
          {validationData.errorCount > 0 && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4">
              <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Validation Warnings & Errors (Skipped):
              </h5>
              <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
                {validationData.errorRecords.map((err, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-900/80 border border-rose-800 text-rose-300">
                    <span className="font-bold mr-1 text-white">Row {err.rowNumber}:</span>
                    {err.errors.join(' | ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Records Preview Table */}
          <div>
            <h5 className="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Valid Records Ready for Automatic Ingestion ({validationData.validCount}):
              </span>
              <span className="text-[11px] text-[#D4AF37] font-semibold">
                Auto-links Attendance, Marks, Mentors, & Talent Profile
              </span>
            </h5>
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-700 text-xs bg-slate-950">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-300 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Reg Number</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Dept & Year</th>
                    <th className="p-2.5">Mentor</th>
                    <th className="p-2.5">Att %</th>
                    <th className="p-2.5">Mark %</th>
                    <th className="p-2.5">Skills / Talent</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {validationData.validRecords.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-2.5 font-bold text-slate-400">{r.rowNumber}</td>
                      <td className="p-2.5 font-bold text-[#F3E5AB]">
                        {r.data.registerNumber}
                      </td>
                      <td className="p-2.5 font-semibold text-white">{r.data.name}</td>
                      <td className="p-2.5 text-slate-400">
                        {r.data.departmentCode || r.data.departmentName || 'CS'} &bull; {r.data.year || 'I Year'}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {r.data.mentorName || 'Dr. S. Kanimozhi'}
                      </td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[11px] border border-emerald-800">
                          {r.data.initialAttendance !== undefined ? `${r.data.initialAttendance}%` : '85%'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-cyan-300 font-bold text-[11px] border border-blue-800">
                          {r.data.initialMarks !== undefined ? `${r.data.initialMarks}%` : '75%'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400 max-w-[140px] truncate" title={Array.isArray(r.data.skills) ? r.data.skills.join(', ') : ''}>
                        {Array.isArray(r.data.skills) && r.data.skills.length > 0
                          ? r.data.skills.slice(0, 2).join(', ')
                          : 'General Aptitude'}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="success" size="sm">
                          Valid
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Back to Upload
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validationData.validCount === 0 || loading}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#090D16] bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl shadow-lg transition font-classic"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Confirm & Ingest {validationData.validCount} Student Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Completed Summary */}
      {step === 3 && (
        <div className="text-center py-6 space-y-4 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 mx-auto shadow-xl shadow-emerald-950">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h4 className="text-xl font-bold text-white">Import Successfully Completed</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            The student records have been inserted into the database and are now live across Admin Dashboard, Mentors, GPS Attendance, and Progress Reports.
          </p>
          <div className="pt-4">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-xs font-bold text-[#090D16] bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] hover:scale-105 rounded-xl shadow-lg transition"
            >
              Done & View Live Records
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
