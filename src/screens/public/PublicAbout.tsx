import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  BookOpen,
} from 'lucide-react';

export const PublicAbout: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-bold uppercase tracking-widest border border-white/20">
            About Our Institution
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Building Pakistan's Next Generation of Independent Digital Earners
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Based in Sadiqabad, The Inspire Business Academy bridges the gap between academic theory
            and high-income freelancing skills with real client project experience.
          </p>
        </div>
      </div>

      {/* Founder & Methodology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
              Founder & Director
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Adeel Bhatti
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-600">
              Director, The Inspire Business Academy (Sadiqabad)
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            "We founded The Inspire Business Academy with a clear, practical mission: to provide ambitious
            youth with market-ready vocational skills that generate immediate income. Whether learning Photoshop,
            CapCut editing, AI automation, or dropshipping on Markaz, our students follow a strict daily routine
            designed to build discipline, client outreach habits, and a verified portfolio."
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                <strong>Real Client Hunting:</strong> Students learn to send 30-40 targeted messages daily on Facebook,
                LinkedIn, and freelance marketplaces.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                <strong>Verified Portfolios:</strong> No student leaves without 4-5 finished client-ready deliverables
                in their public showcase.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                <strong>Payment Protection Rules:</strong> Teaching safe advance deposits (50% or 100%), Easypaisa/JazzCash,
                and Binance USDT escrow rules.
              </p>
            </div>
          </div>
        </div>

        {/* Campus Information Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-lg space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <MapPin size={20} className="text-amber-500" />
            <span>Sadiqabad Physical Campus</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Campus Location</p>
              <p className="font-extrabold text-slate-900 text-sm mt-1">
                Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Director & Helpline</p>
              <p className="font-extrabold text-slate-900 text-sm mt-1">
                Adeel Bhatti — 0309-3534289 (WhatsApp & Calls)
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Training Facilities</p>
              <p className="text-xs text-slate-700 mt-1">
                High-speed internet workstations, Photoshop/CapCut editing setups, interactive digital projection,
                and mentorship review stations.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/923093534289"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={15} />
              <span>WhatsApp Director</span>
            </a>
            <Link
              to="/academy/register"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Student Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Academy Core Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
            Our Core Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            The Three Golden Rules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              1
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Roz Kaam = Roz Paisa</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consistency is the single determining factor in freelancing. Students who maintain their daily
              streak and outreach targets build predictable monthly revenues.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
              2
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Client Hi Paisa Hai</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skills without clients earn zero. We dedicate half our instruction to finding client pain points,
              pitching solutions, and handling negotiations professionally.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              3
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Proof Over Promises</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clients don't buy certificates; they buy proof. Our student public showcase provides verified links
              that clients can inspect before hiring you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
