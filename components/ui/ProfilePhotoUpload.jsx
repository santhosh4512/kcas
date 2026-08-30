'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Trash2, RefreshCw, User, Upload, CheckCircle2 } from 'lucide-react';
import api, { API_BASE_URL } from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';

export default function ProfilePhotoUpload({
  value = '',
  onChange,
  name = 'User',
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { success, error, warning } = useNotification();

  // Dimensions
  const sizeClasses = {
    sm: 'h-16 w-16 text-lg',
    md: 'h-24 w-24 text-2xl',
    lg: 'h-32 w-32 text-4xl',
  };

  // Get full image URL (handling relative /uploads path)
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const backendOrigin = API_BASE_URL.replace(/\/api$/, '');
    return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      error('Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      warning('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        onChange(res.data.url);
        success('Profile photo uploaded successfully');
      } else {
        // Fallback to local Base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result);
          success('Profile photo preview set');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Backend upload fallback to base64 reader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
        success('Photo attached');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    success('Profile photo removed');
  };

  const fullUrl = getFullImageUrl(value);
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'KC';

  return (
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar / Photo Container */}
        <div
          className={`relative shrink-0 rounded-full border-2 border-dashed border-slate-300 bg-slate-100 p-1 shadow-sm overflow-hidden flex items-center justify-center ${sizeClasses[size]} ${
            value ? 'border-solid border-[#701A28]' : ''
          }`}
        >
          {fullUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fullUrl}
              alt={name || 'Profile'}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                // If remote fails, fallback to empty
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold tracking-tight">
              {initials || <User className="h-8 w-8 text-slate-400" />}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        {!disabled && (
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition shadow-2xs disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5 text-[#701A28]" />
                {value ? 'Change Photo' : 'Upload Photo'}
              </button>

              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition shadow-2xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              JPG, JPEG, PNG, or WebP (Max 5MB).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
