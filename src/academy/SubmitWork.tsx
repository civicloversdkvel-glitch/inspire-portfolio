import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAcademyAuth } from './AcademyAuthContext';
import { createStudentSubmission, fetchPublishedAssignments } from './academyApi';
import { ACADEMY_SKILLS, AssignmentRecord, SubmissionType } from './types';
import {
  formatBytes,
  getTodayPKT,
  formatPKTDate,
  validateSubmissionUrl,
  validateUploadFile
} from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  RefreshCw,
  X
} from 'lucide-react';

export function SubmitWork() {
  const navigate = useNavigate();
  const goBack = useSafeBack('/academy');
  const [searchParams] = useSearchParams();
  const { profile } = useAcademyAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialType = searchParams.get('type') === 'portfolio' ? 'portfolio' : 'assignment';
  const initialAssignmentId = searchParams.get('assignmentId') || '';
  const resubmitId = searchParams.get('resubmitId') || '';
  const initialTitle = searchParams.get('title') || '';
  const initialSkill = searchParams.get('skill') || '';

  const [submissionType, setSubmissionType] = useState<SubmissionType>(initialType);
  const [portfolioTag, setPortfolioTag] = useState<'showcase' | 'practice'>('showcase');
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId);
  const [title, setTitle] = useState(initialTitle);
  const [skill, setSkill] = useState(initialSkill || profile?.skill || ACADEMY_SKILLS[0]);
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedAssignments()
      .then(list => {
        setAssignments(list);
        if (initialAssignmentId) {
          const found = list.find(a => a.id === initialAssignmentId);
          if (found) {
            setTitle(found.title);
            setSkill(found.skill || profile?.skill || ACADEMY_SKILLS[0]);
          }
        }
      })
      .catch(() => {});
  }, [initialAssignmentId, profile?.skill]);

  const handleAssignmentChange = (id: string) => {
    setSelectedAssignmentId(id);
    const found = assignments.find(a => a.id === id);
    if (found) {
      setTitle(found.title);
      if (found.skill) setSkill(found.skill);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setSuccessMsg(null);

    if (!selectedFile && !projectUrl.trim()) {
      setError('Please attach a work file or provide a project/assignment URL.');
      return;
    }

    if (projectUrl.trim()) {
      const urlValidation = validateSubmissionUrl(projectUrl);
      if (!urlValidation.valid) {
        setError(urlValidation.error || 'Please enter a valid URL.');
        return;
      }
    }

    if (description.trim().length < 5) {
      setError('Please write a brief description of your work (at least 5 characters).');
      return;
    }

    setUploading(true);
    try {
      await createStudentSubmission({
        studentId: profile.id,
        studentName: profile.full_name,
        assignmentId: submissionType === 'assignment' ? selectedAssignmentId : '',
        submissionType,
        portfolioTag,
        title,
        description,
        skill,
        file: selectedFile,
        projectUrl,
        resubmitSubmissionId: resubmitId || undefined
      });
      setSuccessMsg(
        resubmitId
          ? 'New submission version uploaded! Redirecting to your submissions...'
          : 'Your work has been uploaded! Redirecting to your submissions...'
      );
      setTimeout(() => {
        navigate('/academy/submissions', { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {submissionType === 'assignment' ? 'Upload Daily Assignment' : 'Upload Portfolio File'}
            </h1>
            <p className="text-xs text-blue-200">
              PKT Date: {formatPKTDate(getTodayPKT())}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Type Switcher */}
        <div className="grid grid-cols-2 bg-gray-200 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSubmissionType('assignment')}
            className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              submissionType === 'assignment'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <FileText size={15} />
            <span>Daily Assignment</span>
          </button>
          <button
            type="button"
            onClick={() => setSubmissionType('portfolio')}
            className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              submissionType === 'portfolio'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Briefcase size={15} />
            <span>Portfolio File</span>
          </button>
        </div>

        {/* Immutability Security Rule Notice */}
        {resubmitId && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-blue-900 text-xs">
            <RefreshCw size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Resubmitting Updated Version:</p>
              <p className="mt-0.5 leading-relaxed">
                This upload will save a new version on your existing submission and preserve previous versions in your version history.
              </p>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Permanent Upload Rule:</p>
            <p className="mt-0.5 leading-relaxed">
              Once uploaded, students <strong>cannot delete or overwrite</strong> a file directly. If you upload the wrong file, you can submit a Delete Request for Admin approval.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-800 text-xs">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
        >
          {submissionType === 'assignment' && assignments.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Link to Academy Assignment (Optional)
              </label>
              <select
                value={selectedAssignmentId}
                onChange={e => handleAssignmentChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Daily Practice / Custom Assignment --</option>
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.skill})
                  </option>
                ))}
              </select>
            </div>
          )}

          {submissionType === 'portfolio' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Portfolio Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPortfolioTag('showcase')}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    portfolioTag === 'showcase'
                      ? 'bg-purple-50 border-purple-600 text-purple-900'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Client Showcase
                </button>
                <button
                  type="button"
                  onClick={() => setPortfolioTag('practice')}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    portfolioTag === 'practice'
                      ? 'bg-purple-50 border-purple-600 text-purple-900'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Daily Practice
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Work Title *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={160}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                submissionType === 'assignment'
                  ? 'e.g., Day 12 Social Media Poster Design'
                  : 'e.g., Brand Identity Logo Pack for Client'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Skill Category *
            </label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              {ACADEMY_SKILLS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Description & Work Notes *
            </label>
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain what tools you used, what you learned, or client brief details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Project / Deliverable URL (Optional if File attached)
            </label>
            <div className="relative">
              <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={projectUrl}
                onChange={e => setProjectUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://canva.com/..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Attach Work File (Max 25 MB) {projectUrl.trim() ? '(Optional)' : '*'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp4,.mp3"
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <UploadCloud size={28} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-900">Tap to Select File</span>
                <span className="text-[10px] text-gray-500 text-center">
                  Images, PDF, Word, Excel, PPT, ZIP, MP4, MP3 (Max 25 MB)
                </span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-950 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-blue-700 mt-0.5">
                    {formatBytes(selectedFile.size)} • {selectedFile.type || 'File'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg bg-white text-gray-600 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading to Academy Server...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>
                  {submissionType === 'assignment' ? 'Submit Daily Assignment' : 'Upload to Portfolio'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </ScreenWrapper>
  );
}
