import React from 'react';
import Icons from '../icons';

export interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  size?: 'small' | 'large';
  className?: string;
  ariaLabel?: string;
}

/**
 * Componente de botão play/pause reutilizável
 */
export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onClick,
  size = 'small',
  className = '',
  ariaLabel,
}) => {
  const sizeClasses =
    size === 'large' ? 'w-20 h-20' : 'flex items-center justify-center w-8 h-8';
  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-5 h-5';

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} text-slate-500 hover:text-slate-800 transition-colors ${className}`}
      aria-label={
        ariaLabel || (isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo')
      }
    >
      {isPlaying ? (
        <Icons.Pause className={iconSize} />
      ) : (
        <Icons.Play className={iconSize} />
      )}
    </button>
  );
};
