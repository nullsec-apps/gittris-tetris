import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Resolve the project id from the NullSec runtime so table names stay scoped.
declare global {
  interface Window {
    __NULLSEC__?: {
      projectId?: string;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      logoUrl?: string;
    };
  }
}

const runtime = (typeof window !== 'undefined' && window.__NULLSEC__) || {};

export const PROJECT_ID: string = runtime.projectId || 'gittris';

/** Fully-qualified scores table name for this app instance. */
export const SCORES_TABLE = `app_${PROJECT_ID}_scores`;

const SUPABASE_URL =
  runtime.supabaseUrl ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  runtime.supabaseAnonKey ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  '';

/**
 * Whether Supabase is configured. When false, the app gracefully falls back to
 * seeded retro scores and disables submission (offline/local play still works).
 */
export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[GitTris] Failed to init Supabase client:', err);
    client = null;
  }
}

/**
 * The Supabase client, or null when not configured. Consumers must null-check.
 */
export const supabase: SupabaseClient | null = client;
