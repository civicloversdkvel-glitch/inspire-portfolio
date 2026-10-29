import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Calendar,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const PublicAnnouncements: React.FC = () => {
  const officialNotices = [
    {
      id: 'ann-1',
      title: 'Student Portal Registration & Project Uploads',
      date: '24 October 2026',
      badge: 'Student Portal',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      message:
        'Student portal registration is available for currently enrolled academy students. Enter your academy-issued roll number and account details, then wait for staff verification before uploading assignments and projects.',
      actionLink: '/academy/register',
      actionText: 'Student Registration',
    },
    {
      id: 'ann-2',
      title: 'Weekly Client Outreach & Portfolio Review Session',
      date: '22 October 2026',
      badge: 'Academic',
      badgeColor: 'bg-blue-100 text-blue-800',
      message:
        'Director Adeel Bhatti will be evaluating student Client Showcases this Saturday at 4:00 PM PKT. All active students are required to have their latest 3 design deliverables or video edit samples uploaded in their portal.',
      actionLink: '/academy',
      actionText: 'Open Student Portal',
    },
    {
      id: 'ann-3',
      title: 'AI Tools Mastery Curriculum Upgrade (Gemini 4 Argon Integration)',
      date: '18 October 2026',
      badge: 'Curriculum',
      badgeColor: 'bg-purple-100 text-purple-800',
      message:
        'The Academy has updated its AI syllabus to include advanced reasoning workflows using Gemini 4 Argon with High Thinking level and ElevenLabs synthetic voice backchanneling.',
      actionLink: '/courses/c5',
      actionText: 'View AI Course',
    },
    {
      id: 'ann-4',
      title: 'Payment Protection Notice: Always Enforce Advance Deposit',
      date: '15 October 2026',
      badge: 'Crucial Rule',
      badgeColor: 'bg-amber-100 text-amber-900',
      message:
        'Reminder to all freelancing students: Pehli priority Full Advance payment hai. If a new client expresses trust concerns, agree to 50% advance deposit and 50% upon delivery of watermarked proof. Never deliver editable project files without confirmed deposit.',
      actionLink: '/learning',
      actionText: 'Read Payment Rules',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-bold uppercase tracking-widest border border-white/20">
            Official Bulletin Board
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Academy Announcements & Updates
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Stay informed with the latest batch announcements, timetable schedules, portfolio reviews,
            and campus notices directly from the academy directorate.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {officialNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${notice.badgeColor}`}>
                  {notice.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar size={13} />
                  <span>{notice.date}</span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sadiqabad Directorate</span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {notice.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {notice.message}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={notice.actionLink}
                className="text-xs font-extrabold text-blue-900 hover:text-blue-700 flex items-center gap-1.5"
              >
                <span>{notice.actionText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
