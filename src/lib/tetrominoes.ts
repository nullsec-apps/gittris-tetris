// Tetromino definitions, rotation states, authentic colors, and a 7-bag randomizer.

export type Tetromino = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const TETROMINOES: Tetromino[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Authentic-feeling Tetris colors (hard, saturated, NES-era inspired).
export const COLORS: Record<Tetromino, string> = {
  I: '#00e5ff', // cyan
  O: '#ffce00', // yellow
  T: '#b14aff', // purple
  S: '#3fe04a', // green
  Z: '#ff4d4d', // red
  J: '#3a6bff', // blue
  L: '#ff8a1e', // orange
};

// Each rotation state is a small matrix of 0/1 cells.
// Stored as explicit rotation arrays so rendering stays simple and predictable.
const SHAPES: Record<Tetromino, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

/** Return all rotation state matrices for a tetromino type. */
export function getRotationStates(type: Tetromino): number[][][] {
  return SHAPES[type];
}

/** Number of distinct rotation states for a type. */
export function rotationCount(type: Tetromino): number {
  return SHAPES[type].length;
}

/** The base (spawn) matrix for a type. */
export function baseMatrix(type: Tetromino): number[][] {
  return SHAPES[type][0];
}

/**
 * 7-bag randomizer. Shuffles all 7 tetrominoes into a bag and yields them in
 * order, guaranteeing fair distribution (no long droughts).
 */
export class BagRandomizer {
  private bag: Tetromino[] = [];

  private refill(): void {
    const next = [...TETROMINOES];
    // Fisher-Yates shuffle
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    this.bag.push(...next);
  }

  /** Pop the next tetromino, refilling the bag as needed. */
  next(): Tetromino {
    if (this.bag.length === 0) this.refill();
    return this.bag.shift() as Tetromino;
  }

  /** Peek at the upcoming tetromino without consuming it. */
  peek(): Tetromino {
    if (this.bag.length === 0) this.refill();
    return this.bag[0];
  }

  /** Reset the bag (used when starting a new game). */
  reset(): void {
    this.bag = [];
  }
}

/** Convenience: pull a single random tetromino (non-bag). */
export function randomTetromino(): Tetromino {
  return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
}
