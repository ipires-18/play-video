import React, { useState, useRef, useEffect } from 'react';
import Icons from '../icons';
import { cn } from '@foursales/components';
import { getTheme } from '../../helpers/theme';
import { JobType } from '../../../types';

export interface VolumeControlProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  jobType?: JobType;
  className?: string;
}

/**
 * Componente de controle de volume reutilizável (estilo YouTube)
 */
export const VolumeControl: React.FC<VolumeControlProps> = ({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  jobType = JobType.COMPANY,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const currentVolume = isMuted ? 0 : volume;
  const percentage = currentVolume * 100;
  const theme = getTheme(jobType);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleVolumeChange(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const syntheticEvent = {
      target: { value: percentage.toString() },
    } as React.ChangeEvent<HTMLInputElement>;
    onVolumeChange(syntheticEvent);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const syntheticEvent = {
      target: { value: percentage.toString() },
    } as React.ChangeEvent<HTMLInputElement>;
    onVolumeChange(syntheticEvent);
  };

  return (
    <div
      className="flex items-center space-x-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onToggleMute}
        className={cn(
          'h-4.5 w-4.5 text-wkp-primary-dark hover:text-wkp-primary-darker transition-colors cursor-pointer shrink-0',
          className
        )}
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
      >
        {isMuted || volume === 0 ? (
          <Icons.Mute className="h-4.5 w-4.5" />
        ) : (
          <Icons.Volume className="h-4.5 w-4.5" />
        )}
      </button>
      {isHovered && (
        <div className="volume flex items-center">
          <div
            ref={sliderRef}
            className="slider relative h-1 bg-wkp-gray-300 w-20 rounded-3xl cursor-pointer"
            onMouseDown={handleMouseDown}
            onClick={handleVolumeChange}
          >
            <div
              className={cn(
                'green absolute h-full bg-wkp-primary-dark rounded-3xl transition-all',
                className
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
