import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useReportsViewModel } from '../store/useReportsViewModel';
import { Calendar, CalendarDays, CalendarRange, ChevronRight, Activity, TrendingUp, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { motion } from 'motion/react';

export function Reports() {
  const navigate = useNavigate();
  const { getPerformanceScore, getInsights, getWeeklySummary } = useReportsViewModel();

  const score = getPerformanceScore();
  const insights = getInsights();
  const summary = getWeeklySummary();

  const reportTypes = [
    { title: 'Daily Report', desc: "Log today's progress", icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100', path: '/reports/daily' },
    { title: 'Weekly Report', desc: 'Summarize this week', icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-100', path: '/reports/weekly' },
    { title: 'Monthly Report', desc: 'Review monthly goals', icon: CalendarRange, color: 'text-purple-600', bg: 'bg-purple-100', path: '/reports/monthly' },
  ];

  return (
    <ScreenWrapper className="bg-gray-50">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-blue-200 text-sm mt-1">Analyze your performance</p>
          </div>
          <button
            onClick={() => navigate('/reports/history')}
            aria-label="Report History"
            className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors"
          >
            <History size={24} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Analytics Engine: Performance Score */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${score}, 100` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{score}</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" /> Performance Score
            </h3>
            <p className="text-xs text-gray-500 mt-1">Based on messages, orders, and consistency streak.</p>
          </div>
        </div>

        {/* Insights System */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Smart Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className={`p-4 rounded-xl flex items-start gap-3 border ${
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'
                }`}
              >
                {insight.type === 'warning' ? (
                  <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                ) : (
                  <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
                )}
                <p className={`text-sm font-medium ${insight.type === 'warning' ? 'text-yellow-800' : 'text-green-800'}`}>
                  {insight.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Summary Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-600" /> Weekly Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Best Day</p>
              <p className="font-bold text-gray-800 text-sm">{summary.bestDay}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Growth</p>
              <p className={`font-bold text-sm ${summary.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.growth >= 0 ? '+' : ''}
                {summary.growth}%
              </p>
            </div>
          </div>

          {/* Simple Offline CSS Chart */}
          <div className="h-24 flex items-end justify-between gap-2 pt-4 border-t border-gray-100">
            {summary.chartData.map((data, idx) => {
              const maxEarnings = Math.max(...summary.chartData.map(d => d.earnings), 1);
              const height = `${(data.earnings / maxEarnings) * 100}%`;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 w-full">
                  <div className="w-full bg-blue-100 rounded-t-md relative group h-16 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="w-full bg-blue-500 rounded-t-md"
                    />
                  </div>
                  <span className="text-[9px] text-gray-400">{data.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fill Reports Buttons */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Create Report</h3>
          <div className="space-y-3">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(report.path)}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${report.bg} ${report.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800 text-sm">{report.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{report.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300" size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
