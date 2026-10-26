import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import {
  adminUpdateStudentProfile,
  fetchStudentById,
  fetchStudentSubmissions,
  getSignedFileUrl
} from '../academy/academyApi';
import { ACADEMY_SKILLS, AcademyProfile, SubmissionRecord } from '../academy/types';
import { formatBytes, formatPKTDate, formatPKTDateTime } from '../academy/supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  Save,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const goBack = useSafeBack('/admin/students');

  const [student, setStudent] = useState<AcademyProfile | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [skill, setSkill] = useState<string>(ACADEMY_SKILLS[0]);
  const [admissionDate, setAdmissionDate] = useState('');
  const [isApproved, setIsApproved] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [prof, subs] = await Promise.all([
          fetchStudentById(id),
          fetchStudentSubmissions(id)
        ]);
        if (!active) return;
        if (prof) {
          setStudent(prof);
          setFullName(prof.full_name);
          setPhone(prof.phone);
          setRollNo(prof.roll_no || '');
          setSkill(prof.skill);
          setAdmissionDate(prof.admission_date);
          setIsApproved(prof.is_approved !== false);
          setIsActive(prof.is_active);
        }
        setSubmissions(subs);
      } catch (err: any) {
        if (active) setMsg({ type: 'error', text: err?.message || 'Failed to load student.' });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setMsg(null);
    try {
      await adminUpdateStudentProfile(student.id, {
        full_name: fullName,
        phone,
        roll_no: rollNo,
        skill,
        admission_date: admissionDate,
        is_approved: isApproved,
        is_active: isActive
      });
      setMsg({ type: 'success', text: 'Student profile updated successfully.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to update student.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFile = async (sub: SubmissionRecord) => {
    try {
      const url = await getSignedFileUrl(sub, true);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = sub.file_name;
      a.click();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Could not open file.' });
    }
  };

  if (loading) {
    return (
      <ScreenWrapper className="bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </ScreenWrapper>
    );
  }

  if (!student) {
    return (
      <ScreenWrapper className="bg-slate-50 p-8">
        <p className="text-sm font-bold text-slate-700">Student not found.</p>
        <button type="button" onClick={goBack} className="mt-3 text-xs font-bold text-blue-600">
          ← Back to Students
        </button>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-slate-50 p-4 lg:p-8 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">{student.full_name}</h1>
          <p className="text-xs text-slate-500">{student.email}</p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit"
        >
          <h2 className="text-sm font-extrabold text-slate-900">Student Account Settings</h2>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Roll No
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Skill Track
            </label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
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
              Admission Date (PKT)
            </label>
            <input
              type="date"
              value={admissionDate}
              onChange={e => setAdmissionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-slate-700">Approved Status</span>
            <input
              type="checkbox"
              checked={isApproved}
              onChange={e => setIsApproved(e.target.checked)}
              className="w-4 h-4 accent-blue-900"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Account Active</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-blue-900"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Student Settings'}</span>
          </button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Student Uploads ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-xs text-slate-500">
              No uploads from this student yet.
            </div>
          ) : (
            submissions.map(sub => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold uppercase">
                      {sub.submission_type === 'portfolio' ? 'Portfolio' : 'Assignment'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{sub.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {formatPKTDate(sub.submission_date)} • {formatPKTDateTime(sub.submitted_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.rating && (
                      <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {sub.rating}/5
                      </span>
                    )}
                    {sub.marks !== null && (
                      <span className="px-2 py-0.5 rounded bg-blue-900 text-white text-xs font-bold">
                        {sub.marks}/{sub.max_marks}
                      </span>
                    )}
                  </div>
                </div>
                {sub.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    {sub.description}
                  </p>
                )}
                {sub.feedback && (
                  <p className="text-xs text-blue-900 bg-blue-50 p-2.5 rounded-xl">
                    <strong>Feedback:</strong> {sub.feedback}
                  </p>
                )}
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenFile(sub)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1"
                  >
                    <ExternalLink size={13} />
                    <span>Open File ({formatBytes(sub.file_size)})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}
