import React from 'react';
import Icons from '../icons';
import { cn } from '../../utils/cn';

export interface RecordButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Componente de botão de gravar reutilizável
 */
export const RecordButton: React.FC<RecordButtonProps> = ({
  onClick,
  className,
  ariaLabel = 'Iniciar gravação',
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center space-x-2 text-wkp-primary-dark hover:text-wkp-primary-darker transition-colors font-semibold cursor-pointer',
        className
      )}
      style={{ cursor: 'pointer' }}
      aria-label={ariaLabel}
    >
      <Icons.Play className="h-4.5 w-4.5 cursor-pointer" />
      <span>Gravar</span>
    </button>
  );
};
