import type { HTMLAttributes, ReactNode } from 'react';
export function GlowCard({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`motion-glow-card ${className}`} {...props}>{children}</div>;
}
