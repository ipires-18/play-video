import React from 'react';

export interface BufferingOverlayProps {
  isBuffering: boolean;
}

/**
 * Componente de overlay de buffering
 */
export const BufferingOverlay: React.FC<BufferingOverlayProps> = ({
  isBuffering,
}) => {
  if (!isBuffering) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
};
