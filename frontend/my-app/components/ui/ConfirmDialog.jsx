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
      <div className="flex flex-col items-center text-center py-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

        <div className="mt-6 flex w-full items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition flex items-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
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
