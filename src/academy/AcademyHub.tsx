import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InspireLogo } from '../components/InspireLogo';
import { useAcademyAuth } from './AcademyAuthContext';
import {
  fetchPublishedAnnouncements,
  fetchPublishedAssignments,
  fetchStudentSubmissions
} from './academyApi';
import { AnnouncementRecord, AssignmentRecord, SubmissionRecord } from './types';
import { getTodayPKT, formatPKTDate, computePKTStreak } from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  UploadCloud,
  FolderKanban,
  FileCheck2,
  UserCheck,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  Calendar,
  Briefcase,
  Loader2,
  CalendarCheck2,
  Megaphone,
  Award
} from 'lucide-react';

export function AcademyHub() {
  const navigate = useNavigate();
  const goBack = useSafeBack('/home');
  const { profile, signOut } = useAcademyAuth();

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const todayPKT = getTodayPKT();

  useEffect(() => {
    if (!profile) return;
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [subs, asgs, anns] = await Promise.all([
          fetchStudentSubmissions(profile.id),
          fetchPublishedAssignments(),
          fetchPublishedAnnouncements().catch(() => [])
        ]);
        if (!active) return;
        setSubmissions(subs);
        setAssignments(asgs);
        setAnnouncements(anns);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Failed to load student portal data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [profile]);

  const submittedToday = useMemo(
    () => submissions.some(s => s.submission_date === todayPKT),
    [submissions, todayPKT]
  );

  const streak = useMemo(
    () => computePKTStreak(submissions.map(s => s.submission_date)),
    [submissions]
  );

  const avgRating = useMemo(() => {
    const rated = submissions.filter(s => s.status === 'reviewed' && s.rating && s.rating > 0);
    if (!rated.length) return 0;
    const sum = rated.reduce((acc, s) => acc + (s.rating || 0), 0);
    return Number((sum / rated.length).toFixed(1));
  }, [submissions]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/academy/login', { replace: true });
  };

  if (!profile) return null;

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-900 text-white pt-8 pb-6 px-6 rounded-b-[2rem] shadow-lg relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={20} />
            <span>Offline App</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-white rounded-2xl p-1 shadow-md border-2 border-yellow-400/80 shrink-0 flex items-center justify-center overflow-hidden">
              <InspireLogo
                alt="The Inspire Business Academy Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-800 text-yellow-300 text-[10px] font-bold uppercase tracking-wider truncate max-w-full">
                {profile.skill} {profile.roll_no ? `• ${profile.roll_no}` : ''}
              </span>
              <h1 className="text-lg font-bold mt-1 truncate">{profile.full_name}</h1>
              <p className="text-xs text-blue-200 mt-0.5">
                PKT Date: {formatPKTDate(todayPKT)}
              </p>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="flex items-center justify-center gap-1 text-yellow-400 font-extrabold text-base">
              <Flame size={16} />
              <span>{streak}d</span>
            </div>
            <p className="text-[10px] text-blue-100 uppercase font-semibold">PKT Streak</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Today PKT Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            submittedToday
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {submittedToday ? (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            ) : (
              <Clock size={24} className="text-amber-600 shrink-0" />
            )}
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider">
                {submittedToday ? "Today's Work Uploaded (PKT)" : "Today's Upload Pending (PKT)"}
              </h2>
              <p className="text-xs mt-0.5 opacity-85">
                {submittedToday
                  ? 'Great job! You have submitted work for today.'
                  : 'Upload your daily assignment or portfolio file before midnight PKT.'}
              </p>
            </div>
          </div>
          {!submittedToday && (
            <button
              type="button"
              onClick={() => navigate('/academy/submit?type=assignment')}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0"
            >
              Upload
            </button>
          )}
        </div>

        {/* Summary KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-lg font-extrabold text-gray-900">{submissions.length}</p>
            <p className="text-[10px] font-bold uppercase text-gray-400 mt-0.5">Total Uploads</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-lg font-extrabold text-emerald-600">
              {submissions.filter(s => s.status === 'reviewed').length}
            </p>
            <p className="text-[10px] font-bold uppercase text-gray-400 mt-0.5">Reviewed</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-lg font-extrabold text-amber-500 flex items-center justify-center gap-1">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span>{avgRating > 0 ? avgRating : '—'}</span>
            </p>
            <p className="text-[10px] font-bold uppercase text-gray-400 mt-0.5">Avg Rating</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/academy/submit?type=assignment')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2.5 text-left hover:border-blue-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Daily Assignment</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Upload file + description</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/academy/submit?type=portfolio')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2.5 text-left hover:border-purple-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Portfolio Upload</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Showcase & practice files</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/academy/submissions')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2.5 text-left hover:border-emerald-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FolderKanban size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">My Submissions</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Ratings, feedback & delete requests</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/academy/profile')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2.5 text-left hover:border-amber-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Student Identity</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">ID card & account details</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/academy/attendance')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2.5 text-left hover:border-teal-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <CalendarCheck2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Attendance (PKT)</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">14-day log & streak rate</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/academy/notifications')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-2.5 text-left hover:border-indigo-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Announcements</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {announcements.length > 0 ? `${announcements.length} academy notices` : 'Notices & review alerts'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/public-portfolio')}
            className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-3 text-left hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-yellow-400 flex items-center justify-center shadow-sm shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-xs">Public Portfolio Showcase & Verification</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Browse approved student portfolios & verify student IDs
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Published Assignments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <FileCheck2 size={15} className="text-blue-600" />
              <span>Active Assignments</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-600">{assignments.length} Published</span>
          </div>

          {loading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">
              No specific assignment posted yet. You can still upload your daily practice or portfolio work anytime!
            </p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 4).map(asg => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {asg.skill}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 mt-1">{asg.title}</h4>
                    {asg.description && (
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{asg.description}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Due: {formatPKTDate(asg.due_date)} (PKT)</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/academy/submit?type=assignment&assignmentId=${encodeURIComponent(asg.id)}`)
                    }
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shrink-0"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}
