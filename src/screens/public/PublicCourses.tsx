import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { coursesContent } from '../../data/coursesContent';
import {
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
  GraduationCap,
} from 'lucide-react';

export const PublicCourses: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCourseModal, setActiveCourseModal] = useState<any | null>(null);

  const categories = useMemo(() => {
    return ['All', 'Design & Media', 'Business & Marketing', 'Technical & AI', 'Productivity'];
  }, []);

  const getCourseCategory = (courseId: string) => {
    if (['c3', 'c4'].includes(courseId)) return 'Design & Media';
    if (['c6', 'c8', 'c9', 'c10'].includes(courseId)) return 'Business & Marketing';
    if (['c5', 'c7'].includes(courseId)) return 'Technical & AI';
    return 'Productivity';
  };

  const filteredCourses = useMemo(() => {
    return coursesContent.filter((course) => {
      const cat = getCourseCategory(course.id);
      if (selectedCategory !== 'All' && cat !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesDesc = course.description.toLowerCase().includes(q);
        return matchesTitle || matchesDesc;
      }
      return true;
    });
  }, [search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-bold uppercase tracking-widest border border-white/20">
            Professional Curriculum
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            10 Industry-Standard Diploma Programs
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Every course is taught with live client simulations, homework projects, and direct grading
            from academy instructors in Sadiqabad.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-700"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const totalTopics = course.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
          const category = getCourseCategory(course.id);
          return (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-[10px] font-extrabold uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Diploma</span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{course.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Layers size={14} className="text-blue-600" />
                    <span>{course.chapters.length} Modules</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-600" />
                    <span>{totalTopics} Topics</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCourseModal(course)}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  View Syllabus
                </button>
                <Link
                  to={`/courses/${course.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Syllabus Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 bg-blue-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-300">
                  Complete Course Syllabus
                </span>
                <h3 className="text-lg font-extrabold">{activeCourseModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCourseModal(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-600 leading-relaxed">{activeCourseModal.description}</p>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Modules & Lesson Outlines
                </h4>
                {activeCourseModal.chapters.map((ch: any, idx: number) => (
                  <div key={ch.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-blue-950">
                        Module {idx + 1}: {ch.title}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">
                        {ch.topics.length} Lessons
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                      {ch.topics.map((tp: any) => (
                        <li key={tp.id} className="truncate">
                          {tp.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveCourseModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
              <div className="flex gap-2">
                <Link
                  to="/contact#apply"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-blue-950 text-xs font-extrabold"
                >
                  Enroll in Program
                </Link>
                <Link
                  to={`/courses/${activeCourseModal.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold"
                >
                  Read Topics
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
