import React from 'react';
import Icons from '../icons';
import { cn } from '../../utils/cn';

export interface FinishButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Componente de botão de concluir/finalizar reutilizável
 */
export const FinishButton: React.FC<FinishButtonProps> = ({
  onClick,
  className,
  ariaLabel = 'Concluir gravação',
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 transition-colors cursor-pointer group"
      style={{ cursor: 'pointer' }}
    >
      <Icons.Checkbox
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
        Concluir
      </span>
    </button>
  );
};
