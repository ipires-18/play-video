import React from 'react';
import Icons from '../icons';

export interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
}

/**
 * Componente de botão de tela cheia reutilizável
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  isFullscreen,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-800 transition-colors"
      aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
    >
      {isFullscreen ? (
        <Icons.Minimize className="w-5 h-5" />
      ) : (
        <Icons.Maximize className="w-5 h-5" />
      )}
    </button>
  );
};
