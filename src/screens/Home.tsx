import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { InspireLogo } from '../components/InspireLogo';
import { useTasksViewModel } from '../store/useTasksViewModel';
import { CheckSquare, BarChart2, Briefcase, Target, Phone, MapPin, User, Flame, Bell, BookOpen, Search, Command, GraduationCap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Home() {
  const navigate = useNavigate();
  const { streak, streakReward, todayTask } = useTasksViewModel();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show offline notification if tasks are incomplete
    if (todayTask.messagesSent < 30 || todayTask.ordersCompleted === 0) {
      const timer = setTimeout(() => setShowNotification(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [todayTask]);

  const menuItems = [
    { title: 'Daily Tasks', icon: CheckSquare, color: 'bg-blue-500', path: '/tasks' },
    { title: 'Reports', icon: BarChart2, color: 'bg-indigo-500', path: '/reports' },
    { title: 'Portfolio', icon: Briefcase, color: 'bg-purple-500', path: '/portfolio' },
    { title: 'Targets', icon: Target, color: 'bg-yellow-500', path: '/targets' },
    { title: 'PDF Learning', icon: BookOpen, color: 'bg-green-500', path: '/learning' },
    { title: 'Courses', icon: BookOpen, color: 'bg-teal-500', path: '/courses' },
    { title: 'Games', icon: Target, color: 'bg-orange-500', path: '/games' },
    { title: 'Shortcuts', icon: Command, color: 'bg-pink-500', path: '/shortcuts' },
    { title: 'Student Portal', icon: GraduationCap, color: 'bg-sky-600', path: '/academy' },
    { title: 'Public Showcase', icon: Award, color: 'bg-amber-600', path: '/public-portfolio' },
  ];

  return (
    <ScreenWrapper className="bg-gray-50 relative">
      {/* Header: Heading first at the top, quick actions neatly below */}
      <div className="bg-blue-900 text-white rounded-b-[2.5rem] pt-7 pb-7 px-5 sm:px-6 shadow-lg relative overflow-hidden shrink-0">
        <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>

        <div className="flex justify-between items-center gap-2.5 relative z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-lg border-2 border-yellow-400/80 shrink-0 flex items-center justify-center">
              <InspireLogo
                alt="The Inspire Business Academy Logo"
                className="w-full h-full object-contain block"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[11px] sm:text-xs text-blue-200 font-semibold uppercase tracking-wider leading-snug">
                Welcome to
              </h2>
              <h1 className="text-[15px] min-[360px]:text-base sm:text-lg font-extrabold leading-tight tracking-tight">
                THE INSPIRE
                <br />
                <span className="text-yellow-400">BUSINESS ACADEMY</span>
              </h1>
            </div>
          </div>

          {/* Streak Badge */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30 shadow-sm">
              <Flame size={16} className={streak > 0 ? 'text-yellow-400' : 'text-gray-300'} />
              <span className="font-bold text-sm">{streak}</span>
            </div>
            {streak > 0 && (
              <span className="text-[10px] text-yellow-300 font-medium uppercase tracking-wider pr-1">
                {streakReward}
              </span>
            )}
          </div>
        </div>

        {/* Search & Profile Bar below the main heading */}
        <div className="flex items-center gap-2.5 mt-5 relative z-10">
          <button
            onClick={() => navigate('/search')}
            aria-label="Search"
            className="flex-1 min-w-0 h-10 bg-white/10 rounded-xl px-3.5 flex items-center gap-2 text-blue-100 text-xs backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Search size={16} className="text-white shrink-0" />
            <span className="truncate">Search courses, tasks, shortcuts...</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            aria-label="Profile"
            className="h-10 px-3.5 bg-white/10 rounded-xl flex items-center gap-1.5 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors shrink-0"
          >
            <User size={16} className="text-white shrink-0" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Offline Notification Banner (below header so it never covers the heading) */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mt-5 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-start gap-3 shrink-0"
          >
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full shrink-0">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-800">Daily Reminder</h4>
              <p className="text-xs text-gray-500 mt-0.5">30 messages bheje? Aaj ka report fill karo!</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold px-2">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="px-6 py-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Dashboard</h3>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md`}>
                  <Icon size={24} />
                </div>
                <span className="font-semibold text-gray-700 text-sm">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Academy Info</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Owner</p>
                <p className="text-sm font-semibold text-gray-800">Adeel Bhatti</p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Contact & WhatsApp</p>
                  <p className="text-sm font-semibold text-gray-800">03093534289</p>
                </div>
              </div>
              <a
                href="https://wa.me/923093534289"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors shrink-0 self-center"
              >
                WhatsApp Help
              </a>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Address</p>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
