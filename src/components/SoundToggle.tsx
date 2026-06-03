import React from 'react';
import clsx from 'clsx';
import { Volume2, VolumeX } from 'lucide-react';

export interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Sound OFF (M)' : 'Sound ON (M)'}
      className={clsx(
        'flex items-center justify-center gap-2 h-11 px-3 border-4 transition-colors duration-200',
        muted
          ? 'bg-[var(--gt-bg)] border-[var(--gt-muted)] text-[var(--gt-muted)] hover:text-[var(--gt-text)]'
          : 'bg-[var(--gt-bg)] border-[var(--gt-accent2)] text-[var(--gt-accent2)] hover:bg-[var(--gt-accent2)] hover:text-[var(--gt-bg)]'
      )}
    >
      {muted ? (
        <VolumeX size={20} strokeWidth={2} />
      ) : (
        <Volume2 size={20} strokeWidth={2} />
      )}
      <span className="font-display text-[8px] hidden sm:inline">
        {muted ? 'OFF' : 'ON'}
      </span>
    </button>
  );
}

export default SoundToggle;
