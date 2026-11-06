import { useEffect, useRef, useState } from 'react';

export function useInViewOnce<T extends Element = HTMLDivElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (inView || !ref.current) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.12, ...options });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, options]);
  return { ref, inView };
}
