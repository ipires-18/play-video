import React from 'react';
import Icons from '../icons';
import { cn, Typography } from '@foursales/components';

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
      className="flex items-center gap-2 transition-opacity cursor-pointer"
    >
      <Icons.Checkbox
        className={cn('w-[18px] h-[18px] text-wkp-primary-dark', className)}
      />
      <Typography
        className={cn(
          'whitespace-nowrap tabular-nums text-wkp-primary-dark',
          className
        )}
        variant="body-medium-regular"
        aria-label={ariaLabel}
      >
        Concluir
      </Typography>
    </button>
  );
};
