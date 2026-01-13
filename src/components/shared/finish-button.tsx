import React from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';

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
      className={cn(
        'flex items-center space-x-2 px-4 py-1.5 bg-[#E6F0E9] text-wkp-primary-dark rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer',
        className
      )}
      aria-label={ariaLabel}
    >
      <Icons.Checkbox className="w-[18px] h-[18px] text-wkp-primary-dark" />
      <span>Concluir</span>
    </button>
  );
};
