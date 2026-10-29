import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAcademyAuth } from './AcademyAuthContext';
import { UserRole } from './types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Loader2, ShieldCheck, LogOut, MessageCircle } from 'lucide-react';

interface AcademyProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AcademyProtectedRoute({ children, allowedRoles }: AcademyProtectedRouteProps) {
  const { user, profile, loading, signOut } = useAcademyAuth();
  const location = useLocation();

  if (loading) {
    return (
      <ScreenWrapper className="bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-gray-600">Verifying Academy Session...</p>
        </div>
      </ScreenWrapper>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/academy/login" state={{ from: location }} replace />;
  }

  if (profile.is_active === false || profile.is_approved === false) {
    const isPending = profile.is_active !== false && profile.is_approved === false;
    return (
      <ScreenWrapper className="bg-slate-50 flex items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${isPending ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
            <ShieldCheck size={30} />
          </div>
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-700">Inspire Business Academy</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {isPending ? 'Registration awaiting verification' : 'Student access is disabled'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            {isPending
              ? 'Your account has been created, but your student workspace will unlock after academy staff verify your roll number. If you are already enrolled, please contact the academy for approval.'
              : 'This student account is currently inactive. Please contact academy staff for help.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="https://wa.me/923093534289?text=Assalam-o-Alaikum%2C%20please%20verify%20my%20academy%20student%20portal%20account." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700">
              <MessageCircle size={16} /> Contact academy
            </a>
            <button type="button" onClick={() => void signOut()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const fallback = profile.role === 'admin' ? '/admin' : '/academy';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
