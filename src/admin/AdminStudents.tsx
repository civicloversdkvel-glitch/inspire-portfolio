import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import {
  adminCreateStudentAccount,
  fetchAllStudentsWithProgress
} from '../academy/academyApi';
import { ACADEMY_SKILLS, StudentProgressSummary } from '../academy/types';
import { formatPKTDate, getTodayPKT } from '../academy/supabase';
import {
  Search,
  UserPlus,
  Flame,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

export function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');

  // Create Student Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [skill, setSkill] = useState<string>(ACADEMY_SKILLS[0]);
  const [admissionDate, setAdmissionDate] = useState(getTodayPKT());
  const [creating, setCreating] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllStudentsWithProgress();
      setStudents(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (skillFilter !== 'all' && s.skill !== skillFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.full_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.roll_no || '').toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, skillFilter, searchQuery]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await adminCreateStudentAccount({
        email,
        password,
        fullName,
        phone,
        rollNo,
        skill,
        admissionDate
      });
      setShowCreateModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRollNo('');
      setBanner(`Created student account for ${fullName}.`);
      await loadStudents();
    } catch (err: any) {
      setError(err?.message || 'Could not create student.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScreenWrapper className="bg-slate-50 p-4 lg:p-8 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Students Directory & Progress</h1>
          <p className="text-xs text-slate-500">
            Track daily PKT streaks, assignments, portfolio uploads, and ratings
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 self-start"
        >
          <UserPlus size={16} />
          <span>Add New Student</span>
        </button>
      </div>

      {banner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no, email, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>
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

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <p className="text-sm font-bold text-slate-700">No Students Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(st => (
            <div
              key={st.student_id}
              onClick={() => navigate(`/admin/students/${st.student_id}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                    {st.skill}
                  </span>
                  {st.roll_no && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {st.roll_no}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      st.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {st.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 truncate">{st.full_name}</h3>
                <p className="text-xs text-slate-500 truncate">
                  {st.email} {st.phone ? `• ${st.phone}` : ''}
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs text-slate-600">
                  <span>
                    Uploads: <strong>{st.total_submissions}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {st.avg_rating || (st.avg_marks_pct ? (st.avg_marks_pct / 20).toFixed(1) : '—')}
                  </span>
                  <span className="flex items-center gap-1 text-orange-600 font-bold">
                    <Flame size={13} />
                    {st.current_pkt_streak}d
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Last upload: {st.last_submission_date ? formatPKTDate(st.last_submission_date) : 'Never'}
                </p>
              </div>
              <ChevronRight size={20} className="text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStudent}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Create Student Account</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Full Name *
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
                  Roll No / ID
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  placeholder="IBA-102"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Skill Track *
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
                  Admission (PKT)
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={e => setAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Initial Password (min 6 chars) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold"
              >
                {creating ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ScreenWrapper>
  );
}
