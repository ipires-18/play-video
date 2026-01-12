import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoRecorderProps, RecorderStatus } from '../types';
import Icons from './Icons';

// Detectar se é iOS/Safari/Mac
// Usa maxTouchPoints para detectar iPad (não usa navigator.platform que está deprecated)
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

// Detectar suporte do MediaRecorder
const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined';

// Detectar codecs suportados (priorizando H.264 para Safari/iOS/Mac)
const getSupportedMimeType = (): string | null => {
  if (!isMediaRecorderSupported) return null;

  // Priorizar H.264 para Safari/iOS/Mac (codec nativo do sistema)
  const h264Types = [
    'video/mp4;codecs=avc1.42E01E', // H.264 Baseline Profile
    'video/mp4;codecs=avc1.4D001E', // H.264 Main Profile
    'video/mp4;codecs=avc1.64001E', // H.264 High Profile
    'video/mp4;codecs=h264',
    'video/mp4;codecs=H264',
  ];

  // Codecs padrão para outros navegadores
  const standardTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  // Para iOS/Safari/Mac, priorizar H.264 (MP4)
  // Para outros navegadores, usar WebM
  const typesToTry =
    isSafari || isIOS || isMac
      ? [...h264Types, ...standardTypes]
      : standardTypes;

  for (const type of typesToTry) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('Codec selecionado:', type);
      return type;
    }
  }

  // Fallback: deixar o navegador escolher
  console.warn('Nenhum codec específico suportado, usando padrão do navegador');
  return null;
};

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  jobType,
  maxDurationSeconds = 180, // Default to 3 minutes as in the screenshot
  allowReRecord = true,
  onRecordingComplete,
}) => {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdownValue, setCountdownValue] = useState(5);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoReviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const requestTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

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

  // Themes mapping
  const isCompany = jobType === 'company';
  const theme = {
    barBg: 'bg-[#e9f2ee]', // Light greenish background from screenshot
    textPrimary: 'text-[#4a5568]',
    progressBg: 'bg-[#d1d5db]',
    progressFill: isCompany ? 'bg-indigo-600' : 'bg-slate-400',
    dot: 'bg-[#10b981]', // Green dot from screenshot
  };

  const startStream = async () => {
    // Limpar timeout anterior se existir
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }

    setStatus('requesting');
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        'Acesso à câmera não está disponível neste navegador. Use HTTPS ou localhost.'
      );
      setStatus('idle');
      return;
    }

    // Timeout de segurança para evitar loops infinitos (10 segundos)
    requestTimeoutRef.current = window.setTimeout(() => {
      setError(
        'Tempo limite excedido ao solicitar permissão. Verifique as configurações do navegador.'
      );
      setStatus('idle');
      retryCountRef.current = 0;
    }, 10000);

    try {
      // Constraints otimizadas para iOS/Safari
      // Progressivamente mais simples conforme as tentativas
      let videoConstraints: MediaTrackConstraints;

      if (retryCountRef.current >= 2) {
        // Tentativa 3+: apenas facingMode, sem especificar resolução
        videoConstraints = { facingMode: 'user' };
      } else if (retryCountRef.current >= 1 || isIOS) {
        // Tentativa 2 ou iOS: constraints simples com resolução baixa
        videoConstraints = {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        };
      } else {
        // Tentativa 1: constraints normais
        videoConstraints = {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };
      }

      // Audio constraints também podem ser simplificados em caso de erro
      const audioConstraints =
        retryCountRef.current >= 2
          ? true // Apenas áudio básico
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      });

      // Limpar timeout pois teve sucesso
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      setStream(mediaStream);
      retryCountRef.current = 0; // Reset contador de tentativas

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        // Garantir que o vídeo toque no iOS
        try {
          await videoPreviewRef.current.play();
        } catch (playError) {
          console.warn('Auto-play prevented:', playError);
        }
      }

      setStatus('idle');
    } catch (err: any) {
      // Limpar timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      console.error('Error accessing camera/mic:', err);

      let errorMessage = 'Não foi possível acessar a câmera ou microfone.';
      let shouldRetry = false;

      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        errorMessage =
          'Permissão negada. Por favor, permita o acesso à câmera e microfone nas configurações do navegador e clique em "Tentar Novamente".';
        retryCountRef.current = 0; // Reset ao negar permissão
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        errorMessage =
          'Câmera ou microfone não encontrados. Verifique se os dispositivos estão conectados.';
        retryCountRef.current = 0;
      } else if (
        err.name === 'NotReadableError' ||
        err.name === 'TrackStartError'
      ) {
        errorMessage =
          'Câmera ou microfone estão sendo usados por outro aplicativo. Feche outros aplicativos e tente novamente.';
        retryCountRef.current = 0;
      } else if (
        err.name === 'OverconstrainedError' ||
        err.name === 'ConstraintNotSatisfiedError'
      ) {
        retryCountRef.current += 1;
        // Tentar até 3 vezes com constraints progressivamente mais simples
        if (retryCountRef.current <= 3) {
          errorMessage = `Ajustando configurações de câmera (tentativa ${retryCountRef.current}/3)...`;
          shouldRetry = true;
        } else {
          errorMessage =
            'Não foi possível encontrar configurações de câmera compatíveis. Verifique se a câmera está funcionando e tente novamente.';
          retryCountRef.current = 0;
        }
      } else if (err.name === 'NotSupportedError') {
        errorMessage =
          'Gravação de vídeo não é suportada neste navegador. Use Safari 14.3+ no iOS ou um navegador moderno.';
        retryCountRef.current = 0;
      }

      setError(errorMessage);
      setStatus('idle');

      // Retry apenas uma vez e apenas para OverconstrainedError
      if (shouldRetry && retryCountRef.current === 1) {
        setTimeout(() => {
          startStream();
        }, 500);
      }
    }
  };

  const startCountdown = () => {
    if (!stream) return;
    setStatus('countdown');
    setCountdownValue(5);
  };

  const startRecording = useCallback(() => {
    if (!stream) return;

    if (!isMediaRecorderSupported) {
      setError('MediaRecorder não é suportado neste navegador.');
      return;
    }

    setRecordedChunks([]);
    setElapsedTime(0);
    setPreviewUrl(null);

    // Usar o codec detectado ou deixar o navegador escolher
    const options: MediaRecorderOptions = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }

    try {
      const recorder = new MediaRecorder(stream, options);

      // Limpar chunks anteriores
      setRecordedChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks((prev) => {
            const newChunks = [...prev, event.data];
            return newChunks;
          });
        }
      };

      // Adicionar handler onstop para garantir que a gravação termine corretamente
      recorder.onstop = () => {
        console.log('MediaRecorder stopped');
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      // Adicionar handler de erro
      recorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setError('Erro durante a gravação. Tente novamente.');
        // Não chamar stopRecording aqui para evitar dependência circular
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== 'inactive'
        ) {
          mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setStatus('idle');
      };

      // Para iOS/Safari, usar timeslice maior pode ajudar
      const timeslice = isIOS ? 2000 : 1000;
      recorder.start(timeslice);
      mediaRecorderRef.current = recorder;
      setStatus('recording');

      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= maxDurationSeconds) {
            // Parar gravação quando atingir o tempo máximo
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state !== 'inactive'
            ) {
              mediaRecorderRef.current.stop();
            }
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            setStatus('reviewing');
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error starting MediaRecorder:', err);
      setError(
        `Erro ao iniciar gravação: ${err.message || 'Erro desconhecido'}`
      );
      setStatus('idle');
    }
  }, [stream, isMediaRecorderSupported, mimeType, maxDurationSeconds, isIOS]);

  useEffect(() => {
    let interval: number;
    if (status === 'countdown') {
      interval = window.setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, startRecording]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Parar completamente o stream ao entrar em reviewing
    if (videoPreviewRef.current) {
      videoPreviewRef.current.pause();
      videoPreviewRef.current.srcObject = null;
    }

    // Parar todas as tracks do stream para evitar piscar
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setStatus('reviewing');
  }, [stream]);

  useEffect(() => {
    if (status === 'reviewing' && recordedChunks.length > 0) {
      // Determinar o tipo MIME correto baseado no codec usado
      const blobType = mimeType?.includes('mp4')
        ? 'video/mp4'
        : mimeType || 'video/webm';

      const blob = new Blob(recordedChunks, { type: blobType });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Limpar URL anterior se existir
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [status, recordedChunks, mimeType]);

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

  const handleReRecord = () => {
    if (!allowReRecord) return;

    // Parar o vídeo de revisão primeiro
    if (videoReviewRef.current) {
      videoReviewRef.current.pause();
      videoReviewRef.current.src = '';
      videoReviewRef.current.load();
    }

    // Limpar previewUrl primeiro para remover o vídeo de revisão da tela
    setPreviewUrl(null);

    // Limpar dados da gravação anterior
    setRecordedChunks([]);
    setElapsedTime(0);
    setError(null);
    setIsPreviewPlaying(false);
    setVideoCurrentTime(0);
    setVideoDuration(0);

    // Limpar o stream anterior completamente
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Limpar o vídeo de preview também
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.pause();
    }

    // Resetar countdown e iniciar stream, depois iniciar countdown automaticamente
    setCountdownValue(5);
    setStatus('idle');

    // Aguardar um pouco para garantir que o DOM foi atualizado antes de solicitar novo stream
    setTimeout(async () => {
      try {
        await startStream();
        // Após o stream iniciar com sucesso, começar o countdown automaticamente
        setStatus('countdown');
      } catch {
        // Se falhar, manter em idle (startStream já define o status como idle em caso de erro)
      }
    }, 150);
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col p-4 md:p-8">
      {/* Video Canvas Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg bg-black">
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

        {previewUrl && (status === 'reviewing' || status === 'completed') && (
          <div className="relative w-full h-full">
            <video
              ref={videoReviewRef}
              key={previewUrl} // Force re-render quando previewUrl mudar
              src={previewUrl}
              playsInline
              loop={false}
              autoPlay={false}
              preload="metadata"
              className="w-full h-full object-contain [&::-webkit-media-controls-play-button]:hidden [&::-webkit-media-controls]:display-none"
              style={{
                // Esconder controles nativos do vídeo
                pointerEvents: 'auto',
              }}
              onLoadedMetadata={(e) => {
                // Não tocar automaticamente - deixar o usuário controlar
                const video = e.currentTarget;
                video.currentTime = 0; // Começar do início
                video.pause(); // Garantir que está pausado
                setIsPreviewPlaying(false);
                setVideoDuration(video.duration || 0);
                setVideoCurrentTime(0);
              }}
              onTimeUpdate={(e) => {
                // Atualizar tempo atual do vídeo durante a reprodução
                const video = e.currentTarget;
                setVideoCurrentTime(video.currentTime);
              }}
              onPlay={() => {
                setIsPreviewPlaying(true);
              }}
              onPause={() => {
                setIsPreviewPlaying(false);
              }}
              onEnded={(e) => {
                // Quando o vídeo terminar, não fazer loop - apenas pausar
                const video = e.currentTarget;
                video.pause();
                setIsPreviewPlaying(false);
                video.currentTime = 0; // Voltar ao início
                setVideoCurrentTime(0);
              }}
            />
            {/* Botão de Play centralizado quando o vídeo está pausado */}
            {!isPreviewPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoReviewRef.current) {
                    videoReviewRef.current.play();
                  }
                }}
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
        )}

        {/* Countdown Overlay */}
        {status === 'countdown' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white">
            <h3 className="text-2xl font-medium mb-6">
              A gravação começará em:
            </h3>
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
              <span className="absolute text-4xl font-bold">
                {countdownValue}
              </span>
            </div>
          </div>
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
              className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 ${status === 'recording' ? 'bg-rose-600 animate-pulse' : 'bg-slate-300'}`}
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
          <div className="flex-1 px-8 relative flex items-center">
            <div className="w-full h-1 bg-slate-300 rounded-full relative overflow-hidden">
              <div
                className="h-full bg-slate-400/50"
                style={{
                  width: `${
                    status === 'reviewing' || status === 'completed'
                      ? videoDuration > 0
                        ? (videoCurrentTime / videoDuration) * 100
                        : 0
                      : (elapsedTime / maxDurationSeconds) * 100
                  }%`,
                }}
              />
            </div>
            {/* The Green Dot indicator from layout */}
            <div
              className={`absolute w-2 h-2 rounded-full ${theme.dot} shadow-sm transition-all duration-300`}
              style={{
                left: `${
                  status === 'reviewing' || status === 'completed'
                    ? videoDuration > 0 && videoCurrentTime > 0
                      ? `calc(8% + ${(videoCurrentTime / videoDuration) * 84}%)`
                      : '8%'
                    : elapsedTime > 0
                      ? `calc(8% + ${(elapsedTime / maxDurationSeconds) * 84}%)`
                      : '8%'
                }`,
              }}
            />
          </div>

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
                {/* Botão Play/Pause */}
                <button
                  onClick={() => {
                    if (videoReviewRef.current) {
                      if (videoReviewRef.current.paused) {
                        videoReviewRef.current.play();
                      } else {
                        videoReviewRef.current.pause();
                      }
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label={
                    isPreviewPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'
                  }
                >
                  {isPreviewPlaying ? (
                    <Icons.Pause className="w-5 h-5" />
                  ) : (
                    <Icons.Play className="w-5 h-5" />
                  )}
                </button>
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
