import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skull, Send, RotateCcw, Check, WifiOff, AlertTriangle } from 'lucide-react';
import { padScore, padSmall, sanitizeInitialsLive, sanitizeInitials } from '../lib/format';
import { useSubmitScore } from '../hooks/useSubmitScore';

export interface GameOverModalProps {
  open: boolean;
  score: number;
  level: number;
  lines: number;
  /** True when this run beats the current best on the board. */
  isNewHigh?: boolean;
  onPlayAgain: () => void;
  /** Notify parent after a successful submit (e.g. to refresh leaderboard). */
  onSubmitted?: () => void;
}

/**
 * Pixel-bordered GAME OVER overlay: final stats, arcade 3-char initials entry,
 * submit-to-leaderboard, and PLAY AGAIN.
 */
export function GameOverModal({
  open,
  score,
  level,
  lines,
  isNewHigh = false,
  onPlayAgain,
  onSubmitted,
}: GameOverModalProps) {
  const [initials, setInitials] = useState('AAA');
  const { status, error, submitted, submit, reset } = useSubmitScore();

  // reset entry each time a fresh game-over opens
  useEffect(() => {
    if (open) {
      setInitials('AAA');
      reset();
    }
  }, [open, reset]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status === 'submitting' || submitted) return;
    const name = sanitizeInitials(initials);
    const ok = await submit({ player_name: name, score, level, lines });
    if (ok && onSubmitted) onSubmitted();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="pixel-border bg-[var(--gt-surface)] border-none max-w-sm p-0 [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="crt-scanlines p-5">
          <DialogHeader>
            <DialogTitle asChild>
              <h2 className="font-display text-xl text-center text-[#ff4d4d] led-readout flex items-center justify-center gap-2 gt-blink-fast">
                <Skull size={20} strokeWidth={2.5} />
                GAME OVER
              </h2>
            </DialogTitle>
          </DialogHeader>

          {isNewHigh && (
            <p className="text-center font-display text-[10px] text-[var(--gt-accent)] led-readout gt-blink mt-3">
              ★ NEW HIGH SCORE ★
            </p>
          )}

          {/* final stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="pixel-border-muted bg-[var(--gt-bg)] p-2">
              <p className="font-body text-base text-[var(--gt-muted)]">SCORE</p>
              <p className="led-readout text-sm tabular-nums break-all">
                {padScore(score)}
              </p>
            </div>
            <div className="pixel-border-muted bg-[var(--gt-bg)] p-2">
              <p className="font-body text-base text-[var(--gt-muted)]">LEVEL</p>
              <p className="led-readout-cyan text-sm tabular-nums">
                {padSmall(level, 2)}
              </p>
            </div>
            <div className="pixel-border-muted bg-[var(--gt-bg)] p-2">
              <p className="font-body text-base text-[var(--gt-muted)]">LINES</p>
              <p className="led-readout-cyan text-sm tabular-nums">
                {padSmall(lines, 3)}
              </p>
            </div>
          </div>

          {/* initials + submit */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-5">
              <label className="block font-display text-[10px] text-[var(--gt-accent2)] mb-2 text-center">
                ENTER INITIALS
              </label>
              <div className="flex items-center justify-center gap-2">
                <Input
                  value={initials}
                  onChange={(e) =>
                    setInitials(sanitizeInitialsLive(e.target.value))
                  }
                  maxLength={3}
                  autoFocus
                  spellCheck={false}
                  className="w-28 h-12 text-center font-display text-lg tracking-[0.4em] bg-[var(--gt-bg)] text-[var(--gt-accent)] border-4 border-[var(--gt-accent)] rounded-none uppercase led-readout focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {status === 'offline' && (
                <p className="mt-3 font-body text-base text-[var(--gt-muted)] flex items-center justify-center gap-2">
                  <WifiOff size={14} strokeWidth={2.5} /> LEADERBOARD OFFLINE
                </p>
              )}
              {status === 'error' && (
                <p className="mt-3 font-body text-base text-[#ff4d4d] flex items-center justify-center gap-2">
                  <AlertTriangle size={14} strokeWidth={2.5} />
                  {error || 'SUBMIT FAILED'}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={status === 'submitting' || status === 'offline'}
                  className="w-full h-12 font-display text-[10px] rounded-none bg-[var(--gt-accent)] text-[var(--gt-bg)] border-4 border-[var(--gt-accent)] hover:bg-[#fff04d] hover:border-[#fff04d] transition-colors duration-200 disabled:opacity-50"
                >
                  <Send size={16} strokeWidth={2.5} className="mr-2" />
                  {status === 'submitting' ? 'SUBMITTING...' : 'SUBMIT SCORE'}
                </Button>
                <Button
                  type="button"
                  onClick={onPlayAgain}
                  variant="outline"
                  className="w-full h-12 font-display text-[10px] rounded-none bg-transparent text-[var(--gt-accent2)] border-4 border-[var(--gt-accent2)] hover:bg-[var(--gt-accent2)] hover:text-[var(--gt-bg)] transition-colors duration-200"
                >
                  <RotateCcw size={16} strokeWidth={2.5} className="mr-2" />
                  PLAY AGAIN
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              <p className="font-display text-[10px] text-center text-[var(--gt-accent2)] led-readout-cyan flex items-center justify-center gap-2 gt-blink">
                <Check size={16} strokeWidth={2.5} /> SCORE SAVED!
              </p>
              <Button
                type="button"
                onClick={onPlayAgain}
                className="w-full h-12 font-display text-[10px] rounded-none bg-[var(--gt-accent)] text-[var(--gt-bg)] border-4 border-[var(--gt-accent)] hover:bg-[#fff04d] hover:border-[#fff04d] transition-colors duration-200"
              >
                <RotateCcw size={16} strokeWidth={2.5} className="mr-2" />
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GameOverModal;
