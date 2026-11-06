import type { Variants } from 'motion/react';

type RouteSignature = 'home' | 'split' | 'cards' | 'detail' | 'auth' | 'wizard' | 'student' | 'game' | 'admin' | 'error' | 'simple';

const signatures: Record<RouteSignature, Variants> = {
  home: {
    initial: { opacity: 0, y: 18, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.22 } },
  },
  split: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
  },
  cards: {
    initial: { opacity: 0, y: 16, rotateX: -5, transformPerspective: 900 },
    animate: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 150, damping: 22, staggerChildren: 0.045 } },
    exit: { opacity: 0, scale: 0.985, transition: { duration: 0.18 } },
  },
  detail: {
    initial: { opacity: 0, x: 28, rotateY: -5, transformPerspective: 1000 },
    animate: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  },
  auth: {
    initial: { opacity: 0, x: 18, filter: 'blur(5px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.38 } },
    exit: { opacity: 0, x: -12, filter: 'blur(3px)', transition: { duration: 0.18 } },
  },
  wizard: {
    initial: { opacity: 0, x: 18, rotateY: -15, transformPerspective: 900 },
    animate: { opacity: 1, x: 0, rotateY: 0, transition: { type: 'spring', stiffness: 170, damping: 24 } },
    exit: { opacity: 0, x: -18, rotateY: 15, transition: { duration: 0.2 } },
  },
  student: {
    initial: { opacity: 0, y: 12, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  },
  game: {
    initial: { opacity: 0, y: 18, rotateX: -7, transformPerspective: 850 },
    animate: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 145, damping: 20 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18 } },
  },
  admin: {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.16 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  },
  error: {
    initial: { opacity: 0, x: -4 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.32, ease: 'easeOut' } },
    exit: { opacity: 0, x: 4, transition: { duration: 0.15 } },
  },
  simple: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.26 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
  },
};

export function routeSignature(path: string): RouteSignature {
  if (path === '/' || path === '/home') return 'home';
  if (path === '/about' || path === '/contact') return 'split';
  if (path === '/courses' || path === '/skills-info' || path === '/announcements' || path === '/public-portfolio') return 'cards';
  if (path.startsWith('/admin')) return 'admin';
  if (path === '/academy/login' || path === '/academy/register' || path === '/login') return 'auth';
  if (path.includes('/submit') || path.includes('/reports/daily') || path.includes('/reports/weekly') || path.includes('/reports/monthly')) return 'wizard';
  if (path.startsWith('/games')) return 'game';
  if (path === '/404' || path === '/403') return 'error';
  if (path.startsWith('/academy') || path.startsWith('/reports') || path.startsWith('/tasks') || path.startsWith('/targets') || path.startsWith('/learning') || path.startsWith('/portfolio') || path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/shortcuts') || path.startsWith('/chatbot') || path.startsWith('/search') || path.startsWith('/courses/')) return 'student';
  return 'simple';
}

export function pageVariantsForPath(path: string): Variants {
  return signatures[routeSignature(path)];
}
