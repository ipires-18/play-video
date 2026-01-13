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
        // Tentar iniciar a reprodução
        // Se falhar (ex: autoplay bloqueado), o erro será silenciosamente ignorado
        // pois o usuário já interagiu (clicou no botão)
        videoRef.current.play().catch((error) => {
          console.warn('Erro ao iniciar reprodução:', error);
          // Não é necessário mostrar erro ao usuário aqui,
          // pois ele já interagiu com o botão de play
        });
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
