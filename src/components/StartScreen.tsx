import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy } from 'lucide-react';
import { padScore, padSmall } from '../lib/format';
import { ScoreEntry } from '../lib/seedScores';

export interface StartScreenProps {
  hi: number;
  topScores: ScoreEntry[];
  onStart: () => void;
}

export function StartScreen({ hi, topScores, onStart }: StartScreenProps) {
  const top = topScores.slice(0, 3);
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 bg-[var(--gt-bg)]/92 crt-scanlines">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <h2
          className="font-display text-3xl sm:text-5xl led-readout tracking-widest mb-4"
          style={{ color: 'var(--gt-accent)' }}
        >
          GITTRIS
        </h2>
        <p className="font-body text-lg sm:text-xl text-[var(--gt-text)] leading-snug mb-1">
          Stack the blocks. Clear the lines.
        </p>
        <p className="font-body text-base text-[var(--gt-muted)] leading-snug mb-6">
          Chase the high score. Classic 8-bit Tetris,
          <br className="hidden sm:block" /> right in your browser.
        </p>

        {/* Scoreboard preview */}
        <div className="pixel-border bg-[var(--gt-surface)] p-3 w-full mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[8px] text-[var(--gt-accent2)] flex items-center gap-1">
              <Trophy size={14} strokeWidth={2} /> HI-SCORES
            </span>
            <span
              className="font-display text-[8px] gt-blink"
              style={{ color: '#ff4d6d' }}
            >
              HI {padScore(hi, 6)}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {top.map((s, i) => (
              <div
                key={`${s.player_name}-${i}`}
                className="flex items-center justify-between font-body text-base"
              >
                <span className="text-[var(--gt-muted)]">
                  {i + 1}.{' '}
                  <span className="text-[var(--gt-text)]">
                    {s.player_name}
                  </span>
                </span>
                <span
                  className="led-readout tracking-wider"
                  style={{ color: 'var(--gt-accent)' }}
                >
                  {padScore(s.score, 6)}
                </span>
                <span className="text-[var(--gt-accent2)]">
                  LV{padSmall(s.level, 2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={onStart}
          className="w-full h-14 font-display text-xs sm:text-sm rounded-none bg-[var(--gt-accent)] text-[var(--gt-bg)] border-4 border-[var(--gt-accent)] hover:bg-[#fff04d] hover:border-[#fff04d] transition-colors duration-200 gt-blink"
        >
          <Gamepad2 size={20} strokeWidth={2} className="mr-2" />
          PRESS START
        </Button>
        <p className="mt-4 font-body text-sm text-[var(--gt-muted)]">
          ENTER / SPACE TO BEGIN
        </p>
      </div>
    </div>
  );
}

export default StartScreen;
