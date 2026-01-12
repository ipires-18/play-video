import { useState, useEffect, useRef } from 'react';

export interface UseFullscreenReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

/**
 * Hook para gerenciar o modo tela cheia
 */
export const useFullscreen = (): UseFullscreenReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return {
    containerRef,
    isFullscreen,
    toggleFullscreen,
  };
};
