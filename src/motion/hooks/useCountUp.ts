import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useCountUp(target: number, duration = 700) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) { setValue(target); return; }
    let frame = 0;
    let start = 0;
    const from = 0;
    const tick = (time: number) => {
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, reduced, target]);
  return value;
}
