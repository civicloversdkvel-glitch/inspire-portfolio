import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InspireLogo } from '../components/InspireLogo';
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
  Hash,
  Award,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
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
    signInWithGoogle
  } = useAcademyAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useSafeBack('/home');

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(() => new URLSearchParams(location.search).get('mode') === 'register' || location.pathname === '/academy/register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [skill, setSkill] = useState<string>(ACADEMY_SKILLS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!loading && user && profile) {
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
          rollNo,
          skill,
          email,
          password
        });
        if (result.requiresEmailConfirmation) {
          setSuccessMessage('Your student account has been created. Please check your inbox (and Spam folder) for the Supabase confirmation email, then return here to sign in.');
          setMode('login');
          setPassword('');
        } else {
          setSuccessMessage('Your account is ready. Welcome to the Inspire Academy student portal.');
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      await signInWithGoogle(
        mode === 'register'
          ? { fullName, phone, rollNo, skill }
          : undefined
      );
    } catch (err: any) {
      setLocalError(err?.message || 'Google sign-in failed.');
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

        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-lg border-2 border-yellow-400/80 shrink-0 flex items-center justify-center overflow-hidden">
            <InspireLogo
              alt="The Inspire Business Academy Logo"
              className="w-full h-full object-contain"
            />
          </div>
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
            <span>Sign In</span>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Roll No / ID
                  </label>
                  <div className="relative">
                    <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={rollNo}
                      onChange={e => setRollNo(e.target.value)}
                      placeholder="IBA-101"
                      className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
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
                      className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
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
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {mode === 'reset'
                    ? 'Sending Reset Link...'
                    : mode === 'login'
                    ? 'Signing In...'
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
                <span>Sign In to Portal</span>
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
              ← Back to Sign In
            </button>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-gray-400">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs border border-gray-200 flex items-center justify-center gap-2 transition-colors"
          >
            <KeyRound size={15} className="text-blue-600" />
            <span>Continue with Google Account</span>
          </button>
        </form>
      </div>
    </ScreenWrapper>
  );
}
