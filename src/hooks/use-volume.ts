import { useState, useCallback } from 'react';

export interface UseVolumeProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export interface UseVolumeReturn {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Hook para gerenciar o volume do vídeo
 */
export const useVolume = ({
  videoRef,
}: UseVolumeProps): UseVolumeReturn => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [videoRef, isMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = vol;
        videoRef.current.muted = vol === 0;
        setIsMuted(vol === 0);
        setVolume(vol);
      }
    },
    [videoRef]
  );

  return {
    isMuted,
    volume,
    toggleMute,
    handleVolumeChange,
  };
};
