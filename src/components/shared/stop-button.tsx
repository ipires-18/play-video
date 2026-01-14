import React from 'react';
import Icons from '../icons';
import { cn, Typography } from '@foursales/components';

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
      className="flex items-center gap-2 transition-colors cursor-pointer group"
      style={{ cursor: 'pointer' }}
    >
      <Icons.Checkbox
        className={cn(
          'w-[18px] h-[18px] text-wkp-primary-dark group-hover:text-wkp-primary-darker transition-colors cursor-pointer',
          className
        )}
      />
      <Typography
        className={cn(
          'whitespace-nowrap tabular-nums text-wkp-primary-dark group-hover:text-wkp-primary-darker transition-colors',
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
