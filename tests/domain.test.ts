import test from 'node:test';
import assert from 'node:assert/strict';
import { calcStreak, getStreakReward, isActiveDay, DEFAULT_STREAK_CONFIG } from '../src/domain/streak.ts';
import { calcPerformanceScore, getPerformanceBadge } from '../src/domain/performance.ts';
import { generateSmartInsights } from '../src/domain/insights.ts';
import { calcWeeklySummary } from '../src/domain/weekly.ts';

test('isActiveDay checks minimum requirements properly', () => {
  assert.equal(isActiveDay(undefined), false);
  assert.equal(isActiveDay({ date: '2026-10-24', messagesSent: 5, ordersCompleted: 0, assetsCreated: 0, portfolioImproved: false, learningMinutes: 0, clientsObtained: 0, earnings: 0 }), false);
  assert.equal(isActiveDay({ date: '2026-10-24', messagesSent: 12, ordersCompleted: 0, assetsCreated: 0, portfolioImproved: false, learningMinutes: 0, clientsObtained: 0, earnings: 0 }), true);
  assert.equal(isActiveDay({ date: '2026-10-24', messagesSent: 0, ordersCompleted: 1, assetsCreated: 0, portfolioImproved: false, learningMinutes: 0, clientsObtained: 0, earnings: 0 }), true);
  assert.equal(isActiveDay({ date: '2026-10-24', messagesSent: 0, ordersCompleted: 0, assetsCreated: 0, portfolioImproved: true, learningMinutes: 0, clientsObtained: 0, earnings: 0 }), true);
});

test('calcStreak correctly computes consecutive active days', () => {
  const logs = {
    '2026-10-24': { date: '2026-10-24', messagesSent: 30, ordersCompleted: 2, assetsCreated: 5, portfolioImproved: true, learningMinutes: 60, clientsObtained: 1, earnings: 1000 },
    '2026-10-23': { date: '2026-10-23', messagesSent: 25, ordersCompleted: 1, assetsCreated: 2, portfolioImproved: false, learningMinutes: 30, clientsObtained: 0, earnings: 500 },
    '2026-10-22': { date: '2026-10-22', messagesSent: 15, ordersCompleted: 1, assetsCreated: 0, portfolioImproved: false, learningMinutes: 20, clientsObtained: 0, earnings: 200 },
    // 2026-10-21 missing -> gap
    '2026-10-20': { date: '2026-10-20', messagesSent: 40, ordersCompleted: 3, assetsCreated: 5, portfolioImproved: true, learningMinutes: 90, clientsObtained: 2, earnings: 2000 },
  };

  const streak = calcStreak(logs, '2026-10-24');
  assert.equal(streak, 3);
  assert.equal(getStreakReward(streak), 'On Fire');
  assert.equal(getStreakReward(7), 'Good Consistency');
  assert.equal(getStreakReward(30), 'Pro Level');
});

test('calcPerformanceScore matches PRD formula', () => {
  // Full marks: 30 msgs (40) + 2 orders (40) + 7 streak (20) = 100
  const score100 = calcPerformanceScore(30, 2, 7);
  assert.equal(score100, 100);
  assert.equal(getPerformanceBadge(score100).color, 'green');

  // Half marks: 15 msgs (20) + 1 order (20) + 3 streak (~8.5) = 49
  const scoreHalf = calcPerformanceScore(15, 1, 3);
  assert.equal(scoreHalf, 49);
  assert.equal(getPerformanceBadge(scoreHalf).color, 'red');
});

test('generateSmartInsights provides actionable feedback', () => {
  const lowOutreach = generateSmartInsights({
    messagesSent: 10,
    ordersCompleted: 0,
    todayEarnings: 0,
    yesterdayEarnings: 0,
    repliesReceived: 0,
  });
  assert.equal(lowOutreach.some(i => i.text.includes('below the 30/day target')), true);
  assert.equal(lowOutreach.some(i => i.text.includes('No orders completed')), true);

  const goodDay = generateSmartInsights({
    messagesSent: 35,
    ordersCompleted: 2,
    todayEarnings: 2500,
    yesterdayEarnings: 1000,
    repliesReceived: 10,
  });
  assert.equal(goodDay.some(i => i.text.includes('Great financial growth')), true);
});

test('calcWeeklySummary computes growth percentage and best day', () => {
  const tasks = {
    '2026-10-24': { date: '2026-10-24', messagesSent: 30, ordersCompleted: 2, earnings: 2000 },
    '2026-10-23': { date: '2026-10-23', messagesSent: 20, ordersCompleted: 1, earnings: 1000 },
    '2026-10-17': { date: '2026-10-17', messagesSent: 10, ordersCompleted: 0, earnings: 500 },
  };

  const summary = calcWeeklySummary(tasks, '2026-10-24');
  assert.equal(summary.bestDay, '2026-10-24');
  assert.equal(summary.currentWeekEarnings, 3000);
  assert.equal(summary.lastWeekEarnings, 500);
  assert.equal(summary.growth, 500); // (3000-500)/500 * 100 = 500%
});
