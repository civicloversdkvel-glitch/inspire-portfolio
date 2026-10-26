import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAcademyAuth } from '../academy/AcademyAuthContext';
import {
  approveDeleteRequestAsAdmin,
  approveSubmissionForPublicPortfolio,
  archiveSubmissionAsAdmin,
  createAnnouncementAsAdmin,
  createAssignmentAsAdmin,
  deleteAnnouncementAsAdmin,
  fetchAllAttendanceForAdmin,
  fetchAllDeleteRequestsForAdmin,
  fetchAllPublicPortfoliosForAdmin,
  fetchAllStudentsWithProgress,
  fetchAllSubmissionsForAdmin,
  fetchPublishedAnnouncements,
  fetchPublishedAssignments,
  getSignedFileUrl,
  markStudentAttendanceAsAdmin,
  rejectDeleteRequestAsAdmin,
  removePublicPortfolioItemAsAdmin,
  restoreSubmissionAsAdmin,
  reviewSubmissionAsAdmin,
  updatePublicPortfolioItemAsAdmin
} from '../academy/academyApi';
import {
  ACADEMY_SKILLS,
  AnnouncementPriority,
  AnnouncementRecord,
  AssignmentRecord,
  AttendanceRecord,
  AttendanceStatus,
  DeleteRequestRecord,
  PublicPortfolioRecord,
  StudentProgressSummary,
  SubmissionRecord
} from '../academy/types';
import { formatBytes, formatPKTDate, formatPKTDateTime, getTodayPKT } from '../academy/supabase';
import {
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Search,
  Plus,
  Loader2,
  Users,
  FileCheck2,
  X,
  Award,
  Sparkles,
  CalendarCheck2,
  Megaphone
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAcademyAuth();

  const [activeTab, setActiveTab] = useState<
    | 'submissions'
    | 'delete_requests'
    | 'assignments'
    | 'portfolios'
    | 'attendance'
    | 'announcements'
  >('submissions');
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequestRecord[]>([]);
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [publicPortfolios, setPublicPortfolios] = useState<PublicPortfolioRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'submitted' | 'reviewed' | 'needs_revision' | 'archived'
  >('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'assignment' | 'portfolio'>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Grading Modal
  const [gradingTarget, setGradingTarget] = useState<SubmissionRecord | null>(null);
  const [gradeRating, setGradeRating] = useState<number>(5);
  const [gradeMarks, setGradeMarks] = useState<number>(10);
  const [gradeMaxMarks, setGradeMaxMarks] = useState<number>(10);
  const [gradeStatus, setGradeStatus] = useState<'reviewed' | 'needs_revision'>('reviewed');
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);

  // File Preview Modal
  const [previewModal, setPreviewModal] = useState<{
    title: string;
    url: string;
    mime: string;
  } | null>(null);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  // Reject Delete Request Modal
  const [rejectTarget, setRejectTarget] = useState<DeleteRequestRecord | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [resolvingReqId, setResolvingReqId] = useState<string | null>(null);

  // New Assignment Form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSkill, setAsgSkill] = useState<string>(ACADEMY_SKILLS[0]);
  const [asgDueDate, setAsgDueDate] = useState(getTodayPKT());
  const [asgDesc, setAsgDesc] = useState('');
  const [creatingAsg, setCreatingAsg] = useState(false);

  // Attendance Date & Saving state
  const [selectedAttDate, setSelectedAttDate] = useState(getTodayPKT());
  const [markingStudentId, setMarkingStudentId] = useState<string | null>(null);

  // New Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSkill, setAnnSkill] = useState('All');
  const [annPriority, setAnnPriority] = useState<AnnouncementPriority>('normal');
  const [creatingAnn, setCreatingAnn] = useState(false);
  const [approvingSubId, setApprovingSubId] = useState<string | null>(null);

  const todayPKT = getTodayPKT();

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, reqs, stds, asgs, pubs, atts, anns] = await Promise.all([
        fetchAllSubmissionsForAdmin(true),
        fetchAllDeleteRequestsForAdmin(),
        fetchAllStudentsWithProgress(),
        fetchPublishedAssignments(),
        fetchAllPublicPortfoliosForAdmin().catch(() => []),
        fetchAllAttendanceForAdmin().catch(() => []),
        fetchPublishedAnnouncements().catch(() => [])
      ]);
      setSubmissions(subs);
      setDeleteRequests(reqs);
      setStudents(stds);
      setAssignments(asgs);
      setPublicPortfolios(pubs);
      setAttendanceRecords(atts);
      setAnnouncements(anns);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (statusFilter === 'archived') {
        if (!s.is_deleted) return false;
      } else {
        if (s.is_deleted) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      }
      if (typeFilter === 'assignment' && s.submission_type === 'portfolio') return false;
      if (typeFilter === 'portfolio' && s.submission_type !== 'portfolio') return false;
      if (skillFilter !== 'all' && s.skill !== skillFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchStudent = s.student_name.toLowerCase().includes(q);
        if (!matchTitle && !matchStudent) return false;
      }
      return true;
    });
  }, [submissions, statusFilter, typeFilter, skillFilter, searchQuery]);

  const activeSubmissionsList = useMemo(
    () => submissions.filter(s => !s.is_deleted),
    [submissions]
  );

  const pendingReviewsCount = useMemo(
    () => activeSubmissionsList.filter(s => s.status === 'submitted').length,
    [activeSubmissionsList]
  );

  const pendingDeletesCount = useMemo(
    () => deleteRequests.filter(r => r.status === 'pending').length,
    [deleteRequests]
  );

  const submittedTodayCount = useMemo(
    () => activeSubmissionsList.filter(s => s.submission_date === todayPKT).length,
    [activeSubmissionsList, todayPKT]
  );

  const handleArchiveSubmission = async (sub: SubmissionRecord) => {
    setError(null);
    try {
      await archiveSubmissionAsAdmin(sub.id);
      setFeedbackBanner(`Archived submission "${sub.title}".`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to archive submission.');
    }
  };

  const handleRestoreSubmission = async (sub: SubmissionRecord) => {
    setError(null);
    try {
      await restoreSubmissionAsAdmin(sub.id);
      setFeedbackBanner(`Restored submission "${sub.title}" to active records.`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to restore submission.');
    }
  };

  const openGradeModal = (sub: SubmissionRecord) => {
    setGradingTarget(sub);
    setGradeRating(sub.rating || 5);
    setGradeMarks(sub.marks !== null ? sub.marks : 9);
    setGradeMaxMarks(sub.max_marks || 10);
    setGradeStatus(sub.status === 'needs_revision' ? 'needs_revision' : 'reviewed');
    setGradeFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !gradingTarget) return;
    setSavingGrade(true);
    setError(null);
    try {
      await reviewSubmissionAsAdmin({
        submission: gradingTarget,
        adminId: profile.id,
        rating: gradeRating,
        marks: gradeMarks,
        maxMarks: gradeMaxMarks,
        status: gradeStatus,
        feedback: gradeFeedback
      });
      setFeedbackBanner(`Saved ${gradeRating}★ rating and feedback for "${gradingTarget.title}".`);
      setGradingTarget(null);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to save review.');
    } finally {
      setSavingGrade(false);
    }
  };

  const handleOpenFile = async (sub: SubmissionRecord) => {
    setOpeningFileId(sub.id);
    setError(null);
    try {
      const signedUrl = await getSignedFileUrl(sub, true);
      setPreviewModal({
        title: `${sub.student_name} — ${sub.title}`,
        url: signedUrl,
        mime: sub.file_type
      });
    } catch (err: any) {
      setError(err?.message || 'Could not generate signed URL.');
    } finally {
      setOpeningFileId(null);
    }
  };

  const handleApproveDelete = async (req: DeleteRequestRecord) => {
    if (!profile) return;
    setResolvingReqId(req.id);
    setError(null);
    try {
      await approveDeleteRequestAsAdmin({
        request: req,
        adminId: profile.id
      });
      setFeedbackBanner(`Approved deletion of "${req.submission_title}".`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve delete request.');
    } finally {
      setResolvingReqId(null);
    }
  };

  const handleRejectDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !rejectTarget) return;
    setResolvingReqId(rejectTarget.id);
    setError(null);
    try {
      await rejectDeleteRequestAsAdmin({
        request: rejectTarget,
        adminId: profile.id,
        adminNote: rejectNote
      });
      setFeedbackBanner(`Rejected deletion request for "${rejectTarget.submission_title}".`);
      setRejectTarget(null);
      setRejectNote('');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject delete request.');
    } finally {
      setResolvingReqId(null);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreatingAsg(true);
    setError(null);
    try {
      await createAssignmentAsAdmin({
        adminId: profile.id,
        title: asgTitle,
        description: asgDesc,
        skill: asgSkill,
        dueDate: asgDueDate
      });
      setAsgTitle('');
      setAsgDesc('');
      setFeedbackBanner('Published new assignment to students.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to create assignment.');
    } finally {
      setCreatingAsg(false);
    }
  };

  const approvedSubmissionIds = useMemo(
    () => new Set(publicPortfolios.map(p => p.submission_id)),
    [publicPortfolios]
  );

  const handleApprovePublicPortfolio = async (sub: SubmissionRecord, featured = false) => {
    if (!profile) return;
    setApprovingSubId(sub.id);
    setError(null);
    try {
      const st = students.find(s => s.student_id === sub.student_id);
      await approveSubmissionForPublicPortfolio({
        submission: sub,
        rollNo: st?.roll_no || '',
        isFeatured: featured,
        adminId: profile.id
      });
      setFeedbackBanner(`Approved "${sub.title}" for Public Portfolio Showcase!`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve portfolio item.');
    } finally {
      setApprovingSubId(null);
    }
  };

  const handleTogglePortfolioFlag = async (
    item: PublicPortfolioRecord,
    field: 'featured' | 'public'
  ) => {
    setError(null);
    try {
      await updatePublicPortfolioItemAsAdmin({
        item,
        isFeatured: field === 'featured' ? !item.is_featured : item.is_featured,
        isPublic: field === 'public' ? !item.is_public : item.is_public
      });
      setFeedbackBanner(`Updated showcase settings for "${item.title}".`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to update portfolio item.');
    }
  };

  const handleRemovePublicPortfolio = async (item: PublicPortfolioRecord) => {
    setError(null);
    try {
      await removePublicPortfolioItemAsAdmin(item.id);
      setFeedbackBanner(`Removed "${item.title}" from Public Showcase.`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove portfolio item.');
    }
  };

  const handleMarkAttendance = async (
    student: StudentProgressSummary,
    status: AttendanceStatus
  ) => {
    if (!profile) return;
    setMarkingStudentId(student.student_id);
    setError(null);
    try {
      await markStudentAttendanceAsAdmin({
        studentId: student.student_id,
        studentName: student.full_name,
        skill: student.skill,
        attendanceDate: selectedAttDate,
        status,
        note: `Marked ${status} by Admin`,
        adminId: profile.id
      });
      setFeedbackBanner(
        `Marked ${student.full_name} as ${status.toUpperCase()} for ${formatPKTDate(selectedAttDate)}.`
      );
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to save attendance.');
    } finally {
      setMarkingStudentId(null);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreatingAnn(true);
    setError(null);
    try {
      await createAnnouncementAsAdmin({
        title: annTitle,
        message: annMessage,
        targetSkill: annSkill,
        priority: annPriority,
        adminId: profile.id
      });
      setAnnTitle('');
      setAnnMessage('');
      setFeedbackBanner('Announcement published to students.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to publish announcement.');
    } finally {
      setCreatingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setError(null);
    try {
      await deleteAnnouncementAsAdmin(id);
      setFeedbackBanner('Announcement deleted.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete announcement.');
    }
  };

  return (
    <ScreenWrapper className="bg-slate-50 p-4 lg:p-8 pb-24 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Total Students</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/students')}
            className="text-[11px] font-bold text-blue-600 hover:underline mt-1"
          >
            Manage Students →
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Today (PKT)</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{submittedTodayCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">{formatPKTDate(todayPKT)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Pending Review</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingReviewsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting rating & marks</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Delete Requests</span>
            <Trash2 size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{pendingDeletesCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires admin approval</p>
        </div>
      </div>

      {feedbackBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <span>{feedbackBanner}</span>
          <button type="button" onClick={() => setFeedbackBanner(null)} className="text-emerald-700 font-bold">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'submissions'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Submissions & Ratings ({submissions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delete_requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'delete_requests'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>Delete Requests</span>
          {pendingDeletesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
              {pendingDeletesCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'assignments'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Daily Assignments ({assignments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('portfolios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'portfolios'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Award size={14} />
          <span>Portfolio Approvals ({publicPortfolios.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck2 size={14} />
          <span>Attendance (PKT)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'announcements'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Megaphone size={14} />
          <span>Announcements ({announcements.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : activeTab === 'submissions' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student or title..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="all">All Active Statuses</option>
              <option value="submitted">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="archived">Archived / Deleted</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="all">Assignments + Portfolio</option>
              <option value="assignment">Daily Assignments Only</option>
              <option value="portfolio">Portfolio Files Only</option>
            </select>

            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="all">All Skills</option>
              {ACADEMY_SKILLS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-sm font-bold text-slate-700">No Matching Submissions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
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
                              : 'Assignment'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {sub.skill}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            v{sub.version || 1}
                          </span>
                          {sub.is_deleted && (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-extrabold uppercase">
                              Archived
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 mt-1">{sub.title}</h3>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/students/${sub.student_id}`)}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Student: {sub.student_name}
                        </button>
                        <p className="text-[11px] text-slate-400">
                          PKT Date: {formatPKTDate(sub.submission_date)} • {formatPKTDateTime(sub.submitted_at)}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                          sub.status === 'reviewed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'needs_revision'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                        {sub.description}
                      </p>
                    )}

                    {sub.status !== 'submitted' && (
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              size={14}
                              className={
                                st <= (sub.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="font-bold text-blue-950">
                          Marks: {sub.marks !== null ? `${sub.marks}/${sub.max_marks}` : '—'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFile(sub)}
                      disabled={openingFileId === sub.id}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                    >
                      {openingFileId === sub.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ExternalLink size={14} />
                      )}
                      <span>Open File ({formatBytes(sub.file_size)})</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {sub.is_deleted ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreSubmission(sub)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Restore Submission
                        </button>
                      ) : (
                        <>
                          {approvedSubmissionIds.has(sub.id) ? (
                            <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                              <Award size={14} />
                              <span>Public Showcase</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={approvingSubId === sub.id}
                              onClick={() => handleApprovePublicPortfolio(sub, false)}
                              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1"
                            >
                              <Award size={14} />
                              <span>{approvingSubId === sub.id ? 'Approving...' : 'Approve Public'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleArchiveSubmission(sub)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold"
                          >
                            Archive
                          </button>

                          <button
                            type="button"
                            onClick={() => openGradeModal(sub)}
                            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span>{sub.status === 'submitted' ? 'Rate & Review' : 'Update Rating'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'delete_requests' ? (
        <div className="space-y-4">
          {deleteRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-sm font-bold text-slate-700">No Delete Requests</p>
            </div>
          ) : (
            deleteRequests.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{req.student_name}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatPKTDateTime(req.created_at)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Submission: "{req.submission_title}"
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <strong>Student Reason:</strong> {req.reason}
                  </p>
                  {req.admin_note && (
                    <p className="text-[11px] text-slate-500">
                      <strong>Admin Note:</strong> {req.admin_note}
                    </p>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={resolvingReqId === req.id}
                      onClick={() => handleApproveDelete(req)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      {resolvingReqId === req.id ? 'Processing...' : 'Approve & Archive'}
                    </button>
                    <button
                      type="button"
                      disabled={resolvingReqId === req.id}
                      onClick={() => {
                        setRejectTarget(req);
                        setRejectNote('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'assignments' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleCreateAssignment}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit"
          >
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" />
              <span>Post Daily Assignment</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={asgTitle}
                onChange={e => setAsgTitle(e.target.value)}
                placeholder="e.g., Day 15 Meta Ads Campaign Setup"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Target Skill *
              </label>
              <select
                value={asgSkill}
                onChange={e => setAsgSkill(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {ACADEMY_SKILLS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Due Date (PKT) *
              </label>
              <input
                type="date"
                required
                value={asgDueDate}
                onChange={e => setAsgDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Instructions
              </label>
              <textarea
                rows={3}
                value={asgDesc}
                onChange={e => setAsgDesc(e.target.value)}
                placeholder="Describe deliverable requirements..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creatingAsg}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
            >
              {creatingAsg ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {assignments.map(asg => (
              <div
                key={asg.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                    {asg.skill}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h4>
                  {asg.description && (
                    <p className="text-xs text-slate-600 mt-1">{asg.description}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Due (PKT): {formatPKTDate(asg.due_date)}
                  </p>
                </div>
                <FileCheck2 size={18} className="text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'portfolios' ? (
        /* Portfolio Approvals Tab */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Public Portfolio Showcase Management
              </h3>
              <p className="text-xs text-slate-500">
                Approved items are visible to public visitors on the Public Portfolio Portal without login.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/public-portfolio')}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 self-start"
            >
              <ExternalLink size={14} />
              <span>Open Public Showcase</span>
            </button>
          </div>

          {publicPortfolios.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
              <p className="text-sm font-bold text-slate-700">No Approved Public Portfolios Yet</p>
              <p className="text-xs text-slate-500">
                Click "Approve Public" on any student submission in the Submissions tab to publish it to the Public Showcase.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {publicPortfolios.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          <span className="text-blue-700 font-bold">{item.skill}</span>
                          {item.roll_no ? ` · ${item.roll_no}` : ''} · {item.student_name}
                        </p>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star
                            key={st}
                            size={13}
                            className={
                              st <= item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePortfolioFlag(item, 'featured')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                          item.is_featured
                            ? 'bg-amber-50 border-amber-400 text-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Sparkles size={13} />
                        <span>{item.is_featured ? 'Featured' : 'Mark Featured'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePortfolioFlag(item, 'public')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          item.is_public
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-100 border-slate-300 text-slate-600'
                        }`}
                      >
                        {item.is_public ? 'Public Visible' : 'Hidden'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePublicPortfolio(item)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'attendance' ? (
        /* Attendance Management Tab */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Daily Student Attendance Register (PKT)
              </h3>
              <p className="text-xs text-slate-500">
                Students who upload daily work are automatically flagged; Admins can also record Present, Late, Excused, or Absent.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">PKT Date:</label>
              <input
                type="date"
                value={selectedAttDate}
                onChange={e => setSelectedAttDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          {students.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-sm font-bold text-slate-700">No Students Registered Yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
              {students.map(st => {
                const uploadedOnDate = submissions.some(
                  s => s.student_id === st.student_id && s.submission_date === selectedAttDate
                );
                const attRecord = attendanceRecords.find(
                  a => a.student_id === st.student_id && a.attendance_date === selectedAttDate
                );
                const currentStatus = attRecord?.status || (uploadedOnDate ? 'present' : null);

                return (
                  <div
                    key={st.student_id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{st.full_name}</h4>
                        {st.roll_no && (
                          <span className="text-xs font-bold text-slate-500">({st.roll_no})</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {st.skill} ·{' '}
                        {uploadedOnDate ? (
                          <span className="text-emerald-700 font-bold">
                            Uploaded Work on {formatPKTDate(selectedAttDate)}
                          </span>
                        ) : (
                          <span>No upload on {formatPKTDate(selectedAttDate)}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['present', 'late', 'excused', 'absent'] as AttendanceStatus[]).map(
                        statusOpt => {
                          const isSelected = currentStatus === statusOpt;
                          return (
                            <button
                              key={statusOpt}
                              type="button"
                              disabled={markingStudentId === st.student_id}
                              onClick={() => handleMarkAttendance(st, statusOpt)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                                isSelected
                                  ? statusOpt === 'present'
                                    ? 'bg-emerald-600 text-white'
                                    : statusOpt === 'late'
                                    ? 'bg-amber-500 text-white'
                                    : statusOpt === 'excused'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-red-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {statusOpt}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Announcements Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleCreateAnnouncement}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit"
          >
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone size={16} className="text-blue-600" />
              <span>Post Academy Announcement</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={160}
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                placeholder="e.g., Portfolio Review Session Tomorrow"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Target Skill
                </label>
                <select
                  value={annSkill}
                  onChange={e => setAnnSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="All">All Skills</option>
                  {ACADEMY_SKILLS.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={annPriority}
                  onChange={e => setAnnPriority(e.target.value as AnnouncementPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Message *
              </label>
              <textarea
                required
                minLength={3}
                maxLength={2000}
                rows={4}
                value={annMessage}
                onChange={e => setAnnMessage(e.target.value)}
                placeholder="Write announcement details for students..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creatingAnn}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
            >
              {creatingAnn ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-500">
                No announcements posted yet.
              </div>
            ) : (
              announcements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold">
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
                      <span className="text-slate-400 font-normal">
                        {formatPKTDateTime(ann.created_at)}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{ann.title}</h4>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{ann.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Grade & Rate Modal */}
      {gradingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGrade}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Review & Rate Submission</h3>
                <p className="text-xs text-slate-500">
                  {gradingTarget.student_name} — {gradingTarget.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGradingTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* 1..5 Star Rating */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Star Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setGradeRating(star);
                      setGradeMarks(star * 2);
                    }}
                    className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                      gradeRating >= star
                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Star
                      size={18}
                      className={gradeRating >= star ? 'fill-amber-400 text-amber-400' : ''}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-slate-700 ml-2">
                  {gradeRating} / 5 ★
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Marks (0 - {gradeMaxMarks})
                </label>
                <input
                  type="number"
                  min={0}
                  max={gradeMaxMarks}
                  step="0.5"
                  required
                  value={gradeMarks}
                  onChange={e => setGradeMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Review Status
                </label>
                <select
                  value={gradeStatus}
                  onChange={e => setGradeStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="reviewed">Approved / Reviewed</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Feedback for Student
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={e => setGradeFeedback(e.target.value)}
                placeholder="Write constructive feedback on design, strategy, or improvements..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGradingTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingGrade}
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold"
              >
                {savingGrade ? 'Saving...' : 'Save Rating & Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Delete Request Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectDelete}
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-extrabold text-slate-900">Reject Delete Request</h3>
            <p className="text-xs text-slate-600">
              Provide a note explaining why "{rejectTarget.submission_title}" cannot be deleted:
            </p>
            <textarea
              required
              minLength={3}
              rows={3}
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="e.g., Already graded and recorded in monthly assessment."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Signed URL File Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
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
            <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-100 min-h-[240px]">
              {previewModal.mime.startsWith('image/') || previewModal.url.startsWith('data:image/') ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-h-[55vh] w-auto object-contain rounded-lg shadow"
                />
              ) : (
                <p className="text-xs text-slate-600 text-center px-4">
                  Click below to open or download this submission file.
                </p>
              )}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2">
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
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
}
