import { useCallback } from 'react';

export interface UseVideoProgressProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export interface UseVideoProgressReturn {
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  progressPercentage: number;
}

/**
 * Hook para gerenciar o controle de progresso do vídeo
 */
export const useVideoProgress = ({
  videoRef,
  duration,
  currentTime,
  setCurrentTime,
}: UseVideoProgressProps): UseVideoProgressReturn => {
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (videoRef.current && duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = Math.max(0, Math.min(duration, percentage * duration));
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [videoRef, duration, setCurrentTime]
  );

  const progressPercentage =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    handleProgressClick,
    progressPercentage,
  };
};
