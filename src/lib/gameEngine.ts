import {
  Tetromino,
  TETROMINOES,
  getRotationStates,
  COLORS,
} from './tetrominoes';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
// hidden buffer rows above the visible field for spawning
export const BOARD_BUFFER = 2;
export const TOTAL_HEIGHT = BOARD_HEIGHT + BOARD_BUFFER;

/** A cell is either null (empty) or a color string for the locked block. */
export type Cell = string | null;
export type Board = Cell[][];

export interface ActivePiece {
  type: Tetromino;
  rotation: number; // 0..3
  x: number; // column of top-left of the piece matrix
  y: number; // row of top-left of the piece matrix (can be negative / in buffer)
}

/** Create an empty board (TOTAL_HEIGHT x BOARD_WIDTH). */
export function createEmptyBoard(): Board {
  return Array.from({ length: TOTAL_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null as Cell)
  );
}

/** Get the cell matrix (4x4-ish) for a piece at a given rotation. */
export function getPieceMatrix(type: Tetromino, rotation: number): number[][] {
  const states = getRotationStates(type);
  const idx = ((rotation % states.length) + states.length) % states.length;
  return states[idx];
}

/** List of absolute board cells occupied by a piece. */
export function getPieceCells(piece: ActivePiece): { x: number; y: number }[] {
  const matrix = getPieceMatrix(piece.type, piece.rotation);
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        cells.push({ x: piece.x + c, y: piece.y + r });
      }
    }
  }
  return cells;
}

/** Spawn a new piece centered at the top buffer. */
export function spawnPiece(type: Tetromino): ActivePiece {
  const matrix = getPieceMatrix(type, 0);
  const width = matrix[0].length;
  const x = Math.floor((BOARD_WIDTH - width) / 2);
  // spawn within the buffer so tall pieces appear cleanly
  return { type, rotation: 0, x, y: 0 };
}

/** Collision test: returns true if the piece would overlap a wall/floor/block. */
export function isColliding(board: Board, piece: ActivePiece): boolean {
  const cells = getPieceCells(piece);
  for (const { x, y } of cells) {
    if (x < 0 || x >= BOARD_WIDTH) return true;
    if (y >= TOTAL_HEIGHT) return true;
    if (y < 0) continue; // above the board is fine (buffer)
    if (board[y][x] !== null) return true;
  }
  return false;
}

/** Try to move the piece by (dx, dy). Returns moved piece or null if blocked. */
export function tryMove(
  board: Board,
  piece: ActivePiece,
  dx: number,
  dy: number
): ActivePiece | null {
  const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return isColliding(board, moved) ? null : moved;
}

// SRS-style wall-kick offsets (simplified, works well for casual play).
const WALL_KICKS = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -2, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
];

/**
 * Rotate the piece in the given direction (+1 = CW, -1 = CCW) with wall kicks.
 * Returns rotated piece or null if no valid placement exists.
 */
export function tryRotate(
  board: Board,
  piece: ActivePiece,
  dir: 1 | -1
): ActivePiece | null {
  const states = getRotationStates(piece.type);
  const nextRotation =
    ((piece.rotation + dir) % states.length + states.length) % states.length;
  for (const kick of WALL_KICKS) {
    const candidate: ActivePiece = {
      ...piece,
      rotation: nextRotation,
      x: piece.x + kick.x,
      y: piece.y + kick.y,
    };
    if (!isColliding(board, candidate)) {
      return candidate;
    }
  }
  return null;
}

/** Project the piece straight down to its resting position (ghost piece). */
export function getGhostPiece(board: Board, piece: ActivePiece): ActivePiece {
  let ghost = { ...piece };
  while (true) {
    const next = tryMove(board, ghost, 0, 1);
    if (!next) break;
    ghost = next;
  }
  return ghost;
}

/** Hard-drop distance (rows fallen). */
export function getHardDropDistance(board: Board, piece: ActivePiece): number {
  const ghost = getGhostPiece(board, piece);
  return ghost.y - piece.y;
}

/** Merge a piece into the board, returning a new board. */
export function lockPiece(board: Board, piece: ActivePiece): Board {
  const color = COLORS[piece.type];
  const next = board.map((row) => row.slice());
  for (const { x, y } of getPieceCells(piece)) {
    if (y >= 0 && y < TOTAL_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      next[y][x] = color;
    }
  }
  return next;
}

/** Find indices of fully-filled rows. */
export function findFullRows(board: Board): number[] {
  const rows: number[] = [];
  for (let r = 0; r < TOTAL_HEIGHT; r++) {
    if (board[r].every((cell) => cell !== null)) {
      rows.push(r);
    }
  }
  return rows;
}

/** Clear the given rows and drop everything above down. Returns new board. */
export function clearRows(board: Board, rows: number[]): Board {
  if (rows.length === 0) return board;
  const rowSet = new Set(rows);
  const remaining = board.filter((_, idx) => !rowSet.has(idx));
  const cleared: Board = [];
  // prepend empty rows for each cleared line
  for (let i = 0; i < rows.length; i++) {
    cleared.push(Array.from({ length: BOARD_WIDTH }, () => null as Cell));
  }
  return [...cleared, ...remaining];
}

/** Game-over check: a freshly spawned piece immediately collides. */
export function isGameOver(board: Board, piece: ActivePiece): boolean {
  return isColliding(board, piece);
}

// ---- Scoring / level / gravity formulas (NES-inspired) ----

const LINE_SCORES = [0, 40, 100, 300, 1200];

/** Points awarded for clearing `lines` rows at a given level. */
export function lineClearScore(lines: number, level: number): number {
  const base = LINE_SCORES[Math.min(lines, 4)] || 0;
  return base * (level + 1);
}

/** Soft-drop awards 1 point per cell. */
export function softDropScore(cells: number): number {
  return Math.max(0, cells);
}

/** Hard-drop awards 2 points per cell. */
export function hardDropScore(cells: number): number {
  return Math.max(0, cells) * 2;
}

/** Level increases every 10 lines cleared (starts at level 1). */
export function levelForLines(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

/**
 * Gravity interval in milliseconds for a given level. Higher level = faster.
 * Caps so the game stays (barely) playable at extreme levels.
 */
export function gravityInterval(level: number): number {
  const lvl = Math.max(1, level);
  // start ~800ms at level 1, ramp down, clamp to 60ms.
  const ms = Math.round(800 * Math.pow(0.82, lvl - 1));
  return Math.max(60, ms);
}

/** Label for a line-clear count (used by SFX / messaging). */
export function clearLabel(lines: number): string {
  switch (lines) {
    case 1: return 'SINGLE';
    case 2: return 'DOUBLE';
    case 3: return 'TRIPLE';
    case 4: return 'TETRIS!';
    default: return '';
  }
}

export { TETROMINOES, COLORS };
