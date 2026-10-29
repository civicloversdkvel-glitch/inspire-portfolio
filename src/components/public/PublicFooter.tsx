import React from 'react';
import { Link } from 'react-router-dom';
import { InspireLogo } from '../InspireLogo';
import {
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Gamepad2,
  Command,
} from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper Footer CTA Strip */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 border-b border-blue-800/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Already a student? Your workspace is ready.
            </h3>
            <p className="text-xs sm:text-sm text-blue-200">
              Register or sign in to upload your assignments, submit projects and review feedback.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link to="/academy/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-white/15">
              <GraduationCap size={15} /> Student Login
            </Link>
            <Link to="/academy/register" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-extrabold text-blue-950 shadow-md transition hover:bg-amber-300">
              <ShieldCheck size={15} /> Student Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl p-1.5 shadow-md border-2 border-yellow-400 flex items-center justify-center shrink-0">
                <InspireLogo alt="The Inspire Business Academy Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white leading-tight">
                  THE INSPIRE <span className="text-amber-400">BUSINESS ACADEMY</span>
                </h4>
                <p className="text-xs text-slate-400 font-medium">Learn • Earn • Grow</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Sadiqabad's premier hands-on institute for practical freelancing, e-commerce dropshipping,
              graphic design, CapCut video editing, AI automation, and verified client acquisition training.
            </p>
            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-emerald-400 shrink-0" />
                <a href="tel:03093534289" className="hover:text-white transition-colors">
                  03093534289 (Adeel Bhatti, Director)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-blue-400 shrink-0" />
                <span>theinspirebusinessacademy@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Programs Column */}
          <div className="space-y-3">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Diploma Programs
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/courses/c3" className="hover:text-white transition-colors">
                  Graphic Design (Photoshop)
                </Link>
              </li>
              <li>
                <Link to="/courses/c4" className="hover:text-white transition-colors">
                  CapCut Video Editing
                </Link>
              </li>
              <li>
                <Link to="/courses/c5" className="hover:text-white transition-colors">
                  AI Tools Mastery
                </Link>
              </li>
              <li>
                <Link to="/courses/c6" className="hover:text-white transition-colors">
                  YouTube Automation
                </Link>
              </li>
              <li>
                <Link to="/courses/c9" className="hover:text-white transition-colors">
                  Local Dropshipping (Markaz)
                </Link>
              </li>
              <li>
                <Link to="/courses/c8" className="hover:text-white transition-colors">
                  Facebook & Social Mastery
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-amber-400 hover:underline font-bold">
                  View All 10 Courses &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Hub Column */}
          <div className="space-y-3">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Student Resources
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/academy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-blue-400" />
                  <span>Student Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/public-portfolio" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Award size={13} className="text-amber-400" />
                  <span>Student Showcase</span>
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <BookOpen size={13} className="text-emerald-400" />
                  <span>Learning Guide</span>
                </Link>
              </li>
              <li>
                <Link to="/shortcuts" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Command size={13} className="text-purple-400" />
                  <span>133 Shortcut Vault</span>
                </Link>
              </li>
              <li>
                <Link to="/games" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Gamepad2 size={13} className="text-orange-400" />
                  <span>Interactive Games</span>
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>AI Learning Assistant</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy Info & Legal */}
          <div className="space-y-3">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Institution
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Academy
                </Link>
              </li>
              <li>
                <Link to="/skills-info" className="hover:text-white transition-colors">
                  Career Skills Track
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-white transition-colors">
                  Noticeboard & News
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Campus Location & Visits
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck size={13} className="text-yellow-400" />
                  <span>Admin Management</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} The Inspire Business Academy. All rights reserved. Sadiqabad, Pakistan.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Founder: Adeel Bhatti</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">WhatsApp Helpline: 0309-3534289</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
