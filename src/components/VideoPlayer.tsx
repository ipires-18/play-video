import React, { useRef, useState, useEffect } from 'react';
import { VideoPlayerProps, PlayerState } from '../../types';
import Icons from './Icons';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, jobType }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isMuted: false,
    volume: 1,
    playbackRate: 1,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    isBuffering: false,
  });

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Themes
  const isCompany = jobType === 'company';
  const theme = {
    barBg: 'bg-[#e9f2ee]', // Light greenish background
    textPrimary: 'text-[#4a5568]',
    progressBg: 'bg-[#d1d5db]',
    progressFill: isCompany ? 'bg-indigo-600' : 'bg-slate-400',
    dot: 'bg-[#10b981]', // Green dot
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        currentTime: videoRef.current!.currentTime,
      }));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setState((prev) => ({ ...prev, duration: videoRef.current!.duration }));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState((prev) => ({ ...prev, isMuted: newMuted }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setState((prev) => ({ ...prev, volume: vol, isMuted: vol === 0 }));
    }
  };

  const handlePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
    }
  };

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
      setState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Fechar menu de velocidade ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpeedMenu) {
        const target = event.target as Node;
        const speedMenu = document.querySelector('[data-speed-menu]');
        const speedButton = document.querySelector('[data-speed-button]');
        if (
          speedMenu &&
          speedButton &&
          !speedMenu.contains(target) &&
          !speedButton.contains(target)
        ) {
          setShowSpeedMenu(false);
        }
      }
    };

    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSpeedMenu]);

  // Fechar menu de velocidade ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpeedMenu) {
        const target = event.target as Node;
        const speedMenu = document.querySelector('[data-speed-menu]');
        const speedButton = document.querySelector('[data-speed-button]');
        if (
          speedMenu &&
          speedButton &&
          !speedMenu.contains(target) &&
          !speedButton.contains(target)
        ) {
          setShowSpeedMenu(false);
        }
      }
    };

    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSpeedMenu]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col p-4 md:p-8">
      {/* Video Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded-2xl overflow-hidden shadow-lg bg-black"
      >
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

        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onPlay={() => setState((prev) => ({ ...prev, isPlaying: true }))}
          onPause={() => setState((prev) => ({ ...prev, isPlaying: false }))}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setState((prev) => ({ ...prev, isBuffering: true }))}
          onPlaying={() =>
            setState((prev) => ({ ...prev, isBuffering: false }))
          }
          playsInline
        />

        {/* Buffering Overlay */}
        {state.isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-10">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Big Play Button (shown when paused) */}
        {!state.isPlaying && !state.isBuffering && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#E6F0E9' }}
            >
              <Icons.Play className="w-10 h-10 text-slate-700 fill-slate-700 ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Control Bar - Similar to VideoRecorder */}
      <div className="mt-6 flex justify-center">
        <div
          className={`w-full max-w-4xl h-[44px] rounded-full ${theme.barBg} flex items-center px-6 shadow-sm border border-slate-200/50`}
        >
          {/* Left Side: Time */}
          <div className="flex items-center space-x-3 min-w-0">
            <span className="text-slate-700 font-medium whitespace-nowrap tabular-nums">
              {formatTime(Math.floor(state.currentTime))} de{' '}
              {formatTime(Math.floor(state.duration))}
            </span>
          </div>

          {/* Center: Progress Scrubber */}
          <div className="flex-1 px-8 relative flex items-center">
            <div
              className="w-full h-1 bg-slate-300 rounded-full relative overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (videoRef.current && state.duration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newTime = Math.max(
                    0,
                    Math.min(state.duration, percentage * state.duration)
                  );
                  videoRef.current.currentTime = newTime;
                  setState((prev) => ({ ...prev, currentTime: newTime }));
                }
              }}
            >
              <div
                className={`h-full ${theme.progressFill}`}
                style={{
                  width: `${state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0}%`,
                }}
              />
            </div>
            {/* The Green Dot indicator */}
            <div
              className={`absolute w-2 h-2 rounded-full ${theme.dot} shadow-sm transition-all duration-300 pointer-events-none`}
              style={{
                left: `${
                  state.duration > 0 && state.currentTime > 0
                    ? `calc(8% + ${(state.currentTime / state.duration) * 84}%)`
                    : '8%'
                }`,
              }}
            />
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label={state.isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            >
              {state.isPlaying ? (
                <Icons.Pause className="w-5 h-5" />
              ) : (
                <Icons.Play className="w-5 h-5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 group/volume">
              <button
                onClick={toggleMute}
                className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-800 transition-colors"
                aria-label={state.isMuted ? 'Ativar som' : 'Silenciar'}
              >
                {state.isMuted || state.volume === 0 ? (
                  <Icons.Mute className="w-5 h-5" />
                ) : (
                  <Icons.Volume className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.isMuted ? 0 : state.volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 transition-all duration-300 h-1 appearance-none rounded-full bg-slate-300 accent-slate-600 hidden md:block"
              />
            </div>

            {/* Speed Selector */}
            <div className="relative">
              <button
                data-speed-button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center space-x-1 px-2 py-1 bg-white/50 hover:bg-white/70 rounded text-xs font-semibold transition-colors text-slate-700"
                aria-label="Velocidade de reprodução"
                aria-expanded={showSpeedMenu}
              >
                <span>{state.playbackRate}x</span>
              </button>
              {showSpeedMenu && (
                <div
                  data-speed-menu
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-xl p-1 flex flex-col min-w-[60px] z-20"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        handlePlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1.5 text-xs text-left rounded hover:bg-slate-100 transition-colors ${
                        state.playbackRate === rate
                          ? 'text-indigo-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label={
                state.isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'
              }
            >
              {state.isFullscreen ? (
                <Icons.Minimize className="w-5 h-5" />
              ) : (
                <Icons.Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
