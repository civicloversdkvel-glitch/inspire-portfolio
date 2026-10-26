import { Home, CheckSquare, Briefcase, Target, BookOpen, BarChart2, Gamepad2, Settings, Bot } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/reports', icon: BarChart2, label: 'Reports' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/chatbot', icon: Bot, label: 'Chatbot' },
    { path: '/learning', icon: BookOpen, label: 'PDFs' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Don't show on splash, skills setup, or chatbot
  if (['/', '/skills', '/chatbot'].includes(location.pathname)) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar gap-2">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[4rem] transition-colors duration-200 shrink-0",
              isActive ? "text-blue-700" : "text-gray-400 hover:text-blue-500"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-full transition-all duration-300",
              isActive ? "bg-blue-50" : "bg-transparent"
            )}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[10px] mt-1 font-medium",
              isActive ? "text-blue-700" : "text-gray-500"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
