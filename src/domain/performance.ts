/**
 * Pure Performance Score calculation module
 * In accordance with PRD BR-06 & TRD §2.9
 */

export interface PerformanceTargets {
  dailyMessages: number;
  dailyOrders: number;
}

export const DEFAULT_PERFORMANCE_TARGETS: PerformanceTargets = {
  dailyMessages: 30,
  dailyOrders: 2,
};

export function calcPerformanceScore(
  messages: number,
  orders: number,
  streak: number,
  targets: PerformanceTargets = DEFAULT_PERFORMANCE_TARGETS
): number {
  const msgScore = Math.min(1, Math.max(0, messages) / targets.dailyMessages) * 40;
  const ordScore = Math.min(1, Math.max(0, orders) / targets.dailyOrders) * 40;
  const streakScore = Math.min(1, Math.max(0, streak) / 7) * 20;

  return Math.round(msgScore + ordScore + streakScore);
}

export function getPerformanceBadge(score: number): {
  color: 'green' | 'yellow' | 'red';
  label: string;
} {
  if (score >= 80) return { color: 'green', label: 'Excellent' };
  if (score >= 50) return { color: 'yellow', label: 'Good Progress' };
  return { color: 'red', label: 'Needs Outreach' };
}
