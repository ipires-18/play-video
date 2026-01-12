import { useState, useRef, useCallback } from 'react';
import { isIOS } from '../helpers/device-detection';

export interface UseCameraStreamReturn {
  stream: MediaStream | null;
  error: string | null;
  isRequesting: boolean;
  startStream: () => Promise<void>;
  stopStream: () => void;
  videoPreviewRef: React.RefObject<HTMLVideoElement>;
}

/**
 * Enum para tipos de erro do MediaStream API
 */
export enum MediaStreamErrorType {
  NOT_ALLOWED = 'NotAllowedError',
  PERMISSION_DENIED = 'PermissionDeniedError',
  NOT_FOUND = 'NotFoundError',
  DEVICES_NOT_FOUND = 'DevicesNotFoundError',
  NOT_READABLE = 'NotReadableError',
  TRACK_START = 'TrackStartError',
  OVER_CONSTRAINED = 'OverconstrainedError',
  CONSTRAINT_NOT_SATISFIED = 'ConstraintNotSatisfiedError',
  NOT_SUPPORTED = 'NotSupportedError',
}

// Constantes
const REQUEST_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 500;
const MAX_RETRY_ATTEMPTS = 3;

const BASIC_AUDIO_CONSTRAINTS = true;
const ENHANCED_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const VIDEO_CONSTRAINTS = {
  MINIMAL: { facingMode: 'user' as const },
  LOW_RESOLUTION: {
    facingMode: 'user' as const,
    width: { ideal: 640 },
    height: { ideal: 480 },
  },
  STANDARD: {
    facingMode: 'user' as const,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
} as const;

// Mensagens de erro
const ERROR_MESSAGES = {
  NOT_AVAILABLE:
    'Acesso à câmera não está disponível neste navegador. Use HTTPS ou localhost.',
  TIMEOUT:
    'Tempo limite excedido ao solicitar permissão. Verifique as configurações do navegador.',
  PERMISSION_DENIED:
    'Permissão negada. Por favor, permita o acesso à câmera e microfone nas configurações do navegador e clique em "Tentar Novamente".',
  DEVICES_NOT_FOUND:
    'Câmera ou microfone não encontrados. Verifique se os dispositivos estão conectados.',
  DEVICE_IN_USE:
    'Câmera ou microfone estão sendo usados por outro aplicativo. Feche outros aplicativos e tente novamente.',
  CONSTRAINT_ERROR:
    'Não foi possível encontrar configurações de câmera compatíveis. Verifique se a câmera está funcionando e tente novamente.',
  NOT_SUPPORTED:
    'Gravação de vídeo não é suportada neste navegador. Use Safari 14.3+ no iOS ou um navegador moderno.',
  GENERIC: 'Não foi possível acessar a câmera ou microfone.',
} as const;

/**
 * Hook para gerenciar o stream da câmera
 */
export const useCameraStream = (): UseCameraStreamReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const requestTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

  const clearRequestTimeout = useCallback(() => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
  }, []);

  const checkMediaDevicesSupport = useCallback((): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  const setupRequestTimeout = useCallback((onTimeout: () => void) => {
    requestTimeoutRef.current = window.setTimeout(
      onTimeout,
      REQUEST_TIMEOUT_MS
    );
  }, []);

  const getVideoConstraints = useCallback(
    (retryCount: number): MediaTrackConstraints => {
      if (retryCount >= 2) {
        return VIDEO_CONSTRAINTS.MINIMAL;
      }
      if (retryCount >= 1 || isIOS) {
        return VIDEO_CONSTRAINTS.LOW_RESOLUTION;
      }
      return VIDEO_CONSTRAINTS.STANDARD;
    },
    []
  );

  const getAudioConstraints = useCallback(
    (retryCount: number): boolean | MediaTrackConstraints => {
      return retryCount >= 2
        ? BASIC_AUDIO_CONSTRAINTS
        : ENHANCED_AUDIO_CONSTRAINTS;
    },
    []
  );

  const playVideoPreview = useCallback(async (mediaStream: MediaStream) => {
    if (!videoPreviewRef.current) return;

    videoPreviewRef.current.srcObject = mediaStream;
    try {
      await videoPreviewRef.current.play();
    } catch (playError) {
      console.error('Auto-play prevented:', playError);
    }
  }, []);

  const getErrorMessage = useCallback(
    (error: any): { message: string; shouldRetry: boolean } => {
      const errorName = error?.name as MediaStreamErrorType | undefined;

      if (
        errorName === MediaStreamErrorType.NOT_ALLOWED ||
        errorName === MediaStreamErrorType.PERMISSION_DENIED
      ) {
        return {
          message: ERROR_MESSAGES.PERMISSION_DENIED,
          shouldRetry: false,
        };
      }

      if (
        errorName === MediaStreamErrorType.NOT_FOUND ||
        errorName === MediaStreamErrorType.DEVICES_NOT_FOUND
      ) {
        return {
          message: ERROR_MESSAGES.DEVICES_NOT_FOUND,
          shouldRetry: false,
        };
      }

      if (
        errorName === MediaStreamErrorType.NOT_READABLE ||
        errorName === MediaStreamErrorType.TRACK_START
      ) {
        return {
          message: ERROR_MESSAGES.DEVICE_IN_USE,
          shouldRetry: false,
        };
      }

      if (
        errorName === MediaStreamErrorType.OVER_CONSTRAINED ||
        errorName === MediaStreamErrorType.CONSTRAINT_NOT_SATISFIED
      ) {
        retryCountRef.current += 1;
        if (retryCountRef.current <= MAX_RETRY_ATTEMPTS) {
          return {
            message: `Ajustando configurações de câmera (tentativa ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS})...`,
            shouldRetry: true,
          };
        }
        return {
          message: ERROR_MESSAGES.CONSTRAINT_ERROR,
          shouldRetry: false,
        };
      }

      if (errorName === MediaStreamErrorType.NOT_SUPPORTED) {
        return {
          message: ERROR_MESSAGES.NOT_SUPPORTED,
          shouldRetry: false,
        };
      }

      return {
        message: ERROR_MESSAGES.GENERIC,
        shouldRetry: false,
      };
    },
    []
  );

  const handleStreamSuccess = useCallback(
    async (mediaStream: MediaStream) => {
      clearRequestTimeout();
      setStream(mediaStream);
      retryCountRef.current = 0;
      await playVideoPreview(mediaStream);
      setIsRequesting(false);
    },
    [clearRequestTimeout, playVideoPreview]
  );

  const handleStreamError = useCallback(
    (error: any, retryCallback: () => void) => {
      clearRequestTimeout();
      console.error('Error accessing camera/mic:', error);

      const { message, shouldRetry } = getErrorMessage(error);
      setError(message);
      setIsRequesting(false);

      if (shouldRetry && retryCountRef.current === 1) {
        setTimeout(retryCallback, RETRY_DELAY_MS);
      }
    },
    [clearRequestTimeout, getErrorMessage]
  );

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.pause();
    }
  }, [stream]);

  const startStream = useCallback(async () => {
    clearRequestTimeout();
    setIsRequesting(true);
    setError(null);

    if (!checkMediaDevicesSupport()) {
      setError(ERROR_MESSAGES.NOT_AVAILABLE);
      setIsRequesting(false);
      return;
    }

    setupRequestTimeout(() => {
      setError(ERROR_MESSAGES.TIMEOUT);
      setIsRequesting(false);
      retryCountRef.current = 0;
    });

    try {
      const videoConstraints = getVideoConstraints(retryCountRef.current);
      const audioConstraints = getAudioConstraints(retryCountRef.current);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      });

      await handleStreamSuccess(mediaStream);
    } catch (err: any) {
      handleStreamError(err, startStream);
    }
  }, [
    clearRequestTimeout,
    checkMediaDevicesSupport,
    setupRequestTimeout,
    getVideoConstraints,
    getAudioConstraints,
    handleStreamSuccess,
    handleStreamError,
  ]);

  return {
    stream,
    error,
    isRequesting,
    startStream,
    stopStream,
    videoPreviewRef,
  };
};
