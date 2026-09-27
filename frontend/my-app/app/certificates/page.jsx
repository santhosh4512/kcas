'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  FileCheck2,
  Plus,
  Search,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical',
    issuer: 'NPTEL / Coursera / Organization',
    issueDate: new Date().toISOString().split('T')[0],
    credentialId: '',
    credentialUrl: '',
    pointsAwarded: 15,
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'faculty');

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (user && user.role === 'student' && user.referenceId) {
        params.studentId = user.referenceId;
      }

      const res = await api.get('/certificates', { params });
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [categoryFilter, statusFilter]);

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        studentId: user?.referenceId,
      };
      const res = await api.post('/certificates', payload);
      if (res.data.success) {
        setActionMessage({ text: 'Certificate uploaded successfully! Submitted for mentor verification.', type: 'success' });
        setShowUploadModal(false);
        setFormData({
          title: '',
          category: 'Technical',
          issuer: 'NPTEL / Coursera / Organization',
          issueDate: new Date().toISOString().split('T')[0],
          credentialId: '',
          credentialUrl: '',
          pointsAwarded: 15,
        });
        fetchCertificates();
      }
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Error submitting certificate', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAction = async (certId, status, rejectionReason = '') => {
    try {
      const res = await api.patch(`/certificates/${certId}/verify`, {
        status,
        rejectionReason,
      });
      if (res.data.success) {
        setActionMessage({ text: `Certificate marked as ${status}!`, type: 'success' });
        setVerifyModal(null);
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error verifying certificate');
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!confirm('Are you sure you want to delete this certificate record?')) return;
    try {
      await api.delete(`/certificates/${certId}`);
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting certificate');
    }
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
                <span>Student Achievements & Accreditations</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Certificate Management & Verification Hub
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Store, categorize, and verify NPTEL courses, hackathon awards, sports medals, and skill certifications with tamper-proof records.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Certificate</span>
            </button>
          </div>
        </div>

        {/* Action Message Banner */}
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
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Online MOOC">Online MOOC (NPTEL / Coursera)</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Workshop">Workshop</option>
              <option value="Leadership">Leadership</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs font-bold text-[#F3E5AB] focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">All Verification Status</option>
              <option value="Verified">🟢 Verified</option>
              <option value="Pending">🟡 Pending Review</option>
              <option value="Rejected">🔴 Rejected</option>
            </select>
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0E1B2E]">
            <div className="flex items-center gap-3 text-sm text-[#C5A059]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <span>Fetching certificates repository...</span>
            </div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#C5A059]/20 bg-[#0E1B2E]/60 p-12 text-center">
            <FileCheck2 className="h-12 w-12 text-[#C5A059]/40 mb-3" />
            <h3 className="font-classic text-lg font-bold text-white">No Certificates Found</h3>
            <p className="mt-1 text-xs text-[#E8E2D5]/60 max-w-sm">
              No certificates have been uploaded matching the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="flex flex-col justify-between rounded-3xl border border-[#C5A059]/30 bg-gradient-to-br from-[#162A45]/80 via-[#0E1B2E] to-[#1A3252]/60 p-5 shadow-xl hover:border-[#C5A059] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C5A059]/20 text-[#F3E5AB] border border-[#C5A059]/40">
                      {cert.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        cert.verificationStatus === 'Verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : cert.verificationStatus === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {cert.verificationStatus === 'Verified' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : cert.verificationStatus === 'Pending' ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{cert.verificationStatus}</span>
                    </span>
                  </div>

                  <h3 className="font-classic text-base font-bold text-white leading-snug">
                    {cert.title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-[#E8E2D5]/80 bg-black/20 p-3 rounded-2xl border border-white/5">
                    <p className="flex items-center justify-between">
                      <span className="text-[#C5A059]">Student:</span>
                      <span className="font-bold text-white">{cert.student?.name || 'Student'} ({cert.student?.registerNumber || '22UCS101'})</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-[#C5A059]">Issuer:</span>
                      <span className="font-semibold text-white">{cert.issuer}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-[#C5A059]">Issue Date:</span>
                      <span>{cert.issueDate}</span>
                    </p>
                    {cert.credentialId && (
                      <p className="flex items-center justify-between">
                        <span className="text-[#C5A059]">Credential ID:</span>
                        <span className="font-mono text-[11px] text-white/80">{cert.credentialId}</span>
                      </p>
                    )}
                    <p className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-[#C5A059]">Talent Points:</span>
                      <span className="font-black text-amber-300">+{cert.pointsAwarded || 15} pts</span>
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold text-[#C5A059] hover:text-[#F3E5AB] transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Verify Link</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isStaffOrAdmin && cert.verificationStatus === 'Pending' && (
                      <button
                        onClick={() => handleVerifyAction(cert._id, 'Verified')}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-500/30 transition"
                      >
                        Approve
                      </button>
                    )}
                    {isStaffOrAdmin && (
                      <button
                        onClick={() => handleDeleteCert(cert._id)}
                        className="p-1.5 rounded-lg text-rose-400/70 hover:bg-rose-950/40 hover:text-rose-300 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="font-classic text-lg font-bold text-[#F3E5AB]">Submit Student Certificate</h3>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadCertificate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NPTEL Elite Certification in Data Structures"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Online MOOC">Online MOOC</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Internship">Internship</option>
                      <option value="Leadership">Leadership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Issuing Authority *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IIT Madras / Coursera"
                      value={formData.issuer}
                      onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C5A059] mb-1">Credential / Roll No</label>
                    <input
                      type="text"
                      placeholder="e.g. NPTEL25CS101"
                      value={formData.credentialId}
                      onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                      className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C5A059] mb-1">Credential Verification URL</label>
                  <input
                    type="url"
                    placeholder="https://nptel.ac.in/noc/Ecertificate/?q=..."
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    className="w-full rounded-xl border border-[#C5A059]/30 bg-[#162A45] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-2 text-xs font-black text-[#0E1B2E] shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Upload & Verify'}
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
