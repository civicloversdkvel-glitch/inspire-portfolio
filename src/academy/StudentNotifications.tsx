import { useEffect, useState, useMemo } from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAcademyAuth } from './AcademyAuthContext';
import {
  fetchPublishedAnnouncements,
  fetchStudentDeleteRequests,
  fetchStudentPublicPortfolios,
  fetchStudentSubmissions
} from './academyApi';
import {
  AnnouncementRecord,
  DeleteRequestRecord,
  PublicPortfolioRecord,
  SubmissionRecord
} from './types';
import { formatPKTDateTime } from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  Bell,
  Megaphone,
  Star,
  CheckCircle2,
  AlertTriangle,
  Award,
  Loader2
} from 'lucide-react';

export function StudentNotifications() {
  const goBack = useSafeBack('/academy');
  const { profile } = useAcademyAuth();

  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequestRecord[]>([]);
  const [publicPortfolios, setPublicPortfolios] = useState<PublicPortfolioRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [anns, subs, reqs, pubs] = await Promise.all([
          fetchPublishedAnnouncements(),
          fetchStudentSubmissions(profile.id),
          fetchStudentDeleteRequests(profile.id),
          fetchStudentPublicPortfolios(profile.id)
        ]);
        if (!active) return;
        setAnnouncements(anns);
        setSubmissions(subs);
        setDeleteRequests(reqs);
        setPublicPortfolios(pubs);
      } catch {
        // ignore non-critical error
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [profile?.id]);

  const relevantAnnouncements = useMemo(() => {
    if (!profile) return announcements;
    return announcements.filter(
      a => a.target_skill === 'All' || a.target_skill === profile.skill
    );
  }, [announcements, profile]);

  const personalAlerts = useMemo(() => {
    const list: {
      id: string;
      title: string;
      detail: string;
      timestamp: string;
      type: 'review' | 'showcase' | 'delete_req';
    }[] = [];

    for (const sub of submissions) {
      if (sub.status === 'reviewed' || sub.status === 'needs_revision') {
        list.push({
          id: `rev_${sub.id}`,
          title:
            sub.status === 'reviewed'
              ? `Work Reviewed: "${sub.title}"`
              : `Revision Requested: "${sub.title}"`,
          detail: `${sub.rating ? `${sub.rating}★ Rating · ` : ''}${
            sub.marks !== null ? `Marks: ${sub.marks}/${sub.max_marks}` : ''
          }${sub.feedback ? ` — "${sub.feedback}"` : ''}`,
          timestamp: sub.reviewed_at || sub.updated_at || sub.submitted_at,
          type: 'review'
        });
      }
    }

    for (const pub of publicPortfolios) {
      if (pub.is_public) {
        list.push({
          id: `pub_${pub.id}`,
          title: `Approved for Public Portfolio: "${pub.title}"`,
          detail: pub.is_featured
            ? 'Featured on the Inspire Academy Public Visitor Showcase!'
            : 'Now live on the Inspire Academy Public Visitor Showcase.',
          timestamp: pub.updated_at || pub.created_at,
          type: 'showcase'
        });
      }
    }

    for (const req of deleteRequests) {
      if (req.status !== 'pending') {
        list.push({
          id: `del_${req.id}`,
          title: `Delete Request ${req.status === 'approved' ? 'Approved' : 'Rejected'}: "${
            req.submission_title
          }"`,
          detail: req.admin_note || `Status: ${req.status}`,
          timestamp: req.resolved_at || req.updated_at || req.created_at,
          type: 'delete_req'
        });
      }
    }

    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [submissions, publicPortfolios, deleteRequests]);

  if (!profile) return null;

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Announcements & Alerts</h1>
            <p className="text-xs text-blue-200">
              Academy notices, grading updates & portfolio approvals
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Academy Announcements */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Megaphone size={15} className="text-blue-600" />
                <span>Academy Announcements ({relevantAnnouncements.length})</span>
              </h2>

              {relevantAnnouncements.length === 0 ? (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 text-xs text-gray-500">
                  No new academy announcements at this time.
                </div>
              ) : (
                relevantAnnouncements.map(ann => (
                  <div
                    key={ann.id}
                    className={`rounded-2xl p-4 border shadow-sm space-y-1.5 ${
                      ann.priority === 'urgent'
                        ? 'bg-red-50/70 border-red-200'
                        : ann.priority === 'important'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span
                        className={
                          ann.priority === 'urgent'
                            ? 'text-red-700 uppercase'
                            : ann.priority === 'important'
                            ? 'text-amber-700 uppercase'
                            : 'text-blue-700 uppercase'
                        }
                      >
                        {ann.priority} · {ann.target_skill}
                      </span>
                      <span className="text-gray-400 font-normal">
                        {formatPKTDateTime(ann.created_at)}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-gray-900">{ann.title}</h3>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {ann.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Personal Notifications */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Bell size={15} className="text-emerald-600" />
                <span>My Review & Portfolio Updates ({personalAlerts.length})</span>
              </h2>

              {personalAlerts.length === 0 ? (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 text-xs text-gray-500">
                  Once your assignments or portfolio items are reviewed by Admin, notifications will appear here.
                </div>
              ) : (
                personalAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3"
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        alert.type === 'showcase'
                          ? 'bg-amber-100 text-amber-700'
                          : alert.type === 'review'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {alert.type === 'showcase' ? (
                        <Award size={16} />
                      ) : alert.type === 'review' ? (
                        <Star size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-extrabold text-gray-900">{alert.title}</h3>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{alert.detail}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatPKTDateTime(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </ScreenWrapper>
  );
}
