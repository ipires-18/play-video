import React from 'react';
import Icons from '../icons';

export interface VolumeControlProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Componente de controle de volume reutilizável
 */
export const VolumeControl: React.FC<VolumeControlProps> = ({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
}) => {
  return (
    <div className="flex items-center space-x-2 group/volume">
      <button
        onClick={onToggleMute}
        className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-800 transition-colors"
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
      >
        {isMuted || volume === 0 ? (
          <Icons.Mute className="w-5 h-5" />
        ) : (
          <Icons.Volume className="w-5 h-5" />
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={isMuted ? 0 : volume}
        onChange={onVolumeChange}
        className="w-0 group-hover/volume:w-16 transition-all duration-300 h-1 appearance-none rounded-full bg-slate-300 accent-slate-600 hidden md:block"
      />
    </div>
  );
};
