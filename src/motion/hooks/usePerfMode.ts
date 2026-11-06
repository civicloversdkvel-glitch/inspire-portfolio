import { useMemo } from 'react';

type NavigatorWithHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export function usePerfMode() {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return true;
    const nav = navigator as NavigatorWithHints;
    return (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4)
      || (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2)
      || nav.connection?.saveData === true;
  }, []);
}
