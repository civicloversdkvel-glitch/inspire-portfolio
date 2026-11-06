import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { useAcademyAuth } from './AcademyAuthContext';
import { ACADEMY_SKILLS } from './types';
import { getSupabaseConfigError, isSupabaseConfigured } from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  Phone,
  Award,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  LogIn
} from 'lucide-react';

export function AcademyLogin() {
  const {
    user,
    profile,
    loading,
    authError,
    signInWithEmail,
    registerStudent,
    resetPassword,
    signOut
  } = useAcademyAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useSafeBack('/home');

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(() => new URLSearchParams(location.search).get('mode') === 'register' || location.pathname === '/academy/register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState<string>(ACADEMY_SKILLS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!loading && user && profile && profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (!loading && user && profile && location.pathname !== '/academy/register') {
    const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
    const requestedPath = fromState?.pathname
      ? `${fromState.pathname}${fromState.search || ''}`
      : null;

    let destination = '/academy';
    if (
      requestedPath &&
      requestedPath !== '/academy/login' &&
      requestedPath !== '/login' &&
      !requestedPath.startsWith('/admin')
    ) {
      destination = requestedPath;
    }
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && user && profile) {
      setLocalError('Please sign out of the currently active account before creating a new student registration.');
      return;
    }
    setLocalError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMessage('Password reset instructions have been sent to your email address.');
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          setLocalError('Please enter your email and password.');
          setSubmitting(false);
          return;
        }
        await signInWithEmail(email, password);
      } else {
        const result = await registerStudent({
          fullName,
          phone,
          skill,
          email,
          password
        });
        if (result.requiresEmailConfirmation) {
          setSuccessMessage('Your student account has been created. Confirm your email, then wait for academy staff to review and approve your account.');
          setMode('login');
          setPassword('');
        } else {
          setSuccessMessage('Registration complete. Your account is waiting for academy staff approval. The academy will assign your roll number.');
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const configError = !isSupabaseConfigured ? getSupabaseConfigError() : null;
  const displayError = localError || authError || configError;

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      <div className="bg-blue-900 text-white pt-8 pb-6 px-6 rounded-b-[2rem] shadow-md relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={20} />
            <span>Back to App</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
          >
            Offline Mode
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          <AnimatedLogo size="hero" className="shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">
              Academy Student Workspace
            </p>
            <h1 className="text-xl font-bold leading-tight">Inspire Academy Cloud</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 bg-gray-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login' || mode === 'reset'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LogIn size={15} />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserPlus size={15} />
            <span>Student Registration</span>
          </button>
        </div>

        {location.pathname === '/academy/register' && user && profile && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-2 text-amber-950">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-extrabold">An account is already signed in</p>
                <p className="mt-1 text-xs leading-relaxed">To keep the principal/admin account separate, sign out first. You will stay on this student registration page.</p>
              </div>
            </div>
            <button type="button" onClick={() => void signOut()} className="w-full rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-800">Sign out and continue registration</button>
          </div>
        )}

        {displayError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
        >
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Student Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Muhammad Ali"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  WhatsApp / Phone
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Enrolled Skill *
                </label>
                <div className="relative">
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={skill}
                    onChange={e => setSkill(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-600"
                  >
                    {ACADEMY_SKILLS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@inspireacademy.pk"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setLocalError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={mode === 'register' ? 8 : 6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading || (mode === 'register' && Boolean(user && profile))}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {mode === 'reset'
                    ? 'Sending Reset Link...'
                    : mode === 'login'
                    ? 'Logging In...'
                    : 'Creating Account...'}
                </span>
              </>
            ) : mode === 'reset' ? (
              <>
                <Mail size={16} />
                <span>Send Password Reset Email</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Log In to Student Portal</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Register Student Account</span>
              </>
            )}
          </button>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
                setSuccessMessage(null);
              }}
              className="w-full py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              ← Back to Log In
            </button>
          )}


        </form>
      </div>
    </ScreenWrapper>
  );
}
