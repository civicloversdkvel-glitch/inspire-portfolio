import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InspireLogo } from '../components/InspireLogo';
import { ArrowLeft, LockKeyhole, LogIn } from 'lucide-react';
import { useSafeBack } from '../lib/utils';

export function PublicPortfolioPortal() {
  const navigate = useNavigate();
  const goBack = useSafeBack('/home');

  return (
    <ScreenWrapper className="min-h-[75vh] bg-slate-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-blue-950"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-blue-950 px-7 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-yellow-400 bg-white p-2 shadow-lg">
              <InspireLogo
                alt="The Inspire Business Academy Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-yellow-400">
              The Inspire Business Academy
            </p>
            <h1 className="text-2xl font-extrabold">Student Portal</h1>
            <p className="mt-2 text-sm leading-relaxed text-blue-100">
              Log in to access your personal student workspace, assignments, and projects.
            </p>
          </div>

          <div className="space-y-5 px-7 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
              <LockKeyhole size={26} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Students Only</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Sign in with your registered email address and password to enter your own secure portal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/academy/login')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <LogIn size={18} />
              Student Log In
            </button>
            <p className="text-xs text-slate-400">
              Your personal student information is visible only after login.
            </p>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
