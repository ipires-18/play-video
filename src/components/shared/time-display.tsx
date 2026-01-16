import React from 'react';
import { formatTime } from '../../helpers/time';
import { cn } from '../../utils/cn';

export interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  className?: string;
}

/**
 * Componente de exibição de tempo reutilizável
 */
export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  currentTime,
  duration,
  className = '',
}) => {
  return (
    <span
      className={cn(
        'whitespace-nowrap tabular-nums text-wkp-primary-dark text-sm font-normal',
        className
      )}
    >
      {formatTime(Math.floor(currentTime))} de{' '}
      {formatTime(Math.floor(duration))}
    </span>
  );
};
