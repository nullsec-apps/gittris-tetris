import { useEffect, useRef } from 'react';

export interface GameLoopOptions {
  /** Whether the loop should be running. */
  active: boolean;
  /**
   * Current tick interval in milliseconds. Re-read every frame so changing
   * gravity (level-up) takes effect immediately without restarting the loop.
   */
  intervalMs: number;
  /** Called once per accumulated interval step. */
  onTick: () => void;
}

/**
 * Frame-stepped requestAnimationFrame loop with a fixed-timestep accumulator.
 * Keeps gravity motion stepped (one grid drop per interval) rather than eased,
 * preserving the authentic 8-bit feel. Cleans up on unmount / when inactive.
 */
export function useGameLoop({ active, intervalMs, onTick }: GameLoopOptions): void {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const onTickRef = useRef(onTick);
  const intervalRef = useRef(intervalMs);

  // Keep refs fresh so the loop reads latest values without restarting.
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    intervalRef.current = Math.max(16, intervalMs);
  }, [intervalMs]);

  useEffect(() => {
    if (!active) {
      // Reset timing when paused/stopped so we don't fast-forward on resume.
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const frame = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      let delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Guard against huge deltas (tab refocus) to avoid a burst of ticks.
      if (delta > 1000) delta = intervalRef.current;

      accumulatorRef.current += delta;

      // Cap the number of catch-up ticks per frame.
      let steps = 0;
      while (
        accumulatorRef.current >= intervalRef.current &&
        steps < 5
      ) {
        accumulatorRef.current -= intervalRef.current;
        onTickRef.current();
        steps++;
      }
      // If we hit the cap, drain the accumulator so we don't spiral.
      if (steps >= 5) accumulatorRef.current = 0;

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
    };
  }, [active]);
}
