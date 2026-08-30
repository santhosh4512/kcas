'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ChartCard from '../../components/ui/ChartCard';
import api from '../../lib/api';
import { useNotification } from '../../lib/NotificationContext';
import { useAuth } from '../../lib/AuthContext';
import {
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  Dumbbell,
  Palette,
  Code2,
  MessageSquare,
  Crown,
  Layers,
  Plus,
  Trash2,
  Sliders,
  Eye,
  CheckCircle2,
  Star,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function TalentIntelligencePage() {
  const [talents, setTalents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Quick Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [quickFilter, setQuickFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals
  const [selectedStudentTalent, setSelectedStudentTalent] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

  // Evaluation Form State
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [scoresForm, setScoresForm] = useState({
    studies: 80,
    sports: 70,
    arts: 65,
    technical: 75,
    communication: 70,
    leadership: 65,
    other: 60,
  });
  const [evaluatorNotes, setEvaluatorNotes] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);

  // Specific Skill Form State
  const [skillForm, setSkillForm] = useState({
    skillName: '',
    category: 'Technical Skills',
    skillLevel: 'Intermediate',
    percentage: 80,
    experience: '1 Year',
    achievement: '',
    certificate: '',
    passion: '',
  });

  const { success, error, warning } = useNotification();
  const { hasRole } = useAuth();
  const canEvaluate = hasRole('admin', 'faculty');

  const fetchTalents = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      if (deptFilter !== 'All') params.department = deptFilter;
      if (quickFilter !== 'All') params.quickFilter = quickFilter;
      if (search) params.search = search;

      const [talentRes, deptRes] = await Promise.all([
        api.get('/talent', { params }),
        api.get('/departments'),
      ]);

      if (talentRes.data.success) {
        setTalents(talentRes.data.data);
        setTotalPages(talentRes.data.totalPages || 1);
        setTotalRecords(talentRes.data.total || 0);
      }
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      error('Failed to load talent intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, [currentPage, deptFilter, quickFilter, search]);

  const handleOpenProfile = async (talentItem) => {
    try {
      const res = await api.get(`/talent/student/${talentItem.student?._id || talentItem.student}`);
      if (res.data.success) {
        setSelectedStudentTalent(res.data.data);
        setIsProfileOpen(true);
      }
    } catch (err) {
      error('Failed to load student talent profile.');
    }
  };

  const handleOpenEvaluate = (talentItem) => {
    setEvaluatingStudent(talentItem);
    if (talentItem.categoryScores) {
      setScoresForm({
        studies: talentItem.categoryScores.studies || 0,
        sports: talentItem.categoryScores.sports || 0,
        arts: talentItem.categoryScores.arts || 0,
        technical: talentItem.categoryScores.technical || 0,
        communication: talentItem.categoryScores.communication || 0,
        leadership: talentItem.categoryScores.leadership || 0,
        other: talentItem.categoryScores.other || 0,
      });
    }
    setEvaluatorNotes(talentItem.evaluatorNotes || '');
    setIsEvaluateOpen(true);
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    setEvalLoading(true);
    try {
      const payload = {
        studentId: evaluatingStudent.student?._id || evaluatingStudent.student,
        categoryScores: scoresForm,
        evaluatorNotes,
      };

      const res = await api.post('/talent/evaluate', payload);
      if (res.data.success) {
        success('Deterministic talent engine executed successfully!');
        setIsEvaluateOpen(false);
        fetchTalents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update talent evaluation.');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!skillForm.skillName) {
      warning('Skill name is required.');
      return;
    }

    try {
      const payload = {
        studentId: selectedStudentTalent.student._id,
        ...skillForm,
      };

      const res = await api.post('/talent/skill', payload);
      if (res.data.success) {
        success('Specific skill added to student profile!');
        setIsAddSkillOpen(false);
        // Refresh profile
        handleOpenProfile({ student: selectedStudentTalent.student });
      }
    } catch (err) {
      error('Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const res = await api.delete(`/talent/skill/${skillId}`);
      if (res.data.success) {
        success('Skill deleted.');
        handleOpenProfile({ student: selectedStudentTalent.student });
      }
    } catch (err) {
      error('Failed to delete skill.');
    }
  };

  // Prepare radar data for modal profile
  const radarChartData = selectedStudentTalent?.talent?.categoryScores
    ? [
        { category: 'Studies', score: selectedStudentTalent.talent.categoryScores.studies || 0 },
        { category: 'Sports', score: selectedStudentTalent.talent.categoryScores.sports || 0 },
        { category: 'Arts', score: selectedStudentTalent.talent.categoryScores.arts || 0 },
        { category: 'Technical', score: selectedStudentTalent.talent.categoryScores.technical || 0 },
        { category: 'Communication', score: selectedStudentTalent.talent.categoryScores.communication || 0 },
        { category: 'Leadership', score: selectedStudentTalent.talent.categoryScores.leadership || 0 },
        { category: 'Other Skills', score: selectedStudentTalent.talent.categoryScores.other || 0 },
      ]
    : [];

  const columns = [
    {
      header: 'Register No',
      key: 'registerNumber',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
          {row.registerNumber}
        </span>
      ),
    },
    {
      header: 'Student Name',
      key: 'studentName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.studentName}</p>
          <p className="text-[10px] text-slate-400">{row.department?.name}</p>
        </div>
      ),
    },
    {
      header: '🏆 Primary Talent',
      key: 'dominantCategoryName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="gold" size="md">
            <Trophy className="h-3.5 w-3.5 mr-1 text-amber-600" />
            {row.dominantCategoryName} ({row.highestScore}%)
          </Badge>
          {row.isJointHighest && (
            <Badge variant="purple" size="sm">
              Joint Tied
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Secondary Strength',
      key: 'secondaryStrength',
      render: (row) => {
        const sec = row.secondaryStrength?.[0];
        if (!sec || sec.category === 'none' || sec.score === 0) {
          return <span className="text-slate-400 text-xs italic">None</span>;
        }
        return (
          <span className="font-semibold text-slate-700 text-xs">
            {sec.displayName} ({sec.score}%)
          </span>
        );
      },
    },
    {
      header: 'AI Generated Assessment Summary',
      key: 'calculatedSummary',
      render: (row) => (
        <p className="text-xs text-slate-600 italic line-clamp-2 max-w-sm">
          &ldquo;{row.calculatedSummary}&rdquo;
        </p>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenProfile(row)}
            title="View Full Talent Profile & Radar"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-xs flex items-center gap-1 transition"
          >
            <Eye className="h-4 w-4" />
            Profile
          </button>
          {canEvaluate && (
            <button
              onClick={() => handleOpenEvaluate(row)}
              title="Evaluate 7-Category Scores"
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
            >
              <Sliders className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Student Skill & Talent Intelligence"
      subtitle="Deterministic talent discovery engine, multi-category strengths, and individual radar profiles"
    >
      {/* Innovation Hero Banner */}
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-amber-400/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Main Innovation Feature
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Student Skill & Talent Intelligence Engine
            </h2>
            <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
              Moving beyond traditional academic exams. The system evaluates seven holistic dimensions—Studies, Sports, Arts, Technical, Communication, Leadership & Other Skills—to deterministically calculate each student&apos;s primary strength and secondary talents.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-center min-w-[200px]">
            <Trophy className="h-8 w-8 text-amber-400 mb-1 animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Evaluated Students
            </span>
            <p className="text-2xl font-black text-white">{totalRecords}</p>
          </div>
        </div>
      </div>

      {/* Quick Filters Pill Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { label: 'All Students', icon: Layers, val: 'All' },
          { label: 'Top Academic', icon: BookOpen, val: 'Top Academic' },
          { label: 'Top Sports', icon: Dumbbell, val: 'Top Sports' },
          { label: 'Top Technical', icon: Code2, val: 'Top Technical' },
          { label: 'Top Arts', icon: Palette, val: 'Top Arts' },
          { label: 'Top Communication', icon: MessageSquare, val: 'Top Communication' },
          { label: 'Top Leadership', icon: Crown, val: 'Top Leadership' },
          { label: '🏆 Joint Strengths', icon: Star, val: 'Joint Strengths' },
        ].map((f) => {
          const Icon = f.icon;
          const isActive = quickFilter === f.val;
          return (
            <button
              key={f.val}
              onClick={() => {
                setQuickFilter(f.val);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-2xs ${
                isActive
                  ? 'bg-blue-600 text-white shadow-blue-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main Talent Leaderboard DataTable */}
      <DataTable
        columns={columns}
        data={talents}
        loading={loading}
        totalItems={totalRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onSearchChange={setSearch}
        searchPlaceholder="Search talent by student name, register number or primary strength..."
        filterComponent={
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        }
      />

      {/* DETAILED STUDENT TALENT PROFILE MODAL */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Student Talent Intelligence Profile"
        subtitle={
          selectedStudentTalent
            ? `${selectedStudentTalent.student.name} (${selectedStudentTalent.student.registerNumber})`
            : ''
        }
        maxWidth="max-w-5xl"
      >
        {selectedStudentTalent && (
          <div className="space-y-6 text-xs">
            {/* Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-lg border border-amber-400/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl shadow-md">
                    {selectedStudentTalent.student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{selectedStudentTalent.student.name}</h3>
                    <p className="text-xs text-blue-200">
                      Reg: <span className="font-mono font-bold text-white">{selectedStudentTalent.student.registerNumber}</span> • {selectedStudentTalent.student.department?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Class: {selectedStudentTalent.student.year} ({selectedStudentTalent.student.course?.courseName})
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-400/60 bg-amber-500/20 p-4 text-right backdrop-blur-xs">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center justify-end gap-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    Primary Talent
                  </span>
                  <p className="text-lg font-black text-white mt-0.5">
                    {selectedStudentTalent.talent?.dominantCategoryName} (
                    {selectedStudentTalent.talent?.highestScore}%)
                  </p>
                  {selectedStudentTalent.talent?.isJointHighest && (
                    <Badge variant="purple" size="sm" className="mt-1">
                      Joint Strength Tie
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Narrative Summary Box */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70">
              <h5 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5 text-xs">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Synthesized Talent Intelligence Insight:
              </h5>
              <p className="text-slate-800 font-medium leading-relaxed italic text-sm">
                &ldquo;{selectedStudentTalent.talent?.calculatedSummary}&rdquo;
              </p>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Multi-Dimensional Talent Radar (0–100)
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#475569' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar
                        name="Talent Score"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ranked Category Bar Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Category Score Ranking</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedStudentTalent.talent?.rankedCategories || []}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="displayName" type="category" tick={{ fontSize: 9 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#10b981" radius={[0, 6, 6, 0]} name="Score (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Specific Skills & Verified Achievements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Specific Skills & Passion</h4>
                  <p className="text-[11px] text-slate-500">
                    Individual certificates, projects, sports tournaments, and arts performances
                  </p>
                </div>
                {canEvaluate && (
                  <button
                    onClick={() => setIsAddSkillOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Skill / Achievement
                  </button>
                )}
              </div>

              {selectedStudentTalent.skills?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedStudentTalent.skills.map((sk) => (
                    <div
                      key={sk._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 relative group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{sk.skillName}</h5>
                          <span className="text-[11px] font-semibold text-blue-600">
                            {sk.category} • {sk.experience}
                          </span>
                        </div>
                        <Badge variant="primary" size="sm">
                          {sk.skillLevel} ({sk.percentage}%)
                        </Badge>
                      </div>

                      {sk.achievement && (
                        <p className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          🏅 {sk.achievement}
                        </p>
                      )}

                      {sk.certificate && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          📜 <span className="font-semibold">Certificate:</span> {sk.certificate}
                        </p>
                      )}

                      {sk.passion && (
                        <p className="mt-1 text-[11px] text-purple-700 italic">
                          💜 <span className="font-semibold">Passion:</span> {sk.passion}
                        </p>
                      )}

                      {canEvaluate && (
                        <button
                          onClick={() => handleDeleteSkill(sk._id)}
                          className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                  No specific skills added yet. Click &apos;Add Skill / Achievement&apos; above.
                </div>
              )}
            </div>

            {/* AI CAREER PATHWAY & HIGHER EDUCATION INTELLIGENCE */}
            {(() => {
              const primary = selectedStudentTalent.talent?.primaryTalent?.category || 'studies';
              const recommendations = {
                technical: {
                  title: 'Technology, Software Architecture & AI Systems',
                  roles: ['Full-Stack Software Engineer', 'Data & AI Analyst', 'Cloud Solutions Developer', 'Cybersecurity Specialist'],
                  higherEd: ['M.Sc Computer Science / Data Analytics', 'MCA (Master of Computer Applications)', 'MS in Artificial Intelligence'],
                  certs: ['AWS Certified Cloud Practitioner', 'Python Institute PCAP', 'Google Professional Data Analyst'],
                  action: 'Encourage participating in National Hackathons and open-source project development.',
                },
                sports: {
                  title: 'Athletics, Physical Education & Sports Management',
                  roles: ['State / National Athlete', 'Physical Education Director (PED)', 'Sports Physiotherapy & Nutrition Coach', 'Youth Academy Trainer'],
                  higherEd: ['B.P.Ed / M.P.Ed (Physical Education)', 'Master of Sports Management', 'Diploma in Sports Coaching (NIS)'],
                  certs: ['Sports Authority of India (SAI) Certification', 'First Aid & Sports Injury Management', 'Federation Referee License'],
                  action: 'Nominate candidate for Inter-Collegiate & All-India Inter-University Tournaments.',
                },
                studies: {
                  title: 'Academic Research, Higher Studies & Civil Services',
                  roles: ['University Professor / Academician', 'Civil Services Officer (UPSC / TNPSC)', 'Scientific Research Fellow', 'Data Policy Researcher'],
                  higherEd: ['M.Sc / M.A / M.Com (Honours)', 'Ph.D Doctoral Fellowship', 'Master of Public Administration (MPA)'],
                  certs: ['UGC-NET / CSIR-NET Lectureship', 'GATE Examination', 'NPTEL Elite Gold Certifications'],
                  action: 'Provide mentorship for Research Paper publications and competitive exam preparation.',
                },
                arts: {
                  title: 'Creative Arts, Media Production & Design',
                  roles: ['Creative Art Director', 'UI/UX Visual Designer', 'Performing Artist / Choreographer', 'Digital Content Producer'],
                  higherEd: ['Master of Fine Arts (MFA)', 'M.Sc Visual Communication', 'Diploma in Animation & Graphic Design'],
                  certs: ['Adobe Certified Professional', 'Classical Dance / Vocal Grade Examinations', 'Digital Illustration Masters'],
                  action: 'Represent institution in Youth Cultural Festivals & State Art Exhibitions.',
                },
                communication: {
                  title: 'Corporate Communications, Public Relations & Journalism',
                  roles: ['Corporate PR & Media Strategist', 'Broadcast Journalist / News Anchor', 'Human Resources Executive', 'Institutional Spokesperson'],
                  higherEd: ['M.A Journalism & Mass Communication', 'MBA in Human Resources', 'Master of International Relations'],
                  certs: ['Toastmasters International Competent Communicator', 'Cambridge Business English (BEC)', 'Digital Marketing Specialist'],
                  action: 'Appoint as Student Emcee for College Conferences and Debating Society Leader.',
                },
                leadership: {
                  title: 'Strategic Management, Entrepreneurship & Administration',
                  roles: ['Corporate Project Manager', 'Startup Founder / Entrepreneur', 'Operations Lead', 'NGO Director'],
                  higherEd: ['MBA (Master of Business Administration)', 'Master of Strategic Management', 'Executive Leadership Diploma'],
                  certs: ['PMI Agile Certified Practitioner', 'Six Sigma Green Belt', 'Harvard Business Online Leadership'],
                  action: 'Entrust with Student Council leadership and institutional event organization.',
                },
                other: {
                  title: 'Vocational & Entrepreneurial Mastery',
                  roles: ['Specialized Domain Consultant', 'Vocational Training Specialist', 'Business Operations Executive'],
                  higherEd: ['Master of Vocation (M.Voc)', 'Postgraduate Diploma in Management'],
                  certs: ['National Skill Development Corporation (NSDC)', 'Skill India Certification'],
                  action: 'Provide entrepreneurship incubation and domain skill enhancement support.',
                },
              };

              const rec = recommendations[primary] || recommendations.studies;

              return (
                <div className="p-5 rounded-3xl border-2 border-[#C5A059]/40 bg-gradient-to-br from-[#0E1B2E] via-[#162A45] to-[#4A0E18] text-white shadow-md space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#C5A059]/30 pb-2">
                    <Sparkles className="h-4 w-4 text-[#F3E5AB] animate-pulse" />
                    <h4 className="font-classic text-xs font-black uppercase text-[#F3E5AB]">
                      AI Talent Recommendation: {rec.title}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase block mb-1">Recommended Career Roles</span>
                      <ul className="space-y-0.5 text-[11px] text-slate-200">
                        {rec.roles.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase block mb-1">Higher Education Pathways</span>
                      <ul className="space-y-0.5 text-[11px] text-slate-200">
                        {rec.higherEd.map((h, i) => (
                          <li key={i}>• {h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase block mb-1">Recommended Certifications</span>
                      <ul className="space-y-0.5 text-[11px] text-slate-200">
                        {rec.certs.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#E8E2D5] italic pt-1">
                    💡 <span className="font-bold text-[#F3E5AB]">Faculty Action:</span> {rec.action}
                  </p>
                </div>
              );
            })()}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#0E1B2E] hover:bg-[#162A45] rounded-xl transition font-classic"
              >
                Close Talent Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 7-CATEGORY TALENT EVALUATION MODAL */}
      <Modal
        isOpen={isEvaluateOpen}
        onClose={() => setIsEvaluateOpen(false)}
        title="Evaluate Student Talent Scores"
        subtitle={
          evaluatingStudent
            ? `Assessing 7 categories for ${evaluatingStudent.studentName} (${evaluatingStudent.registerNumber})`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEvaluateSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter holistic capability scores (0–100) across all 7 institutional categories. The deterministic engine will calculate primary talents and rank ties automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'studies', label: '1. Studies & Academics', icon: BookOpen, color: 'text-blue-600' },
              { key: 'sports', label: '2. Sports & Martial Arts', icon: Dumbbell, color: 'text-emerald-600' },
              { key: 'arts', label: '3. Arts & Culture', icon: Palette, color: 'text-purple-600' },
              { key: 'technical', label: '4. Technical Skills & Coding', icon: Code2, color: 'text-indigo-600' },
              { key: 'communication', label: '5. Communication & Oratory', icon: MessageSquare, color: 'text-amber-600' },
              { key: 'leadership', label: '6. Leadership & Coordination', icon: Crown, color: 'text-rose-600' },
              { key: 'other', label: '7. Other Vocational Skills', icon: Star, color: 'text-slate-600' },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.key} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 ${cat.color}`} />
                      {cat.label}
                    </label>
                    <span className="font-extrabold text-sm text-blue-700">
                      {scoresForm[cat.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoresForm[cat.key]}
                    onChange={(e) =>
                      setScoresForm({ ...scoresForm, [cat.key]: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Faculty Evaluator Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={evaluatorNotes}
              onChange={(e) => setEvaluatorNotes(e.target.value)}
              placeholder="e.g. Demonstrated outstanding leadership during state youth summit..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEvaluateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={evalLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {evalLoading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Run Deterministic Engine & Save
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD SPECIFIC SKILL MODAL */}
      <Modal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        title="Add Specific Talent / Achievement"
        subtitle={selectedStudentTalent?.student.name}
      >
        <form onSubmit={handleAddSkillSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Skill Name / Title *
            </label>
            <input
              type="text"
              required
              value={skillForm.skillName}
              onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
              placeholder="e.g. Silambam, Python Web Development, Bharatanatyam, English Debate"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Sports">Sports</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Communication">Communication</option>
                <option value="Leadership">Leadership</option>
                <option value="Studies">Studies</option>
                <option value="Other Skills">Other Skills</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proficiency Level</label>
              <select
                value={skillForm.skillLevel}
                onChange={(e) => setSkillForm({ ...skillForm, skillLevel: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
                <option value="Master">Master</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proficiency Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={skillForm.percentage}
                onChange={(e) => setSkillForm({ ...skillForm, percentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
              <input
                type="text"
                value={skillForm.experience}
                onChange={(e) => setSkillForm({ ...skillForm, experience: e.target.value })}
                placeholder="e.g. 3 Years"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Achievement / Award (Optional)
            </label>
            <input
              type="text"
              value={skillForm.achievement}
              onChange={(e) => setSkillForm({ ...skillForm, achievement: e.target.value })}
              placeholder="e.g. Gold Medal - State Level Championship 2025"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Certificate / Certification (Optional)
            </label>
            <input
              type="text"
              value={skillForm.certificate}
              onChange={(e) => setSkillForm({ ...skillForm, certificate: e.target.value })}
              placeholder="e.g. Meta Front-End Developer Certified"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSkillOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              Save Skill
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
