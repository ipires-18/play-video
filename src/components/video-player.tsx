import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import { VideoPlayerProps } from '../../types';
import { useVideoPlayer } from '../hooks/use-video-player';
import { useVideoProgress } from '../hooks/use-video-progress';
import { useFullscreen } from '../hooks/use-fullscreen';
import { useVolume } from '../hooks/use-volume';
import { usePlaybackRate } from '../hooks/use-playback-rate';
import { getTheme } from '../helpers/theme';
import { getControlColorsStyle } from '../helpers/colors';
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
  ControlBar,
  FullscreenControlBar,
} from './shared';
import { cn } from '../utils/cn';

export interface VideoPlayerRef {
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isFullscreen: boolean;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      srcObject,
      poster,
      jobType,
      hideControls = false,
      showControlsOnPlay = true,
      onStateChange,
      className = 'w-full h-full object-contain',
      autoPlay = false,
      muted = false,
      bigPlayButtonRightButton,
      customFullscreenControlBar,
      colors,
    },
    ref
  ) => {
    const theme = getTheme(jobType);
    const [showControls, setShowControls] = useState(!showControlsOnPlay);
    const controlColorsStyle = getControlColorsStyle(colors);

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

    // Expor métodos e estado via ref
    useImperativeHandle(ref, () => ({
      togglePlay,
      setCurrentTime,
      setPlaybackRate: handlePlaybackRate,
      toggleFullscreen,
      isPlaying,
      currentTime,
      duration,
      playbackRate,
      isFullscreen,
    }));

    // Notificar mudanças de estado
    useEffect(() => {
      if (onStateChange) {
        onStateChange({
          isPlaying,
          currentTime,
          duration,
        });
      }
    }, [isPlaying, currentTime, duration, onStateChange]);

    // Gerenciar srcObject quando fornecido
    useEffect(() => {
      if (videoRef.current && srcObject) {
        videoRef.current.srcObject = srcObject;
        if (autoPlay) {
          // Autoplay no macOS/Safari requer muted para funcionar
          // Se não estiver muted, tentar mutar automaticamente
          if (!muted && videoRef.current.muted === false) {
            videoRef.current.muted = true;
          }

          videoRef.current
            .play()
            .then(() => {
              console.log('✅ Autoplay iniciado com sucesso');
            })
            .catch((error) => {
              // Autoplay foi bloqueado (política do navegador)
              // Isso é esperado se o vídeo não estiver muted
              console.warn(
                '⚠️ Autoplay bloqueado. O usuário precisa interagir para iniciar o vídeo.',
                error
              );
              // Não é um erro crítico - o usuário pode clicar para iniciar
            });
        }
      } else if (videoRef.current && !srcObject) {
        // Limpar srcObject quando não fornecido
        videoRef.current.srcObject = null;
      }
    }, [srcObject, autoPlay, muted]);

    return (
      <div
        className="absolute inset-0 z-10"
        style={colors ? controlColorsStyle : undefined}
      >
        {/* Video Canvas Container */}
        <div
          ref={containerRef}
          className={cn(
            'relative flex-1 overflow-hidden bg-transparent',
            isFullscreen
              ? 'rounded-none'
              : 'rounded-lg sm:rounded-xl md:rounded-2xl'
          )}
        >
          <VideoStyles />

          <video
            ref={videoRef}
            src={srcObject ? undefined : src}
            poster={poster}
            className={cn('w-full h-full object-contain', className)}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={handleWaiting}
            onPlaying={handlePlaying}
            playsInline
            autoPlay={autoPlay}
            muted={muted}
            // Nota sobre autoplay:
            // - No macOS/Safari, autoplay só funciona se muted=true
            // - Vídeos com áudio requerem interação do usuário para iniciar
            // - playsInline é necessário para iOS/macOS
          />

          <BufferingOverlay isBuffering={isBuffering} />

          {!isPlaying && !isBuffering && (
            <BigPlayButton
              onClick={() => {
                togglePlay();
                if (showControlsOnPlay) {
                  setShowControls(true);
                }
              }}
            />
          )}

          {/* Control Bar DENTRO do vídeo - apenas em fullscreen */}
          {isFullscreen && customFullscreenControlBar
            ? customFullscreenControlBar
            : !hideControls &&
              showControls &&
              isFullscreen && (
                <FullscreenControlBar
                  theme={theme}
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  volume={volume}
                  currentTime={currentTime}
                  duration={duration}
                  progressPercentage={progressPercentage}
                  playbackRate={playbackRate}
                  isFullscreen={isFullscreen}
                  onTogglePlay={togglePlay}
                  onToggleMute={toggleMute}
                  onVolumeChange={handleVolumeChange}
                  onProgressClick={handleProgressClick}
                  onPlaybackRateChange={handlePlaybackRate}
                  onToggleFullscreen={toggleFullscreen}
                />
              )}
        </div>

        {/* Control Bar FORA do vídeo - apenas quando NÃO está em fullscreen */}
        {!hideControls && showControls && !isFullscreen && (
          <ControlBar
            theme={theme}
            leftContent={
              <>
                <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
                <VolumeControl
                  isMuted={isMuted}
                  volume={volume}
                  onToggleMute={toggleMute}
                  onVolumeChange={handleVolumeChange}
                  jobType={jobType}
                />
                <TimeDisplay currentTime={currentTime} duration={duration} />
              </>
            }
            centerContent={
              <ProgressBar
                progressPercentage={progressPercentage}
                theme={theme}
                onClick={handleProgressClick}
              />
            }
            rightContent={
              <>
                <SpeedSelector
                  playbackRate={playbackRate}
                  onRateChange={handlePlaybackRate}
                />
                <FullscreenButton
                  isFullscreen={isFullscreen}
                  onClick={toggleFullscreen}
                />
              </>
            }
          />
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
