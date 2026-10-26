import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAcademyAuth } from './AcademyAuthContext';
import {
  createDeleteRequest,
  fetchMarksHistory,
  fetchStudentDeleteRequests,
  fetchStudentSubmissions,
  fetchSubmissionVersionHistory,
  getSignedFileUrl
} from './academyApi';
import {
  DeleteRequestRecord,
  MarksHistoryRecord,
  SubmissionRecord,
  SubmissionVersionRecord
} from './types';
import { formatBytes, formatPKTDate, formatPKTDateTime } from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Loader2,
  MessageSquare,
  RefreshCw,
  History,
  Link2,
  X
} from 'lucide-react';

export function MySubmissions() {
  const navigate = useNavigate();
  const goBack = useSafeBack('/academy');
  const { profile } = useAcademyAuth();

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequestRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'assignment' | 'portfolio' | 'reviewed' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    title: string;
    url: string;
    mime: string;
  } | null>(null);

  // Delete Request Modal state
  const [requestTarget, setRequestTarget] = useState<SubmissionRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Version & Marks History Modal state
  const [historyTarget, setHistoryTarget] = useState<SubmissionRecord | null>(null);
  const [versionsList, setVersionsList] = useState<SubmissionVersionRecord[]>([]);
  const [marksHistoryList, setMarksHistoryList] = useState<MarksHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleOpenHistory = async (sub: SubmissionRecord) => {
    setHistoryTarget(sub);
    setLoadingHistory(true);
    try {
      const [vers, marksHist] = await Promise.all([
        fetchSubmissionVersionHistory(sub.id),
        fetchMarksHistory(sub.id).catch(() => [])
      ]);
      setVersionsList(vers);
      setMarksHistoryList(marksHist);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAll = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const [subs, reqs] = await Promise.all([
        fetchStudentSubmissions(profile.id),
        fetchStudentDeleteRequests(profile.id)
      ]);
      setSubmissions(subs);
      setDeleteRequests(reqs);
    } catch (err: any) {
      setError(err?.message || 'Could not load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [profile?.id]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (filter === 'assignment') return s.submission_type !== 'portfolio';
      if (filter === 'portfolio') return s.submission_type === 'portfolio';
      if (filter === 'reviewed') return s.status === 'reviewed';
      if (filter === 'pending') return s.status !== 'reviewed';
      return true;
    });
  }, [submissions, filter]);

  const handleOpenFile = async (sub: SubmissionRecord) => {
    setOpeningFileId(sub.id);
    setError(null);
    try {
      const signedUrl = await getSignedFileUrl(sub);
      setPreviewModal({
        title: sub.title,
        url: signedUrl,
        mime: sub.file_type
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to generate signed URL.');
    } finally {
      setOpeningFileId(null);
    }
  };

  const handleSendDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !requestTarget) return;
    setSubmittingReq(true);
    setError(null);
    try {
      const created = await createDeleteRequest({
        submissionId: requestTarget.id,
        submissionTitle: requestTarget.title,
        studentId: profile.id,
        studentName: profile.full_name,
        reason: deleteReason
      });
      setDeleteRequests(prev => [created, ...prev]);
      setRequestTarget(null);
      setDeleteReason('');
    } catch (err: any) {
      setError(err?.message || 'Could not submit delete request.');
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-bold">My Uploads & Ratings</h1>
              <p className="text-xs text-blue-200">Assignments & portfolio reviews</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/academy/submit')}
            className="p-2.5 bg-yellow-400 text-blue-950 rounded-full font-bold shadow-sm"
            title="New Upload"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'reviewed', label: 'Reviewed' },
            { id: 'pending', label: 'Pending' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                filter === tab.id
                  ? 'bg-white text-blue-900'
                  : 'bg-blue-800/70 text-blue-200 hover:bg-blue-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading your submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-800">No Submissions Found</p>
            <p className="text-xs text-gray-500 mt-1">
              Upload your daily assignment or portfolio work to get Admin rating and feedback.
            </p>
            <button
              type="button"
              onClick={() => navigate('/academy/submit')}
              className="mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Upload Work Now
            </button>
          </div>
        ) : (
          filteredSubmissions.map(sub => {
            const subReqs = deleteRequests.filter(r => r.submission_id === sub.id);
            const pendingReq = subReqs.find(r => r.status === 'pending');
            const latestRejected = subReqs.find(r => r.status === 'rejected');

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sub.submission_type === 'portfolio'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {sub.submission_type === 'portfolio'
                          ? `Portfolio (${sub.portfolio_tag || 'showcase'})`
                          : 'Daily Assignment'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold">
                        {sub.skill}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        v{sub.version || 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-1.5">{sub.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      PKT Date: {formatPKTDate(sub.submission_date)} • {formatPKTDateTime(sub.submitted_at)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
                      sub.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'needs_revision'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {sub.status === 'reviewed' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    <span>{sub.status.replace('_', ' ')}</span>
                  </span>
                </div>

                {sub.description && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl leading-relaxed">
                    {sub.description}
                  </p>
                )}

                {sub.project_url && (
                  <a
                    href={sub.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-2 text-xs text-blue-700 font-bold hover:bg-blue-50"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Link2 size={14} className="shrink-0" />
                      <span className="truncate">{sub.project_url}</span>
                    </span>
                    <ExternalLink size={13} className="shrink-0" />
                  </a>
                )}

                {/* Admin Rating & Feedback Box */}
                {(sub.status === 'reviewed' || sub.status === 'needs_revision') && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
                        Admin Review & Rating
                      </span>
                      <div className="flex items-center gap-2">
                        {sub.rating && (
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={13}
                                className={
                                  star <= (sub.rating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        )}
                        {sub.marks !== null && (
                          <span className="px-2 py-0.5 rounded bg-blue-900 text-white text-[11px] font-bold">
                            {sub.marks} / {sub.max_marks}
                          </span>
                        )}
                      </div>
                    </div>

                    {sub.feedback && (
                      <div className="flex items-start gap-2 text-xs text-gray-800 pt-1 border-t border-blue-100">
                        <MessageSquare size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{sub.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Delete Request Status */}
                {pendingReq && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                    <strong>Delete Request Pending Admin Approval:</strong> "{pendingReq.reason}"
                  </div>
                )}

                {!pendingReq && latestRejected && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800">
                    <strong>Delete Request Rejected by Admin:</strong>{' '}
                    {latestRejected.admin_note || 'Keep this submission in your record.'}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(sub)}
                      disabled={openingFileId === sub.id}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {openingFileId === sub.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ExternalLink size={14} />
                      )}
                      <span>
                        {sub.file_size > 0
                          ? `Open File (${formatBytes(sub.file_size)})`
                          : 'Open Link'}
                      </span>
                    </button>

                    {sub.status !== 'reviewed' && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/academy/submit?resubmitId=${encodeURIComponent(sub.id)}&title=${encodeURIComponent(sub.title)}&skill=${encodeURIComponent(sub.skill)}&type=${encodeURIComponent(sub.submission_type || 'assignment')}`
                          )
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                          sub.status === 'needs_revision'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                        }`}
                      >
                        <RefreshCw size={13} />
                        <span>{sub.status === 'needs_revision' ? 'Resubmit Work' : 'Update Work'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenHistory(sub)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Version & Rating History"
                    >
                      <History size={13} />
                      <span>History</span>
                    </button>
                  </div>

                  {!pendingReq && (
                    <button
                      type="button"
                      onClick={() => {
                        setRequestTarget(sub);
                        setDeleteReason('');
                      }}
                      className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Request Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Signed URL File Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate">{previewModal.title}</h3>
                <p className="text-[10px] text-blue-200">Short-lived Signed URL (60s expiry)</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-1.5 hover:bg-white/10 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-gray-100 min-h-[220px]">
              {previewModal.mime.startsWith('image/') || previewModal.url.startsWith('data:image/') ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-h-[50vh] w-auto object-contain rounded-lg shadow"
                />
              ) : (
                <p className="text-xs text-gray-600 text-center px-4">
                  Click the button below to download or view this file.
                </p>
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2">
              <a
                href={previewModal.url}
                download={previewModal.title}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Download / Open File
              </a>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version & Marks History Modal */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Version & Review History
                </h3>
                <p className="text-xs text-gray-500">
                  {historyTarget.title} (Current: v{historyTarget.version || 1})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                    Submitted Versions
                  </h4>
                  {versionsList.length === 0 ? (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                      <p className="font-bold">Version 1 (Initial Upload)</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Submitted: {formatPKTDateTime(historyTarget.submitted_at)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {versionsList.map(v => (
                        <div
                          key={v.id}
                          className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-900">
                              Version {v.version_number}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatPKTDateTime(v.created_at)}
                            </span>
                          </div>
                          {v.description && <p className="text-gray-600">{v.description}</p>}
                          <p className="text-[11px] text-gray-500">
                            {v.file_size > 0
                              ? `${v.file_name} (${formatBytes(v.file_size)})`
                              : v.project_url || v.file_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                    Admin Grading History
                  </h4>
                  {marksHistoryList.length === 0 ? (
                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                      No grading updates recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {marksHistoryList.map(mh => (
                        <div
                          key={mh.id}
                          className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs flex items-center justify-between"
                        >
                          <span>
                            Marks: {mh.old_marks === null ? 'Ungraded' : mh.old_marks} →{' '}
                            <strong>{mh.new_marks}</strong>
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatPKTDateTime(mh.changed_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Deletion Modal */}
      {requestTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSendDeleteRequest}
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900">Request Admin Deletion</h3>
              <button
                type="button"
                onClick={() => setRequestTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Students cannot delete uploads directly. Explain why{' '}
              <strong>"{requestTarget.title}"</strong> should be removed so Admin can approve it:
            </p>
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={3}
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="e.g., Uploaded wrong draft file by mistake, need to remove this version..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRequestTarget(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReq || deleteReason.trim().length < 10}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {submittingReq ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ScreenWrapper>
  );
}
