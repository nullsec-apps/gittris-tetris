import React from 'react';
import clsx from 'clsx';

export interface ArcadeCabinetProps {
  /** Increments to trigger a one-shot screen-shake animation. */
  shakeKey?: number;
  /** Increments to trigger a level-up border pulse. */
  levelUpKey?: number;
  children: React.ReactNode;
}

const logoUrl =
  typeof window !== 'undefined' ? window.__NULLSEC__?.logoUrl : undefined;

/**
 * Root cabinet shell: chunky pixel-bordered frame with CRT scanlines + vignette,
 * a 'GITTRIS' marquee title bar, and animation hooks for shake/level-up pulse.
 */
export function ArcadeCabinet({
  shakeKey = 0,
  levelUpKey = 0,
  children,
}: ArcadeCabinetProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-3 py-4 sm:px-6 sm:py-8 no-select">
      <div
        key={`shake-${shakeKey}`}
        className={clsx(
          'w-full max-w-5xl',
          shakeKey > 0 && 'gt-shake'
        )}
      >
        <div
          key={`pulse-${levelUpKey}`}
          className={clsx(
            'pixel-border crt-vignette bg-[var(--gt-surface)] p-2 sm:p-4',
            levelUpKey > 0 && 'gt-levelup-pulse'
          )}
          style={{ backgroundColor: 'var(--gt-surface)' }}
        >
          {/* Marquee title bar */}
          <header className="mb-3 sm:mb-4 flex items-center justify-center gap-3 border-b-4 border-[var(--gt-accent)] pb-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="GitTris"
                className="w-6 h-6 sm:w-8 sm:h-8"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <span
                className="led-readout-cyan font-display text-base sm:text-xl"
                aria-hidden
              >
                ▓▓
              </span>
            )}
            <h1
              className="font-display text-xl sm:text-3xl led-readout tracking-widest"
              style={{ color: 'var(--gt-accent)' }}
            >
              GITTRIS
            </h1>
            <span
              className="led-readout-cyan font-display text-[10px] sm:text-xs gt-blink hidden sm:inline"
            >
              ●
            </span>
          </header>

          {/* Body content (playfield + panels) */}
          <div className="crt-scanlines">{children}</div>
        </div>

        {/* Cabinet footer credit line */}
        <p className="mt-3 text-center font-body text-base text-[var(--gt-muted)]">
          INSERT COIN · CLEAR LINES · CHASE THE HIGH SCORE
        </p>
      </div>
    </div>
  );
}

export default ArcadeCabinet;
