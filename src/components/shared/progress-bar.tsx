import React from 'react';
import { Theme } from '../../helpers/theme';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  progressPercentage: number;
  theme: Theme;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  showDot?: boolean;
  className?: string;
}

/**
 * Componente de barra de progresso reutilizável
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  theme,
  onClick,
  showDot = false,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'w-full h-1 bg-wkp-gray-300 rounded-3xl  mb-4 relative overflow-hidden cursor-pointer m-auto',
        className
      )}
      onClick={onClick}
      role="progressbar"
      aria-valuenow={Math.round(progressPercentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-1 rounded-3xl transition-all duration-300 bg-wkp-primary-dark',
          className
        )}
        style={{
          width: `${progressPercentage}%`,
        }}
      />
      {showDot && (
        <div
          className={`absolute w-2 h-2 rounded-full ${theme.dot} shadow-sm transition-all duration-300 pointer-events-none top-1/2 -translate-y-1/2`}
          style={{
            left: `${progressPercentage}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};
