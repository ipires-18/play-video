
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoPlayerProps, PlayerState } from '../types';
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
    isBuffering: false
  });

  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Themes
  const theme = {
    primary: jobType === 'company' ? 'bg-indigo-600' : 'bg-slate-700',
    accent: jobType === 'company' ? 'text-indigo-400' : 'text-slate-300',
    hover: jobType === 'company' ? 'hover:bg-indigo-700' : 'hover:bg-slate-800',
    progress: jobType === 'company' ? 'bg-indigo-500' : 'bg-white',
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
      setState(prev => ({ ...prev, currentTime: videoRef.current!.currentTime }));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setState(prev => ({ ...prev, duration: videoRef.current!.duration }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState(prev => ({ ...prev, isMuted: newMuted }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setState(prev => ({ ...prev, volume: vol, isMuted: vol === 0 }));
    }
  };

  const handlePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (state.isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full bg-black group select-none overflow-hidden touch-none"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onPlay={() => setState(prev => ({ ...prev, isPlaying: true }))}
        onPause={() => setState(prev => ({ ...prev, isPlaying: false }))}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setState(prev => ({ ...prev, isBuffering: true }))}
        onPlaying={() => setState(prev => ({ ...prev, isBuffering: false }))}
        playsInline
      />

      {/* Buffering Overlay */}
      {state.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Big Play Button (shown when paused) */}
      {!state.isPlaying && !state.isBuffering && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover:bg-black/50 transition-all"
        >
          <div className={`p-6 rounded-full ${theme.primary} shadow-2xl transform scale-100 hover:scale-110 transition-transform`}>
            <Icons.Play className="w-12 h-12 text-white fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 md:p-6 transition-opacity duration-300 ${
          showControls || !state.isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar Container */}
        <div className="relative group/progress mb-4 px-1">
          <input
            type="range"
            min="0"
            max={state.duration || 0}
            value={state.currentTime}
            onChange={handleSeek}
            className={`w-full h-1.5 appearance-none rounded-full cursor-pointer bg-white/30 accent-current ${theme.accent}`}
            style={{
              background: `linear-gradient(to right, ${jobType === 'company' ? '#4f46e5' : '#ffffff'} ${(state.currentTime / state.duration) * 100}%, rgba(255,255,255,0.2) 0%)`
            }}
          />
        </div>

        {/* Lower Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2 md:space-x-6">
            {/* Play/Pause */}
            <button 
              onClick={togglePlay} 
              className="hover:scale-110 transition-transform focus:outline-none"
              title={state.isPlaying ? "Pausar" : "Reproduzir"}
            >
              {state.isPlaying ? <Icons.Pause className="w-6 h-6" /> : <Icons.Play className="w-6 h-6 fill-current" />}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2 group/volume">
              <button onClick={toggleMute} className="focus:outline-none" title="Silenciar">
                {state.isMuted || state.volume === 0 ? <Icons.Mute className="w-6 h-6" /> : <Icons.Volume className="w-6 h-6" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.isMuted ? 0 : state.volume}
                onChange={handleVolumeChange}
                className={`w-0 group-hover/volume:w-16 md:group-hover/volume:w-24 transition-all duration-300 h-1 appearance-none rounded-full bg-white/30 accent-white hidden md:block`}
              />
            </div>

            {/* Time */}
            <div className="text-sm font-medium tabular-nums">
              <span>{formatTime(state.currentTime)}</span>
              <span className="mx-1 text-white/50">/</span>
              <span className="text-white/70">{formatTime(state.duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-6">
            {/* Speed Selector */}
            <div className="relative group/speed">
              <button className="flex items-center space-x-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs md:text-sm font-semibold transition-colors">
                <span>{state.playbackRate}x</span>
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/speed:opacity-100 transition-opacity pointer-events-none group-hover/speed:pointer-events-auto p-1 flex flex-col min-w-[60px]">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRate(rate)}
                    className={`px-3 py-1.5 text-xs text-left rounded hover:bg-white/10 transition-colors ${state.playbackRate === rate ? theme.accent : 'text-white'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen} 
              className="hover:scale-110 transition-transform focus:outline-none"
              title="Tela Cheia"
            >
              {state.isFullscreen ? <Icons.Minimize className="w-6 h-6" /> : <Icons.Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
