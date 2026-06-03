import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivePiece,
  Board,
  createEmptyBoard,
  spawnPiece,
  tryMove,
  tryRotate,
  lockPiece,
  findFullRows,
  clearRows,
  getGhostPiece,
  getHardDropDistance,
  isGameOver,
  lineClearScore,
  softDropScore,
  hardDropScore,
  levelForLines,
  gravityInterval,
} from '../lib/gameEngine';
import { BagRandomizer, Tetromino } from '../lib/tetrominoes';
import { useGameLoop } from './useGameLoop';
import { useSound } from './useSound';

export type GameStatus = 'attract' | 'playing' | 'paused' | 'over';

export interface ClearEvent {
  id: number;
  rows: number[];
  lines: number;
}

export interface UseTetrisResult {
  board: Board;
  active: ActivePiece | null;
  ghost: ActivePiece | null;
  next: Tetromino | null;
  score: number;
  level: number;
  lines: number;
  status: GameStatus;
  // last clear / shake / level-up signals for the UI to react to
  clearEvent: ClearEvent | null;
  shakeKey: number;
  levelUpKey: number;
  flashRows: number[];
  // sound
  muted: boolean;
  toggleMute: () => void;
  // controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  restart: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  softDrop: () => void;
  hardDrop: () => void;
}

const LOCK_DELAY_MS = 0; // immediate lock for tight arcade feel
const FLASH_DURATION_MS = 140;

/**
 * Core Tetris engine hook. Owns the board, active/next pieces, score, level,
 * lines, and status. Gravity is driven by useGameLoop at a level-based interval.
 */
