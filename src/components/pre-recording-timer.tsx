import React, { useState, useEffect } from 'react';
import { JobType } from '../../types';

export interface PreRecordingTimerProps {
  jobType: JobType;
  durationSeconds?: number;
  onTimerComplete: () => void;
  onSkip?: () => void;
}

/**
 * Componente de timer pré-gravação
 * Mostra uma contagem regressiva antes de iniciar a gravação
 */
export const PreRecordingTimer: React.FC<PreRecordingTimerProps> = ({
  jobType,
  durationSeconds = 30,
  onTimerComplete,
  onSkip,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          // Chamar o callback imediatamente quando chegar a 0
          console.log('⏰ Timer chegou a 0 - chamando onTimerComplete');
          onTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onTimerComplete]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progressPercentage =
    ((durationSeconds - timeRemaining) / durationSeconds) * 100;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Timer Display */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Circular Progress */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
          {/* Background Circle */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              className="text-emerald-500 transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl sm:text-7xl font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm sm:text-base text-slate-400 mt-2">
              Preparando gravação...
            </div>
          </div>
        </div>

        {/* Skip Button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium transition-all border border-white/20"
          >
            Pular timer
          </button>
        )}
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] animate-pulse" />
      </div>
    </div>
  );
};

export default PreRecordingTimer;
