import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Board,
  ActivePiece,
  getPieceCells,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_BUFFER,
  COLORS,
} from '../lib/gameEngine';
import { GameStatus } from '../hooks/useTetris';

export interface PlayfieldProps {
  board: Board;
  active: ActivePiece | null;
  ghost: ActivePiece | null;
  flashRows: number[];
  status: GameStatus;
}

const CELL = 26; // logical pixels per cell
const GRID_LINE = 'rgba(122,111,176,0.18)';
const BG = '#0d0221';

/** Lighten/darken a hex color for the pixel-block bevel. */
function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `rgb(${r},${g},${b})`;
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  color: string,
  flash: boolean
) {
  if (flash) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px, py, CELL, CELL);
    return;
  }
  // base
  ctx.fillStyle = color;
  ctx.fillRect(px, py, CELL, CELL);
  // top + left highlight
  ctx.fillStyle = shade(color, 60);
  ctx.fillRect(px, py, CELL, 4);
  ctx.fillRect(px, py, 4, CELL);
  // bottom + right shadow
  ctx.fillStyle = shade(color, -70);
  ctx.fillRect(px, py + CELL - 4, CELL, 4);
  ctx.fillRect(px + CELL - 4, py, 4, CELL);
  // inner pixel sheen
  ctx.fillStyle = shade(color, 30);
  ctx.fillRect(px + 6, py + 6, CELL - 12, CELL - 12);
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4);
  ctx.globalAlpha = 1;
}

/**
 * Canvas-rendered 10x20 CRT playfield well. Hard pixel blocks with bevels,
 * ghost-piece outline, and white-flash on cleared rows.
 */
export function Playfield({
  board,
  active,
  ghost,
  flashRows,
  status,
}: PlayfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = BOARD_WIDTH * CELL;
    const H = BOARD_HEIGHT * CELL;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    // background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // grid lines
    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, H);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(W, y * CELL + 0.5);
      ctx.stroke();
    }

    const flashSet = new Set(flashRows);

    // locked blocks (skip buffer rows)
    for (let r = BOARD_BUFFER; r < board.length; r++) {
      const row = board[r];
      const isFlash = flashSet.has(r);
      const vy = (r - BOARD_BUFFER) * CELL;
      for (let c = 0; c < BOARD_WIDTH; c++) {
        const cell = row[c];
        if (cell) {
          drawBlock(ctx, c * CELL, vy, cell, isFlash);
        }
      }
    }

    // ghost piece
    if (ghost && active && status === 'playing') {
      const ghostColor = COLORS[ghost.type];
      for (const { x, y } of getPieceCells(ghost)) {
        const vy = y - BOARD_BUFFER;
        if (vy < 0) continue;
        drawGhost(ctx, x * CELL, vy * CELL, ghostColor);
      }
    }

    // active piece
    if (active) {
      const color = COLORS[active.type];
      for (const { x, y } of getPieceCells(active)) {
        const vy = y - BOARD_BUFFER;
        if (vy < 0) continue;
        drawBlock(ctx, x * CELL, vy * CELL, color, false);
      }
    }
  }, [board, active, ghost, flashRows, status]);

  return (
    <div
      className={clsx(
        'relative pixel-border-cyan crt-scanlines crt-vignette bg-[var(--gt-bg)]',
        'mx-auto'
      )}
      style={{ lineHeight: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-auto"
        style={{
          width: '100%',
          maxWidth: BOARD_WIDTH * CELL,
          aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}

export default Playfield;
