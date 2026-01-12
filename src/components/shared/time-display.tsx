import React from 'react';
import { formatTime } from '../../helpers/time';

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
      className={`text-slate-700 font-medium whitespace-nowrap tabular-nums ${className}`}
    >
      {formatTime(Math.floor(currentTime))} de{' '}
      {formatTime(Math.floor(duration))}
    </span>
  );
};
