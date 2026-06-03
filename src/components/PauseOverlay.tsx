import React from 'react';

/**
 * Stepped flashing PAUSED overlay covering the playfield well. Hard-edged,
 * no easing — blink driven by a frame-stepped CSS animation.
 */
export function PauseOverlay() {
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(13,2,33,0.82)' }}
    >
      <h2 className="font-display text-2xl sm:text-3xl led-readout gt-blink mb-4 tracking-widest">
        PAUSED
      </h2>
      <p className="font-body text-lg sm:text-xl text-[var(--gt-accent2)] led-readout-cyan">
        PRESS&nbsp;P&nbsp;TO&nbsp;RESUME
      </p>
      <p className="font-body text-base text-[var(--gt-muted)] mt-2">
        — STACK&apos;S&nbsp;WAITING —
      </p>
    </div>
  );
}

export default PauseOverlay;
