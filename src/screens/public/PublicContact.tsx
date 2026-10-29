import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, GraduationCap, UserPlus, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';

export const PublicContact: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-8 text-white shadow-xl sm:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200">
            <ShieldCheck size={14} /> Current students
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Student support & academy contact</h1>
          <p className="text-sm leading-relaxed text-blue-100 sm:text-base">
            This website is the learning workspace for students of The Inspire Business Academy. Register or sign in to upload projects, submit assignments and review your feedback.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link to="/academy/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-blue-950 hover:bg-amber-300">
              <UserPlus size={17} /> Student Registration <ArrowRight size={15} />
            </Link>
            <Link to="/academy/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">
              <GraduationCap size={17} /> Student Login
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-black text-slate-950">Academy contact details</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">For account access or student portal support, contact the academy directly.</p>
          <div className="mt-7 space-y-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700"><MapPin size={20} /></span>
              <div><p className="font-extrabold text-slate-900">Campus address</p><p className="mt-1 text-sm leading-relaxed text-slate-600">Near Shimla Point, beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan</p></div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"><Phone size={20} /></span>
              <div><p className="font-extrabold text-slate-900">WhatsApp support</p><a className="mt-1 inline-block text-sm font-bold text-emerald-700 hover:underline" href="https://wa.me/923093534289" target="_blank" rel="noopener noreferrer">0309 3534289</a></div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700"><Mail size={20} /></span>
              <div><p className="font-extrabold text-slate-900">Email address</p><a className="mt-1 inline-block break-all text-sm text-slate-600 hover:text-blue-700" href="mailto:theinspirebusinessacademy@gmail.com">theinspirebusinessacademy@gmail.com</a></div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-700"><Clock size={20} /></span>
              <div><p className="font-extrabold text-slate-900">Support hours</p><p className="mt-1 text-sm text-slate-600">Contact the academy during campus working hours.</p></div>
            </div>
          </div>
          <a href="https://wa.me/923093534289?text=Assalam-o-Alaikum%2C%20I%20need%20help%20with%20my%20student%20portal%20account." target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-700">
            <MessageCircle size={17} /> Contact student support
          </a>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-xl font-black text-slate-950">Use your student portal</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">No public admission application is needed here. This portal is intended for students who study at our academy.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UserPlus size={21} /></div>
              <h3 className="mt-4 font-extrabold text-slate-900">Create an account</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Register with your name, phone, skill, email and a secure password.</p>
              <Link to="/academy/register" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-blue-800 hover:underline">Student registration <ArrowRight size={15} /></Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><GraduationCap size={21} /></div>
              <h3 className="mt-4 font-extrabold text-slate-900">Upload your work</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Sign in to submit assignments, upload projects and check teacher feedback.</p>
              <Link to="/academy/login" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-blue-800 hover:underline">Open student login <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
