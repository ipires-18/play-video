import React from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';

export interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Componente de botão play/pause reutilizável
 */
export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onClick,
  className,
  ariaLabel,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-4.5 w-4.5 text-wkp-primary-dark hover:text-wkp-primary-darker transition-colors cursor-pointer',
        className
      )}
      style={{ cursor: 'pointer' }}
      aria-label={
        ariaLabel || (isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo')
      }
    >
      {isPlaying ? (
        <Icons.Pause className="h-4.5 w-4.5 cursor-pointer" />
      ) : (
        <Icons.Play className="h-4.5 w-4.5 cursor-pointer" />
      )}
    </button>
  );
};
