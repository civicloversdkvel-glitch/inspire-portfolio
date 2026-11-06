import type { HTMLAttributes, ReactNode } from 'react';
import { useTilt } from '../hooks/useTilt';

export function Tilt3D({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const tilt = useTilt();
  return <div ref={node => { tilt.ref.current = node; }} onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave} className={`motion-tilt-3d ${className}`} {...props}>{children}</div>;
}
