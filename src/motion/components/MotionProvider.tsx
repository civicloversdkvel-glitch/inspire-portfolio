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
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button:not(:disabled), a[href], [role="button"]:not([aria-disabled="true"]), [data-clickable="true"], [class*="cursor-pointer"]') : null;
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
    const onPointerMove = (event: PointerEvent) => {
      if (root.dataset.motionReduce === 'true' || root.dataset.perfMode === 'true' || event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[class*="cursor-pointer"], [data-clickable="true"]') : null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.setProperty('--card-tilt-x', `${-y * 3}deg`);
      target.style.setProperty('--card-tilt-y', `${x * 3}deg`);
      target.classList.add('motion-card-tilt');
    };
    const onPointerLeave = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.motion-card-tilt') : null;
      if (!target) return;
      target.style.setProperty('--card-tilt-x', '0deg');
      target.style.setProperty('--card-tilt-y', '0deg');
      target.classList.remove('motion-card-tilt');
    };
    window.addEventListener('storage', sync);
    window.addEventListener('inspire-motion-preference', sync);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener?.('change', sync);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerout', onPointerLeave, true);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('inspire-motion-preference', sync);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerout', onPointerLeave, true);
      media.removeEventListener?.('change', sync);
    };
  }, []);
  return <>{children}</>;
}
