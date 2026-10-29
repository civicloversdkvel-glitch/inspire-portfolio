import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { InspireLogo } from '../InspireLogo';
import {
  GraduationCap,
  Menu,
  X,
  Phone,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTasksViewModel } from '../../store/useTasksViewModel';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { streak } = useTasksViewModel();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Courses', path: '/courses' },
    { label: 'Student Showcase', path: '/public-portfolio' },
    { label: 'Skills Track', path: '/skills-info' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Student Support', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 glass-header border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top micro-bar for quick contact info */}
      <div className="bg-blue-950 text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-blue-900/50">
        <div className="flex items-center gap-3 sm:gap-6 truncate">
          <span className="flex items-center gap-1.5 font-medium text-yellow-400">
            <Sparkles size={13} className="shrink-0" />
            <span className="truncate">Student Portal • Assignments & Projects</span>
          </span>
          <span className="hidden md:inline-block text-slate-400">|</span>
          <span className="hidden md:inline-block truncate text-slate-300">
            📍 Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="https://wa.me/923093534289"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            <Phone size={12} />
            <span>03093534289</span>
          </a>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white rounded-2xl p-1.5 shadow-md border-2 border-yellow-400 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
            <InspireLogo alt="The Inspire Business Academy Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Sadiqabad Campus
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight leading-tight mt-0.5">
              THE INSPIRE <span className="text-amber-500">BUSINESS ACADEMY</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Learn • Earn • Grow</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden xl:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive(link.path)
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {/* Student Portal CTA */}
          <Link
            to="/academy"
            className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <GraduationCap size={16} className="text-blue-700" />
            <span>Student Portal</span>
            {streak > 0 && (
              <span className="bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded-full text-[10px] font-black flex items-center gap-0.5 ml-0.5">
                <Flame size={10} className="fill-blue-950" /> {streak}d
              </span>
            )}
          </Link>

          <Link
            to="/academy/register"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-blue-950 text-xs font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Student Register</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex xl:hidden items-center gap-2">
          <Link
            to="/academy"
            className="sm:hidden p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200"
            title="Student Portal"
          >
            <GraduationCap size={18} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 pb-2 mb-2 border-b border-slate-100">
            <Link
              to="/academy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 text-center"
            >
              <GraduationCap size={15} />
              <span>Student Portal</span>
            </Link>
            <Link
              to="/academy/register"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl bg-amber-400 text-blue-950 text-xs font-extrabold flex items-center justify-center gap-1.5 text-center"
            >
              <span>Student Register</span>
            </Link>
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-900 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end text-xs text-slate-500">
            <a href="https://wa.me/923093534289" className="text-emerald-700 font-bold">
              WhatsApp Support
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
