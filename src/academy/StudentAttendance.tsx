import { useEffect, useState, useMemo } from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAcademyAuth } from './AcademyAuthContext';
import { fetchStudentAttendance, fetchStudentSubmissions } from './academyApi';
import { AttendanceRecord, SubmissionRecord } from './types';
import {
  computePKTStreak,
  formatPKTDate,
  getPKTDateDaysAgo,
  getTodayPKT
} from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Flame,
  Loader2
} from 'lucide-react';

export function StudentAttendance() {
  const goBack = useSafeBack('/academy');
  const { profile } = useAcademyAuth();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [attList, subList] = await Promise.all([
          fetchStudentAttendance(profile.id),
          fetchStudentSubmissions(profile.id)
        ]);
        if (!active) return;
        setAttendance(attList);
        setSubmissions(subList);
      } catch (err: any) {
        if (active) setError(err?.message || 'Could not load attendance records.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [profile?.id]);

  // Build 14-day PKT attendance calendar combining Admin-marked records + Daily Submission activity
  const last14Days = useMemo(() => {
    const subDates = new Set(submissions.map(s => s.submission_date));
    const attByDate = new Map(attendance.map(a => [a.attendance_date, a]));

    const days: {
      date: string;
      status: 'present' | 'late' | 'absent' | 'excused' | 'submitted' | 'unmarked';
      note: string;
      hasSubmission: boolean;
    }[] = [];

    for (let i = 0; i < 14; i++) {
      const d = getPKTDateDaysAgo(i);
      const explicit = attByDate.get(d);
      const hasSub = subDates.has(d);

      if (explicit) {
        days.push({
          date: d,
          status: explicit.status,
          note: explicit.note,
          hasSubmission: hasSub
        });
      } else if (hasSub) {
        days.push({
          date: d,
          status: 'submitted',
          note: 'Auto-logged via daily work upload',
          hasSubmission: true
        });
      } else {
        days.push({
          date: d,
          status: 'unmarked',
          note: d === getTodayPKT() ? 'Upload today to log attendance' : 'No upload recorded',
          hasSubmission: false
        });
      }
    }

    return days;
  }, [attendance, submissions]);

  const stats = useMemo(() => {
    const presentCount = last14Days.filter(
      d => d.status === 'present' || d.status === 'submitted' || d.status === 'late'
    ).length;
    const rate = Math.round((presentCount / 14) * 100);
    const streak = computePKTStreak([
      ...submissions.map(s => s.submission_date),
      ...attendance.filter(a => a.status === 'present').map(a => a.attendance_date)
    ]);
    return { presentCount, rate, streak };
  }, [last14Days, submissions, attendance]);

  if (!profile) return null;

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Attendance & Activity</h1>
            <p className="text-xs text-blue-200">Daily PKT Attendance & Submission Log</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 text-center">
            <p className="text-lg font-extrabold text-yellow-400">{stats.rate}%</p>
            <p className="text-[10px] text-blue-100 uppercase font-semibold">14d Rate</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 text-center">
            <p className="text-lg font-extrabold text-emerald-300">{stats.presentCount}/14</p>
            <p className="text-[10px] text-blue-100 uppercase font-semibold">Active Days</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 text-center">
            <p className="text-lg font-extrabold text-orange-300 flex items-center justify-center gap-1">
              <Flame size={15} />
              <span>{stats.streak}d</span>
            </p>
            <p className="text-[10px] text-blue-100 uppercase font-semibold">PKT Streak</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <CalendarCheck2 size={15} className="text-blue-600" />
                <span>Last 14 Days (Asia/Karachi PKT)</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {last14Days.map(day => {
                const badge =
                  day.status === 'present' || day.status === 'submitted'
                    ? {
                        label: day.status === 'present' ? 'Present' : 'Present (Uploaded)',
                        cls: 'text-emerald-700 bg-emerald-50',
                        icon: CheckCircle2
                      }
                    : day.status === 'late'
                    ? {
                        label: 'Late',
                        cls: 'text-amber-700 bg-amber-50',
                        icon: Clock
                      }
                    : day.status === 'excused'
                    ? {
                        label: 'Excused',
                        cls: 'text-blue-700 bg-blue-50',
                        icon: Clock
                      }
                    : day.status === 'absent'
                    ? {
                        label: 'Absent',
                        cls: 'text-red-700 bg-red-50',
                        icon: XCircle
                      }
                    : {
                        label: 'No Record',
                        cls: 'text-gray-500 bg-gray-100',
                        icon: Clock
                      };

                const Icon = badge.icon;

                return (
                  <div
                    key={day.date}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {formatPKTDate(day.date)}
                        {day.date === getTodayPKT() ? ' (Today)' : ''}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{day.note}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ${badge.cls}`}
                    >
                      <Icon size={12} />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
}
