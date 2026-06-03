import { useCallback, useState } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  SCORES_TABLE,
} from '../lib/supabaseClient';
import { sanitizeInitials } from '../lib/format';

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error' | 'offline';

export interface SubmitScorePayload {
  player_name: string;
  score: number;
  level: number;
  lines: number;
}

export interface UseSubmitScoreResult {
  status: SubmitStatus;
  error: string | null;
  submitted: boolean;
  submit: (payload: SubmitScorePayload) => Promise<boolean>;
  reset: () => void;
}

/**
 * Inserts a new score row into Supabase. Sanitizes initials to 3 uppercase
 * alphanumeric chars. Gracefully reports offline when Supabase isn't configured.
 */
export function useSubmitScore(): UseSubmitScoreResult {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (payload: SubmitScorePayload): Promise<boolean> => {
      if (!isSupabaseConfigured || !supabase) {
        setStatus('offline');
        setError('Leaderboard offline — score saved locally only.');
        return false;
      }

      const player_name = sanitizeInitials(payload.player_name);
      const score = Math.max(0, Math.floor(payload.score));
      const level = Math.max(1, Math.floor(payload.level));
      const lines = Math.max(0, Math.floor(payload.lines));

      setStatus('submitting');
      setError(null);

      try {
        const { error: insertError } = await supabase
          .from(SCORES_TABLE)
          .insert([{ player_name, score, level, lines }]);
        if (insertError) throw insertError;
        setStatus('success');
        return true;
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn('[GitTris] score submit failed:', err);
        setStatus('error');
        setError(err?.message || 'Failed to submit score. Try again.');
        return false;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    error,
    submitted: status === 'success',
    submit,
    reset,
  };
}
