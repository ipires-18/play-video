import React from 'react';
import Icons from '../icons';
import { cn, Typography } from '@foursales/components';

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
      className="flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
    >
      <Icons.ReRecord
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
        Regravar
      </Typography>
    </button>
  );
};
