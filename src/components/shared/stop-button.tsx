import React from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';

export interface StopButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Componente de botão de parar/concluir durante gravação
 */
export const StopButton: React.FC<StopButtonProps> = ({
  onClick,
  className,
  ariaLabel = 'Concluir gravação',
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold cursor-pointer',
        className
      )}
      aria-label={ariaLabel}
    >
      <Icons.StopSquare className="w-6 h-6" />
      <span>Concluir</span>
    </button>
  );
};
