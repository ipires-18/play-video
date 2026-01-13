import React from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';

export interface ReRecordButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Componente de botão de regravar reutilizável
 */
export const ReRecordButton: React.FC<ReRecordButtonProps> = ({
  onClick,
  className,
  ariaLabel = 'Regravar vídeo',
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors flex-shrink-0 cursor-pointer',
        className
      )}
      aria-label={ariaLabel}
    >
      <Icons.ReRecord className="w-[18px] h-[18px] text-wkp-primary-dark" />
      <span>Regravar</span>
    </button>
  );
};
