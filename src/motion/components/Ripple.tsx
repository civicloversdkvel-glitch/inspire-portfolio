import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function Ripple({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button className={`motion-ripple ${className}`} {...props}>{children}</button>;
}
