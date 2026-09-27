'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  AlertTriangle,
  Send,
  CheckCircle2,
  RefreshCw,
  BrainCircuit,
  Compass,
  GraduationCap,
} from 'lucide-react';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import Modal from './Modal';
import Badge from './Badge';

export default function AIAdvisorWidget({ studentId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const { success, error } = useNotification();

  useEffect(() => {
    if (!isOpen || !studentId) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ai-advisor/student/${studentId}`);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        error('Failed to generate AI performance intelligence.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [isOpen, studentId]);

  const handleDispatchAlert = async (type = 'Attendance') => {
    setDispatching(true);
    try {
      const res = await api.post('/ai-advisor/dispatch-alert', {
        studentId,
        alertType: type,
        recipientType: 'parent',
      });
      if (res.data && res.data.success) {
        success(res.data.message || 'Parent notification dispatched successfully!');
      }
    } catch (err) {
      error('Failed to dispatch alert.');
    } finally {
      setDispatching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Smart Academic & Career Advisor" maxWidth="max-w-3xl">
      {loading ? (
        <div className="py-16 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] animate-spin">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-300">
            Synthesizing academic scores, attendance trends, and talent profile...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6 text-slate-200">
          {/* Header Overview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#3B0B14] border-2 border-[#D4AF37]/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-[10px] font-black uppercase tracking-widest mb-2">
                  <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                  <span>KCAS AI Copilot Engine</span>
                </div>
                <h3 className="text-lg font-bold text-white">{data.studentName}</h3>
                <p className="text-xs text-[#E8E2D5]/80">
                  {data.registerNumber} &bull; {data.departmentName}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">Exam Readiness</span>
                  <p className="text-2xl font-black text-emerald-400">{data.examReadinessScore}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-sm shadow-lg shadow-emerald-900/40">
                  {data.examReadinessScore}%
                </div>
              </div>
            </div>
          </div>

          {/* AI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Career Pathway Fit</span>
              <p className="text-xs font-bold text-[#F3E5AB]">{data.primaryCareerTrack}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{data.careerFitScore}% Suitability Index</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Forecast</span>
              <p className="text-xs font-bold text-white">Projected: {data.projectedAttendance}%</p>
              <p className="text-[11px] text-slate-400">Semester End Threshold Analysis</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Academic Risk Level</span>
              <div className="mt-1">
                <Badge
                  variant={data.riskLevel === 'Low Risk' ? 'success' : data.riskLevel === 'Moderate' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {data.riskLevel}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Based on marks & attendance history</p>
            </div>
          </div>

          {/* AI Personalized Recommendations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Personalized Action Plan & Remedial Roadmap</span>
            </h4>
            <div className="space-y-2.5">
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3 hover:border-[#D4AF37]/40 transition"
                >
                  <div
                    className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      rec.type === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : rec.type === 'ACADEMIC'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {rec.type === 'CRITICAL' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : rec.type === 'ACADEMIC' ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <Award className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{rec.title}</h5>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Dispatcher Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Generated: {new Date(data.generatedAt).toLocaleDateString()} &bull; AI Confidence: 94.8%
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDispatchAlert('Attendance and Academic Progress')}
                disabled={dispatching}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0E1B2E] bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] hover:scale-102 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {dispatching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Dispatch Parent Alert SMS</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
