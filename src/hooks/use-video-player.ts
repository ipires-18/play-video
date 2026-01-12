import { useRef, useState, useCallback } from 'react';

export interface UseVideoPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  handlePlay: () => void;
  handlePause: () => void;
  handleWaiting: () => void;
  handlePlaying: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

/**
 * Hook para gerenciar a reprodução de vídeo
 */
export const useVideoPlayer = (): UseVideoPlayerReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handlePlaying = useCallback(() => {
    setIsBuffering(false);
  }, []);

  return {
    videoRef,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handlePlay,
    handlePause,
    handleWaiting,
    handlePlaying,
    setCurrentTime,
    setDuration,
  };
};
