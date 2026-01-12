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
        className={`w-full max-w-4xl h-11 rounded-full flex items-center bg-wkp-primary-lighter px-4 py-[0.938rem]`}
      >
        {/* Left Side */}
        {leftContent && (
          <div className="flex items-center space-x-3 shrink-0 px-2">
            {leftContent}
          </div>
        )}

        {/* Center */}
        {centerContent && <div className="flex-1 min-w-0">{centerContent}</div>}

        {/* Right Side */}
        {rightContent && (
          <div className="flex items-center space-x-3 ml-4 shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};
