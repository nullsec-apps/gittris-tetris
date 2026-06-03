import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCw,
  ArrowDownToLine,
  Pause,
} from 'lucide-react';

export interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
}

function PadButton({
  onPress,
  label,
  children,
  accent,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  accent?: 'yellow' | 'cyan';
}) {
  const handleStart = (e: React.PointerEvent) => {
    e.preventDefault();
    onPress();
  };
  const color =
    accent === 'cyan'
      ? 'border-[var(--gt-accent2)] text-[var(--gt-accent2)] active:bg-[var(--gt-accent2)] active:text-[var(--gt-bg)]'
      : accent === 'yellow'
      ? 'border-[var(--gt-accent)] text-[var(--gt-accent)] active:bg-[var(--gt-accent)] active:text-[var(--gt-bg)]'
      : 'border-[var(--gt-muted)] text-[var(--gt-text)] active:bg-[var(--gt-muted)] active:text-[var(--gt-bg)]';
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={handleStart}
      className={`flex items-center justify-center min-h-[56px] min-w-[56px] bg-[var(--gt-bg)] border-4 ${color} transition-colors duration-100 touch-none select-none`}
    >
      {children}
    </button>
  );
}

export function TouchControls({
  onLeft,
  onRight,
  onSoftDrop,
  onRotate,
  onHardDrop,
  onPause,
}: TouchControlsProps) {
  return (
    <div className="pixel-border bg-[var(--gt-surface)] p-3 mt-3 w-full">
      <div className="flex items-center justify-between gap-3">
        {/* D-pad cluster */}
        <div className="flex items-center gap-2">
          <PadButton onPress={onLeft} label="Move left">
            <ChevronLeft size={28} strokeWidth={2.5} />
          </PadButton>
          <div className="flex flex-col gap-2">
            <PadButton onPress={onRotate} label="Rotate" accent="cyan">
              <RotateCw size={24} strokeWidth={2.5} />
            </PadButton>
            <PadButton onPress={onSoftDrop} label="Soft drop">
              <ChevronDown size={28} strokeWidth={2.5} />
            </PadButton>
          </div>
          <PadButton onPress={onRight} label="Move right">
            <ChevronRight size={28} strokeWidth={2.5} />
          </PadButton>
        </div>

        {/* Action cluster */}
        <div className="flex flex-col gap-2">
          <PadButton onPress={onHardDrop} label="Hard drop" accent="yellow">
            <ArrowDownToLine size={24} strokeWidth={2.5} />
          </PadButton>
          <PadButton onPress={onPause} label="Pause">
            <Pause size={24} strokeWidth={2.5} />
          </PadButton>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between font-display text-[7px] text-[var(--gt-muted)] tracking-wider">
        <span>MOVE / DROP</span>
        <span className="text-[var(--gt-accent2)]">ROTATE</span>
        <span className="text-[var(--gt-accent)]">HARD · PAUSE</span>
      </div>
    </div>
  );
}

export default TouchControls;
