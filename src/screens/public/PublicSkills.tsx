import React from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Video,
  TrendingUp,
  Bot,
  ShoppingCart,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';

export const PublicSkills: React.FC = () => {
  const tracks = [
    {
      name: 'Graphic Designing',
      icon: Palette,
      badge: 'Most Popular',
      color: 'bg-purple-600',
      courseId: 'c3',
      description: 'Master Adobe Photoshop, vector art, visual identity, social media graphics, and print media design.',
      dailyRoutine: 'Design 1 creative social asset or logo concept daily.',
      whatYouLearn: [
        'Photoshop interface, layers, masking & adjustment layers',
        'Object selection, background removal & skin retouching',
        'Typography pairing, hierarchy & modern layout design',
        'Exporting for web, print (300 DPI), and YouTube thumbnails',
      ],
      clientMarkets: 'E-commerce brands, YouTubers, local businesses in Pakistan & freelance portals.',
    },
    {
      name: 'Video Editing',
      icon: Video,
      badge: 'High Earning',
      color: 'bg-red-600',
      courseId: 'c4',
      description: 'Professional video editing with CapCut desktop & mobile, vertical reels, and storytelling rhythm.',
      dailyRoutine: 'Edit 1 short-form reel or cut 1 client project sample daily.',
      whatYouLearn: [
        'A-Roll and B-Roll cutting with seamless transitions',
        'Automated & kinetic dynamic animated subtitles',
        'Color grading, filters, and cinematic sound design',
        'Client workflows for TikTok, Instagram Reels, and YouTube Shorts',
      ],
      clientMarkets: 'Content creators, podcast channels, digital agencies, and e-commerce stores.',
    },
    {
      name: 'Digital Marketing',
      icon: TrendingUp,
      badge: 'Scalable Growth',
      color: 'bg-blue-600',
      courseId: 'c10',
      description: 'Zero-budget organic marketing, copywriting psychology, lead generation, and Meta Business Suite campaigns.',
      dailyRoutine: 'Launch 1 organic outreach campaign or write 3 viral hooks daily.',
      whatYouLearn: [
        'Copywriting psychology: Hooks, storytelling, and high-conversion CTAs',
        'Meta Business Suite scheduling, groups ecosystem & audience targeting',
        'Organic lead generation and WhatsApp business funneling',
        'SEO essentials and micro-influencer collaboration models',
      ],
      clientMarkets: 'Local retailers, online service providers, startups, and international businesses.',
    },
    {
      name: 'AI Content Creation',
      icon: Bot,
      badge: 'Future Tech',
      color: 'bg-cyan-600',
      courseId: 'c5',
      description: 'Generative AI tools, prompt engineering, Midjourney image generation, and ElevenLabs voice design.',
      dailyRoutine: 'Produce 1 complete AI content batch or slide presentation daily.',
      whatYouLearn: [
        'Prompt engineering (zero-shot, few-shot, structured schemas)',
        'AI image generation with Midjourney & DALL-E, vector conversions',
        'Text-to-speech with natural vocal bursts and podcast backchanneling',
        'Automated document summarization & slide deck generation',
      ],
      clientMarkets: 'Digital publishers, faceless channel operators, and marketing teams.',
    },
    {
      name: 'Local Dropshipping',
      icon: ShoppingCart,
      badge: 'E-Commerce Cashflow',
      color: 'bg-teal-600',
      courseId: 'c9',
      description: 'Zero-inventory local e-commerce in Pakistan using Markaz app and direct social media fulfillment.',
      dailyRoutine: 'Identify 1 winning product and test outreach ads on Facebook.',
      whatYouLearn: [
        'Finding trending problem-solving products on Markaz & local wholesale markets',
        'Creating high-converting listings on Facebook Marketplace & WhatsApp Catalog',
        'Calculating gross vs net profit margins & handling courier COD deliveries',
        'Financial tracking with Google Sheets and scaling winner campaigns',
      ],
      clientMarkets: 'Pakistani online shoppers across Punjab, Sindh, KPK, and Balochistan.',
    },
    {
      name: 'Account Selling & Outreach',
      icon: Share2,
      badge: 'Quick Revenue',
      color: 'bg-amber-600',
      courseId: 'c6',
      description: 'Creating, warming up, and securely delivering aged Gmail, Facebook, and social media assets to marketing buyers.',
      dailyRoutine: 'Warm up 5-10 accounts daily and execute 30 outreach messages.',
      whatYouLearn: [
        'Safe multi-account infrastructure and device fingerprint isolation',
        'Legitimate phone verification strategies & 2-factor authenticator setup',
        'Warming schedules (7-10 days) to prevent algorithmic shadow-bans',
        'Safe delivery protocols, escrow payment verification & client retention',
      ],
      clientMarkets: 'Affiliate marketers, advertising agencies, and digital growth specialists.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-bold uppercase tracking-widest border border-white/20">
            Vocational Skills Tracks
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            6 Specialized Pathways to Independent Earning
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Every track at Inspire Business Academy is tailored to specific monetization markets.
            Our students master both the production technicalities and client acquisition strategies.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {tracks.map((track) => {
          const Icon = track.icon;
          return (
            <div
              key={track.name}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${track.color} text-white flex items-center justify-center shadow-md shrink-0`}
                  >
                    <Icon size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{track.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                        {track.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{track.description}</p>
                  </div>
                </div>

                <Link
                  to={`/courses/${track.courseId}`}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
                >
                  <span>Explore Course Track</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
                    Daily Student Habit
                  </p>
                  <p className="text-slate-700 leading-relaxed font-medium">{track.dailyRoutine}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
                    Core Technical Syllabus
                  </p>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {track.whatYouLearn.map((item, idx) => (
                      <li key={idx} className="truncate">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
                    Primary Client Markets
                  </p>
                  <p className="text-slate-700 leading-relaxed">{track.clientMarkets}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
