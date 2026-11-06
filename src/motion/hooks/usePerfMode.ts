import { useMemo } from 'react';

type NavigatorWithHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export function usePerfMode() {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return true;
    const nav = navigator as NavigatorWithHints;
    return (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 1)
      || (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 0.5)
      || nav.connection?.saveData === true;
  }, []);
}
