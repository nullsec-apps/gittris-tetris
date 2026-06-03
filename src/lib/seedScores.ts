// Intentional retro default leaderboard. These are classic arcade attract-mode
// placeholders shown until real player scores are submitted. They are NOT faked
// live player data — they are styled and labeled as defaults.

export interface ScoreEntry {
  id: string;
  player_name: string;
  score: number;
  level: number;
  lines: number;
  created_at: string;
  seed?: boolean;
}

export const SEED_SCORES: ScoreEntry[] = [
  { id: 'seed-1', player_name: 'AAA', score: 99999, level: 12, lines: 142, created_at: '1989-06-06T00:00:00.000Z', seed: true },
  { id: 'seed-2', player_name: 'BBB', score: 87500, level: 10, lines: 118, created_at: '1990-08-15T00:00:00.000Z', seed: true },
  { id: 'seed-3', player_name: 'CCC', score: 76420, level: 9,  lines: 101, created_at: '1991-03-21T00:00:00.000Z', seed: true },
  { id: 'seed-4', player_name: 'DEV', score: 54300, level: 7,  lines: 78,  created_at: '1992-11-02T00:00:00.000Z', seed: true },
  { id: 'seed-5', player_name: 'NES', score: 31200, level: 5,  lines: 52,  created_at: '1993-04-18T00:00:00.000Z', seed: true },
  { id: 'seed-6', player_name: 'RGB', score: 21700, level: 4,  lines: 41,  created_at: '1994-09-09T00:00:00.000Z', seed: true },
  { id: 'seed-7', player_name: 'JMP', score: 13370, level: 4,  lines: 38,  created_at: '1995-12-25T00:00:00.000Z', seed: true },
  { id: 'seed-8', player_name: 'KEY', score: 8000,  level: 3,  lines: 24,  created_at: '1996-07-04T00:00:00.000Z', seed: true },
  { id: 'seed-9', player_name: 'POW', score: 4500,  level: 2,  lines: 15,  created_at: '1997-02-14T00:00:00.000Z', seed: true },
  { id: 'seed-10', player_name: 'BIT', score: 1500, level: 1,  lines: 7,   created_at: '1998-10-31T00:00:00.000Z', seed: true },
];

/** The default "HI" value displayed in attract mode before any real scores. */
export const DEFAULT_HI = 99999;

/**
 * Merge real scores with seed defaults: real scores take priority. Seeds fill
 * remaining slots up to `limit` so the leaderboard never looks empty.
 */
export function mergeWithSeeds(real: ScoreEntry[], limit = 10): ScoreEntry[] {
  const combined = [...real, ...SEED_SCORES];
  combined.sort((a, b) => b.score - a.score);
  // de-dupe by id
  const seen = new Set<string>();
  const out: ScoreEntry[] = [];
  for (const e of combined) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
    if (out.length >= limit) break;
  }
  return out;
}
