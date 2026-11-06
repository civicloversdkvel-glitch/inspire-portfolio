import type { Variants } from 'motion/react';
import { motionTokens } from './tokens';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.base, ease: motionTokens.easing.standard } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: motionTokens.spring },
};
export const slideX: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.base, ease: motionTokens.easing.standard } },
};
export const flipUp: Variants = {
  hidden: { opacity: 0, rotateX: -10, y: 8, transformPerspective: 700 },
  visible: { opacity: 1, rotateX: 0, y: 0, transition: motionTokens.spring },
};
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};
export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: motionTokens.duration.base, ease: motionTokens.easing.standard } },
};

export const buttonMotionPresets = {
  primary: { whileHover: { y: -2, scale: 1.015 }, whileTap: { scale: 0.96 } },
  accent: { whileHover: { y: -2, scale: 1.02 }, whileTap: { scale: 0.97 } },
  secondary: { whileHover: { y: -1 }, whileTap: { scale: 0.97 } },
  ghost: { whileHover: { x: 2 }, whileTap: { scale: 0.98 } },
  danger: { whileHover: { y: -1 }, whileTap: { scale: 0.96 } },
  icon: { whileHover: { rotate: 5, scale: 1.06 }, whileTap: { scale: 0.9 } },
  fab: { whileHover: { y: -3, scale: 1.04 }, whileTap: { scale: 0.94 } },
} as const;
