import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ArrowDown,
  ChevronsDown,
  Pause,
  VolumeX,
} from 'lucide-react';

interface ControlRow {
  keys: React.ReactNode;
  label: string;
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 pixel-border-muted bg-[var(--gt-bg)] font-display text-[9px] text-[var(--gt-accent2)]">
      {children}
    </span>
  );
}

/**
 * Always-visible control legend card. Keeps the playfield instructional during
 * attract mode and on desktop play. Pixel-bordered, fixed-width LED feel.
 */
export function ControlLegend() {
  const rows: ControlRow[] = [
    {
      keys: (
        <span className="flex gap-1">
          <KeyCap>
            <ArrowLeft size={14} strokeWidth={2.5} />
          </KeyCap>
          <KeyCap>
            <ArrowRight size={14} strokeWidth={2.5} />
          </KeyCap>
        </span>
      ),
      label: 'MOVE',
    },
    {
      keys: (
        <KeyCap>
          <RotateCw size={14} strokeWidth={2.5} />
        </KeyCap>
      ),
      label: 'ROTATE',
    },
    {
      keys: (
        <KeyCap>
          <ArrowDown size={14} strokeWidth={2.5} />
        </KeyCap>
      ),
      label: 'SOFT DROP',
    },
    {
      keys: (
        <span className="flex items-center gap-1">
          <KeyCap>SPC</KeyCap>
          <ChevronsDown size={14} strokeWidth={2.5} className="text-[var(--gt-accent)]" />
        </span>
      ),
      label: 'HARD DROP',
    },
    {
      keys: (
        <span className="flex items-center gap-1">
          <KeyCap>P</KeyCap>
          <Pause size={14} strokeWidth={2.5} className="text-[var(--gt-muted)]" />
        </span>
      ),
      label: 'PAUSE',
    },
    {
      keys: (
        <span className="flex items-center gap-1">
          <KeyCap>M</KeyCap>
          <VolumeX size={14} strokeWidth={2.5} className="text-[var(--gt-muted)]" />
        </span>
      ),
      label: 'MUTE',
    },
  ];

  return (
    <div className="pixel-border-cyan bg-[var(--gt-bg)] p-3">
      <h3 className="font-display text-[10px] mb-3 text-[var(--gt-accent2)] led-readout-cyan border-b-2 border-[var(--gt-muted)] pb-2">
        CONTROLS
      </h3>
      <ul className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center">{row.keys}</span>
            <span className="font-body text-lg text-[var(--gt-text)] tracking-wide">
              {row.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ControlLegend;
