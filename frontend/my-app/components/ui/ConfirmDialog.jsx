'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Are you sure you want to proceed?',
  confirmText = 'Yes, Delete',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center py-2 text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 mb-4 shadow-lg shadow-rose-950">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-sm">{message}</p>

        <div className="mt-6 flex w-full items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
