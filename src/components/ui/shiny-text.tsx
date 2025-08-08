'use client';

import * as React from 'react';
import clsx from 'clsx';

export type ShinyTextProps = {
  children: React.ReactNode;
  className?: string;
  durationSec?: number; // animation duration in seconds
  gradientClassName?: string; // tailwind gradient stops
  animate?: boolean; // whether to animate the shine
};

export function ShinyText({
  children,
  className,
  durationSec = 2.2,
  gradientClassName = 'from-white/30 via-white to-white/30',
  animate = true,
}: ShinyTextProps) {
  return (
    <span
      className={clsx('relative inline-block align-middle', className)}
      style={{
        // CSS var for animation duration
        ['--shiny-duration']: `${durationSec}s`,
      } as React.CSSProperties}
    >
      <span
        className={clsx(
          animate && 'bg-clip-text text-transparent bg-gradient-to-r [background-size:200%_100%] animate-shiny',
          animate && gradientClassName
        )}
      >
        {children}
      </span>
    </span>
  );
}

export default ShinyText;
