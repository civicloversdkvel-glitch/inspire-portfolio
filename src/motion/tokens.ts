export const motionTokens = {
  durationMs: { fast: 180, base: 300, slow: 500 },
  duration: { fast: 0.18, base: 0.3, slow: 0.5, reduced: 0.15 },
  easing: {
    standard: [0.22, 1, 0.36, 1] as const,
    emphasized: [0.2, 0.8, 0.2, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
  },
  spring: { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.8 },
} as const;

export const MOTION_REDUCE_KEY = 'inspire-motion-reduce';
