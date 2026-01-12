import React, { useState, useEffect } from 'react';
import { VideoRecorderProps, RecorderStatus } from '../../types';
import Icons from './icons';
import { useCameraStream } from '../hooks/use-camera-stream';
import { useMediaRecorder } from '../hooks/use-media-recorder';
import { useCountdown } from '../hooks/use-countdown';
import { useVideoReview } from '../hooks/use-video-review';
import { useVideoProgress } from '../hooks/use-video-progress';
import { getTheme } from '../helpers/theme';
import { getSupportedMimeType } from '../helpers/codec-detection';
import { isMediaRecorderSupported, isIOS } from '../helpers/device-detection';
import { formatTime } from '../helpers/time';
import { ProgressBar, PlayButton, VideoStyles, BigPlayButton } from './shared';
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
    videoPreviewRef,
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
    isActive: status === 'countdown',
    initialValue: 5,
    onComplete: startRecording,
  });

  const {
    videoReviewRef,
    isPlaying: isPreviewPlaying,
    currentTime: videoCurrentTime,
    duration: videoDuration,
    togglePlay: toggleReviewPlay,
    reset: resetReview,
  } = useVideoReview({
    previewUrl,
    isActive: status === 'reviewing' || status === 'completed',
  });

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
      setStatus('requesting');
    } else if (status === 'requesting' && !isRequesting && stream) {
      setStatus('idle');
    }
  }, [isRequesting, stream, status, setStatus]);

  // Garantir que o stream seja atribuído ao elemento de vídeo quando disponível
  useEffect(() => {
    if (stream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
      videoPreviewRef.current.play().catch((error) => {
        console.error('Error playing video preview:', error);
      });
    }
  }, [stream, videoPreviewRef]);

  // Iniciar countdown automaticamente quando o stream estiver disponível após regravação
  useEffect(() => {
    if (shouldStartCountdownAfterStream && stream && status === 'idle') {
      setActiveCountdown(5);
      setStatus('countdown');
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
    setStatus('countdown');
  };

  const handleFinish = () => {
    if (recordedChunks.length > 0) {
      // Determinar o tipo MIME correto baseado no codec usado
      const blobType = mimeType?.includes('mp4')
        ? 'video/mp4'
        : mimeType || 'video/webm';

      const blob = new Blob(recordedChunks, { type: blobType });
      onRecordingComplete?.(blob);
      setStatus('completed');
      stopStream();
    }
  };

  const handleReRecord = async () => {
    if (!allowReRecord) return;

    // Resetar review
    resetReview();

    // Limpar previewUrl primeiro para remover o vídeo de revisão da tela
    setPreviewUrl(null);

    // Limpar dados da gravação anterior
    setRecordedChunks([]);
    setElapsedTime(0);
    setError(null);

    // Resetar status primeiro
    setStatus('idle');

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
    status === 'reviewing' || status === 'completed'
      ? videoDuration > 0
        ? (videoCurrentTime / videoDuration) * 100
        : 0
      : (elapsedTime / maxDurationSeconds) * 100;

  const { handleProgressClick } = useVideoProgress({
    videoRef: videoReviewRef,
    duration: videoDuration,
    currentTime: videoCurrentTime,
    setCurrentTime: () => {}, // Não usado no review
  });

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col p-4 md:p-8">
      {/* Video Canvas Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg bg-black">
        <VideoStyles />

        {/* Vídeo de preview (stream ao vivo) - apenas durante gravação */}
        {status !== 'reviewing' && status !== 'completed' && (
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            loop={false}
            className="w-full h-full object-cover transform scale-x-[-1]"
            style={{ display: stream ? 'block' : 'none' }}
          />
        )}

        {/* Vídeo de revisão */}
        {previewUrl && (status === 'reviewing' || status === 'completed') && (
          <div className="relative w-full h-full">
            <video
              ref={videoReviewRef}
              key={previewUrl}
              src={previewUrl}
              playsInline
              loop={false}
              autoPlay={false}
              preload="metadata"
              className="w-full h-full object-contain"
              style={{ pointerEvents: 'auto' }}
            />
            {!isPreviewPlaying && <BigPlayButton onClick={toggleReviewPlay} />}
          </div>
        )}

        {/* Countdown Overlay */}
        {status === 'countdown' && (
          <CountdownOverlay countdownValue={activeCountdown} />
        )}

        {/* Initial Overlay if not streaming */}
        {!stream && status === 'idle' && (
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
        {status === 'requesting' && (
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
      <div className="mt-6 flex justify-center">
        <div
          className={`w-full max-w-4xl h-[44px] rounded-full ${theme.barBg} flex items-center px-6 shadow-sm border border-slate-200/50`}
        >
          {/* Left Side: Time, Status Icon, and Regravar button */}
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 ${
                status === 'recording'
                  ? 'bg-rose-600 animate-pulse'
                  : 'bg-slate-300'
              }`}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-slate-700 font-medium whitespace-nowrap tabular-nums">
              {status === 'reviewing' || status === 'completed'
                ? `${formatTime(Math.floor(videoCurrentTime))} de ${formatTime(Math.floor(videoDuration))}`
                : `${formatTime(elapsedTime)} de ${formatTime(maxDurationSeconds)}`}
            </span>
            {/* Botão Regravar ao lado do timer quando ativo */}
            {allowReRecord && status === 'reviewing' && (
              <button
                onClick={handleReRecord}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors flex-shrink-0"
                aria-label="Regravar vídeo"
              >
                <Icons.ReRecord className="w-[18px] h-[18px] text-[#007AD3]" />
                <span>Regravar</span>
              </button>
            )}
          </div>

          {/* Center: Progress Scrubber */}
          <ProgressBar
            progressPercentage={progressPercentage}
            theme={theme}
            onClick={
              status === 'reviewing' || status === 'completed'
                ? handleProgressClick
                : undefined
            }
          />

          {/* Right Side: Action Buttons */}
          <div className="flex items-center ml-4 flex-shrink-0">
            {status === 'idle' && stream && (
              <button
                onClick={startCountdown}
                className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-colors font-semibold"
              >
                <Icons.Play className="w-5 h-5" />
                <span>Gravar</span>
              </button>
            )}

            {status === 'recording' && (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
              >
                <Icons.StopSquare className="w-6 h-6" />
                <span>Concluir</span>
              </button>
            )}

            {status === 'reviewing' && (
              <div className="flex items-center space-x-4">
                <PlayButton
                  isPlaying={isPreviewPlaying}
                  onClick={toggleReviewPlay}
                />
                {/* Botão Concluir */}
                <button
                  onClick={handleFinish}
                  className="flex items-center space-x-2 px-4 py-1.5 bg-[#E6F0E9] text-[#007AD3] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                  aria-label="Concluir gravação"
                >
                  <Icons.Checkbox className="w-[18px] h-[18px] text-[#007AD3]" />
                  <span>Concluir</span>
                </button>
              </div>
            )}

            {status === 'completed' && (
              <span className="text-emerald-600 font-bold text-sm">
                ✓ Enviado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;
