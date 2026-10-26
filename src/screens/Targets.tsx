import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTasksViewModel } from '../store/useTasksViewModel';
import { useTargetsViewModel } from '../store/useTargetsViewModel';
import { Target as TargetIcon, TrendingUp, Award, MessageSquare, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export function Targets() {
  const { todayTask } = useTasksViewModel();
  const { weeklyStats, monthlyStats } = useTargetsViewModel();

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const TargetCard = ({ title, current, target, icon: Icon, colorTheme, prefix = '' }: any) => {
    const progress = Math.min(100, (current / target) * 100);
    const barColor = getProgressColor(progress);

    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorTheme}`}>
              <Icon size={20} />
            </div>
            <h3 className="font-bold text-gray-800">{title}</h3>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${colorTheme}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${barColor}`}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right font-medium">
          {prefix}
          {current} of {prefix}
          {target}
        </p>
      </div>
    );
  };

  return (
    <ScreenWrapper className="bg-gray-50">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <h1 className="text-2xl font-bold">Targets</h1>
        <p className="text-blue-200 text-sm mt-1">Track your earning and learning goals</p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Daily Targets */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TargetIcon size={16} /> Daily Progress
          </h2>
          <div className="space-y-4">
            <TargetCard
              title="Messages Sent"
              current={todayTask.messagesSent}
              target={30}
              icon={MessageSquare}
              colorTheme="bg-blue-50 text-blue-600"
            />
            <TargetCard
              title="Orders Completed"
              current={todayTask.ordersCompleted}
              target={2}
              icon={ShoppingBag}
              colorTheme="bg-blue-50 text-blue-600"
            />
          </div>
        </section>

        {/* Weekly Targets */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Weekly Summary
          </h2>
          <div className="space-y-4">
            <TargetCard
              title="Weekly Messages"
              current={weeklyStats.messagesSent}
              target={200}
              icon={MessageSquare}
              colorTheme="bg-indigo-50 text-indigo-600"
            />
            <TargetCard
              title="Weekly Orders"
              current={weeklyStats.ordersCompleted}
              target={10}
              icon={ShoppingBag}
              colorTheme="bg-indigo-50 text-indigo-600"
            />
            <TargetCard
              title="Weekly Clients"
              current={weeklyStats.clientsObtained}
              target={20}
              icon={Users}
              colorTheme="bg-indigo-50 text-indigo-600"
            />
          </div>
        </section>

        {/* Monthly Targets */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award size={16} /> Monthly Milestones
          </h2>
          <div className="space-y-4">
            <TargetCard
              title="Monthly Messages"
              current={monthlyStats.messagesSent}
              target={800}
              icon={MessageSquare}
              colorTheme="bg-purple-50 text-purple-600"
            />
            <TargetCard
              title="Monthly Orders"
              current={monthlyStats.ordersCompleted}
              target={40}
              icon={ShoppingBag}
              colorTheme="bg-purple-50 text-purple-600"
            />
            <TargetCard
              title="Monthly Earnings"
              current={monthlyStats.earnings}
              target={30000}
              icon={DollarSign}
              colorTheme="bg-purple-50 text-purple-600"
              prefix="$"
            />
          </div>
        </section>
      </div>
    </ScreenWrapper>
  );
}
