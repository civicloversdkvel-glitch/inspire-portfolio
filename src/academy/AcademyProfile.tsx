import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAcademyAuth } from './AcademyAuthContext';
import { updateOwnStudentProfile } from './academyApi';
import { ACADEMY_SKILLS } from './types';
import { formatPKTDate } from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  User,
  Phone,
  Hash,
  Mail,
  Calendar,
  Award,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

export function AcademyProfile() {
  const navigate = useNavigate();
  const goBack = useSafeBack('/academy');
  const { profile, refreshProfile } = useAcademyAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [rollNo, setRollNo] = useState(profile?.roll_no || '');
  const [skill, setSkill] = useState(profile?.skill || ACADEMY_SKILLS[0]);
  const [batch, setBatch] = useState(profile?.batch || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setRollNo(profile.roll_no || '');
      setSkill(profile.skill || ACADEMY_SKILLS[0]);
      setBatch(profile.batch || '');
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateOwnStudentProfile(profile.id, {
        full_name: fullName,
        phone,
        roll_no: rollNo,
        skill,
        batch
      });
      await refreshProfile();
      setMsg({ type: 'success', text: 'Student profile and course selection updated.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-xl font-bold">Student Identity Card</h1>
            <p className="text-xs text-blue-200">Verified Academy Cloud Profile</p>
          </div>
        </div>

        {/* Digital ID Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-400">
              THE INSPIRE BUSINESS ACADEMY
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck size={11} />
              <span>{profile.is_approved !== false ? 'Approved' : 'Pending Approval'}</span>
            </span>
          </div>
          <h2 className="text-lg font-extrabold">{profile.full_name}</h2>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-100 pt-1">
            <div>
              <p className="text-[10px] text-blue-300 uppercase">Skill Track</p>
              <p className="font-bold text-white">{profile.skill}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase">Admission (PKT)</p>
              <p className="font-bold text-white">{formatPKTDate(profile.admission_date)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
        >
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Roll No / Student ID
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  placeholder="IBA-101"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Batch / Cohort
              </label>
              <input
                type="text"
                value={batch}
                onChange={e => setBatch(e.target.value)}
                placeholder="e.g., Batch 14"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Enrolled Course / Skill Track
            </label>
            <div className="relative">
              <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={skill}
                onChange={e => setSkill(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                {ACADEMY_SKILLS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> Email:
              </span>
              <span className="font-semibold text-gray-800">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Admission (PKT):
              </span>
              <span className="font-semibold text-gray-800">{formatPKTDate(profile.admission_date)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </form>

        {/* Public Portfolio & Verification Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Public Portfolio & Verification
            </h3>
            <Award size={16} className="text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Once an Admin approves your portfolio or assignment uploads for public display, visitors and employers can verify your work on the Public Showcase.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(`/public-portfolio?student=${encodeURIComponent(profile.full_name)}`)
            }
            className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open My Public Showcase Page</span>
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
