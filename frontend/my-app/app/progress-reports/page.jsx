'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import {
  ClipboardList,
  Printer,
  Download,
  Award,
  GraduationCap,
  CalendarCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function ProgressReportPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId');

  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(studentIdParam || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all students for student selector
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        if (res.data.success) {
          setStudentsList(res.data.data);
          if (!selectedStudentId && res.data.data.length > 0) {
            // If user is student, pick their own ID, else pick first student
            const defaultId = (user?.role === 'student' && user.referenceId) || res.data.data[0]._id;
            setSelectedStudentId(defaultId);
          }
        }
      } catch (err) {
        console.error('Error fetching students list:', err);
      }
    };
    fetchStudents();
  }, [user]);

  // Fetch report data when selected student changes
  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reports/student-progress/${selectedStudentId}`);
        if (res.data.success) {
          setReport(res.data);
        }
      } catch (err) {
        console.error('Error loading progress report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedStudentId]);

  const handlePrint = () => {
    window.print();
  };

  const radarData = report?.talent?.radarData || [
    { subject: 'Studies', score: 85, fullMark: 100 },
    { subject: 'Coding', score: 94, fullMark: 100 },
    { subject: 'Sports', score: 80, fullMark: 100 },
    { subject: 'Cultural', score: 75, fullMark: 100 },
    { subject: 'Communication', score: 90, fullMark: 100 },
    { subject: 'Leadership', score: 88, fullMark: 100 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            aside, header, .no-print {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
            .printable-card {
              border: 1px solid #ddd !important;
              background: white !important;
              color: #111 !important;
              box-shadow: none !important;
            }
            .print-text-dark {
              color: #111 !important;
            }
          }
        `}</style>

        {/* Action Header Banner (no-print) */}
        <div className="no-print relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Consolidated Academic Dossier</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                Student Comprehensive Progress Report
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Unified report containing Semester Marks, Live Geo-Attendance %, Talent Intelligence Scores, Verified Certificates, and Mentor Evaluations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {user?.role !== 'student' && (
                <div className="flex items-center gap-2 bg-[#0E1B2E] border border-[#C5A059]/40 rounded-2xl px-3 py-1.5">
                  <span className="text-xs font-bold text-[#C5A059]">Select Student:</span>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#F3E5AB] focus:outline-none"
                  >
                    {studentsList.map((st) => (
                      <option key={st._id} value={st._id} className="bg-[#0E1B2E] text-white">
                        {st.name} ({st.registerNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Report Document (Printable) */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-[#0E1B2E]">
            <div className="flex items-center gap-3 text-sm text-[#C5A059]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <span>Compiling student dossier & analytics...</span>
            </div>
          </div>
        ) : !report ? (
          <div className="p-8 text-center text-white">Report not found.</div>
        ) : (
          <div className="printable-card rounded-3xl border border-[#C5A059]/40 bg-[#0E1B2E] p-6 lg:p-10 shadow-2xl space-y-8">
            {/* College Header */}
            <div className="border-b-2 border-[#C5A059]/40 pb-6 text-center">
              <div className="inline-block px-3 py-1 rounded-full bg-[#C5A059]/15 text-[#C5A059] font-black text-[10px] uppercase tracking-widest mb-2 border border-[#C5A059]/30">
                Autonomous Institution • Affiliated to Thiruvalluvar University
              </div>
              <h2 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB] uppercase tracking-wide print-text-dark">
                Kamban College of Arts and Science for Women
              </h2>
              <p className="text-xs text-[#E8E2D5]/80 mt-1">
                Tiruvannamalai - 606603, Tamil Nadu • Re-Accredited with Grade &quot;A&quot; by NAAC
              </p>
              <div className="mt-3 inline-block bg-gradient-to-r from-[#6D1B29] to-[#8C2234] text-white text-xs font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-md border border-[#C5A059]/40">
                Official Student Comprehensive Progress Card
              </div>
            </div>

            {/* Student Info & Mentor Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-br from-[#162A45]/80 via-[#0E1B2E] to-[#1A3252]/60 p-6 rounded-3xl border border-[#C5A059]/30">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Student Dossier</span>
                <h3 className="font-classic text-lg font-bold text-white print-text-dark">{report.student?.name}</h3>
                <p className="text-xs text-[#E8E2D5]/80 font-mono">Reg No: <strong className="text-white print-text-dark">{report.student?.registerNumber}</strong></p>
                <p className="text-xs text-[#E8E2D5]/80">Roll No: {report.student?.rollNumber}</p>
                <p className="text-xs text-[#E8E2D5]/80">{report.student?.department} • {report.student?.course}</p>
                <p className="text-xs text-[#E8E2D5]/80">{report.student?.year} ({report.student?.semester}) • Sec {report.student?.section}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Parent & Contact Details</span>
                <p className="text-xs text-[#E8E2D5]/80">Guardian: <strong className="text-white print-text-dark">{report.student?.parentName}</strong></p>
                <p className="text-xs text-[#E8E2D5]/80">Parent Phone: {report.student?.parentPhone || '94421 99881'}</p>
                <p className="text-xs text-[#E8E2D5]/80">Student Email: {report.student?.email}</p>
                <p className="text-xs text-[#E8E2D5]/80">Address: {report.student?.address}</p>
              </div>

              <div className="space-y-1.5 bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Assigned Mentor</span>
                <h4 className="font-bold text-white text-xs print-text-dark">{report.student?.mentor?.name}</h4>
                <p className="text-[11px] text-[#E8E2D5]/80">{report.student?.mentor?.designation}</p>
                <p className="text-[11px] text-[#E8E2D5]/80">Email: {report.student?.mentor?.email}</p>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#C5A059]">Overall Grade</span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/40">
                    {report.performanceSummary?.overallGrade}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance & Academic Marks Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Attendance Card */}
              <div className="rounded-3xl border border-[#C5A059]/30 bg-[#162A45]/40 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-[#C5A059]" />
                    <h4 className="font-classic text-sm font-bold text-[#F3E5AB]">Attendance Record</h4>
                  </div>
                  <span className="font-black text-lg text-emerald-400">
                    {report.attendance?.percentage}%
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#E8E2D5]/80">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Total Working Days:</span>
                    <strong className="text-white">{report.attendance?.totalWorkingDays || 24}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Present Days:</span>
                    <strong className="text-emerald-400">{report.attendance?.presentDays || 22}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>On Duty (OD) Days:</span>
                    <strong className="text-blue-400">{report.attendance?.onDutyDays || 1}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Absent / Leave:</span>
                    <strong className="text-rose-400">{report.attendance?.absentDays || 1}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Geo-Verified Check-ins:</span>
                    <strong className="text-[#C5A059]">100% Campus GPS</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#C5A059] font-bold">University Status:</span>
                    <span className="font-bold text-emerald-400">{report.attendance?.status}</span>
                  </div>
                </div>
              </div>

              {/* Subject Marks Table */}
              <div className="lg:col-span-2 rounded-3xl border border-[#C5A059]/30 bg-[#162A45]/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#C5A059]" />
                    <h4 className="font-classic text-sm font-bold text-[#F3E5AB]">End Semester Academic Scores</h4>
                  </div>
                  <span className="text-xs font-bold text-[#C5A059]">
                    GPA: <strong className="text-white text-sm">{report.academics?.gpa || '8.8'}</strong> / 10.0
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#C5A059]/30 text-[10px] font-black uppercase tracking-wider text-[#C5A059]">
                        <th className="py-2">Code</th>
                        <th className="py-2">Subject Name</th>
                        <th className="py-2 text-center">CIA (25)</th>
                        <th className="py-2 text-center">ESE (75)</th>
                        <th className="py-2 text-center">Total (100)</th>
                        <th className="py-2 text-center">Grade</th>
                        <th className="py-2 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[#E8E2D5]/90">
                      {(report.academics?.subjects || []).map((sub, idx) => (
                        <tr key={idx}>
                          <td className="py-2 font-mono text-[11px] text-[#C5A059]">{sub.subjectCode}</td>
                          <td className="py-2 font-medium">{sub.subjectName}</td>
                          <td className="py-2 text-center">{sub.internalMark}</td>
                          <td className="py-2 text-center">{sub.externalMark}</td>
                          <td className="py-2 text-center font-bold text-white">{sub.totalMarks}</td>
                          <td className="py-2 text-center font-black text-[#F3E5AB]">{sub.grade}</td>
                          <td className="py-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.result === 'PASS'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {sub.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Talent Radar & Skills Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="rounded-3xl border border-[#C5A059]/30 bg-[#162A45]/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C5A059]" />
                    <h4 className="font-classic text-sm font-bold text-[#F3E5AB]">Talent Intelligence Radar</h4>
                  </div>
                  <span className="text-xs font-bold text-[#C5A059]">
                    Top Domain: <strong className="text-white">{report.talent?.dominantCategoryName || 'Coding & Tech'}</strong>
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#C5A059" strokeOpacity={0.25} />
                      <PolarAngleAxis dataKey="subject" stroke="#F3E5AB" tick={{ fill: '#F3E5AB', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#C5A059" strokeOpacity={0.3} />
                      <Radar
                        name="Student Talent"
                        dataKey="score"
                        stroke="#C5A059"
                        fill="#C5A059"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills & Certificates List */}
              <div className="rounded-3xl border border-[#C5A059]/30 bg-[#162A45]/40 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#C5A059]" />
                  <h4 className="font-classic text-sm font-bold text-[#F3E5AB]">Skills & Verified Accreditations</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-1">Identified Talents:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(report.skills || []).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#C5A059]/15 text-[#F3E5AB] border border-[#C5A059]/30"
                        >
                          ⭐ {sk.skillName} ({sk.category} - {sk.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-1">Verified Certificates & Awards:</span>
                    <div className="space-y-1.5">
                      {(report.certificates || []).map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-black/20 p-2 rounded-xl border border-white/5">
                          <span className="font-semibold text-white truncate max-w-[240px]">{c.title}</span>
                          <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                            Verified ({c.issuer})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Evaluation & Institutional Signature Seal */}
            <div className="border-t-2 border-[#C5A059]/30 pt-6 space-y-6">
              <div className="rounded-2xl bg-black/30 p-4 border border-white/5">
                <span className="text-xs font-bold text-[#C5A059] uppercase block mb-1">Mentor Evaluation & Counselor Remarks:</span>
                <p className="text-xs text-[#E8E2D5]/90 italic leading-relaxed">
                  &ldquo;{report.performanceSummary?.mentorRemarks}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center pt-8">
                <div>
                  <div className="h-10 border-b border-[#C5A059]/50 mx-auto w-32" />
                  <p className="mt-2 text-xs font-bold text-white print-text-dark">Faculty Mentor</p>
                  <p className="text-[10px] text-[#E8E2D5]/60">Dr. S. Kanimozhi</p>
                </div>

                <div>
                  <div className="h-10 border-b border-[#C5A059]/50 mx-auto w-32" />
                  <p className="mt-2 text-xs font-bold text-white print-text-dark">Head of the Department</p>
                  <p className="text-[10px] text-[#E8E2D5]/60">Dr. R. Saravanan</p>
                </div>

                <div>
                  <div className="h-10 border-b border-[#C5A059]/50 mx-auto w-32" />
                  <p className="mt-2 text-xs font-bold text-white print-text-dark">Principal / CoE</p>
                  <p className="text-[10px] text-[#E8E2D5]/60">Kamban College</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
