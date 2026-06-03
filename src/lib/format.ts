// LED-style formatting helpers for the GitTris arcade UI.

/**
 * Zero-pad a number to a fixed width for LED-style readouts (e.g. 000000).
 */
export function padScore(value: number, width = 6): string {
  const n = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  let s = String(n);
  if (s.length > width) {
    // cap at all-nines for the given width (arcade overflow style)
    return '9'.repeat(width);
  }
  return s.padStart(width, '0');
}

/**
 * Pad small counters (level / lines) to a smaller fixed width.
 */
export function padSmall(value: number, width = 3): string {
  return padScore(value, width);
}

/**
 * Sanitize player initials: uppercase, A-Z and 0-9 only, exactly 3 chars.
 * Falls back to padding with 'A'.
 */
export function sanitizeInitials(raw: string): string {
  const cleaned = (raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3);
  if (cleaned.length === 0) return 'AAA';
  return cleaned.padEnd(3, 'A');
}

/**
 * Live-typing sanitizer: lets the user clear the field while typing,
 * keeps uppercase alphanumerics, caps at 3 chars.
 */
export function sanitizeInitialsLive(raw: string): string {
  return (raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3);
}

/**
 * Format a leaderboard rank as a zero-padded 2-digit string with a trailing dot.
 */
export function formatRank(rank: number): string {
  const n = Math.max(1, Math.floor(rank));
  return `${String(n).padStart(2, '0')}`;
}

/**
 * Compact a level number for the LED panel.
 */
export function formatLevel(level: number): string {
  return padSmall(Math.max(1, Math.floor(level)), 2);
}

/**
 * Format lines cleared.
 */
export function formatLines(lines: number): string {
  return padSmall(Math.max(0, Math.floor(lines)), 3);
}
