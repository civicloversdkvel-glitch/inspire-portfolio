import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';

// Public Website Screens
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicHome } from './screens/public/PublicHome';
import { PublicAbout } from './screens/public/PublicAbout';
import { PublicCourses } from './screens/public/PublicCourses';
import { PublicSkills } from './screens/public/PublicSkills';
import { PublicAnnouncements } from './screens/public/PublicAnnouncements';
import { PublicContact } from './screens/public/PublicContact';

// Offline & Productivity Screens
import { Splash } from './screens/Splash';
import { Skills } from './screens/Skills';
import { Tasks } from './screens/Tasks';
import { Reports } from './screens/Reports';
import { Portfolio } from './screens/Portfolio';
import { Targets } from './screens/Targets';
import { DailyReportForm } from './screens/DailyReportForm';
import { WeeklyReportForm } from './screens/WeeklyReportForm';
import { MonthlyReportForm } from './screens/MonthlyReportForm';
import { ReportHistory } from './screens/ReportHistory';
import { Learning } from './screens/Learning';
import { Settings } from './screens/Settings';
import { Courses } from './screens/Courses';
import { CourseDetail } from './screens/CourseDetail';
import { Games } from './screens/Games';
import { QuizBattle } from './screens/games/QuizBattle';
import { PuzzleChallenge } from './screens/games/PuzzleChallenge';
import { MemoryGame } from './screens/games/MemoryGame';
import { EnemyShooter } from './screens/games/EnemyShooter';
import { BubbleShooter } from './screens/games/BubbleShooter';
import { Profile } from './screens/Profile';
import { Search } from './screens/Search';
import { ShortcutVault } from './screens/ShortcutVault';
import { Chatbot } from './screens/Chatbot';
import { setupNotifications } from './lib/notifications';

// Academy Student & Admin Portal Modules
import { AcademyAuthProvider, useAcademyAuth } from './academy/AcademyAuthContext';
import { AcademyProtectedRoute } from './academy/AcademyProtectedRoute';
import { AcademyLogin } from './academy/AcademyLogin';
import { AcademyHub } from './academy/AcademyHub';
import { SubmitWork } from './academy/SubmitWork';
import { MySubmissions } from './academy/MySubmissions';
import { AcademyProfile } from './academy/AcademyProfile';
import { PublicPortfolioPortal } from './academy/PublicPortfolioPortal';
import { StudentAttendance } from './academy/StudentAttendance';
import { StudentNotifications } from './academy/StudentNotifications';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminStudents } from './admin/AdminStudents';
import { AdminStudentDetail } from './admin/AdminStudentDetail';
import { AdminInquiries } from './admin/AdminInquiries';

import {
  GraduationCap,
  ShieldCheck,
  CheckSquare,
  BarChart2,
  Briefcase,
  Target,
  BookOpen,
  Gamepad2,
  Command,
  Bot,
  Settings as SettingsIcon,
  Home as HomeIcon,
  User,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useTasksViewModel } from './store/useTasksViewModel';

// Public Layout Wrapper for the Main Website
function PublicSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

