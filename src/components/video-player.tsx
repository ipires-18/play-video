import React from 'react';
import { VideoPlayerProps } from '../../types';
import { useVideoPlayer } from '../hooks/use-video-player';
import { useVideoProgress } from '../hooks/use-video-progress';
import { useFullscreen } from '../hooks/use-fullscreen';
import { useVolume } from '../hooks/use-volume';
import { usePlaybackRate } from '../hooks/use-playback-rate';
import { getTheme } from '../helpers/theme';
import {
  ProgressBar,
  PlayButton,
  VolumeControl,
  SpeedSelector,
  FullscreenButton,
  TimeDisplay,
  VideoStyles,
  BigPlayButton,
  BufferingOverlay,
} from './shared';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, jobType }) => {
  const theme = getTheme(jobType);

  // Hooks
  const {
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
  } = useVideoPlayer();

  const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();

  const { isMuted, volume, toggleMute, handleVolumeChange } = useVolume({
    videoRef,
  });

  const { playbackRate, handlePlaybackRate } = usePlaybackRate({
    videoRef,
  });

  const { handleProgressClick, progressPercentage } = useVideoProgress({
    videoRef,
    duration,
    currentTime,
    setCurrentTime,
  });

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col p-4 md:p-8">
      {/* Video Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded-2xl overflow-hidden shadow-lg bg-black"
      >
        <VideoStyles />

        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          playsInline
        />

        <BufferingOverlay isBuffering={isBuffering} />

        {!isPlaying && !isBuffering && <BigPlayButton onClick={togglePlay} />}
      </div>

      {/* Control Bar */}
      <div className="mt-6 flex justify-center">
        <div
          className={`w-full max-w-4xl h-[44px] rounded-full ${theme.barBg} flex items-center px-6 shadow-sm border border-slate-200/50`}
        >
          {/* Left Side: Time */}
          <div className="flex items-center space-x-3 min-w-0">
            <TimeDisplay currentTime={currentTime} duration={duration} />
          </div>

          {/* Center: Progress Scrubber */}
          <ProgressBar
            progressPercentage={progressPercentage}
            theme={theme}
            onClick={handleProgressClick}
          />

          {/* Right Side: Action Buttons */}
          <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
            <PlayButton isPlaying={isPlaying} onClick={togglePlay} />

            <VolumeControl
              isMuted={isMuted}
              volume={volume}
              onToggleMute={toggleMute}
              onVolumeChange={handleVolumeChange}
            />

            <SpeedSelector
              playbackRate={playbackRate}
              onRateChange={handlePlaybackRate}
            />

            <FullscreenButton
              isFullscreen={isFullscreen}
              onClick={toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
