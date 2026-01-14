import React from 'react';
import { Theme } from '../../helpers/theme';
import { PlayButton } from './play-button';
import { VolumeControl } from './volume-control';
import { TimeDisplay } from './time-display';
import { ProgressBar } from './progress-bar';
import { SpeedSelector } from './speed-selector';
import { FullscreenButton } from './fullscreen-button';
import { ReRecordButton } from './re-record-button';

export interface FullscreenControlBarProps {
  theme: Theme;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  progressPercentage: number;
  playbackRate: number;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  showReRecordButton?: boolean;
  onReRecord?: () => void;
}

/**
 * Componente de controles que aparecem dentro do vídeo em modo fullscreen
 */
export const FullscreenControlBar: React.FC<FullscreenControlBarProps> = ({
  theme,
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  progressPercentage,
  playbackRate,
  isFullscreen,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onProgressClick,
  onPlaybackRateChange,
  onToggleFullscreen,
  showReRecordButton = false,
  onReRecord,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Gradiente escuro para melhorar visibilidade dos controles */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/70 to-transparent pointer-events-none" />
      <div className="relative pointer-events-auto w-full">
        <div className="w-full h-11 rounded-none flex items-center bg-wkp-primary-lighter/90 backdrop-blur-sm px-4 py-[0.938rem]">
          {/* Left Side */}
          <div className="flex items-center space-x-3 shrink-0 px-2 pointer-events-auto cursor-pointer">
            {showReRecordButton && onReRecord && (
              <ReRecordButton onClick={onReRecord} />
            )}
            <PlayButton isPlaying={isPlaying} onClick={onTogglePlay} />
            <TimeDisplay currentTime={currentTime} duration={duration} />
          </div>

          {/* Center */}
          <div className="flex-1 min-w-0 pointer-events-auto">
            <ProgressBar
              progressPercentage={progressPercentage}
              theme={theme}
              onClick={onProgressClick}
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3 ml-4 shrink-0 pointer-events-auto cursor-pointer">
            <SpeedSelector
              playbackRate={playbackRate}
              onRateChange={onPlaybackRateChange}
            />
            <FullscreenButton
              isFullscreen={isFullscreen}
              onClick={onToggleFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
