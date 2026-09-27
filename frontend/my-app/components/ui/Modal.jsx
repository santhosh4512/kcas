'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full ${maxWidth} overflow-hidden rounded-3xl border-2 border-[#D4AF37]/40 bg-[#0F172A] text-white backdrop-blur-2xl shadow-2xl shadow-[#D4AF37]/10 transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D4AF37]/20 px-6 py-5 bg-slate-900/95">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h3>
            {subtitle && <p className="mt-0.5 text-xs font-medium text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[78vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
