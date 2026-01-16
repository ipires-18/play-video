import React, { useState, useEffect } from 'react';
import { VideoRecorderProps, RecorderStatus } from '../../types';
import Icons from './icons';
import VideoPlayer from './video-player';
import type { VideoPlayerRef } from './video-player';
import { useCameraStream } from '../hooks/use-camera-stream';
import { useMediaRecorder } from '../hooks/use-media-recorder';
import { useCountdown } from '../hooks/use-countdown';
import { getTheme } from '../helpers/theme';
import { getSupportedMimeType } from '../helpers/codec-detection';
import { isMediaRecorderSupported, isIOS } from '../helpers/device-detection';
import { getControlColorsStyle } from '../helpers/colors';
import {
  ProgressBar,
  PlayButton,
  VideoStyles,
  ControlBar,
  FinishButton,
  ReRecordButton,
  StatusIcon,
  RecordButton,
  StopButton,
  TimeDisplay,
  SpeedSelector,
  FullscreenButton,
  FullscreenControlBar,
} from './shared';
import { CountdownOverlay } from './shared/countdown-overlay';
import { Button, LogoAnimation } from '@foursales/components';

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  jobType,
  maxDurationSeconds = 180,
  allowReRecord = true,
  onRecordingComplete,
  autoStart = false,
  colors,
}) => {
  const theme = getTheme(jobType);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdownValue, setCountdownValue] = useState(5);
  const [shouldStartCountdownAfterStream, setShouldStartCountdownAfterStream] =
    useState(false);
  const autoStartAttemptedRef = React.useRef(false);

  // Hooks
  const {
    stream,
    error: streamError,
    isRequesting,
    startStream,
    stopStream,
  } = useCameraStream();

  const handleRecordingComplete = () => {
    // Callback vazio - o previewUrl será criado automaticamente pelo hook
  };

  const {
    status,
    elapsedTime,
    recordedChunks,
    previewUrl,
    isProcessingChunks,
    startRecording,
    stopRecording,
    setStatus,
    setPreviewUrl,
    setRecordedChunks,
    setElapsedTime,
  } = useMediaRecorder({
    stream,
    mimeType,
    maxDurationSeconds,
    onRecordingComplete: handleRecordingComplete,
  });

  const {
    countdownValue: activeCountdown,
    setCountdownValue: setActiveCountdown,
  } = useCountdown({
    isActive: status === RecorderStatus.COUNTDOWN,
    initialValue: 5,
    onComplete: startRecording,
  });

  const [videoPlayerState, setVideoPlayerState] = useState<{
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  }>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const videoPlayerRef = React.useRef<VideoPlayerRef>(null);

  const isPreviewPlaying = videoPlayerState.isPlaying;
  const videoCurrentTime = videoPlayerState.currentTime;
  const videoDuration = videoPlayerState.duration;

  const toggleReviewPlay = () => {
    videoPlayerRef.current?.togglePlay();
  };

  // Estado para controles durante reviewing (sincronizado com VideoPlayer via ref)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Sincronizar estado do VideoPlayer durante reviewing
  useEffect(() => {
    if (
      videoPlayerRef.current &&
      (status === RecorderStatus.REVIEWING ||
        status === RecorderStatus.COMPLETED)
    ) {
      const player = videoPlayerRef.current;
      setIsFullscreen(player.isFullscreen);
      setPlaybackRate(player.playbackRate);
    }
  }, [status, videoPlayerState.isPlaying, videoPlayerState.currentTime]);

  // Listener para mudanças de fullscreen em tempo real
  useEffect(() => {
    const handleFullscreenChange = () => {
      setTimeout(() => {
        if (videoPlayerRef.current) {
          setIsFullscreen(videoPlayerRef.current.isFullscreen);
        } else {
          setIsFullscreen(!!document.fullscreenElement);
        }
      }, 50);
    };

    if (videoPlayerRef.current) {
      setIsFullscreen(videoPlayerRef.current.isFullscreen);
    } else {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.toggleFullscreen();
      // Atualizar estado local após toggle
      setTimeout(() => {
        if (videoPlayerRef.current) {
          setIsFullscreen(videoPlayerRef.current.isFullscreen);
        }
      }, 100);
    }
  };

  const handlePlaybackRate = (rate: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  };

  // Handlers para volume
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implementar mute no VideoPlayer se necessário
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    // TODO: Implementar volume no VideoPlayer se necessário
  };

  // Detectar codec suportado na montagem
  useEffect(() => {
    const supportedType = getSupportedMimeType();
    setMimeType(supportedType);

    if (!isMediaRecorderSupported) {
      setError(
        'Seu navegador não suporta gravação de vídeo. Por favor, use um navegador mais recente (Chrome, Firefox, Edge, Safari 14.3+).'
      );
    } else if (!supportedType && isIOS) {
      setError(
        'Gravação de vídeo não está disponível neste dispositivo iOS. Por favor, atualize para iOS 14.3 ou superior.'
      );
    }
  }, []);

  // Sincronizar erro do stream
  useEffect(() => {
    if (streamError) {
      setError(streamError);
    }
  }, [streamError]);

  // Sincronizar status de requesting
  useEffect(() => {
    if (isRequesting) {
      setStatus(RecorderStatus.REQUESTING);
    } else if (
      status === RecorderStatus.REQUESTING &&
      !isRequesting &&
      stream
    ) {
      setStatus(RecorderStatus.IDLE);
    }
  }, [isRequesting, stream, status, setStatus]);

  // Resetar flag quando autoStart mudar para false
  useEffect(() => {
    if (!autoStart) {
      autoStartAttemptedRef.current = false;
    }
  }, [autoStart]);

  // Iniciar stream automaticamente se autoStart for true
  useEffect(() => {
    if (
      autoStart &&
      !stream &&
      !isRequesting &&
      !autoStartAttemptedRef.current
    ) {
      console.log('🚀 AutoStart ativado - iniciando stream...', {
        autoStart,
        hasStream: !!stream,
        isRequesting,
        status,
      });
      autoStartAttemptedRef.current = true;
      startStream().catch((error) => {
        console.error('Erro ao iniciar stream automaticamente:', error);
        setError('Erro ao iniciar câmera automaticamente');
        autoStartAttemptedRef.current = false; // Permitir tentar novamente em caso de erro
      });
    }
  }, [autoStart, stream, isRequesting, startStream, status]);

  // Iniciar countdown automaticamente quando o stream estiver disponível (autoStart ou regravação)
  useEffect(() => {
    if (
      (shouldStartCountdownAfterStream || autoStart) &&
      stream &&
      status === RecorderStatus.IDLE &&
      !isRequesting
    ) {
      console.log('⏱️ Stream disponível - iniciando countdown automático...', {
        shouldStartCountdownAfterStream,
        autoStart,
        hasStream: !!stream,
        status,
        isRequesting,
      });
      setActiveCountdown(5);
      setStatus(RecorderStatus.COUNTDOWN);
      setShouldStartCountdownAfterStream(false);
    }
  }, [
    shouldStartCountdownAfterStream,
    autoStart,
    stream,
    status,
    isRequesting,
    setStatus,
    setActiveCountdown,
  ]);

  const startCountdown = () => {
    if (!stream) return;
    setCountdownValue(5);
    setActiveCountdown(5);
    setStatus(RecorderStatus.COUNTDOWN);
  };

  const handleFinish = () => {
    if (recordedChunks.length > 0) {
      // Determinar o tipo MIME correto baseado no codec usado
      const blobType = mimeType?.includes('mp4')
        ? 'video/mp4'
        : mimeType || 'video/webm';

      const blob = new Blob(recordedChunks, { type: blobType });
      onRecordingComplete?.(blob);
      setStatus(RecorderStatus.COMPLETED);
      stopStream();
    }
  };

  const handleReRecord = async () => {
    if (!allowReRecord) return;

    // Resetar estado do vídeo
    setVideoPlayerState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });

    // Limpar previewUrl primeiro para remover o vídeo de revisão da tela
    setPreviewUrl(null);

    // Limpar dados da gravação anterior
    setRecordedChunks([]);
    setElapsedTime(0);
    setError(null);

    // Resetar status primeiro
    setStatus(RecorderStatus.IDLE);

    // Limpar o stream anterior completamente
    stopStream();

    // Resetar countdown
    setCountdownValue(5);
    setActiveCountdown(5);

    // Aguardar um pouco para garantir que o DOM foi atualizado antes de solicitar novo stream
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      // Marcar que devemos iniciar o countdown quando o stream estiver disponível
      setShouldStartCountdownAfterStream(true);
      await startStream();
    } catch {
      // Se falhar, manter em idle e cancelar o flag
      setShouldStartCountdownAfterStream(false);
    }
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Calcular progresso baseado no status
  const progressPercentage =
    status === RecorderStatus.REVIEWING || status === RecorderStatus.COMPLETED
      ? videoDuration > 0
        ? (videoCurrentTime / videoDuration) * 100
        : 0
      : (elapsedTime / maxDurationSeconds) * 100;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoDuration > 0 && videoPlayerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = Math.max(
        0,
        Math.min(videoDuration, percentage * videoDuration)
      );
      videoPlayerRef.current.setCurrentTime(newTime);
    }
  };

  const controlColorsStyle = getControlColorsStyle(colors);

  return (
    <div
      className={`relative w-full h-full bg-transparent flex flex-col ${
        isFullscreen &&
        (status === RecorderStatus.REVIEWING ||
          status === RecorderStatus.COMPLETED)
          ? 'p-0'
          : 'p-2 sm:p-4 md:p-6 lg:p-8'
      }`}
      style={colors ? controlColorsStyle : undefined}
    >
      {/* Video Canvas Container */}
      <div
        className={`relative flex-1 overflow-hidden bg-transparent ${
          isFullscreen &&
          (status === RecorderStatus.REVIEWING ||
            status === RecorderStatus.COMPLETED)
            ? 'rounded-none'
            : 'rounded-lg sm:rounded-xl md:rounded-2xl'
        }`}
      >
        <VideoStyles />

        {/* Vídeo de preview (stream ao vivo) usando VideoPlayer */}
        {status !== RecorderStatus.REVIEWING &&
          status !== RecorderStatus.COMPLETED &&
          stream && (
            <VideoPlayer
              srcObject={stream}
              jobType={jobType}
              hideControls={true}
              className="transform scale-x-[-1]"
              autoPlay={true}
              muted={true}
              colors={colors}
            />
          )}

        {/* Vídeo de revisão usando VideoPlayer */}
        {previewUrl &&
          (status === RecorderStatus.REVIEWING ||
            status === RecorderStatus.COMPLETED) && (
            <div className="absolute inset-0">
              <VideoPlayer
                ref={videoPlayerRef}
                src={previewUrl}
                jobType={jobType}
                hideControls={true}
                onStateChange={setVideoPlayerState}
                colors={colors}
                bigPlayButtonRightButton={
                  status === RecorderStatus.REVIEWING &&
                  !isPreviewPlaying &&
                  allowReRecord &&
                  !isFullscreen ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReRecord();
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 bg-wkp-primary-lighter/70"
                    >
                      <Icons.ReRecord className="w-10 h-10 text-wkp-primary-dark fill-wkp-primary-dark" />
                    </button>
                  ) : undefined
                }
                customFullscreenControlBar={
                  isFullscreen &&
                  (status === RecorderStatus.REVIEWING ||
                    status === RecorderStatus.COMPLETED) ? (
                    <FullscreenControlBar
                      theme={theme}
                      isPlaying={isPreviewPlaying}
                      isMuted={isMuted}
                      volume={volume}
                      currentTime={videoCurrentTime}
                      duration={videoDuration}
                      progressPercentage={
                        videoDuration > 0
                          ? (videoCurrentTime / videoDuration) * 100
                          : 0
                      }
                      playbackRate={playbackRate}
                      isFullscreen={isFullscreen}
                      onTogglePlay={toggleReviewPlay}
                      onToggleMute={handleToggleMute}
                      onVolumeChange={handleVolumeChange}
                      onProgressClick={handleProgressClick}
                      onPlaybackRateChange={handlePlaybackRate}
                      onToggleFullscreen={toggleFullscreen}
                      showReRecordButton={
                        status === RecorderStatus.REVIEWING && allowReRecord
                      }
                      onReRecord={
                        status === RecorderStatus.REVIEWING && allowReRecord
                          ? handleReRecord
                          : undefined
                      }
                    />
                  ) : undefined
                }
              />
            </div>
          )}

        {/* Countdown Overlay */}
        {status === RecorderStatus.COUNTDOWN && (
          <CountdownOverlay countdownValue={activeCountdown} />
        )}

        {/* Loading Overlay - Processando chunks do vídeo */}
        {isProcessingChunks && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
            <LogoAnimation className="h-12 w-12 text-white mb-4" />
            <p className="text-lg font-medium">Aguarde um instante!</p>
            <p className="text-sm text-white/80 mt-1">
              Seu vídeo está sendo gerado.
            </p>
          </div>
        )}

        {/* Initial Overlay if not streaming */}
        {!stream && status === RecorderStatus.IDLE && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white p-6 text-center">
            <button
              onClick={startStream}
              className="px-8 py-3 bg-white text-black rounded-full font-bold shadow-xl hover:bg-slate-50 transition-all transform hover:scale-105 cursor-pointer"
            >
              Ativar Câmera
            </button>
          </div>
        )}

        {/* Status UI (Requesting / Error) */}
        {status === RecorderStatus.REQUESTING && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 text-white text-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="font-medium">Solicitando permissão...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 text-white text-center p-6">
            <Icons.Mute className="w-16 h-16 text-rose-500 mb-4" />
            <p className="max-w-xs mb-6">{error}</p>
            <button
              onClick={startStream}
              className="px-6 py-2 bg-indigo-600 rounded-full font-bold"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>

      {/* Botão "Iniciar a gravação" quando câmera está habilitada (IDLE com stream) */}
      {status === RecorderStatus.IDLE && stream && (
        <div className="mt-6 flex justify-center">
          <Button onClick={startCountdown} variant="secondary">
            Iniciar a gravação
          </Button>
        </div>
      )}

      {/* Control Bar - Oculto durante ativação da câmera, countdown, quando IDLE com stream, e em fullscreen */}
      {status !== RecorderStatus.REQUESTING &&
        status !== RecorderStatus.COUNTDOWN &&
        stream &&
        status !== RecorderStatus.IDLE &&
        !(
          isFullscreen &&
          (status === RecorderStatus.REVIEWING ||
            status === RecorderStatus.COMPLETED)
        ) && (
          <ControlBar
            theme={theme}
            leftContent={
              <>
                {/* Recording: Regravar + StatusIcon + TimeDisplay */}
                {status === RecorderStatus.RECORDING && (
                  <>
                    {allowReRecord && (
                      <ReRecordButton onClick={handleReRecord} />
                    )}
                    <StatusIcon status={status} />
                    <TimeDisplay
                      currentTime={elapsedTime}
                      duration={maxDurationSeconds}
                    />
                  </>
                )}

                {/* Reviewing: Regravar (primeiro) + PlayButton + TimeDisplay */}
                {status === RecorderStatus.REVIEWING && (
                  <>
                    {allowReRecord && (
                      <ReRecordButton onClick={handleReRecord} />
                    )}
                    <PlayButton
                      isPlaying={isPreviewPlaying}
                      onClick={toggleReviewPlay}
                    />
                    <TimeDisplay
                      currentTime={videoCurrentTime}
                      duration={videoDuration}
                    />
                  </>
                )}

                {/* Completed: StatusIcon + TimeDisplay */}
                {status === RecorderStatus.COMPLETED && (
                  <>
                    <StatusIcon status={status} />
                    <TimeDisplay
                      currentTime={videoCurrentTime}
                      duration={videoDuration}
                    />
                  </>
                )}
              </>
            }
            centerContent={
              <ProgressBar
                progressPercentage={progressPercentage}
                theme={theme}
                onClick={
                  status === RecorderStatus.REVIEWING ||
                  status === RecorderStatus.COMPLETED
                    ? handleProgressClick
                    : undefined
                }
              />
            }
            rightContent={
              <>
                {/* Recording: Concluir */}
                {status === RecorderStatus.RECORDING && (
                  <StopButton onClick={stopRecording} />
                )}

                {/* Reviewing: SpeedSelector + FullscreenButton */}
                {status === RecorderStatus.REVIEWING && (
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
                )}

                {/* Completed: Mensagem de enviado */}
                {status === RecorderStatus.COMPLETED && (
                  <span className="text-emerald-600 font-bold text-sm">
                    ✓ Enviado
                  </span>
                )}
              </>
            }
          />
        )}
    </div>
  );
};

export default VideoRecorder;
