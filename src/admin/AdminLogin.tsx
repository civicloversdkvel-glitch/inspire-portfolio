import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { useAcademyAuth } from '../academy/AcademyAuthContext';
import {
  getSupabaseConfigError,
  isBootstrappedAdminEmail,
  isSupabaseConfigured
} from '../academy/supabase';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export function AdminLogin() {
  const {
    user,
    profile,
    loading,
    authError,
    signInWithEmail,
    resetPassword,
    signOut
  } = useAcademyAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-950 text-white flex flex-col items-center justify-center gap-3 p-6">
        <Loader2 className="w-9 h-9 text-yellow-400 animate-spin" />
        <p className="text-sm font-bold text-slate-200">Verifying Administrator Session...</p>
      </div>
    );
  }

  // If authenticated as an authorized admin, redirect directly to the Admin Dashboard
  if (user && profile && profile.role === 'admin') {
    const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
    const requestedPath = fromState?.pathname
      ? `${fromState.pathname}${fromState.search || ''}`
      : null;

    const destination =
      requestedPath && requestedPath.startsWith('/admin') && requestedPath !== '/admin/login'
        ? requestedPath
        : '/admin';

    return <Navigate to={destination} replace />;
  }

  // If authenticated as a student (non-admin), strictly block admin portal access
  if (user && profile && profile.role !== 'admin') {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-5 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Lock size={28} />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              Restricted Portal
            </p>
            <h1 className="text-xl font-extrabold">Admin Authorization Required</h1>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You are currently signed in as <strong>{profile.email}</strong> with a{' '}
            <span className="text-amber-300 font-bold">Student</span> account. Students and public
            visitors are not permitted to access the Inspire Business Academy Admin Portal.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setLocalError(null);
              }}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={15} />
              <span>Sign Out & Use Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/academy', { replace: true })}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Return to Student Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSuccess(null);
    setSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (mode === 'reset') {
        await resetPassword(cleanEmail);
        setResetSuccess('Password reset instructions have been sent to your admin email.');
      } else {
        if (!cleanEmail || !password) {
          setLocalError('Please enter your administrator email and password.');
          setSubmitting(false);
          return;
        }
        await signInWithEmail(cleanEmail, password);
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Admin authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };



  const configError = !isSupabaseConfigured ? getSupabaseConfigError() : null;
  const displayError = localError || authError || configError;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-md w-full mx-auto my-auto space-y-6 py-6">
        {/* Top Brand Header */}
        <div className="bg-blue-950/90 border border-blue-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-yellow-400 flex items-center gap-1.5">
              <ShieldCheck size={15} />
              <span>Dedicated Admin Portal</span>
            </span>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Main Website</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <AnimatedLogo size="hero" className="shrink-0" />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                THE INSPIRE BUSINESS ACADEMY
              </h1>
              <p className="text-xs text-blue-200 mt-1">
                Administrator Sign-In & Review Console
              </p>
            </div>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {displayError && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-700/80 flex items-start gap-2.5 text-red-200 text-xs">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {resetSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 flex items-start gap-2.5 text-emerald-200 text-xs font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{resetSuccess}</span>
          </div>
        )}

        {/* Admin Sign-In Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
        >
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-extrabold text-white">
              {mode === 'reset' ? 'Reset Administrator Password' : 'Administrator Credentials'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Authorized staff and academy owners only. Student registration is disabled here.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Email Address *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="theinspirebusinessacademy@gmail.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-yellow-400"
              />
            </div>
            {email.trim() && !isBootstrappedAdminEmail(email) && (
              <p className="text-[11px] text-amber-400 mt-1.5">
                Note: Only authorized admin emails or registered admin UIDs can access /admin.
              </p>
            )}
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setLocalError(null);
                    setResetSuccess(null);
                  }}
                  className="text-[11px] font-bold text-yellow-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{mode === 'reset' ? 'Sending Reset Link...' : 'Verifying Admin...'}</span>
              </>
            ) : mode === 'reset' ? (
              <>
                <Mail size={16} />
                <span>Send Password Reset Email</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In to Admin Console</span>
              </>
            )}
          </button>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
                setResetSuccess(null);
              }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              ← Back to Admin Sign In
            </button>
          )}

        </form>


      </div>
    </div>
  );
}
