import React, { useState, useEffect } from 'react';
import { VideoRecorderProps, RecorderStatus } from '../../types';
import Icons from './icons';
import VideoPlayer from './video-player';
import type { VideoPlayerRef } from './video-player';
import { useCameraStream } from '../hooks/use-camera-stream';
import { useMediaRecorder } from '../hooks/use-media-recorder';
import { useCountdown } from '../hooks/use-countdown';
import { useVideoProgress } from '../hooks/use-video-progress';
import { getTheme } from '../helpers/theme';
import { getSupportedMimeType } from '../helpers/codec-detection';
import { isMediaRecorderSupported, isIOS } from '../helpers/device-detection';
import { formatTime } from '../helpers/time';
import { ProgressBar, PlayButton, VideoStyles, ControlBar } from './shared';
import { CountdownOverlay } from './shared/countdown-overlay';

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  jobType,
  maxDurationSeconds = 180,
  allowReRecord = true,
  onRecordingComplete,
}) => {
  const theme = getTheme(jobType);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdownValue, setCountdownValue] = useState(5);
  const [shouldStartCountdownAfterStream, setShouldStartCountdownAfterStream] =
    useState(false);

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

  // Iniciar countdown automaticamente quando o stream estiver disponível após regravação
  useEffect(() => {
    if (
      shouldStartCountdownAfterStream &&
      stream &&
      status === RecorderStatus.IDLE
    ) {
      setActiveCountdown(5);
      setStatus(RecorderStatus.COUNTDOWN);
      setShouldStartCountdownAfterStream(false);
    }
  }, [
    shouldStartCountdownAfterStream,
    stream,
    status,
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

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col p-4 md:p-8">
      {/* Video Canvas Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg bg-transparent">
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
              />
            </div>
          )}

        {/* Countdown Overlay */}
        {status === RecorderStatus.COUNTDOWN && (
          <CountdownOverlay countdownValue={activeCountdown} />
        )}

        {/* Initial Overlay if not streaming */}
        {!stream && status === RecorderStatus.IDLE && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white p-6 text-center">
            <button
              onClick={startStream}
              className="px-8 py-3 bg-white text-black rounded-full font-bold shadow-xl hover:bg-slate-50 transition-all transform hover:scale-105"
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

      {/* Themed Control Bar */}
      <ControlBar
        theme={theme}
        leftContent={
          <>
            <div
              className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 ${
                status === RecorderStatus.RECORDING
                  ? 'bg-rose-600 animate-pulse'
                  : 'bg-slate-300'
              }`}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>

            {status === RecorderStatus.REVIEWING && (
              <PlayButton
                isPlaying={isPreviewPlaying}
                onClick={toggleReviewPlay}
              />
            )}

            <span className="text-slate-700 font-medium whitespace-nowrap tabular-nums">
              {status === RecorderStatus.REVIEWING ||
              status === RecorderStatus.COMPLETED
                ? `${formatTime(Math.floor(videoCurrentTime))} de ${formatTime(Math.floor(videoDuration))}`
                : `${formatTime(elapsedTime)} de ${formatTime(maxDurationSeconds)}`}
            </span>

            {allowReRecord && status === RecorderStatus.REVIEWING && (
              <button
                onClick={handleReRecord}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors flex-shrink-0"
                aria-label="Regravar vídeo"
              >
                <Icons.ReRecord className="w-[18px] h-[18px] text-[#007AD3]" />
                <span>Regravar</span>
              </button>
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
            {status === RecorderStatus.IDLE && stream && (
              <button
                onClick={startCountdown}
                className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-colors font-semibold"
              >
                <Icons.Play className="w-5 h-5" />
                <span>Gravar</span>
              </button>
            )}

            {status === RecorderStatus.RECORDING && (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
              >
                <Icons.StopSquare className="w-6 h-6" />
                <span>Concluir</span>
              </button>
            )}

            {status === RecorderStatus.REVIEWING && (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-2 px-4 py-1.5 bg-[#E6F0E9] text-[#007AD3] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                aria-label="Concluir gravação"
              >
                <Icons.Checkbox className="w-[18px] h-[18px] text-[#007AD3]" />
                <span>Concluir</span>
              </button>
            )}

            {status === RecorderStatus.COMPLETED && (
              <span className="text-emerald-600 font-bold text-sm">
                ✓ Enviado
              </span>
            )}
          </>
        }
      />
    </div>
  );
};

export default VideoRecorder;
