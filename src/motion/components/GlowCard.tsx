import type { HTMLAttributes, ReactNode } from 'react';
import { useTilt } from '../hooks/useTilt';
export function GlowCard({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const tilt = useTilt(3);
  return <div ref={node => { tilt.ref.current = node; }} onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave} className={`motion-tilt-3d motion-glow-card ${className}`} {...props}>{children}</div>;
}
