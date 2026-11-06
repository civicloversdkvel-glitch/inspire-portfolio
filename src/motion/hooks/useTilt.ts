import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { usePerfMode } from './usePerfMode';

export function useTilt(maxDegrees = 5) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const lowPerf = usePerfMode();
  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (reduced || lowPerf || event.pointerType === 'touch' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty('--tilt-x', `${-y * maxDegrees}deg`);
    ref.current.style.setProperty('--tilt-y', `${x * maxDegrees}deg`);
  }, [lowPerf, maxDegrees, reduced]);
  const onPointerLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--tilt-x', '0deg');
    ref.current.style.setProperty('--tilt-y', '0deg');
  }, []);
  return { ref, onPointerMove, onPointerLeave, enabled: !reduced && !lowPerf };
}
