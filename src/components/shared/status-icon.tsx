import React from 'react';
import { cn } from '@foursales/components';
import { RecorderStatus } from '../../../types';

export interface StatusIconProps {
  status: RecorderStatus;
  className?: string;
}

/**
 * Componente de ícone de status (bolinha indicadora)
 */
export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  className,
}) => {
  const isRecording = status === RecorderStatus.RECORDING;

  return (
    <div
      className={cn(
        'w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0',
        isRecording ? 'bg-rose-600 animate-pulse' : 'bg-slate-300',
        className
      )}
    >
      <div className="w-2 h-2 bg-white rounded-full" />
    </div>
  );
};
