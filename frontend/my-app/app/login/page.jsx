'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { useNotification } from '../../lib/NotificationContext';
import api, { getEffectiveApiUrl } from '../../lib/api';
import Modal from '../../components/ui/Modal';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Server,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [formError, setFormError] = useState('');

  // Backend URL Config Modal State
  const [configOpen, setConfigOpen] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [customApiUrlInput, setCustomApiUrlInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const url = getEffectiveApiUrl();
    setCurrentApiUrl(url);
    setCustomApiUrlInput(url);
  }, []);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Register Form (Student Public Only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Mandatory First Login Password Reset Modal State
  const [mustResetOpen, setMustResetOpen] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [firstPassForm, setFirstPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetLoading, setResetLoading] = useState(false);

  const { login, setSession } = useAuth();
  const { success, error, warning } = useNotification();
  const router = useRouter();

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      warning('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // First check if user must change temporary password
      const directRes = await api.post('/auth/login', { email, password });
      
      if (directRes.data && directRes.data.success) {
        const { token: userToken, user: userData } = directRes.data;

        if (userData.mustChangePassword) {
          setTempToken(userToken);
          setTempUser(userData);
          setFirstPassForm({
            currentPassword: password,
            newPassword: '',
            confirmPassword: '',
          });
          setMustResetOpen(true);
          setLoading(false);
          return;
        }

        // Standard Login
        setSession(userToken, userData);
        success(`Welcome back, ${userData.name || 'Administrator'}!`);
        
        // Immediate redirect to /dashboard
        router.push('/dashboard');
        // Fallback for immediate navigation
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 300);
      } else {
        const msg = directRes.data?.message || 'Invalid email or password.';
        setFormError(msg);
        error(msg);
      }
    } catch (err) {
      let errMsg = 'Unable to connect to the server. Please check your internet connection or try again.';

      if (err.response) {
        const status = err.response.status;
        const serverMsg = err.response.data?.message;

        if (status === 401) {
          errMsg = 'Invalid email or password.';
        } else if (status === 403) {
          errMsg = 'Your account is inactive or you do not have permission to access this system.';
        } else if (status === 404) {
          errMsg = 'Login service is unavailable. Please contact the administrator.';
        } else if (status === 500) {
          errMsg = 'Server error. Please try again later.';
        } else if (serverMsg) {
          errMsg = serverMsg;
        }
      }

      setFormError(errMsg);
      error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle First Password Reset
  const handleFirstPasswordSubmit = async (e) => {
    e.preventDefault();
    if (firstPassForm.newPassword.length < 6) {
      warning('New password must be at least 6 characters.');
      return;
    }
    if (firstPassForm.newPassword !== firstPassForm.confirmPassword) {
      warning('New password confirmation does not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.post('/auth/change-first-password', firstPassForm, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      });

      if (res.data && res.data.success) {
        success('Password updated successfully! Welcome to your dashboard.');
        const updatedUser = { ...tempUser, mustChangePassword: false };
        setSession(tempToken, updatedUser);
        setMustResetOpen(false);
        router.push('/dashboard');
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 300);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update temporary password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Public Student Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!regName || !regEmail || !regPassword) {
      warning('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      warning('Password must be at least 6 characters in length.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      warning('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register-public', {
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        setSession(userToken, userData);
        success('Student account created successfully! Welcome to KCAS.');
        router.push('/dashboard');
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 300);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setFormError(errMsg);
      error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Fill
  const fillDemo = (demoEmail, demoPass) => {
    setActiveTab('login');
    setFormError('');
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 sm:p-6 lg:p-8 font-[Inter,sans-serif] text-slate-100 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-2 ring-white/20 transition group-hover:scale-105">
              <Image
                src="/assets/images/kcas-logo.png"
                alt="KCAS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <h2 className="mt-4 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Kamban College
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C5A059]">
            Department Management & Talent Intelligence
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Thenmathur, Tiruvannamalai – 606 603
          </p>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tabs: Sign In / Create Account */}
          <div className="mb-6 flex rounded-2xl bg-black/30 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFormError('');
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-[#701A28] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFormError('');
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-[#701A28] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Create Account
            </button>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError('');
                    }}
                    placeholder="santhoshsiva754@gmail.com"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C5A059] focus:bg-white/10 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError('');
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C5A059] focus:bg-white/10 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#701A28] hover:bg-[#58111A] py-3 text-xs font-bold text-white shadow-lg shadow-[#701A28]/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>
                      {loadingTime > 4
                        ? `Waking up cloud server (${loadingTime}s)...`
                        : 'Signing in...'}
                    </span>
                  </div>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* 1-Click Demo Accounts */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
                  ⚡ 1-Click Demo Accounts
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => fillDemo('santhoshsiva754@gmail.com', '12345678')}
                    className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-2 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('faculty@kcas.edu.in', 'Faculty@123')}
                    className="rounded-xl border border-teal-400/30 bg-teal-500/10 p-2 text-[11px] font-bold text-teal-300 hover:bg-teal-500/20 transition"
                  >
                    👩‍🏫 Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('student@kcas.edu.in', 'Student@123')}
                    className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-2 text-[11px] font-bold text-purple-300 hover:bg-purple-500/20 transition"
                  >
                    🎓 Student
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: PUBLIC STUDENT REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-[11px] text-blue-200 flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Student Registration Portal:</strong> Create your account to view your academic marks, attendance %, and holistic 7-category talent radar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      setFormError('');
                    }}
                    placeholder="e.g. Sangeetha Natarajan"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C5A059] focus:bg-white/10 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setFormError('');
                    }}
                    placeholder="sangeetha@gmail.com"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C5A059] focus:bg-white/10 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setFormError('');
                    }}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C5A059] focus:bg-white/10 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      setFormError('');
                    }}
                    placeholder="Re-enter password"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C5A059] focus:bg-white/10 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#701A28] hover:bg-[#58111A] py-3 text-xs font-bold text-white shadow-lg shadow-[#701A28]/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <>
                    Create Student Account
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400 mt-3">
                * Faculty and Staff accounts are provisioned exclusively by the Institutional Administrator.
              </p>
            </form>
          )}
        </div>

        {/* Back Link & Server Status */}
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400">
          <Link
            href="/"
            className="hover:text-white transition flex items-center gap-1"
          >
            ← Return to KCAS Home
          </Link>

          <button
            type="button"
            onClick={() => setConfigOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 transition text-[11px]"
            title="Configure Backend API Server URL"
          >
            <Server className="h-3 w-3 text-emerald-400" />
            <span>API Server</span>
          </button>
        </div>
      </div>

      {/* BACKEND API CONFIGURATION MODAL */}
      <Modal
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        title="🌐 Backend API Server Settings"
        subtitle="Configure the connected API server for Render, Vercel, or Localhost."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
            <p className="font-bold flex items-center gap-1.5 text-blue-950">
              <Server className="h-4 w-4 text-blue-600 shrink-0" />
              Connected Backend URL
            </p>
            <p className="mt-1 text-[11px] text-blue-800 break-all">
              Current: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[10px]">{currentApiUrl || 'Default'}</code>
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Custom Backend API Endpoint URL
            </label>
            <input
              type="url"
              value={customApiUrlInput}
              onChange={(e) => setCustomApiUrlInput(e.target.value)}
              placeholder="https://your-app.onrender.com/api"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-hidden font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Example: <code>https://kcas-backend.onrender.com/api</code>
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={testingConnection}
              onClick={async () => {
                setTestingConnection(true);
                setTestResult(null);
                try {
                  const targetUrl = customApiUrlInput.trim().replace(/\/+$/, '');
                  const testRes = await fetch(`${targetUrl}/health`);
                  const data = await testRes.json();
                  if (data && data.success) {
                    setTestResult({
                      success: true,
                      message: `Connected! (${data.institution || 'KCAS Backend'})`,
                    });
                  } else {
                    setTestResult({
                      success: false,
                      message: 'Server responded but failed health check.',
                    });
                  }
                } catch (err) {
                  setTestResult({
                    success: false,
                    message: 'Cannot reach server. If using Render, wait 45s for wake-up.',
                  });
                } finally {
                  setTestingConnection(false);
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('kcas_backend_url');
                  const defaultUrl = getEffectiveApiUrl();
                  setCurrentApiUrl(defaultUrl);
                  setCustomApiUrlInput(defaultUrl);
                  setTestResult(null);
                  success('Reset to default API URL');
                  setConfigOpen(false);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanUrl = customApiUrlInput.trim().replace(/\/+$/, '');
                  if (cleanUrl) {
                    localStorage.setItem('kcas_backend_url', cleanUrl);
                    setCurrentApiUrl(cleanUrl);
                    success('Backend URL saved!');
                    setConfigOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#701A28] hover:bg-[#58111A] text-white font-bold text-xs transition shadow-xs"
              >
                Save URL
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MANDATORY FIRST-LOGIN PASSWORD RESET MODAL */}
      <Modal
        isOpen={mustResetOpen}
        onClose={() => {}} // Non-dismissible until password reset
        title="🔒 Set New Password (First-Time Login)"
        subtitle="As a newly provisioned staff member, please update your temporary password to proceed."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFirstPasswordSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <p className="font-bold flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Security Requirement
            </p>
            <p className="mt-0.5 text-[11px] text-amber-800">
              Your account was created with a temporary password by the Administrator. Please set your own private password.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Current Temporary Password *
            </label>
            <input
              type="password"
              required
              value={firstPassForm.currentPassword}
              onChange={(e) =>
                setFirstPassForm({ ...firstPassForm, currentPassword: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Secure Password *</label>
            <input
              type="password"
              required
              value={firstPassForm.newPassword}
              onChange={(e) =>
                setFirstPassForm({ ...firstPassForm, newPassword: e.target.value })
              }
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={firstPassForm.confirmPassword}
              onChange={(e) =>
                setFirstPassForm({ ...firstPassForm, confirmPassword: e.target.value })
              }
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#701A28] hover:bg-[#58111A] rounded-xl transition shadow-xs disabled:opacity-60"
            >
              {resetLoading && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Save New Password & Enter Dashboard
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
