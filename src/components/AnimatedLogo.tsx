import React, { useState } from 'react';
import { INSPIRE_LOGO_DATA_URI } from './InspireLogo';
import { useReducedMotion } from '../motion/hooks/useReducedMotion';
import { usePerfMode } from '../motion/hooks/usePerfMode';
import './animated-logo.css';

export type AnimatedLogoSize = 'hero' | 'md' | 'sm';

interface AnimatedLogoProps {
  size?: AnimatedLogoSize;
  alt?: string;
  className?: string;
}

export function AnimatedLogo({
  size = 'md',
  alt = 'The Inspire Business Academy Logo',
  className = '',
}: AnimatedLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const lowPower = usePerfMode();
  const disableInteractiveMotion = reduceMotion || lowPower;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disableInteractiveMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    event.currentTarget.style.setProperty('--logo-tilt-x', `${-y * 8}deg`);
    event.currentTarget.style.setProperty('--logo-tilt-y', `${x * 8}deg`);
    event.currentTarget.style.setProperty('--logo-light-x', `${(x + 1) * 50}%`);
    event.currentTarget.style.setProperty('--logo-light-y', `${(y + 1) * 50}%`);
  };

  const resetPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--logo-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--logo-tilt-y', '0deg');
    event.currentTarget.style.setProperty('--logo-light-x', '50%');
    event.currentTarget.style.setProperty('--logo-light-y', '50%');
  };

  const reflectionMask = {
    maskImage: `url("${INSPIRE_LOGO_DATA_URI}")`,
    WebkitMaskImage: `url("${INSPIRE_LOGO_DATA_URI}")`,
  } as React.CSSProperties;

  return (
    <div
      className={`animated-logo animated-logo--${size} ${className}`}
      data-size={size}
      data-reduced={disableInteractiveMotion ? 'true' : 'false'}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-label={alt}
    >
      <span className="animated-logo__ring" aria-hidden="true" />
      <span className="animated-logo__glow" aria-hidden="true" />
      {size === 'hero' && (
        <>
          <span className="animated-logo__orbit animated-logo__orbit--one" aria-hidden="true"><i /></span>
          <span className="animated-logo__orbit animated-logo__orbit--two" aria-hidden="true"><i /></span>
          <span className="animated-logo__orbit animated-logo__orbit--three" aria-hidden="true"><i /></span>
          <span className="animated-logo__beam" aria-hidden="true" />
        </>
      )}
      <span className="animated-logo__surface">
        {!imageFailed ? (
          <img
            className="animated-logo__image"
            src={INSPIRE_LOGO_DATA_URI}
            alt={alt}
            draggable={false}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="animated-logo__fallback" role="img" aria-label="INSPIRE">INSPIRE</span>
        )}
        {!imageFailed && <span className="animated-logo__reflection" style={reflectionMask} aria-hidden="true" />}
      </span>
      {size === 'hero' && (
        <span className="animated-logo__tagline" aria-label="Learn • Earn • Grow">
          Learn • Earn • Grow
        </span>
      )}
    </div>
  );
}
