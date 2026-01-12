import { useState, useRef, useCallback, useEffect } from 'react';
import { RecorderStatus } from '../../types';
import { isMediaRecorderSupported, isIOS } from '../helpers/device-detection';

export interface UseMediaRecorderProps {
  stream: MediaStream | null;
  mimeType: string | null;
  maxDurationSeconds: number;
  onRecordingComplete: () => void;
}

export interface UseMediaRecorderReturn {
  status: RecorderStatus;
  elapsedTime: number;
  recordedChunks: Blob[];
  previewUrl: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  setStatus: (status: RecorderStatus) => void;
  setPreviewUrl: (url: string | null) => void;
  setRecordedChunks: (chunks: Blob[]) => void;
  setElapsedTime: (time: number) => void;
}

/**
 * Hook para gerenciar a gravação de vídeo com MediaRecorder
 */
export const useMediaRecorder = ({
  stream,
  mimeType,
  maxDurationSeconds,
  onRecordingComplete,
}: UseMediaRecorderProps): UseMediaRecorderReturn => {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const startRecording = useCallback(() => {
    if (!stream) return;

    if (!isMediaRecorderSupported) {
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
            onRecordingComplete();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error starting MediaRecorder:', err);
      setStatus('idle');
    }
  }, [stream, mimeType, maxDurationSeconds, onRecordingComplete]);

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
    setStatus('reviewing');
  }, []);

  // Criar preview URL quando entrar em reviewing
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

  return {
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
  };
};
