import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTasksViewModel } from '../store/useTasksViewModel';
import { useSkillsViewModel } from '../store/useSkillsViewModel';
import { MessageSquare, ShoppingBag, Image as ImageIcon, BookOpen, CheckCircle2, Circle, AlertTriangle, Lightbulb, Trophy, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SKILL_TASKS: Record<string, string> = {
  'Graphic Designing': 'Create 1 design asset',
  'Video Editing': 'Edit 1 short video',
  'Digital Marketing': 'Optimize 1 ad campaign',
  'AI Content': 'Generate 1 content batch',
  'Dropshipping': 'Find 1 winning product',
  'Account Selling': 'Warm up 1 account'
};

export function Tasks() {
  const { todayTask, updateTodayTask } = useTasksViewModel();
  const { skills } = useSkillsViewModel();

  // Smart Logic Calculations
  const isMessagesLow = todayTask.messagesSent < 30;
  const isOrdersZero = todayTask.ordersCompleted === 0;
  const isAllCompleted =
    todayTask.messagesSent >= 30 &&
    todayTask.ordersCompleted >= 2 &&
    todayTask.assetsCreated >= 5 &&
    todayTask.portfolioImproved;

  const getProgressColor = (current: number, target: number) => {
    const percent = (current / target) * 100;
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const NumberInput = ({ label, value, target, field, icon: Icon }: any) => {
    const progress = Math.min(100, (value / target) * 100);
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Icon size={18} />
            </div>
            <span className="font-semibold text-gray-800 text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={value || ''}
              onChange={e => updateTodayTask({ [field]: Math.max(0, Number(e.target.value)) })}
              className="w-16 text-center border border-gray-200 rounded-lg p-1.5 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
            <span className="text-xs text-gray-400 font-medium">/ {target}</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${getProgressColor(value, target)}`}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  };

  const ToggleTask = ({ label, completed, onToggle }: any) => (
    <div
      onClick={onToggle}
      className={`bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer transition-colors ${
        completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
      }`}
    >
      <span className={`font-semibold text-sm ${completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {label}
      </span>
      <button type="button" className="text-gray-400 transition-colors">
        {completed ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle size={24} />}
      </button>
    </div>
  );

  return (
    <ScreenWrapper className="bg-gray-50">
      <div className="bg-blue-900 text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-md">
        <h1 className="text-2xl font-bold">Daily Tasks</h1>
        <p className="text-blue-200 text-sm mt-1">Track your daily productivity</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Smart Logic Banners */}
        <AnimatePresence>
          {isAllCompleted ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-200 p-4 rounded-xl flex items-start gap-3"
            >
              <Trophy className="text-green-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-green-800 font-bold text-sm">Amazing work!</h4>
                <p className="text-green-700 text-xs mt-0.5">You've hit your core daily targets.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {isMessagesLow && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-red-800 font-bold text-sm">Increase Outreach</h4>
                    <p className="text-red-600 text-xs mt-0.5">You are below the 30 messages target. Keep pushing!</p>
                  </div>
                </motion.div>
              )}
              {isOrdersZero && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex items-start gap-3"
                >
                  <Lightbulb className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-yellow-800 font-bold text-sm">Focus on Conversion</h4>
                    <p className="text-yellow-700 text-xs mt-0.5">Try following up with previous leads to get an order today.</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Core Numeric Targets */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Core Targets</h3>
          <div className="space-y-3">
            <NumberInput label="Send Messages" value={todayTask.messagesSent} target={30} field="messagesSent" icon={MessageSquare} />
            <NumberInput label="Complete Orders" value={todayTask.ordersCompleted} target={2} field="ordersCompleted" icon={ShoppingBag} />
            <NumberInput label="Create Assets" value={todayTask.assetsCreated} target={5} field="assetsCreated" icon={ImageIcon} />
            <NumberInput label="Learning (Mins)" value={todayTask.learningMinutes} target={60} field="learningMinutes" icon={BookOpen} />
          </div>
        </div>

        {/* Business Growth Targets */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Business Growth</h3>
          <div className="space-y-3">
            <NumberInput label="New Clients" value={todayTask.clientsObtained} target={1} field="clientsObtained" icon={Users} />
            <NumberInput label="Earnings ($)" value={todayTask.earnings} target={50} field="earnings" icon={DollarSign} />
          </div>
        </div>

        {/* Boolean Tasks */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Action Items</h3>
          <div className="space-y-3">
            <ToggleTask
              label="Improve Portfolio"
              completed={todayTask.portfolioImproved}
              onToggle={() => updateTodayTask({ portfolioImproved: !todayTask.portfolioImproved })}
            />

            {/* Skill-Based Tasks */}
            {skills.map(skill => {
              const taskDesc = SKILL_TASKS[skill];
              if (!taskDesc) return null;
              const isCompleted = todayTask.skillTasksCompleted[skill] || false;

              return (
                <ToggleTask
                  key={skill}
                  label={`[${skill}] ${taskDesc}`}
                  completed={isCompleted}
                  onToggle={() => {
                    updateTodayTask({
                      skillTasksCompleted: {
                        ...todayTask.skillTasksCompleted,
                        [skill]: !isCompleted
                      }
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
