import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAcademyAuth } from '../academy/AcademyAuthContext';
import { InspireLogo } from '../components/InspireLogo';
import { getTodayPKT, formatPKTDate, BOOTSTRAPPED_ADMIN_EMAILS } from '../academy/supabase';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Smartphone,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Loader2,
  Lock,
  AlertCircle,
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, authError, signOut } = useAcademyAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 text-yellow-400 animate-spin" />
        <p className="text-sm font-bold">Loading Inspire Admin Console...</p>
      </div>
    );
  }

  if (authError && (!user || !profile)) {
    return (
      <div className="h-[100dvh] w-full bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 space-y-4 text-center shadow-2xl">
          <AlertCircle size={36} className="text-red-400 mx-auto" />
          <h1 className="text-xl font-extrabold">Session Error</h1>
          <p className="text-xs text-slate-300 leading-relaxed">{authError}</p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-extrabold"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/admin/login', { replace: true });
              }}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (profile.role !== 'admin') {
    return (
      <div className="h-[100dvh] w-full bg-slate-900 text-white flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 space-y-4 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-extrabold">Admin Access Required</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            You are signed in as <strong>{profile.email}</strong> with role{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-700 text-amber-300">{profile.role}</code>.
            Only Academy Administrators can open <code className="text-amber-300">/admin</code>.
          </p>
          <div className="bg-slate-950 p-3.5 rounded-xl text-left border border-slate-700">
            <p className="text-xs text-slate-300">
              Access is restricted to authorized Inspire Business Academy administrators. Please sign in with an authorized administrator account or contact academy management for access.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/admin/login', { replace: true });
              }}
              className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-extrabold"
            >
              Admin Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/academy', { replace: true })}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold"
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/home', { replace: true })}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold"
            >
              Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { path: '/admin', label: 'Review & Requests', icon: LayoutDashboard, exact: true },
    { path: '/admin/students', label: 'Students Directory', icon: Users, exact: false },
    { path: '/admin/inquiries', label: 'Admission Inquiries', icon: MessageSquare, exact: false }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-blue-950 text-white border-r border-blue-900 shrink-0">
        <div className="p-5 border-b border-blue-900 flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-xl p-1 shadow-md border border-yellow-400/70 shrink-0 flex items-center justify-center overflow-hidden">
            <InspireLogo
              alt="The Inspire Business Academy Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-400">
              Admin Console
            </p>
            <h1 className="text-sm font-extrabold leading-tight">Inspire Academy</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map(item => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-yellow-400 text-blue-950 shadow-sm'
                    : 'text-blue-100 hover:bg-blue-900/70'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-blue-900/80 space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Switch View
            </p>
            <button
              type="button"
              onClick={() => navigate('/academy')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-200 hover:bg-blue-900/70"
            >
              <GraduationCap size={17} />
              <span>Student Portal (/academy)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-200 hover:bg-blue-900/70"
            >
              <Smartphone size={17} />
              <span>Phone App (/home)</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-blue-900 bg-blue-950/60">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{profile.full_name}</p>
              <p className="text-[10px] text-blue-300 truncate">{profile.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg bg-blue-900 hover:bg-red-600 text-white transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-blue-950 text-white h-full flex flex-col z-10">
            <div className="p-4 border-b border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white rounded-lg p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                  <InspireLogo
                    alt="The Inspire Business Academy Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider">
                  Inspire Admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-blue-900"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-3 space-y-1">
              {navLinks.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-blue-100 hover:bg-blue-900"
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  navigate('/academy');
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-blue-200 hover:bg-blue-900"
              >
                <GraduationCap size={17} />
                <span>Student Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/home');
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-blue-200 hover:bg-blue-900"
              >
                <Smartphone size={17} />
                <span>Phone App (/home)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-sm lg:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-700" />
                <span>The Inspire Business Academy — Admin Review Portal</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Asia/Karachi (PKT) Today: <strong>{formatPKTDate(getTodayPKT())}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Phone App</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
