import React from 'react';
import Icons from '../icons';

export interface BigPlayButtonProps {
  onClick: () => void;
}

/**
 * Componente de botão de play grande centralizado
 */
export const BigPlayButton: React.FC<BigPlayButtonProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#E6F0E9' }}
      >
        <Icons.Play className="w-10 h-10 text-slate-700 fill-slate-700 ml-1" />
      </div>
    </div>
  );
};
