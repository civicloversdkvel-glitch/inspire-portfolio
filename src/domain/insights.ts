/**
 * Pure smart insights generator
 * In accordance with PRD BR-07
 */

export interface DailyInsight {
  type: 'warning' | 'success';
  text: string;
}

export function generateSmartInsights(params: {
  messagesSent: number;
  ordersCompleted: number;
  todayEarnings: number;
  yesterdayEarnings: number;
  repliesReceived?: number;
  targetMessages?: number;
}): DailyInsight[] {
  const {
    messagesSent,
    ordersCompleted,
    todayEarnings,
    yesterdayEarnings,
    repliesReceived,
    targetMessages = 30,
  } = params;

  const insights: DailyInsight[] = [];

  if (messagesSent < targetMessages) {
    insights.push({
      type: 'warning',
      text: `Increase outreach. Messages (${messagesSent}) are below the ${targetMessages}/day target.`,
    });
  }

  if (typeof repliesReceived === 'number' && messagesSent > 0 && repliesReceived < messagesSent * 0.1) {
    insights.push({
      type: 'warning',
      text: 'Improve message quality. Your client reply rate is below 10%.',
    });
  }

  if (ordersCompleted === 0) {
    insights.push({
      type: 'warning',
      text: 'Focus on conversion. No orders completed today—follow up with existing leads.',
    });
  }

  if (todayEarnings > yesterdayEarnings && todayEarnings > 0) {
    insights.push({
      type: 'success',
      text: `Great financial growth! Today's earnings (Rs ${todayEarnings.toLocaleString()}) surpassed yesterday.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      text: 'You are on track! Core daily productivity targets achieved.',
    });
  }

  return insights;
}
