import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesContent } from '../../data/coursesContent';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Flame,
  Award,
  BookOpen,
  DollarSign,
  TrendingUp,
  FileCheck,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  Monitor,
  Video,
  Palette,
  Bot,
  ShoppingCart,
  Share2,
} from 'lucide-react';

export const PublicHome: React.FC = () => {
  const navigate = useNavigate();

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryCourse, setInquiryCourse] = useState('Graphic Design (Photoshop)');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [inquiryStatus, setInquiryStatus] = useState<'success' | 'error' | null>(null);

  // Selected course for quick preview modal
  const [previewCourse, setPreviewCourse] = useState<any | null>(null);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitting(true);
    setInquirySuccess(null);
    setInquiryStatus(null);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail,
          course: inquiryCourse,
          message: inquiryMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Inquiry could not be submitted.');
      setInquiryStatus('success');
      setInquirySuccess(data.message || 'Admission inquiry submitted successfully! Our director will contact you via WhatsApp.');
      setInquiryName('');
      setInquiryPhone('');
      setInquiryEmail('');
      setInquiryMessage('');
    } catch {
      setInquiryStatus('error');
      setInquirySuccess("We couldn't save your inquiry online. Please contact us on WhatsApp at 03093534289.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  const coreSkills = [
    {
      name: 'Graphic Designing',
      icon: Palette,
      color: 'bg-purple-600',
      badge: 'High Demand',
      description: 'Master Photoshop, logo creation, branding kits, and social media banners.',
      targetEarnings: 'Rs 15,000 - 30,000/mo',
      courseId: 'c3',
    },
    {
      name: 'Video Editing',
      icon: Video,
      color: 'bg-red-600',
      badge: 'Viral Reels',
      description: 'CapCut masterclass, dynamic subtitles, pacing, sound effects & client reels.',
      targetEarnings: 'Rs 25,000 - 50,000/mo',
      courseId: 'c4',
    },
    {
      name: 'Digital Marketing',
      icon: TrendingUp,
      color: 'bg-blue-600',
      badge: 'Business Growth',
      description: 'Facebook Meta Business Suite, WhatsApp marketing, and organic lead generation.',
      targetEarnings: 'Rs 20,000 - 45,000/mo',
      courseId: 'c10',
    },
    {
      name: 'AI Content Creation',
      icon: Bot,
      color: 'bg-cyan-600',
      badge: 'Modern Tech',
      description: 'Prompt engineering, Midjourney, ElevenLabs AI voices, automated workflows.',
      targetEarnings: 'Rs 15,000 - 35,000/mo',
      courseId: 'c5',
    },
    {
      name: 'Local Dropshipping',
      icon: ShoppingCart,
      color: 'bg-teal-600',
      badge: 'Zero Inventory',
      description: 'Source products with Markaz app, market on social channels, and earn margins.',
      targetEarnings: 'Rs 20,000 - 40,000/mo',
      courseId: 'c9',
    },
    {
      name: 'Account Selling & Outreach',
      icon: Share2,
      color: 'bg-amber-600',
      badge: 'Quick Cashflow',
      description: 'Creating, warming up, and safely transferring verified social & business accounts.',
      targetEarnings: 'Rs 10,000 - 25,000/mo',
      courseId: 'c6',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Campus badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-yellow-300 shadow-xs">
              <Sparkles size={14} className="text-amber-400" />
              <span>Official Physical Campus in Sadiqabad • Digital Skill Diplomas</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Learn High-Income Skills.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200">
                Close Real Clients. Earn Daily.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base lg:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
              <strong>The Inspire Business Academy</strong> combines practical coursework, an integrated student
              productivity portal, daily client outreach tracking, and verified public student portfolios.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="#apply"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-blue-950 font-extrabold text-sm shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Apply for Admission</span>
                <ArrowRight size={16} />
              </a>

              <Link
                to="/academy"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/30 text-white font-bold text-sm backdrop-blur-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <GraduationCap size={18} className="text-yellow-300" />
                <span>Student Portal</span>
              </Link>

              <a
                href="https://wa.me/923093534289?text=Hello%20Adeel%20Bhatti%2C%20I%20want%20to%20learn%20more%20about%20Inspire%20Business%20Academy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={16} />
                <span>WhatsApp Helpline</span>
              </a>
            </div>

            {/* Trust Metrics Row */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-amber-400">10</p>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">Mastery Courses</p>
                <p className="text-[10px] text-blue-300">124 in-depth lesson topics</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">1,200+</p>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">Students Trained</p>
                <p className="text-[10px] text-blue-300">In Sadiqabad & online</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-yellow-300">PKT Streak</p>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">Daily Habit System</p>
                <p className="text-[10px] text-blue-300">30 msgs & 2 orders/day</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-cyan-300">AI Powered</p>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">Gemini 4 High Thinking</p>
                <p className="text-[10px] text-blue-300">24/7 learning assistant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Director Welcome & Location Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0 border-2 border-yellow-400">
              AB
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[11px] uppercase tracking-wider">
                  Academy Founder & Director
                </span>
                <span className="text-xs text-slate-500 font-medium">Adeel Bhatti</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                "Our single rule: Roz Kaam = Roz Paisa. Consistency is greater than talent."
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                We don't teach dry theory. Every student builds 4-5 real client samples, tracks outreach daily,
                and learns payment security so you never do uncompensated work.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <a
              href="https://wa.me/923093534289"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Phone size={15} />
              <span>Direct WhatsApp: 03093534289</span>
            </a>
            <Link
              to="/about"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>About Academy</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 In-Demand Career Tracks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
            Career Tracks & Specializations
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Choose Your High-Income Earning Skill
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed for immediate monetization through freelancing, local services, or remote client contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreSkills.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.name}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-400"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl ${skill.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                      {skill.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{skill.description}</p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Target Earning</p>
                    <p className="text-xs font-extrabold text-emerald-600">{skill.targetEarnings}</p>
                  </div>
                  <Link
                    to={`/courses/${skill.courseId}`}
                    className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                    title={`View ${skill.name} Curriculum`}
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10 Complete Academy Courses Section */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
                Structured Curriculum
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                All 10 Academy Diploma Courses
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Each program includes interactive chapters, practical lessons, and assignment evaluations.
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-extrabold text-blue-900 hover:text-blue-700 flex items-center gap-1 self-start"
            >
              <span>Explore Full Syllabus Directory</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coursesContent.map((course) => {
              const totalTopics = course.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold">
                        {course.chapters.length} Modules • {totalTopics} Topics
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">Diploma</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewCourse(course)}
                      className="text-xs font-bold text-blue-700 hover:underline"
                    >
                      View Modules ({course.chapters.length})
                    </button>
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors"
                    >
                      Open Course
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student Showcase / Portfolio Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600">
              <Award size={16} />
              <span>Verified Student Work</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Public Student Showcase & Portfolio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore real designs, edited videos, marketing campaigns, and projects produced by our students.
            </p>
          </div>
          <Link
            to="/public-portfolio"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm self-start"
          >
            <Award size={15} />
            <span>Open Public Showcase Gallery</span>
          </Link>
        </div>

        {/* Highlight Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-tr from-purple-800 to-indigo-600 p-6 flex flex-col justify-between text-white">
              <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase w-fit">
                Graphic Designing
              </span>
              <div>
                <p className="text-xs text-purple-200 font-semibold">Student Project #1</p>
                <h4 className="text-lg font-black mt-0.5">Corporate Branding & Identity Kit</h4>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Student: Muhammad Ali (IBA-2026-0012)</span>
                <div className="flex text-amber-500">
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full brand kit including vector logo, social media banners, typography hierarchy, and color palettes.
              </p>
              <Link
                to="/public-portfolio"
                className="text-xs font-bold text-blue-700 hover:underline inline-block pt-1"
              >
                Verify in Public Showcase &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-tr from-rose-800 to-red-600 p-6 flex flex-col justify-between text-white">
              <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase w-fit">
                Video Editing (CapCut)
              </span>
              <div>
                <p className="text-xs text-red-200 font-semibold">Student Project #2</p>
                <h4 className="text-lg font-black mt-0.5">Viral Short-Form Reels Series</h4>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Student: Ayesha Khan (IBA-2026-0042)</span>
                <div className="flex text-amber-500">
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fast-paced vertical videos with animated kinetic subtitles, zoom cuts, sound design, and color grading.
              </p>
              <Link
                to="/public-portfolio"
                className="text-xs font-bold text-blue-700 hover:underline inline-block pt-1"
              >
                Verify in Public Showcase &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-tr from-emerald-800 to-teal-600 p-6 flex flex-col justify-between text-white">
              <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase w-fit">
                Local Dropshipping
              </span>
              <div>
                <p className="text-xs text-emerald-200 font-semibold">Student Project #3</p>
                <h4 className="text-lg font-black mt-0.5">Markaz Sourcing & Campaign</h4>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Student: Usman Tariq (IBA-2026-0088)</span>
                <div className="flex text-amber-500">
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                  <Star size={13} className="fill-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generated over 45 successful orders in the local market with transparent profit margin tracking sheets.
              </p>
              <Link
                to="/public-portfolio"
                className="text-xs font-bold text-blue-700 hover:underline inline-block pt-1"
              >
                Verify in Public Showcase &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How Admission Works Roadmap */}
      <section className="bg-blue-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              Straightforward Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How Admission & Learning Works
            </h2>
            <p className="text-xs sm:text-sm text-blue-200">
              Join hundreds of successful graduates through our structured four-step path.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-3xl p-6 border border-white/15 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 font-black flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Choose Your Track</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Select from our 10 courses and 6 career tracks based on your interests and monetization goals.
              </p>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 border border-white/15 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 font-black flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">Submit Application</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Fill the simple online admission form below or visit our physical academy near Shimla Point, Sadiqabad.
              </p>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 border border-white/15 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 font-black flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Receive Roll Number</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Once reviewed by Director Adeel Bhatti, you receive your permanent roll number (e.g. IBA-2026-0042).
              </p>
            </div>

            <div className="bg-white/10 rounded-3xl p-6 border border-white/15 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 font-black flex items-center justify-center text-lg">
                4
              </div>
              <h3 className="text-base font-bold text-white">Log Daily & Build Proof</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Access your Student Portal, maintain streaks, submit assignments, and publish verified client samples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Admission & Inquiry Form */}
      <section id="apply" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/90 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold uppercase tracking-widest border border-amber-200">
              Online Admission Form
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Apply for Current Batch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Fill out your details below. You will receive an immediate response and WhatsApp confirmation.
            </p>
          </div>

          {inquirySuccess && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${inquiryStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              {inquiryStatus === 'error' ? <Phone size={18} className="text-rose-600 shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{inquirySuccess}</p>
                <p className={inquiryStatus === 'error' ? "mt-1 text-rose-700" : "mt-1 text-emerald-700"}>
                  You can also WhatsApp Director Adeel Bhatti at <strong>03093534289</strong> for urgent fee queries.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="e.g. Muhammad Hamza"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Preferred Course Track *
                </label>
                <select
                  value={inquiryCourse}
                  onChange={(e) => setInquiryCourse(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                >
                  {coursesContent.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Your Goals / Message
              </label>
              <textarea
                rows={3}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="Tell us about your background or any questions you have..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-slate-400">
                🔒 Your contact details are kept strictly private for academy admission communication.
              </p>
              <button
                type="submit"
                disabled={inquirySubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {inquirySubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Admission Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Course Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 bg-blue-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-300">
                  Course Modules & Syllabus
                </span>
                <h3 className="text-base font-extrabold">{previewCourse.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCourse(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-600 leading-relaxed">{previewCourse.description}</p>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Modules Included ({previewCourse.chapters.length})
                </h4>
                {previewCourse.chapters.map((ch: any, idx: number) => (
                  <div key={ch.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-xs font-extrabold text-blue-950">
                      Module {idx + 1}: {ch.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{ch.topics.length} In-depth Lessons</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
              <Link
                to={`/courses/${previewCourse.id}`}
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold"
              >
                View Full Lessons
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
