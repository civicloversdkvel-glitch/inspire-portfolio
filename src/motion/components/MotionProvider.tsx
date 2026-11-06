import { useEffect, type ReactNode } from 'react';
import { MOTION_REDUCE_KEY } from '../tokens';

export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const reduced = window.localStorage.getItem(MOTION_REDUCE_KEY) === 'true'
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.dataset.motionReduce = reduced ? 'true' : 'false';
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      root.dataset.perfMode = (nav.hardwareConcurrency <= 4 || (nav.deviceMemory ?? 99) <= 2 || nav.connection?.saveData === true) ? 'true' : 'false';
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button:not(:disabled), a[href], [role="button"]:not([aria-disabled="true"]), [data-clickable="true"]') : null;
      if (!target || root.dataset.motionReduce === 'true' || target.matches(':disabled,[aria-disabled="true"]')) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
      target.classList.remove('motion-ripple-active');
      void target.offsetWidth;
      target.classList.add('motion-ripple-active');
      window.setTimeout(() => target.classList.remove('motion-ripple-active'), 550);
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('inspire-motion-preference', sync);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener?.('change', sync);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('inspire-motion-preference', sync);
      document.removeEventListener('pointerdown', onPointerDown, true);
      media.removeEventListener?.('change', sync);
    };
  }, []);
  return <>{children}</>;
}
