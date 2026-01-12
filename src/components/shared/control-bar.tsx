import React from 'react';
import { Theme } from '../../helpers/theme';

export interface ControlBarProps {
  theme: Theme;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

/**
 * Componente de barra de controle reutilizável
 */
export const ControlBar: React.FC<ControlBarProps> = ({
  theme,
  leftContent,
  centerContent,
  rightContent,
  className = '',
}) => {
  return (
    <div className={`mt-6 flex justify-center ${className}`}>
      <div
        className={`w-full max-w-4xl h-[44px] rounded-full ${theme.barBg} flex items-center px-6 shadow-sm border border-slate-200/50`}
      >
        {/* Left Side */}
        {leftContent && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            {leftContent}
          </div>
        )}

        {/* Center */}
        {centerContent && <div className="flex-1 min-w-0">{centerContent}</div>}

        {/* Right Side */}
        {rightContent && (
          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};
