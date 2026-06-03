import { useEffect, useRef } from 'react';

export interface TetrisActions {
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  toggleMute: () => void;
}

export interface UseKeyboardControlsOptions {
  /** Only respond to gameplay keys while actively playing. */
  enabled: boolean;
  actions: TetrisActions;
  /** DAS: initial delay before auto-shift kicks in (ms). */
  dasDelay?: number;
  /** ARR: repeat interval once auto-shift is active (ms). */
  arrRate?: number;
  /** Soft-drop repeat interval (ms). */
  softDropRate?: number;
}

const MOVE_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ',
  'Spacebar',
]);

/**
 * Binds keyboard controls with DAS (delayed auto-shift) for smooth horizontal
 * movement and a soft-drop repeat. Prevents page scroll on arrows/space.
 */
export function useKeyboardControls({
  enabled,
  actions,
  dasDelay = 150,
  arrRate = 40,
  softDropRate = 45,
}: UseKeyboardControlsOptions): void {
  const actionsRef = useRef(actions);
  const enabledRef = useRef(enabled);

  // DAS state for left/right.
  const horizDirRef = useRef<0 | -1 | 1>(0);
  const dasTimerRef = useRef<number | null>(null);
  const arrTimerRef = useRef<number | null>(null);

  // Soft-drop state.
  const softTimerRef = useRef<number | null>(null);

  // Track held keys to avoid OS key-repeat spamming actions.
  const heldRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      clearAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current !== null) {
      window.clearInterval(ref.current);
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const clearAll = () => {
    clearTimer(dasTimerRef);
    clearTimer(arrTimerRef);
    clearTimer(softTimerRef);
    horizDirRef.current = 0;
    heldRef.current.clear();
  };

  const startHorizontal = (dir: -1 | 1) => {
    if (horizDirRef.current === dir) return;
    // stop any existing horizontal repeat
    clearTimer(dasTimerRef);
    clearTimer(arrTimerRef);
    horizDirRef.current = dir;

    const doMove = () => {
      if (!enabledRef.current) return;
      if (dir === -1) actionsRef.current.moveLeft();
      else actionsRef.current.moveRight();
    };

    // immediate move
    doMove();
    // after DAS delay, start ARR repeat
    dasTimerRef.current = window.setTimeout(() => {
      arrTimerRef.current = window.setInterval(() => {
        if (horizDirRef.current !== dir) {
          clearTimer(arrTimerRef);
          return;
        }
        doMove();
      }, arrRate);
    }, dasDelay);
  };

  const stopHorizontal = (dir: -1 | 1) => {
    if (horizDirRef.current === dir) {
      horizDirRef.current = 0;
      clearTimer(dasTimerRef);
      clearTimer(arrTimerRef);
    }
  };

  const startSoftDrop = () => {
    if (softTimerRef.current !== null) return;
    const tick = () => {
      if (!enabledRef.current) return;
      actionsRef.current.softDrop();
    };
    tick();
    softTimerRef.current = window.setInterval(tick, softDropRate);
  };

  const stopSoftDrop = () => {
    clearTimer(softTimerRef);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Global keys work even when not actively playing (pause/mute).
      if (key === 'p' || key === 'P') {
        e.preventDefault();
        actionsRef.current.togglePause();
        return;
      }
      if (key === 'm' || key === 'M') {
        e.preventDefault();
        actionsRef.current.toggleMute();
        return;
      }

      if (!enabledRef.current) return;

      if (MOVE_KEYS.has(key)) {
        e.preventDefault();
      }

      // Ignore OS auto-repeat (we manage our own DAS/ARR).
      if (heldRef.current.has(key)) return;
      heldRef.current.add(key);

      switch (key) {
        case 'ArrowLeft':
          startHorizontal(-1);
          break;
        case 'ArrowRight':
          startHorizontal(1);
          break;
        case 'ArrowDown':
          startSoftDrop();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          actionsRef.current.rotateCW();
          break;
        case 'z':
        case 'Z':
        case 'Control':
          actionsRef.current.rotateCCW();
          break;
        case ' ':
        case 'Spacebar':
          actionsRef.current.hardDrop();
          break;
        default:
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      heldRef.current.delete(key);

      switch (key) {
        case 'ArrowLeft':
          stopHorizontal(-1);
          break;
        case 'ArrowRight':
          stopHorizontal(1);
          break;
        case 'ArrowDown':
          stopSoftDrop();
          break;
        default:
          break;
      }
    };

    const onBlur = () => clearAll();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dasDelay, arrRate, softDropRate]);
}
