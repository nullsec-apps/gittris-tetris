import { useCallback, useEffect, useRef, useState } from 'react';

export type SfxName =
  | 'move'
  | 'rotate'
  | 'softDrop'
  | 'hardDrop'
  | 'lock'
  | 'lineClear'
  | 'tetris'
  | 'levelUp'
  | 'gameOver'
  | 'start';

export interface UseSoundResult {
  muted: boolean;
  toggleMute: () => void;
  setMuted: (m: boolean) => void;
  play: (name: SfxName) => void;
}

const STORAGE_KEY = 'gittris_muted';

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * WebAudio-based chiptune SFX manager. Synthesizes hard-edged 8-bit blips with
 * square waves and tight envelopes. Mute state persists to localStorage.
 */
export function useSound(): UseSoundResult {
  const [muted, setMutedState] = useState<boolean>(() => readMuted());
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [muted]);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      try {
        const AC =
          (window.AudioContext ||
            (window as any).webkitAudioContext) as typeof AudioContext;
        ctxRef.current = new AC();
      } catch {
        return null;
      }
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  // Resume audio context on first user interaction (browser autoplay policy).
  useEffect(() => {
    const unlock = () => {
      ensureCtx();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [ensureCtx]);

  /** Play a single square-wave tone at time t (relative to ctx.currentTime). */
  const tone = useCallback(
    (
      ctx: AudioContext,
      freq: number,
      start: number,
      duration: number,
      type: OscillatorType = 'square',
      gain = 0.12
    ) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      env.gain.setValueAtTime(0, ctx.currentTime + start);
      env.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.005);
      env.gain.setValueAtTime(gain, ctx.currentTime + start + duration * 0.6);
      env.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + start + duration
      );
      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.02);
    },
    []
  );

  /** Quick noise burst for impacts (hard drop / game over). */
  const noise = useCallback(
    (ctx: AudioContext, start: number, duration: number, gain = 0.08) => {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const src = ctx.createBufferSource();
      const env = ctx.createGain();
      src.buffer = buffer;
      env.gain.setValueAtTime(gain, ctx.currentTime + start);
      env.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + start + duration
      );
      src.connect(env);
      env.connect(ctx.destination);
      src.start(ctx.currentTime + start);
      src.stop(ctx.currentTime + start + duration);
    },
    []
  );

  const play = useCallback(
    (name: SfxName) => {
      if (mutedRef.current) return;
      const ctx = ensureCtx();
      if (!ctx) return;

      switch (name) {
        case 'move':
          tone(ctx, 220, 0, 0.04, 'square', 0.06);
          break;
        case 'rotate':
          tone(ctx, 440, 0, 0.05, 'square', 0.08);
          tone(ctx, 660, 0.02, 0.04, 'square', 0.05);
          break;
        case 'softDrop':
          tone(ctx, 180, 0, 0.03, 'square', 0.04);
          break;
        case 'hardDrop':
          tone(ctx, 120, 0, 0.06, 'square', 0.1);
          noise(ctx, 0, 0.06, 0.06);
          break;
        case 'lock':
          tone(ctx, 160, 0, 0.05, 'square', 0.07);
          break;
        case 'lineClear':
          tone(ctx, 523, 0, 0.06, 'square', 0.1);
          tone(ctx, 659, 0.06, 0.06, 'square', 0.1);
          tone(ctx, 784, 0.12, 0.08, 'square', 0.1);
          break;
        case 'tetris':
          tone(ctx, 523, 0, 0.06, 'square', 0.12);
          tone(ctx, 659, 0.06, 0.06, 'square', 0.12);
          tone(ctx, 784, 0.12, 0.06, 'square', 0.12);
          tone(ctx, 1046, 0.18, 0.14, 'square', 0.13);
          break;
        case 'levelUp':
          tone(ctx, 392, 0, 0.07, 'triangle', 0.11);
          tone(ctx, 523, 0.07, 0.07, 'triangle', 0.11);
          tone(ctx, 659, 0.14, 0.07, 'triangle', 0.11);
          tone(ctx, 880, 0.21, 0.14, 'triangle', 0.12);
          break;
        case 'gameOver':
          tone(ctx, 392, 0, 0.12, 'square', 0.1);
          tone(ctx, 311, 0.13, 0.12, 'square', 0.1);
          tone(ctx, 261, 0.26, 0.12, 'square', 0.1);
          tone(ctx, 196, 0.39, 0.3, 'square', 0.12);
          noise(ctx, 0.39, 0.2, 0.05);
          break;
        case 'start':
          tone(ctx, 523, 0, 0.07, 'square', 0.1);
          tone(ctx, 784, 0.08, 0.07, 'square', 0.1);
          tone(ctx, 1046, 0.16, 0.12, 'square', 0.11);
          break;
        default:
          break;
      }
    },
    [ensureCtx, tone, noise]
  );

  const toggleMute = useCallback(() => {
    setMutedState((m) => !m);
  }, []);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
  }, []);

  return { muted, toggleMute, setMuted, play };
}
