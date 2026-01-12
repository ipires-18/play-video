import React from 'react';

/**
 * Componente que injeta estilos CSS para esconder controles nativos do vídeo
 */
export const VideoStyles: React.FC = () => {
  return (
    <style>{`
      video::-webkit-media-controls {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        display: none !important;
      }
      video::-webkit-media-controls-panel {
        display: none !important;
      }
      video::-webkit-media-controls-play-button {
        display: none !important;
      }
      video::-webkit-media-controls-start-playback-button {
        display: none !important;
      }
    `}</style>
  );
};
