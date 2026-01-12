import { useRef, useState, useEffect, useCallback } from 'react';

export interface UseVideoReviewProps {
  previewUrl: string | null;
  isActive: boolean;
}

export interface UseVideoReviewReturn {
  videoReviewRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  reset: () => void;
}

/**
 * Hook para gerenciar o vídeo de revisão após gravação
 */
export const useVideoReview = ({
  previewUrl,
  isActive,
}: UseVideoReviewProps): UseVideoReviewReturn => {
  const videoReviewRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    if (videoReviewRef.current) {
      if (videoReviewRef.current.paused) {
        videoReviewRef.current.play();
      } else {
        videoReviewRef.current.pause();
      }
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoReviewRef.current) {
      setCurrentTime(videoReviewRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoReviewRef.current) {
      const video = videoReviewRef.current;
      video.currentTime = 0;
      video.pause();
      setIsPlaying(false);
      setDuration(video.duration || 0);
      setCurrentTime(0);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    if (videoReviewRef.current) {
      videoReviewRef.current.pause();
      setIsPlaying(false);
      videoReviewRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const reset = useCallback(() => {
    if (videoReviewRef.current) {
      videoReviewRef.current.pause();
      videoReviewRef.current.src = '';
      videoReviewRef.current.load();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Reset quando previewUrl mudar
  useEffect(() => {
    if (previewUrl && videoReviewRef.current) {
      const video = videoReviewRef.current;
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [
    previewUrl,
    handlePlay,
    handlePause,
    handleEnded,
    handleTimeUpdate,
    handleLoadedMetadata,
  ]);

  return {
    videoReviewRef,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    reset,
  };
};
