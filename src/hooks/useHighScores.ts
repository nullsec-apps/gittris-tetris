import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured, SCORES_TABLE } from '../lib/supabaseClient';
import {
  ScoreEntry,
  SEED_SCORES,
  DEFAULT_HI,
  mergeWithSeeds,
} from '../lib/seedScores';

export type HighScoresStatus = 'loading' | 'ready' | 'error' | 'offline';

export interface UseHighScoresResult {
  /** Top scores merged with seeded retro defaults (never empty). */
  scores: ScoreEntry[];
  /** Top score value for the HI readout. */
  hi: number;
  status: HighScoresStatus;
  /** Whether the displayed scores include any real (non-seed) entries. */
  hasRealScores: boolean;
  /** Re-fetch from Supabase. */
  refresh: () => void;
}

const LIMIT = 10;

function normalizeRow(row: any): ScoreEntry {
  return {
    id: String(row.id),
    player_name: String(row.player_name ?? 'AAA').toUpperCase().slice(0, 3),
    score: Number(row.score) || 0,
    level: Number(row.level) || 1,
    lines: Number(row.lines) || 0,
    created_at: row.created_at || new Date().toISOString(),
    seed: false,
  };
}

/**
 * Fetches top scores from Supabase ordered by score DESC, subscribes to realtime
 * INSERTs, and falls back to seeded retro defaults when empty or offline.
 */
export function useHighScores(): UseHighScoresResult {
  const [real, setReal] = useState<ScoreEntry[]>([]);
  const [status, setStatus] = useState<HighScoresStatus>(
    isSupabaseConfigured ? 'loading' : 'offline'
  );
  const topicRef = useRef(`scores_${crypto.randomUUID()}`);
  const mountedRef = useRef(true);

  const fetchScores = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus('offline');
      return;
    }
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const { data, error } = await supabase
        .from(SCORES_TABLE)
        .select('id, player_name, score, level, lines, created_at')
        .order('score', { ascending: false })
        .limit(LIMIT);
      if (error) throw error;
      if (!mountedRef.current) return;
      setReal((data || []).map(normalizeRow));
      setStatus('ready');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[GitTris] high score fetch failed:', err);
      if (!mountedRef.current) return;
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchScores();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchScores]);

  // Realtime subscription for new INSERTs.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase
      .channel(topicRef.current)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: SCORES_TABLE },
        (payload) => {
          const entry = normalizeRow(payload.new);
          setReal((prev) => {
            if (prev.some((p) => p.id === entry.id)) return prev;
            const merged = [...prev, entry]
              .sort((a, b) => b.score - a.score)
              .slice(0, LIMIT);
            return merged;
          });
          setStatus('ready');
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const hasRealScores = real.length > 0;
  const scores = mergeWithSeeds(real, LIMIT);
  const hi = scores.length > 0 ? scores[0].score : DEFAULT_HI;

  return {
    scores: scores.length > 0 ? scores : SEED_SCORES.slice(0, LIMIT),
    hi,
    status,
    hasRealScores,
    refresh: fetchScores,
  };
}