export function useTetris(): UseTetrisResult {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [active, setActive] = useState<ActivePiece | null>(null);
  const [nextType, setNextType] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState<GameStatus>('attract');

  const [clearEvent, setClearEvent] = useState<ClearEvent | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const [flashRows, setFlashRows] = useState<number[]>([]);

  const { muted, toggleMute, play } = useSound();

  const bagRef = useRef<BagRandomizer>(new BagRandomizer());
  // Refs to avoid stale closures in the game loop / handlers.
  const boardRef = useRef(board);
  const activeRef = useRef(active);
  const statusRef = useRef(status);
  const levelRef = useRef(level);
  const linesRef = useRef(lines);
  const clearIdRef = useRef(0);
  const lockingRef = useRef(false);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { linesRef.current = lines; }, [lines]);

  /** Spawn the next piece; returns false on game over. */
  const spawnNext = useCallback((): boolean => {
    const bag = bagRef.current;
    const type = nextRef.current ?? bag.next();
    const upcoming = bag.next();
    nextRef.current = upcoming;
    setNextType(upcoming);

    const piece = spawnPiece(type);
    if (isGameOver(boardRef.current, piece)) {
      setActive(null);
      setStatus('over');
      statusRef.current = 'over';
      play('gameOver');
      return false;
    }
    setActive(piece);
    activeRef.current = piece;
    return true;
  }, [play]);

  // Track the upcoming piece type in a ref for spawnNext.
  const nextRef = useRef<Tetromino | null>(null);

  /** Lock the active piece, clear lines, score, level-up, and spawn next. */
  const lockAndProceed = useCallback(
    (piece: ActivePiece) => {
      if (lockingRef.current) return;
      lockingRef.current = true;

      const locked = lockPiece(boardRef.current, piece);
      const full = findFullRows(locked);

      if (full.length > 0) {
        // Flash phase: show full rows, screen shake, sfx.
        const id = ++clearIdRef.current;
        setBoard(locked);
        boardRef.current = locked;
        setActive(null);
        activeRef.current = null;
        setFlashRows(full);
        setClearEvent({ id, rows: full, lines: full.length });
        setShakeKey((k) => k + 1);
        play(full.length >= 4 ? 'tetris' : 'lineClear');

        const prevLines = linesRef.current;
        const newLines = prevLines + full.length;
        const newScore =
          score + lineClearScore(full.length, levelRef.current);
        const newLevel = levelForLines(newLines);

        window.setTimeout(() => {
          const cleared = clearRows(locked, full);
          setBoard(cleared);
          boardRef.current = cleared;
          setFlashRows([]);
          setLines(newLines);
          linesRef.current = newLines;
          setScore(newScore);
          if (newLevel > levelRef.current) {
            setLevel(newLevel);
            levelRef.current = newLevel;
            setLevelUpKey((k) => k + 1);
            play('levelUp');
          }
          lockingRef.current = false;
          spawnNext();
        }, FLASH_DURATION_MS);
      } else {
        setBoard(locked);
        boardRef.current = locked;
        setActive(null);
        activeRef.current = null;
        play('lock');
        lockingRef.current = false;
        spawnNext();
      }
    },
    [play, score, spawnNext]
  );

  /** Gravity tick: drop one row, or lock if resting. */
  const gravityTick = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const moved = tryMove(boardRef.current, piece, 0, 1);
    if (moved) {
      setActive(moved);
      activeRef.current = moved;
    } else {
      lockAndProceed(piece);
    }
  }, [lockAndProceed]);

  useGameLoop({
    active: status === 'playing',
    intervalMs: gravityInterval(level),
    onTick: gravityTick,
  });

  // ---- Public controls ----

  const resetState = useCallback(() => {
    const empty = createEmptyBoard();
    setBoard(empty);
    boardRef.current = empty;
    setScore(0);
    setLevel(1);
    levelRef.current = 1;
    setLines(0);
    linesRef.current = 0;
    setClearEvent(null);
    setFlashRows([]);
    lockingRef.current = false;
    bagRef.current.reset();
    nextRef.current = bagRef.current.next();
  }, []);

  const start = useCallback(() => {
    resetState();
    setStatus('playing');
    statusRef.current = 'playing';
    play('start');
    // spawn after state settles
    window.setTimeout(() => spawnNext(), 0);
  }, [resetState, spawnNext, play]);

  const restart = useCallback(() => {
    start();
  }, [start]);

  const pause = useCallback(() => {
    if (statusRef.current === 'playing') {
      setStatus('paused');
      statusRef.current = 'paused';
    }
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current === 'paused') {
      setStatus('playing');
      statusRef.current = 'playing';
    }
  }, []);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') pause();
    else if (statusRef.current === 'paused') resume();
  }, [pause, resume]);

  const moveLeft = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const moved = tryMove(boardRef.current, piece, -1, 0);
    if (moved) {
      setActive(moved);
      activeRef.current = moved;
      play('move');
    }
  }, [play]);

  const moveRight = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const moved = tryMove(boardRef.current, piece, 1, 0);
    if (moved) {
      setActive(moved);
      activeRef.current = moved;
      play('move');
    }
  }, [play]);

  const rotateCW = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const rotated = tryRotate(boardRef.current, piece, 1);
    if (rotated) {
      setActive(rotated);
      activeRef.current = rotated;
      play('rotate');
    }
  }, [play]);

  const rotateCCW = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const rotated = tryRotate(boardRef.current, piece, -1);
    if (rotated) {
      setActive(rotated);
      activeRef.current = rotated;
      play('rotate');
    }
  }, [play]);

  const softDrop = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const moved = tryMove(boardRef.current, piece, 0, 1);
    if (moved) {
      setActive(moved);
      activeRef.current = moved;
      setScore((s) => s + softDropScore(1));
      play('softDrop');
    } else {
      lockAndProceed(piece);
    }
  }, [play, lockAndProceed]);

  const hardDrop = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const piece = activeRef.current;
    if (!piece) return;
    const dist = getHardDropDistance(boardRef.current, piece);
    const dropped = { ...piece, y: piece.y + dist };
    if (dist > 0) {
      setScore((s) => s + hardDropScore(dist));
    }
    setActive(dropped);
    activeRef.current = dropped;
    play('hardDrop');
    setShakeKey((k) => k + 1);
    lockAndProceed(dropped);
  }, [play, lockAndProceed]);

  // Ghost projection for the UI.
  const ghost = active ? getGhostPiece(board, active) : null;

  // Clear locking guard if game ends while flashing.
  useEffect(() => {
    if (status === 'over') {
      lockingRef.current = false;
    }
  }, [status]);

  return {
    board,
    active,
    ghost,
    next: nextType,
    score,
    level,
    lines,
    status,
    clearEvent,
    shakeKey,
    levelUpKey,
    flashRows,
    muted,
    toggleMute,
    start,
    pause,
    resume,
    togglePause,
    restart,
    moveLeft,
    moveRight,
    rotateCW,
    rotateCCW,
    softDrop,
    hardDrop,
  };
}
