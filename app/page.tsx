'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  GraduationCap,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  BookOpen,
  Trophy,
  CheckCircle2,
  Menu,
  X,
  Building2,
  BarChart3,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Check,
  ChevronRight,
  Lock,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Talent radar demo data
  const talentRadarData = [
    { category: 'Sports', score: 92, fullMark: 100 },
    { category: 'Studies', score: 80, fullMark: 100 },
    { category: 'Communication', score: 75, fullMark: 100 },
    { category: 'Arts', score: 70, fullMark: 100 },
    { category: 'Leadership', score: 68, fullMark: 100 },
    { category: 'Technical', score: 65, fullMark: 100 },
    { category: 'Vocational', score: 60, fullMark: 100 },
  ];

  // Analytics preview data
  const talentDistributionData = [
    { name: 'Sports', count: 32, color: '#3B82F6' },
    { name: 'Academics', count: 28, color: '#10B981' },
    { name: 'Technical', count: 24, color: '#8B5CF6' },
    { name: 'Arts & Culture', count: 18, color: '#EC4899' },
    { name: 'Communication', count: 15, color: '#F59E0B' },
    { name: 'Leadership', count: 12, color: '#06B6D4' },
  ];

  const academicGradesData = [
    { grade: 'O (90-100)', students: 35 },
    { grade: 'A+ (80-89)', students: 58 },
    { grade: 'A (70-79)', students: 42 },
    { grade: 'B+ (60-69)', students: 25 },
    { grade: 'B (50-59)', students: 12 },
  ];

  // Interactive Platform Tabs
  const platformTabs = [
    {
      title: 'Department Management',
      badge: '01',
      desc: 'Centralized administration for degree programs, HOD assignments, faculty mapping, and student cohort allocations.',
      stats: '12 Active Programs',
      icon: Building2,
      preview: {
        title: 'Department Directory',
        items: [
          { name: 'B.Sc Computer Science', code: 'CS', students: 180, faculty: 8, status: 'Active' },
          { name: 'B.Sc Data Science', code: 'DS', students: 120, faculty: 6, status: 'Active' },
          { name: 'B.Com General', code: 'COM', students: 240, faculty: 10, status: 'Active' },
          { name: 'B.A English Literature', code: 'ENG', students: 150, faculty: 7, status: 'Active' },
        ],
      },
    },
    {
      title: 'Student 360 & Excel',
      badge: '02',
      desc: 'Holistic student profiles, register numbers, parent contact info, automated attendance rates, and one-click bulk Excel import.',
      stats: '2,500+ Student Records',
      icon: GraduationCap,
      preview: {
        title: 'Student Profile & Academic Health',
        items: [
          { name: 'Vinodhini R', reg: '2026CS101', dept: 'B.Sc CS', att: '94%', talent: 'Sports (92%)' },
          { name: 'Priyanka S', reg: '2026CS102', dept: 'B.Sc CS', att: '88%', talent: 'Technical (90%)' },
          { name: 'Sangeetha N', reg: '2026DS105', dept: 'B.Sc DS', att: '91%', talent: 'Arts (92%)' },
          { name: 'Ananya M', reg: '2026ENG110', dept: 'B.A ENG', att: '85%', talent: 'Debate (88%)' },
        ],
      },
    },
    {
      title: 'Faculty & Workload',
      badge: '03',
      desc: 'Faculty credentials, designations, subject unit assignments, and Admin staff account provisioning with custom permissions.',
      stats: '85+ Faculty Staff',
      icon: Users,
      preview: {
        title: 'Staff Allocations & Permissions',
        items: [
          { name: 'Dr. K. Anitha', emp: 'KCAS-FAC-001', desig: 'Assoc. Professor', role: 'Full Access' },
          { name: 'Dr. R. Kavitha', emp: 'KCAS-FAC-002', desig: 'Assoc. Professor', role: 'Academics & Talent' },
          { name: 'Dr. M. Soundarya', emp: 'KCAS-FAC-003', desig: 'Professor & HOD', role: 'Full Access' },
          { name: 'Mrs. V. Jayanthi', emp: 'KCAS-FAC-004', desig: 'Asst. Professor', role: 'Attendance & Marks' },
        ],
      },
    },
    {
      title: 'Attendance & University Marks',
      badge: '04',
      desc: 'Daily subject attendance with 75% shortage alerts, internal (25) & external (75) mark entry with automated university grading.',
      stats: '98.4% Pass Percentage',
      icon: Award,
      preview: {
        title: 'Examination Grade Computation',
        items: [
          { subject: 'Data Structures', code: 'CS301', int: '24/25', ext: '70/75', total: '94/100', grade: 'O Grade' },
          { subject: 'Database Management', code: 'CS302', int: '22/25', ext: '65/75', total: '87/100', grade: 'A+ Grade' },
          { subject: 'Operating Systems', code: 'CS303', int: '23/25', ext: '68/75', total: '91/100', grade: 'O Grade' },
          { subject: 'Computer Networks', code: 'CS304', int: '21/25', ext: '60/75', total: '81/100', grade: 'A+ Grade' },
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] font-[Inter,sans-serif] selection:bg-[#701A28] selection:text-white antialiased overflow-x-hidden w-full">
      {/* =========================================================================
          1. RESPONSIVE STICKY NAVBAR (DESKTOP, TABLET, MOBILE)
      ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#1C0409]/95 backdrop-blur-xl shadow-xl border-b border-white/10 py-3'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          {/* Logo & College Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-white p-1 border border-white/20 shadow-md transition group-hover:scale-105">
              <Image
                src="/assets/images/kcas-logo.png"
                alt="KCAS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5 leading-tight truncate">
                Kamban College
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white/15 text-[#E2B86E] text-[10px] font-bold border border-white/20">
                  KCAS
                </span>
              </span>
              <p className="text-[9px] sm:text-[10px] text-stone-300 font-medium hidden sm:block truncate max-w-xs md:max-w-md">
                Recognized u/s 2(f) & 12(B) of UGC Act 1956 • NAAC Accredited
              </p>
            </div>
          </Link>

          {/* Desktop & Laptop Navigation Links (1024px+) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold text-stone-200">
            <a href="#overview" className="hover:text-[#E2B86E] transition">
              Overview
            </a>
            <a href="#modules" className="hover:text-[#E2B86E] transition">
              Modules
            </a>
            <a href="#talent" className="hover:text-[#E2B86E] transition flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[#E2B86E]" />
              Talent Intelligence
            </a>
            <a href="#analytics" className="hover:text-[#E2B86E] transition">
              Analytics
            </a>
            <a href="#roles" className="hover:text-[#E2B86E] transition">
              Roles & Security
            </a>
          </nav>

          {/* Header Action Button (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold text-stone-950 bg-[#E2B86E] hover:bg-amber-300 transition shadow-lg shadow-black/20 hover:scale-105"
            >
              Portal Login
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile & Tablet Drawer Trigger (Below 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-white hover:bg-white/10 lg:hidden focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile / Tablet Slide Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1C0409]/98 backdrop-blur-2xl border-b border-white/10 px-5 sm:px-8 py-5 space-y-3.5 shadow-2xl animate-fadeIn">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-stone-200 hover:text-[#E2B86E] py-1"
            >
              Platform Overview
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-stone-200 hover:text-[#E2B86E] py-1"
            >
              Core Academic Modules
            </a>
            <a
              href="#talent"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-[#E2B86E] py-1 flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-[#E2B86E]" />
              Talent Intelligence Engine
            </a>
            <a
              href="#analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-stone-200 hover:text-[#E2B86E] py-1"
            >
              Department Analytics
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-stone-200 hover:text-[#E2B86E] py-1"
            >
              Role-Based Access
            </a>
            <div className="pt-3 border-t border-white/10">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold text-stone-950 bg-[#E2B86E] hover:bg-amber-300 shadow-md transition"
              >
                Sign In to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. FULL-SCREEN 100VH CINEMATIC CAMPUS IMAGE HERO SECTION
             Responsive across Large Desktop (1920px+), Desktop, Laptop, Tablet, and Mobile
      ========================================================================= */}
      <section className="relative min-h-[100svh] w-full flex flex-col justify-between overflow-hidden bg-black text-white">
        {/* Full Viewport Background Campus Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/kcas-campus.jpg"
            alt="Kamban College Campus Building"
            fill
            className="object-cover object-center scale-100 transition-transform duration-1000 ease-out"
            priority
          />
          {/* Subtle Deep Burgundy / Dark Gradient Overlay for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-[#350812]/80 to-[#1c0409]/75" />
          <div className="absolute inset-0 bg-[#2b050d]/35 backdrop-brightness-[0.88]" />
        </div>

        {/* Top Spacer for Fixed Nav */}
        <div className="h-20 sm:h-24 md:h-28 w-full shrink-0 z-10" />

        {/* Center Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center my-auto py-6 sm:py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Top Small Institution Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-bold tracking-wider text-[#E2B86E] uppercase mb-4 sm:mb-6 shadow-xl max-w-full">
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#E2B86E] shrink-0" />
              <span className="truncate">KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN</span>
            </div>

            {/* Main Responsive Heading */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] font-black uppercase tracking-tight text-white leading-[1.12] sm:leading-[1.08] mb-3 sm:mb-4 drop-shadow-lg">
              COLLEGE DEPARTMENT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-100 to-[#E2B86E]">
                MANAGEMENT SYSTEM
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base md:text-lg lg:text-xl font-extrabold text-[#E2B86E] tracking-wide mb-3 sm:mb-4 drop-shadow-md">
              Manage • Analyze • Discover Student Talent
            </p>

            {/* Short Description */}
            <p className="text-xs sm:text-sm md:text-base text-stone-200/90 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 font-normal drop-shadow-sm px-2">
              One intelligent platform to manage academic operations, understand student performance, and discover every student&apos;s potential.
            </p>

            {/* Action Buttons (Touch Friendly on Mobile) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-stone-950 bg-white hover:bg-stone-100 transition-all duration-200 shadow-2xl hover:scale-105 group min-h-[48px]"
              >
                Enter Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#overview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all duration-200 hover:scale-105 shadow-xl min-h-[48px]"
              >
                Explore Platform
              </a>
            </div>

            {/* Quick Hero Floating Metrics Strip (Responsive) */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-stone-300 font-semibold">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                ⚡ 2,500+ Students
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                🏛️ 12 Departments
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                ✨ 7-Category Talent Radar
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Hero Information Strip */}
        <div className="relative z-10 w-full border-t border-white/10 bg-black/50 backdrop-blur-md py-3 sm:py-4">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-stone-300 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E2B86E] animate-pulse shrink-0" />
              <span>Thenmathur, Tiruvannamalai – 606 603</span>
            </div>
            <div className="text-[#E2B86E] font-bold tracking-wide">
              Manage. Analyze. Discover Potential.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION 2 — PLATFORM OVERVIEW (INTERACTIVE PRODUCT DEMONSTRATION)
      ========================================================================= */}
      <section id="overview" className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#701A28]">
              ONE UNIFIED PLATFORM
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Everything your department needs. <br />
              <span className="text-[#701A28]">In one intelligent system.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium px-2">
              Eliminate disconnected spreadsheets and manual logs with seamless real-time coordination.
            </p>
          </div>

          {/* Showcase Grid (Responsive across Desktop, Tablet, and Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Tabs List */}
            <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
              {platformTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === idx;
                return (
                  <div
                    key={tab.title}
                    onMouseEnter={() => setActiveTab(idx)}
                    onClick={() => setActiveTab(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#701A28]/5 border-[#701A28]/30 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isActive ? 'bg-[#701A28] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isActive ? 'text-[#701A28]' : 'text-slate-800'
                          }`}
                        >
                          {tab.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 ml-2">
                        {tab.badge}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed pl-8 sm:pl-9">
                      {tab.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Interactive Mockup Visual */}
            <div className="lg:col-span-7">
              <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-5">
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500 shrink-0" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500 shrink-0" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-slate-300 ml-1.5 truncate">
                      KCAS Portal — {platformTabs[activeTab].preview.title}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold shrink-0">
                    {platformTabs[activeTab].stats}
                  </span>
                </div>

                {/* Mockup Table View with Horizontal Scroll */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        {Object.keys(platformTabs[activeTab].preview.items[0]).map((key) => (
                          <th key={key} className="pb-3 px-2 capitalize">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {platformTabs[activeTab].preview.items.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="py-3 px-2 font-medium">
                              {typeof val === 'string' && val.includes('Sports') ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                                  🏆 {val}
                                </span>
                              ) : typeof val === 'string' && (val.includes('O Grade') || val.includes('Active') || val.includes('Full Access')) ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                                  {val}
                                </span>
                              ) : (
                                val
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mockup Footer Quick Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] sm:text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Live MongoDB Synchronization
                  </span>
                  <Link
                    href="/login"
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1 text-[11px] sm:text-xs"
                  >
                    View in Portal <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SECTION 3 — CORE ACADEMIC MODULES (RESPONSIVE CARDS)
      ========================================================================= */}
      <section id="modules" className="py-16 sm:py-20 lg:py-24 bg-slate-50/80 border-t border-slate-200/80">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#701A28]">
              ACADEMIC ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Built for the entire academic ecosystem.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium px-2">
              Every workflow from student admission to examination results is designed for speed and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Card 1: Student 360 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#701A28]/40 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-[#701A28] group-hover:text-white transition">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">01</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Student 360 & Directory</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive student management with 360 profile drawer, parent contact, admission metadata, and native Excel batch import.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#701A28]">
                <span>Excel Preview & Import</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 2: Faculty Management */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#701A28]/40 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-[#701A28] group-hover:text-white transition">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">02</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Faculty & Staff Accounts</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Faculty directory, designations, specialization, subject unit allocations, and Admin staff credential generation with custom permissions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-teal-700">
                <span>Granular Permissions</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 3: Attendance Management */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#701A28]/40 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-[#701A28] group-hover:text-white transition">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">03</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Attendance Tracker</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interactive class mark sheet with Present/Absent/OD toggles, Mark All Present shortcut, cumulative percentage computation, and shortage alerts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span>75% Health Indicator</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 4: Marks & University Results */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#701A28]/40 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-[#701A28] group-hover:text-white transition">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">04</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Marks & Semester Results</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Internal (25) + External (75) marks entry with automatic calculation of total, university grade (O, A+, A, RA), and Pass/Fail result.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span>Thiruvalluvar Univ Grading</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 5: Courses & Subjects */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#701A28]/40 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-[#701A28] group-hover:text-white transition">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">05</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Course & Subject Catalog</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Degree programs (UG/PG), credit points, semester curriculum structure, and faculty course assignments across academic departments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-700">
                <span>Credit Points & Semesters</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 6: Reports & Transcripts */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#701A28]/40 transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-[#701A28] group-hover:text-white transition">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400">06</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Institutional Reports</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Print-optimized academic transcripts, attendance shortage records, talent aggregate summaries, and instant Excel data exports.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
                <span>Clean Print & Excel Export</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECTION 4 — STUDENT TALENT INTELLIGENCE (HERO VISUAL HIGHLIGHT)
      ========================================================================= */}
      <section id="talent" className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#311042] text-white relative overflow-hidden">
        {/* Decorative Background Lighting */}
        <div className="absolute top-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-indigo-400/40 text-xs font-bold text-indigo-300">
                <Sparkles className="h-4 w-4 text-[#E2B86E]" />
                Main Innovation Feature
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Don&apos;t just manage students. <br />
                <span className="bg-gradient-to-r from-amber-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  Discover what they are capable of.
                </span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Analyze academic performance, sports, arts, technical skills, communication and leadership to automatically identify each student&apos;s strongest potential without arbitrary bias.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-amber-400/20 text-amber-300 mt-0.5 shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Deterministic Talent Engine:</strong> Calculates primary strength (Rank 1) and secondary capability (Rank 2) dynamically.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-indigo-400/20 text-indigo-300 mt-0.5 shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Joint-Strength Tie Detection:</strong> Automatically identifies students with equal top capabilities across multiple fields.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-purple-400/20 text-purple-300 mt-0.5 shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Cohort Dominance Analytics:</strong> Computes the dominant strength profile across entire departments and classes.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-slate-950 bg-[#E2B86E] hover:bg-amber-300 transition shadow-lg shadow-amber-400/20"
                >
                  Explore Talent Intelligence
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: Live Interactive Talent Radar & Data Card */}
            <div className="lg:col-span-6">
              <div className="p-5 sm:p-7 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-2xl space-y-5">
                {/* Profile Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">Student Talent Profile</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono truncate">Vinodhini R (2026CS101) • B.Sc CS</p>
                  </div>
                  <div className="px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-md shrink-0 ml-2">
                    <Trophy className="h-3.5 w-3.5" />
                    92% Strength
                  </div>
                </div>

                {/* Visual Radar Visualization (Responsive Container) */}
                <div className="h-60 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={talentRadarData} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                      <PolarGrid stroke="#475569" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: '#cbd5e1' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                      <Radar
                        name="Talent Score"
                        dataKey="score"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.4}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Score Indicators Pill Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      🏆 Primary Talent
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white mt-0.5">Sports & Martial Arts (92%)</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      Secondary Strength
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white mt-0.5">Studies & Academics (80%)</p>
                  </div>
                </div>

                {/* Synthesized Narrative Insight */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] sm:text-xs italic text-slate-200 leading-relaxed">
                  &ldquo;Vinodhini&apos;s strongest performance area is Sports with a score of 92%. Her secondary strength is Studies with a score of 80%.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION 5 — FROM DATA TO INSIGHT (RESPONSIVE PIPELINE)
      ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#701A28]">
              INTELLIGENCE PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Turn student data into meaningful insight.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium px-2">
              Transforming raw administrative and performance metrics into actionable student guidance.
            </p>
          </div>

          {/* Responsive 3-Step Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 items-center">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="font-bold text-xs text-slate-900">Student Data</h4>
              <p className="text-[11px] text-slate-500">Profiles, demographics & attendance</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-300">
              <ArrowRight className="h-5 w-5" />
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="font-bold text-xs text-slate-900">Academic Marks</h4>
              <p className="text-[11px] text-slate-500">Internal, external & university grades</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-300">
              <ArrowRight className="h-5 w-5" />
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="h-10 w-10 mx-auto rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="font-bold text-xs text-slate-900">Skill Engine</h4>
              <p className="text-[11px] text-slate-500">7 capability dimensions scored 0–100</p>
            </div>
          </div>

          <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#701A28]/5 via-amber-500/5 to-purple-500/5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Actionable Institutional Guidance</h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Empower department HODs and mentors with instant talent leaderboards and shortage alerts.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#701A28] hover:bg-[#58111A] transition shrink-0 shadow-xs"
            >
              Access Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. SECTION 6 — REAL-TIME ANALYTICS (RESPONSIVE CHARTS)
      ========================================================================= */}
      <section id="analytics" className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-t border-slate-200/80">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#701A28]">
              INSTITUTIONAL VISIBILITY
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              See your institution clearly.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium px-2">
              Understand performance, attendance and talent distribution through real-time dynamic visualizations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Chart 1: Talent Distribution */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Department Talent Distribution</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Student count across talent domains</p>
                </div>
                <span className="text-xs font-bold text-[#701A28]">Live Cohort</span>
              </div>

              <div className="h-60 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={talentDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {talentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Academic Performance Grades */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Academic Examination Grades</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Thiruvalluvar University Evaluation</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">Semester 1</span>
              </div>

              <div className="h-60 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={academicGradesData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis dataKey="grade" type="category" tick={{ fontSize: 8.5, fill: '#64748b' }} width={80} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#10B981" radius={[0, 6, 6, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. SECTION 7 — EXCEL WORKFLOW (RESPONSIVE TIMELINE & TABLE)
      ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-700">
                NATIVE SPREADSHEET INTEGRATION
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Import. Validate. <br />
                <span className="text-emerald-700">Manage.</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Bulk operations without complexity. Import hundreds of student profiles, faculty members, and examination marks in seconds with automated duplicate detection and preview validation.
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Student Management → Direct Excel Upload & Template</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Faculty Management → Direct Excel Upload & Template</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Marks & Results → Automated Calculation & Export</span>
                </div>
              </div>
            </div>

            {/* Right Spreadsheet Preview Visual */}
            <div className="lg:col-span-7">
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Excel Import Validation Workflow
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                    3-Step Verification
                  </span>
                </div>

                {/* Validation Table Simulation with Horizontal Scroll */}
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-200/70 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Row</th>
                        <th className="p-2">Register No</th>
                        <th className="p-2">Student Name</th>
                        <th className="p-2">Department</th>
                        <th className="p-2">Validation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr>
                        <td className="p-2 font-mono text-slate-400">#01</td>
                        <td className="p-2 font-mono font-bold text-blue-700">2026CS101</td>
                        <td className="p-2 font-bold text-slate-900">Vinodhini R</td>
                        <td className="p-2 text-slate-600">B.Sc CS</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            ✓ Valid Record
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-slate-400">#02</td>
                        <td className="p-2 font-mono font-bold text-blue-700">2026CS102</td>
                        <td className="p-2 font-bold text-slate-900">Priyanka S</td>
                        <td className="p-2 text-slate-600">B.Sc CS</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            ✓ Valid Record
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-slate-400">#03</td>
                        <td className="p-2 font-mono font-bold text-rose-700">2026CS101</td>
                        <td className="p-2 font-bold text-slate-900">Duplicate Entry</td>
                        <td className="p-2 text-slate-600">B.Sc CS</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            ✕ Duplicate Reg No
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                  <span className="text-[11px] sm:text-xs">Total Rows: 100 | Valid: 99 | Duplicates: 1</span>
                  <button className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition text-xs">
                    Confirm Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. SECTION 8 — ROLE-BASED ACCESS ARCHITECTURE (RESPONSIVE CARDS)
      ========================================================================= */}
      <section id="roles" className="py-16 sm:py-20 lg:py-24 bg-slate-50/80 border-t border-slate-200/80">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2.5 sm:space-y-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#701A28]">
              SECURITY & ACCESS CONTROL
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Purpose-built for every institutional role.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium px-2">
              Single-Admin governance, Admin-provisioned faculty credentials, and private student profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Role 1: Admin */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700 w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Institutional Admin</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full administrative authority. Manages departments, degree programs, provisions faculty staff accounts with temporary passwords, and audits system activity.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-semibold text-slate-700">
                <p>• Staff Account Provisioning</p>
                <p>• Department & Course CRUD</p>
                <p>• System Audit Trail</p>
              </div>
            </div>

            {/* Role 2: Faculty */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 text-teal-700 w-fit">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Faculty & Mentors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Academic execution layer. Records daily subject attendance, inputs internal & external marks, evaluates 7-dimension talent scores, and generates class reports.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-semibold text-slate-700">
                <p>• Daily Attendance Sheet</p>
                <p>• Marks & Grade Submission</p>
                <p>• Talent Assessment Matrix</p>
              </div>
            </div>

            {/* Role 3: Student */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-700 w-fit">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Student Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Personal intelligence dashboard. Access semester examination marks, attendance percentage health indicator, and holistic 7-dimension capability radar.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-semibold text-slate-700">
                <p>• Personal Talent Radar</p>
                <p>• Attendance % Health Badge</p>
                <p>• Semester Result Slips</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. SECTION 9 — FINAL CTA (ENTER PLATFORM)
      ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-r from-[#701A28] via-[#4A0E1A] to-slate-950 p-6 sm:p-12 text-white text-center shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex p-3 rounded-2xl bg-white/10 text-[#E2B86E] mb-1 backdrop-blur-md">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Manage better. <br />
              Understand deeper. <br />
              <span className="text-[#E2B86E]">
                Discover potential.
              </span>
            </h2>

            <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed px-2">
              Bring departments, students, faculty, academics and talent intelligence together in one modern platform.
            </p>

            <div className="pt-2 sm:pt-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 transition-all duration-200 shadow-xl min-h-[48px]"
              >
                Login to Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. INSTITUTIONAL FOOTER (RESPONSIVE MULTI-COLUMN TO STACKED)
      ========================================================================= */}
      <footer className="bg-[#0B132B] text-slate-400 py-12 sm:py-16 border-t border-slate-800">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10 sm:space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* College Details */}
            <div className="md:col-span-6 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-xl bg-white p-1">
                  <Image
                    src="/assets/images/kcas-logo.png"
                    alt="KCAS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-tight leading-tight">
                    Kamban College of Arts & Science for Women
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Department Management System</p>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                <p className="font-semibold text-slate-300">
                  Recognized u/s 2(f) & 12(B) of UGC Act 1956 • Accredited by NAAC • Permanently Affiliated to Thiruvalluvar University • ISO 9001:2015
                </p>
                <p>Thenmathur, Tiruvannamalai – 606 603, Tamil Nadu, India</p>
                <p>Phone: 04175 – 255401 • Cell No: 9488029091</p>
                <p>
                  Official Email:{' '}
                  <a
                    href="mailto:kcastvmalai@gmail.com"
                    className="text-[#E2B86E] hover:underline font-semibold"
                  >
                    kcastvmalai@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Quick Links (Responsive 3 columns on tablet/desktop, 2 columns on small screens) */}
            <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[10px] sm:text-[11px]">
                  Core Modules
                </h4>
                <ul className="space-y-2 text-slate-400 text-xs">
                  <li>
                    <Link href="/dashboard" className="hover:text-white transition">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/departments" className="hover:text-white transition">
                      Departments
                    </Link>
                  </li>
                  <li>
                    <Link href="/students" className="hover:text-white transition">
                      Students
                    </Link>
                  </li>
                  <li>
                    <Link href="/faculty" className="hover:text-white transition">
                      Faculty
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[10px] sm:text-[11px]">
                  Academics
                </h4>
                <ul className="space-y-2 text-slate-400 text-xs">
                  <li>
                    <Link href="/attendance" className="hover:text-white transition">
                      Attendance
                    </Link>
                  </li>
                  <li>
                    <Link href="/marks" className="hover:text-white transition">
                      Marks & Results
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="hover:text-white transition">
                      Courses & Units
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports" className="hover:text-white transition">
                      Reports
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[10px] sm:text-[11px]">
                  Intelligence
                </h4>
                <ul className="space-y-2 text-slate-400 text-xs">
                  <li>
                    <Link href="/talent" className="text-[#E2B86E] hover:underline font-semibold">
                      Talent Engine
                    </Link>
                  </li>
                  <li>
                    <Link href="/talent-analytics" className="hover:text-white transition">
                      Cohort Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-white transition">
                      Portal Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Sub-footer */}
          <div className="pt-6 sm:pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} Kamban College of Arts and Science for Women. All rights reserved.
            </p>
            <p className="font-semibold text-[#E2B86E]">
              Manage. Analyze. Discover Potential.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
