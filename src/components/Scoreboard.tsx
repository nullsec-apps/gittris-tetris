import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { padScore, padSmall, formatLevel, formatLines } from '../lib/format';

export interface ScoreboardProps {
  score: number;
  level: number;
  lines: number;
  hi: number;
  levelUpKey?: number;
}

function LedRow({
  label,
  value,
  color,
  blink,
}: {
  label: string;
  value: string;
  color: string;
  blink?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-[8px] sm:text-[9px] text-[var(--gt-muted)] tracking-widest">
        {label}
      </span>
      <div className="crt-scanlines bg-[var(--gt-bg)] border-2 border-[var(--gt-muted)]/40 px-2 py-1 sm:px-3 sm:py-1.5">
        <span
          className={clsx(
            'font-display text-sm sm:text-base led-readout tracking-wider',
            blink && 'gt-blink'
          )}
          style={{ color }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function Scoreboard({
  score,
  level,
  lines,
  hi,
  levelUpKey = 0,
}: ScoreboardProps) {
  const [pulse, setPulse] = useState(0);
  const prevLevelKey = useRef(levelUpKey);

  useEffect(() => {
    if (levelUpKey !== prevLevelKey.current) {
      prevLevelKey.current = levelUpKey;
      setPulse((p) => p + 1);
    }
  }, [levelUpKey]);

  return (
    <div
      key={`sb-pulse-${pulse}`}
      className={clsx(
        'pixel-border bg-[var(--gt-surface)] p-3 sm:p-4 flex flex-col gap-3 sm:gap-4',
        pulse > 0 && 'gt-levelup-pulse'
      )}
    >
      <LedRow
        label="SCORE"
        value={padScore(score, 6)}
        color="var(--gt-accent)"
      />
      <div className="grid grid-cols-2 gap-3">
        <LedRow
          label="LEVEL"
          value={formatLevel(level)}
          color="var(--gt-accent2)"
        />
        <LedRow
          label="LINES"
          value={padSmall(lines, 3)}
          color="var(--gt-accent2)"
        />
      </div>
      <LedRow
        label="HI-SCORE"
        value={padScore(hi, 6)}
        color="#ff4d6d"
        blink
      />
    </div>
  );
}

export default Scoreboard;
