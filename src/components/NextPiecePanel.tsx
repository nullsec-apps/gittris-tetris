import React, { useEffect, useRef } from 'react';
import { Tetromino, getRotationStates, COLORS } from '../lib/tetrominoes';

export interface NextPiecePanelProps {
  next: Tetromino | null;
}

const CELL = 18;
const GRID = 4;

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
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(px, py, CELL, CELL);
  ctx.fillStyle = shade(color, 60);
  ctx.fillRect(px, py, CELL, 3);
  ctx.fillRect(px, py, 3, CELL);
  ctx.fillStyle = shade(color, -70);
  ctx.fillRect(px, py + CELL - 3, CELL, 3);
  ctx.fillRect(px + CELL - 3, py, 3, CELL);
}

/**
 * CRT 'NEXT' sub-screen rendering the upcoming tetromino centered on a 4x4 grid.
 */
export function NextPiecePanel({ next }: NextPiecePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = GRID * CELL;
    const H = GRID * CELL;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = 'var(--gt-bg)';
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, W, H);

    // faint grid
    ctx.strokeStyle = 'rgba(122,111,176,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL + 0.5);
      ctx.lineTo(W, i * CELL + 0.5);
      ctx.stroke();
    }

    if (!next) return;

    const matrix = getRotationStates(next)[0];
    const color = COLORS[next];
    const rows = matrix.length;
    const cols = matrix[0].length;

    // bounding box of filled cells to center neatly
    let minR = rows, maxR = -1, minC = cols, maxC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }
    const pieceW = maxC - minC + 1;
    const pieceH = maxR - minR + 1;
    const offsetX = Math.floor((GRID - pieceW) / 2) - minC;
    const offsetY = Math.floor((GRID - pieceH) / 2) - minR;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c]) {
          drawBlock(
            ctx,
            (c + offsetX) * CELL,
            (r + offsetY) * CELL,
            color
          );
        }
      }
    }
  }, [next]);

  return (
    <div className="pixel-border-cyan bg-[var(--gt-bg)] p-3">
      <h3 className="font-display text-[10px] mb-3 text-[var(--gt-accent2)] led-readout-cyan border-b-2 border-[var(--gt-muted)] pb-2">
        NEXT
      </h3>
      <div
        className="crt-scanlines mx-auto flex items-center justify-center bg-[var(--gt-bg)]"
        style={{ lineHeight: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: GRID * CELL,
            height: GRID * CELL,
            maxWidth: '100%',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  );
}

export default NextPiecePanel;
