/**
 * Pure weekly summary & growth statistics
 * In accordance with PRD BR-08
 */

export interface DayTaskScore {
  date: string;
  messagesSent: number;
  ordersCompleted: number;
  earnings: number;
}

export interface WeeklySummaryResult {
  bestDay: string;
  worstDay: string;
  growth: number;
  currentWeekEarnings: number;
  lastWeekEarnings: number;
  chartData: Array<{ date: string; earnings: number; score: number }>;
}

export function calcWeeklySummary(
  tasksByDate: Record<string, DayTaskScore>,
  referenceDateStr: string
): WeeklySummaryResult {
  const d = new Date(referenceDateStr + 'T12:00:00Z');
  const last7Days: string[] = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(d);
    cur.setUTCDate(cur.getUTCDate() - i);
    last7Days.push(cur.toISOString().split('T')[0]);
  }

  let bestDay = { date: '-', score: -1 };
  let worstDay = { date: '-', score: 999999 };
  let currentWeekEarnings = 0;
  let lastWeekEarnings = 0;

  last7Days.forEach((date) => {
    const task = tasksByDate[date];
    if (task) {
      const score = (task.ordersCompleted || 0) * 10 + (task.messagesSent || 0);
      if (score > bestDay.score) bestDay = { date, score };
      if (score < worstDay.score) worstDay = { date, score };
      currentWeekEarnings += task.earnings || 0;
    } else {
      if (0 < worstDay.score) worstDay = { date, score: 0 };
    }
  });

  for (let i = 7; i < 14; i++) {
    const cur = new Date(d);
    cur.setUTCDate(cur.getUTCDate() - i);
    const dateKey = cur.toISOString().split('T')[0];
    const task = tasksByDate[dateKey];
    if (task) lastWeekEarnings += task.earnings || 0;
  }

  const growth =
    lastWeekEarnings === 0
      ? currentWeekEarnings > 0
        ? 100
        : 0
      : Math.round(((currentWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100);

  const chartData = [...last7Days].reverse().map((date) => {
    const task = tasksByDate[date];
    const score = task ? (task.ordersCompleted || 0) * 10 + (task.messagesSent || 0) : 0;
    return {
      date: date.substring(5), // MM-DD
      earnings: task?.earnings || 0,
      score,
    };
  });

  return {
    bestDay: bestDay.date,
    worstDay: worstDay.date,
    growth,
    currentWeekEarnings,
    lastWeekEarnings,
    chartData,
  };
}
