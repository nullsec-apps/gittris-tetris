import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, RefreshCw, WifiOff, AlertTriangle } from 'lucide-react';
import { ScoreEntry } from '../lib/seedScores';
import { HighScoresStatus } from '../hooks/useHighScores';
import { padScore, formatRank, formatLevel } from '../lib/format';
import clsx from 'clsx';

export interface LeaderboardProps {
  scores: ScoreEntry[];
  status: HighScoresStatus;
  hasRealScores: boolean;
  onRefresh: () => void;
}

/**
 * Arcade high-score table. Fixed-width LED rows (RANK / NAME / SCORE / LV).
 * Shows seeded retro defaults until real scores arrive; handles
 * loading / error / offline states.
 */
export function Leaderboard({
  scores,
  status,
  hasRealScores,
  onRefresh,
}: LeaderboardProps) {
  return (
    <div className="pixel-border bg-[var(--gt-bg)] p-3">
      <div className="flex items-center justify-between border-b-2 border-[var(--gt-muted)] pb-2 mb-3">
        <h3 className="font-display text-[10px] text-[var(--gt-accent)] led-readout flex items-center gap-2">
          <Trophy size={14} strokeWidth={2.5} className="text-[var(--gt-accent)]" />
          HIGH SCORES
        </h3>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh leaderboard"
          className="text-[var(--gt-muted)] hover:text-[var(--gt-accent2)] transition-colors duration-200"
        >
          <RefreshCw size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* status banner */}
      {status === 'offline' && (
        <p className="font-body text-base text-[var(--gt-muted)] flex items-center gap-2 mb-2">
          <WifiOff size={14} strokeWidth={2.5} /> OFFLINE — SHOWING DEFAULTS
        </p>
      )}
      {status === 'error' && (
        <p className="font-body text-base text-[#ff4d4d] flex items-center gap-2 mb-2">
          <AlertTriangle size={14} strokeWidth={2.5} /> FETCH FAILED — SHOWING DEFAULTS
        </p>
      )}

      {status === 'loading' ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-6 w-full bg-[var(--gt-surface)] rounded-none"
            />
          ))}
        </div>
      ) : (
        <div className="font-body text-lg leading-tight">
          {/* header row */}
          <div className="grid grid-cols-[2.5rem_1fr_auto_2.5rem] gap-2 text-[var(--gt-muted)] text-base border-b border-[var(--gt-muted)]/40 pb-1 mb-1 px-1">
            <span>#</span>
            <span>NAME</span>
            <span className="text-right">SCORE</span>
            <span className="text-right">LV</span>
          </div>
          <ol className="flex flex-col">
            {scores.map((entry, i) => {
              const isTop = i === 0;
              return (
                <li
                  key={entry.id}
                  className={clsx(
                    'grid grid-cols-[2.5rem_1fr_auto_2.5rem] gap-2 px-1 py-0.5 items-center tracking-wide',
                    isTop && 'gt-blink-fast'
                  )}
                >
                  <span
                    className={clsx(
                      'led-readout text-base',
                      isTop ? 'text-[var(--gt-accent)]' : 'text-[var(--gt-muted)]'
                    )}
                  >
                    {formatRank(i + 1)}
                  </span>
                  <span
                    className={clsx(
                      'font-display text-[10px] truncate flex items-center gap-1',
                      entry.seed ? 'text-[var(--gt-muted)]' : 'text-[var(--gt-text)]'
                    )}
                  >
                    {entry.player_name}
                  </span>
                  <span
                    className={clsx(
                      'text-right led-readout-cyan tabular-nums',
                      isTop ? 'text-[var(--gt-accent)]' : 'text-[var(--gt-accent2)]'
                    )}
                  >
                    {padScore(entry.score)}
                  </span>
                  <span className="text-right text-[var(--gt-muted)] tabular-nums">
                    {formatLevel(entry.level)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {!hasRealScores && status !== 'loading' && (
        <p className="font-body text-base text-[var(--gt-muted)] mt-3 pt-2 border-t border-[var(--gt-muted)]/40">
          ★ ATTRACT-MODE DEFAULTS · BE THE FIRST REAL SCORE ★
        </p>
      )}
    </div>
  );
}

export default Leaderboard;
