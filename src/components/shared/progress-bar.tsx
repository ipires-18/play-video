import React from 'react';
import { Theme } from '../../helpers/theme';

export interface ProgressBarProps {
  progressPercentage: number;
  theme: Theme;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  showDot?: boolean;
}

/**
 * Componente de barra de progresso reutilizável
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  theme,
  onClick,
  showDot = true,
}) => {
  return (
    <div className="w-full px-8 relative flex items-center">
      <div
        className="w-full h-1 bg-slate-300 rounded-full relative overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div
          className={`h-full ${theme.progressFill}`}
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
      {showDot && (
        <div
          className={`absolute w-2 h-2 rounded-full ${theme.dot} shadow-sm transition-all duration-300 pointer-events-none`}
          style={{
            left: `${
              progressPercentage > 0
                ? `calc(8% + ${progressPercentage * 0.84}%)`
                : '8%'
            }`,
          }}
        />
      )}
    </div>
  );
};
