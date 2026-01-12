import { useState, useCallback } from 'react';

export interface UsePlaybackRateProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export interface UsePlaybackRateReturn {
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  handlePlaybackRate: (rate: number) => void;
}

/**
 * Hook para gerenciar a velocidade de reprodução
 */
export const usePlaybackRate = ({
  videoRef,
}: UsePlaybackRateProps): UsePlaybackRateReturn => {
  const [playbackRate, setPlaybackRateState] = useState(1);

  const handlePlaybackRate = useCallback(
    (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRateState(rate);
      }
    },
    [videoRef]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  return {
    playbackRate,
    setPlaybackRate,
    handlePlaybackRate,
  };
};
