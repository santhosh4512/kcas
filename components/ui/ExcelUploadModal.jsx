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
} from 'lucide-react';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';

export default function ExcelUploadModal({
  isOpen,
  onClose,
  title = 'Upload Excel File',
  templateUrl,
  previewUrl,
  importUrl,
  onSuccess,
  entityName = 'Records',
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
        error('Please select an Excel file (.xlsx or .xls)');
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
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            1
          </div>
          <span className="text-xs font-semibold text-slate-700">Upload & Template</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            2
          </div>
          <span className="text-xs font-semibold text-slate-700">Validate & Preview</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            3
          </div>
          <span className="text-xs font-semibold text-slate-700">Completed</span>
        </div>
      </div>

      {/* STEP 1: Upload File & Template Download */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Standard Excel Template</h4>
                <p className="text-[11px] text-slate-500">
                  Download formatted .xlsx template with required columns & sample data.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition shadow-2xs whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100/70 text-blue-600 mb-3">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {file ? file.name : 'Click to browse or drag and drop Excel file'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls (Max 10MB)</p>
            {file && (
              <Badge variant="primary" className="mt-3">
                Selected: {(file.size / 1024).toFixed(1)} KB
              </Badge>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreviewAndValidate}
              disabled={!file || loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              Validate & Preview
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Preview Validation Results */}
      {step === 2 && validationData && (
        <div className="space-y-5">
          {/* Validation KPI Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Total Rows</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{validationData.totalRows}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
              <span className="text-[11px] font-medium text-emerald-700 uppercase">Valid Rows</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{validationData.validCount}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-center">
              <span className="text-[11px] font-medium text-rose-700 uppercase">Errors Found</span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">{validationData.errorCount}</p>
            </div>
          </div>

          {/* Errors Section if any */}
          {validationData.errorCount > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Validation Errors (These rows will be skipped):
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                {validationData.errorRecords.map((err, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white border border-rose-100 text-rose-800">
                    <span className="font-bold mr-1">Row {err.rowNumber}:</span>
                    {err.errors.join(' | ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Records Preview Table */}
          <div>
            <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Valid Records Ready for Import ({validationData.validCount}):
            </h5>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-[11px] uppercase font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Identifier / Code</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Details</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationData.validRecords.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-700">{r.rowNumber}</td>
                      <td className="p-2.5 font-semibold text-blue-600">
                        {r.data.registerNumber || r.data.employeeId || r.data.subjectCode}
                      </td>
                      <td className="p-2.5">{r.data.name || r.data.studentName || r.data.facultyName}</td>
                      <td className="p-2.5 text-slate-500">
                        {r.data.departmentCode || r.data.qualification || r.data.totalMark !== undefined ? `Mark: ${r.data.totalMark}` : ''}
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

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Back to Upload
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validationData.validCount === 0 || loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Confirm & Import {validationData.validCount} Valid Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Completed Summary */}
      {step === 3 && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Import Process Completed</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The valid records have been inserted into the database and are now live in the system.
          </p>
          <div className="pt-4">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
            >
              Done & View Records
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
