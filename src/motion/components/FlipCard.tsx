import type { ReactNode } from 'react';
import { useState } from 'react';

export function FlipCard({ front, back, className = '' }: { front: ReactNode; back: ReactNode; className?: string }) {
  const [flipped, setFlipped] = useState(false);
  return <button type="button" aria-pressed={flipped} onClick={() => setFlipped(value => !value)} className={`motion-flip-card ${flipped ? 'is-flipped' : ''} ${className}`}>
    <span className="motion-flip-inner"><span className="motion-flip-face">{front}</span><span className="motion-flip-face motion-flip-back">{back}</span></span>
  </button>;
}
