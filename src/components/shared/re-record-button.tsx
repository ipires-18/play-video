import React from 'react';
import Icons from '../icons';
import { cn } from '../../utils/cn';

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
      className="flex items-center gap-2 transition-colors shrink-0 cursor-pointer group"
      style={{ cursor: 'pointer' }}
    >
      <Icons.ReRecord
        className={cn(
          'w-[18px] h-[18px] text-wkp-primary-dark group-hover:text-wkp-primary-darker transition-colors cursor-pointer',
          className
        )}
      />
      <span
        className={cn(
          'whitespace-nowrap tabular-nums text-wkp-primary-dark group-hover:text-wkp-primary-darker transition-colors text-sm font-normal',
          className
        )}
        aria-label={ariaLabel}
      >
        Regravar
      </span>
    </button>
  );
};
