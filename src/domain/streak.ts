/**
 * Pure business logic for Student Streak calculations
 * In accordance with PRD BR-05 & TRD §2.9
 */

export interface DailyLogEntity {
  date: string;
  messagesSent: number;
  ordersCompleted: number;
  assetsCreated: number;
  portfolioImproved: boolean;
  learningMinutes: number;
  clientsObtained: number;
  earnings: number;
  skillTasksCompleted?: Record<string, boolean>;
  topicsRead?: number;
}

export interface StreakConfig {
  minMsgs: number;
  minOrders: number;
}

export const DEFAULT_STREAK_CONFIG: StreakConfig = {
  minMsgs: 10,
  minOrders: 1,
};

export function isActiveDay(log?: DailyLogEntity, config: StreakConfig = DEFAULT_STREAK_CONFIG): boolean {
  if (!log) return false;
  return (
    (log.messagesSent || 0) >= config.minMsgs ||
    (log.ordersCompleted || 0) >= config.minOrders ||
    Boolean(log.portfolioImproved) ||
    Boolean(log.topicsRead && log.topicsRead > 0)
  );
}

export function calcStreak(logsByDate: Record<string, DailyLogEntity>, todayStr: string, config = DEFAULT_STREAK_CONFIG): number {
  let streak = 0;
  const d = new Date(todayStr + 'T12:00:00Z');
  
  // Today counts if already active
  const todayKey = d.toISOString().split('T')[0];
  if (isActiveDay(logsByDate[todayKey], config)) {
    streak++;
  }

  // Count backwards consecutive days
  d.setUTCDate(d.getUTCDate() - 1);
  while (true) {
    const prevKey = d.toISOString().split('T')[0];
    if (isActiveDay(logsByDate[prevKey], config)) {
      streak++;
      d.setUTCDate(d.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getStreakReward(streak: number): 'Keep Going' | 'On Fire' | 'Good Consistency' | 'Pro Level' {
  if (streak >= 30) return 'Pro Level';
  if (streak >= 7) return 'Good Consistency';
  if (streak >= 3) return 'On Fire';
  return 'Keep Going';
}
