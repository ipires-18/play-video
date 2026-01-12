import React from 'react';

export interface CountdownOverlayProps {
  countdownValue: number;
}

/**
 * Componente de overlay de countdown
 */
export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  countdownValue,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white">
      <h3 className="text-2xl font-medium mb-6">A gravação começará em:</h3>
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-white/20"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={364}
            strokeDashoffset={364 * (1 - countdownValue / 5)}
            className="text-white transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute text-4xl font-bold">{countdownValue}</span>
      </div>
    </div>
  );
};
