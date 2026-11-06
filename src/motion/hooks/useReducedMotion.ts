import { useEffect, useState } from 'react';
import { MOTION_REDUCE_KEY } from '../tokens';

function readPreference() {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(MOTION_REDUCE_KEY);
  return stored === 'true' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(readPreference);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(readPreference());
    media.addEventListener?.('change', update);
    window.addEventListener('storage', update);
    window.addEventListener('inspire-motion-preference', update);
    return () => {
      media.removeEventListener?.('change', update);
      window.removeEventListener('storage', update);
      window.removeEventListener('inspire-motion-preference', update);
    };
  }, []);
  return reduced;
}
