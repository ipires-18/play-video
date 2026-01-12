import React from 'react';
import { formatTime } from '../../helpers/time';
import { cn, Typography } from '@foursales/components';

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
    <Typography
      className={cn(
        'whitespace-nowrap tabular-nums text-wkp-primary-dark',
        className
      )}
      variant="body-medium-regular"
    >
      {formatTime(Math.floor(currentTime))} de{' '}
      {formatTime(Math.floor(duration))}
    </Typography>
  );
};
