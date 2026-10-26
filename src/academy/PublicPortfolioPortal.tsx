import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InspireLogo } from '../components/InspireLogo';
import { fetchPublicPortfolios } from './academyApi';
import { ACADEMY_SKILLS, PublicPortfolioRecord } from './types';
import { formatPKTDate } from './supabase';
import { useSafeBack } from '../lib/utils';
import {
  ArrowLeft,
  Award,
  Search,
  Star,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  UserCheck,
  Briefcase,
  Loader2,
  X,
  CheckCircle2,
  FileText
} from 'lucide-react';

export function PublicPortfolioPortal() {
  const navigate = useNavigate();
  const goBack = useSafeBack('/home');
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStudentFilter = searchParams.get('student') || '';
  const initialTab = searchParams.get('tab') === 'verify' ? 'verify' : 'showcase';

  const [activeTab, setActiveTab] = useState<'showcase' | 'verify'>(initialTab);
  const [items, setItems] = useState<PublicPortfolioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialStudentFilter);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PublicPortfolioRecord | null>(null);

  // Verification Tab State
  const [verifyQuery, setVerifyQuery] = useState(initialStudentFilter);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchPublicPortfolios();
        if (active) setItems(list);
      } catch (err: any) {
        if (active) setError(err?.message || 'Could not load public portfolio showcase.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (featuredOnly && !item.is_featured) return false;
      if (selectedSkill !== 'all' && item.skill !== selectedSkill) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchStudent = item.student_name.toLowerCase().includes(q);
        const matchRoll = (item.roll_no || '').toLowerCase().includes(q);
        const matchSkill = item.skill.toLowerCase().includes(q);
        if (!matchTitle && !matchStudent && !matchRoll && !matchSkill) return false;
      }
      return true;
    });
  }, [items, featuredOnly, selectedSkill, searchQuery]);

  // Group approved public portfolios by student for verification
  const verifiedStudents = useMemo(() => {
    const map = new Map<
      string,
      {
        student_id: string;
        student_name: string;
        roll_no: string;
        skill: string;
        approved_count: number;
        featured_count: number;
        avg_rating: number;
        latest_date: string;
        works: PublicPortfolioRecord[];
      }
    >();

    for (const item of items) {
      const existing = map.get(item.student_id);
      if (!existing) {
        map.set(item.student_id, {
          student_id: item.student_id,
          student_name: item.student_name,
          roll_no: item.roll_no,
          skill: item.skill,
          approved_count: 1,
          featured_count: item.is_featured ? 1 : 0,
          avg_rating: item.rating,
          latest_date: item.created_at,
          works: [item]
        });
      } else {
        existing.approved_count += 1;
        if (item.is_featured) existing.featured_count += 1;
        existing.works.push(item);
        const totalRating = existing.works.reduce((acc, w) => acc + w.rating, 0);
        existing.avg_rating = Number((totalRating / existing.works.length).toFixed(1));
        if (!existing.roll_no && item.roll_no) existing.roll_no = item.roll_no;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.approved_count - a.approved_count);
  }, [items]);

  const matchingVerifiedStudents = useMemo(() => {
    if (!verifyQuery.trim()) return verifiedStudents;
    const q = verifyQuery.toLowerCase().trim();
    return verifiedStudents.filter(
      s =>
        s.student_name.toLowerCase().includes(q) ||
        (s.roll_no || '').toLowerCase().includes(q) ||
        s.skill.toLowerCase().includes(q)
    );
  }, [verifiedStudents, verifyQuery]);

  return (
    <ScreenWrapper className="bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-900 text-white pt-10 pb-6 px-6 rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/academy')}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
          >
            Student Login
          </button>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-lg border-2 border-yellow-400/80 shrink-0 flex items-center justify-center overflow-hidden">
            <InspireLogo
              alt="The Inspire Business Academy Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] font-extrabold uppercase tracking-widest">
              <Award size={13} />
              <span>Public Visitor Showcase</span>
            </div>
            <h1 className="text-lg font-extrabold leading-tight">
              Inspire Student Portfolios
            </h1>
            <p className="text-[11px] text-blue-200 leading-snug">
              Browse admin-approved student work & verify academy student records
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-blue-950/60 p-1 rounded-xl border border-blue-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('showcase');
              setSearchParams({});
            }}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'showcase'
                ? 'bg-yellow-400 text-blue-950 shadow-sm'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <Briefcase size={14} />
            <span>Approved Work ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('verify');
              setSearchParams({ tab: 'verify' });
            }}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'verify'
                ? 'bg-yellow-400 text-blue-950 shadow-sm'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <UserCheck size={14} />
            <span>Verify Student</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        {activeTab === 'showcase' ? (
          <>
            {/* Search & Filter Controls */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student name, roll no, or project..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSkill}
                  onChange={e => setSelectedSkill(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="all">All Skills</option>
                  {ACADEMY_SKILLS.map(skill => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setFeaturedOnly(prev => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1 shrink-0 transition-colors ${
                    featuredOnly
                      ? 'bg-amber-50 border-amber-400 text-amber-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Featured</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-xs text-gray-500 font-medium">Loading approved portfolios...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm space-y-2">
                <Briefcase className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-sm font-bold text-gray-800">No Approved Showcase Items Yet</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Once Academy Admins approve student portfolio submissions for public display, they appear here for visitors and employers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => {
                  const isImage =
                    item.file_type.startsWith('image/') ||
                    item.preview_url.startsWith('data:image/');

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:border-blue-200 transition-all"
                    >
                      {isImage && item.preview_url && (
                        <div
                          onClick={() => setSelectedItem(item)}
                          className="h-44 w-full bg-gray-100 overflow-hidden cursor-pointer relative"
                        >
                          <img
                            src={item.preview_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.is_featured && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-400 text-blue-950 text-[10px] font-extrabold uppercase flex items-center gap-1 shadow">
                              <Sparkles size={11} />
                              <span>Featured Work</span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold flex-wrap">
                              <span className="text-blue-700 font-bold">{item.skill}</span>
                              {item.roll_no && (
                                <>
                                  <span>·</span>
                                  <span>ID: {item.roll_no}</span>
                                </>
                              )}
                              <span>·</span>
                              <span>{formatPKTDate(item.created_at)}</span>
                            </div>
                            <h3 className="text-sm font-extrabold text-gray-900 mt-1">
                              {item.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                            {[1, 2, 3, 4, 5].map(st => (
                              <Star
                                key={st}
                                size={13}
                                className={
                                  st <= item.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-200'
                                }
                              />
                            ))}
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSearchQuery(item.student_name)}
                            className="text-xs font-bold text-gray-800 hover:text-blue-700 flex items-center gap-1.5"
                          >
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>{item.student_name}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink size={13} />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Student Verification Tab */
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Verify Student Portfolio & Roll Number
              </h2>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={verifyQuery}
                  onChange={e => setVerifyQuery(e.target.value)}
                  placeholder="Enter Student Name or Roll No (e.g., IBA-101)..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {matchingVerifiedStudents.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 text-xs text-gray-500">
                No matching public student record found. Only students with at least one Admin-approved public portfolio item appear in the public directory.
              </div>
            ) : (
              matchingVerifiedStudents.map(st => (
                <div
                  key={st.student_id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 size={14} />
                        <span>Verified Academy Student</span>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 mt-1">
                        {st.student_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Skill Track: <strong className="text-gray-800">{st.skill}</strong>
                        {st.roll_no ? ` · Roll No: ${st.roll_no}` : ''}
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl text-center">
                      <div className="flex items-center gap-1 text-amber-600 font-extrabold text-xs">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{st.avg_rating}</span>
                      </div>
                      <p className="text-[9px] text-amber-800 uppercase font-bold">Avg Rating</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                      <p className="text-sm font-extrabold text-blue-900">{st.approved_count}</p>
                      <p className="text-[10px] text-gray-500 font-semibold">Approved Projects</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                      <p className="text-sm font-extrabold text-amber-600">{st.featured_count}</p>
                      <p className="text-[10px] text-gray-500 font-semibold">Featured Honors</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(st.student_name);
                      setActiveTab('showcase');
                    }}
                    className="w-full py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors"
                  >
                    View All Approved Works ({st.approved_count})
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate">{selectedItem.title}</h3>
                <p className="text-[11px] text-blue-200">
                  By {selectedItem.student_name} ({selectedItem.skill})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-white/10 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {(selectedItem.file_type.startsWith('image/') ||
                selectedItem.preview_url.startsWith('data:image/')) &&
              selectedItem.preview_url ? (
                <img
                  src={selectedItem.preview_url}
                  alt={selectedItem.title}
                  className="w-full max-h-64 object-contain rounded-xl bg-gray-100"
                />
              ) : (
                <div className="p-6 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center gap-2 text-center">
                  <FileText size={28} className="text-blue-600" />
                  <p className="text-xs font-bold text-blue-950">Verified Project Deliverable</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-3">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold">Student</p>
                  <p className="font-bold text-gray-900">
                    {selectedItem.student_name}{' '}
                    {selectedItem.roll_no ? `(${selectedItem.roll_no})` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase font-bold">Academy Rating</p>
                  <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star
                        key={st}
                        size={13}
                        className={
                          st <= selectedItem.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              {selectedItem.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Project Overview
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedItem.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              {selectedItem.preview_url && (
                <a
                  href={selectedItem.preview_url}
                  download={selectedItem.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Open / Download Preview
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
}