// Student Portal App Bar for student modules (/tasks, /reports, /learning, etc.)
function StudentPortalShell({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const navigate = useNavigate();
  const { streak } = useTasksViewModel();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Top Portal Bar */}
      <header className="sticky top-0 z-40 bg-blue-950 text-white border-b border-blue-900 px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/academy')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Student Portal</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold leading-tight">
              {title || 'Inspire Business Academy Student Workspace'}
            </h1>
            {subtitle && <p className="text-[11px] text-blue-200">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="bg-amber-400/20 text-yellow-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Flame size={14} className="fill-yellow-400" />
              <span>{streak} Day Streak</span>
            </div>
          )}
          <Link
            to="/"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
          >
            Public Site
          </Link>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2 overflow-x-auto no-scrollbar flex items-center gap-1 sm:gap-2 text-xs font-bold">
        {[
          { label: 'Portal Hub', path: '/academy', icon: GraduationCap },
          { label: 'Daily Tasks', path: '/tasks', icon: CheckSquare },
          { label: 'Reports Hub', path: '/reports', icon: BarChart2 },
          { label: 'Targets', path: '/targets', icon: Target },
          { label: 'Courses', path: '/courses', icon: BookOpen },
          { label: 'Learning Guide', path: '/learning', icon: BookOpen },
          { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
          { label: '5 Games', path: '/games', icon: Gamepad2 },
          { label: 'Shortcuts', path: '/shortcuts', icon: Command },
          { label: 'AI Advisor', path: '/chatbot', icon: Bot },
          { label: 'Profile', path: '/profile', icon: User },
          { label: 'Backup', path: '/settings', icon: SettingsIcon },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="px-3 py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <item.icon size={15} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

function NotFoundScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md max-w-sm w-full space-y-4">
        <p className="text-4xl font-black text-blue-950">404</p>
        <h2 className="text-lg font-bold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested page does not exist or may have been updated.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
          >
            Return to Homepage
          </button>
          <button
            type="button"
            onClick={() => navigate('/academy', { replace: true })}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
          >
            Open Student Portal
          </button>
        </div>
      </div>
    </div>
  );
}

// Ensure HashRouter direct URL support
if (typeof window !== 'undefined') {
  const pathname = window.location.pathname;
  if (pathname && pathname !== '/' && !window.location.hash) {
    const search = window.location.search || '';
    window.location.replace(`${window.location.origin}/#${pathname}${search}`);
  } else if (window.location.hash && !window.location.hash.startsWith('#/')) {
    window.location.hash = '#/' + window.location.hash.slice(1);
  }
}

function AppContainer() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname === '/admin' ||
    location.pathname.startsWith('/admin/') ||
    (typeof window !== 'undefined' &&
      (window.location.hash === '#/admin' || window.location.hash.startsWith('#/admin/')));

  return (
    <Routes>
      {/* 1. PUBLIC WEBSITE ROUTES */}
      <Route
        path="/"
        element={
          <PublicSiteLayout>
            <PublicHome />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/home"
        element={
          <PublicSiteLayout>
            <PublicHome />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicSiteLayout>
            <PublicAbout />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/courses"
        element={
          <PublicSiteLayout>
            <PublicCourses />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/skills-info"
        element={
          <PublicSiteLayout>
            <PublicSkills />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/announcements"
        element={
          <PublicSiteLayout>
            <PublicAnnouncements />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicSiteLayout>
            <PublicContact />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/apply"
        element={
          <PublicSiteLayout>
            <PublicContact />
          </PublicSiteLayout>
        }
      />
      <Route
        path="/public-portfolio"
        element={
          <PublicSiteLayout>
            <PublicPortfolioPortal />
          </PublicSiteLayout>
        }
      />

      {/* 2. ACADEMY AUTH & STUDENT PORTAL ROUTES */}
      <Route path="/login" element={<Navigate to="/academy/login" replace />} />
      <Route path="/academy/login" element={<AcademyLogin />} />

      <Route
        path="/academy"
        element={
          <AcademyProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentPortalShell title="Student Hub & Assignment Dashboard">
              <AcademyHub />
            </StudentPortalShell>
          </AcademyProtectedRoute>
        }
      />
      <Route
        path="/academy/submit"
        element={
          <AcademyProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentPortalShell title="Upload Daily Assignment / Portfolio">
              <SubmitWork />
            </StudentPortalShell>
          </AcademyProtectedRoute>
        }
      />
      <Route
        path="/academy/submissions"
        element={
          <AcademyProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentPortalShell title="My Submissions & Admin Feedback">
              <MySubmissions />
            </StudentPortalShell>
          </AcademyProtectedRoute>
        }
      />
      <Route
        path="/academy/profile"
        element={
          <AcademyProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentPortalShell title="Student Identity & Verified Credentials">
              <AcademyProfile />
            </StudentPortalShell>
          </AcademyProtectedRoute>
        }
      />
      <Route
        path="/academy/attendance"
        element={
          <AcademyProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentPortalShell title="Attendance Register (PKT)">
              <StudentAttendance />
            </StudentPortalShell>
          </AcademyProtectedRoute>
        }
      />
      <Route
        path="/academy/notifications"
        element={
          <AcademyProtectedRoute allowedRoles={['student', 'admin']}>
            <StudentPortalShell title="Announcements & Notification Feed">
              <StudentNotifications />
            </StudentPortalShell>
          </AcademyProtectedRoute>
        }
      />

      {/* 3. STUDENT PRODUCTIVITY & LEARNING TOOLS */}
      <Route
        path="/tasks"
        element={
          <StudentPortalShell title="Daily Productivity Targets & Tasks">
            <Tasks />
          </StudentPortalShell>
        }
      />
      <Route
        path="/reports"
        element={
          <StudentPortalShell title="Performance Analytics & Reports">
            <Reports />
          </StudentPortalShell>
        }
      />
      <Route
        path="/reports/daily"
        element={
          <StudentPortalShell title="File Daily Activity Report">
            <DailyReportForm />
          </StudentPortalShell>
        }
      />
      <Route
        path="/reports/weekly"
        element={
          <StudentPortalShell title="Weekly Reflection Report">
            <WeeklyReportForm />
          </StudentPortalShell>
        }
      />
      <Route
        path="/reports/monthly"
        element={
          <StudentPortalShell title="Monthly Assessment & Milestones">
            <MonthlyReportForm />
          </StudentPortalShell>
        }
      />
      <Route
        path="/reports/history"
        element={
          <StudentPortalShell title="Report Submission History">
            <ReportHistory />
          </StudentPortalShell>
        }
      />
      <Route
        path="/targets"
        element={
          <StudentPortalShell title="Core Productivity & Revenue Targets">
            <Targets />
          </StudentPortalShell>
        }
      />
      <Route
        path="/learning"
        element={
          <StudentPortalShell title="Inspire Learning Guides & Rules">
            <Learning />
          </StudentPortalShell>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <StudentPortalShell title="Interactive Course Topics & Modules">
            <CourseDetail />
          </StudentPortalShell>
        }
      />
      <Route
        path="/portfolio"
        element={
          <StudentPortalShell title="Local Portfolio Workspace">
            <Portfolio />
          </StudentPortalShell>
        }
      />
      <Route
        path="/games"
        element={
          <StudentPortalShell title="Interactive Learning Games">
            <Games />
          </StudentPortalShell>
        }
      />
      <Route
        path="/games/quiz"
        element={
          <StudentPortalShell title="Quiz Battle">
            <QuizBattle />
          </StudentPortalShell>
        }
      />
      <Route
        path="/games/puzzle"
        element={
          <StudentPortalShell title="Workflow Puzzle Challenge">
            <PuzzleChallenge />
          </StudentPortalShell>
        }
      />
      <Route
        path="/games/memory"
        element={
          <StudentPortalShell title="Memory Brain Match">
            <MemoryGame />
          </StudentPortalShell>
        }
      />
      <Route
        path="/games/shooter"
        element={
          <StudentPortalShell title="Enemy Target Shooter">
            <EnemyShooter />
          </StudentPortalShell>
        }
      />
      <Route
        path="/games/bubble"
        element={
          <StudentPortalShell title="Bubble Popper Challenge">
            <BubbleShooter />
          </StudentPortalShell>
        }
      />
      <Route
        path="/shortcuts"
        element={
          <StudentPortalShell title="133 Shortcut Vault">
            <ShortcutVault />
          </StudentPortalShell>
        }
      />
      <Route
        path="/chatbot"
        element={
          <StudentPortalShell title="Academic AI Advisor (Gemini 4 Argon)">
            <Chatbot />
          </StudentPortalShell>
        }
      />
      <Route
        path="/search"
        element={
          <StudentPortalShell title="Global Academy Search">
            <Search />
          </StudentPortalShell>
        }
      />
      <Route
        path="/profile"
        element={
          <StudentPortalShell title="Student Profile">
            <Profile />
          </StudentPortalShell>
        }
      />
      <Route
        path="/skills"
        element={
          <StudentPortalShell title="Skill Selection Onboarding">
            <Skills />
          </StudentPortalShell>
        }
      />
      <Route
        path="/settings"
        element={
          <StudentPortalShell title="Backup & Restore System">
            <Settings />
          </StudentPortalShell>
        }
      />

      {/* 4. ADMIN CONSOLE ROUTES */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminLayout>
            <AdminStudents />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <AdminLayout>
            <AdminStudentDetail />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/inquiries"
        element={
          <AdminLayout>
            <AdminInquiries />
          </AdminLayout>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <PublicSiteLayout>
            <NotFoundScreen />
          </PublicSiteLayout>
        }
      />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <AcademyAuthProvider>
      <HashRouter>
        <AppContainer />
      </HashRouter>
    </AcademyAuthProvider>
  );
}

