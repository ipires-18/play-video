import React from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';

export interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Componente de botão de tela cheia reutilizável
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  isFullscreen,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-4.5 w-4.5 text-wkp-primary-dark hover:text-wkp-primary-darker transition-colors cursor-pointer',
        className
      )}
      aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
    >
      {isFullscreen ? (
        <Icons.Minimize className="h-4.5 w-4.5" />
      ) : (
        <Icons.Maximize className="h-4.5 w-4.5" />
      )}
    </button>
  );
};
