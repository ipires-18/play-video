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
  const [status, setStatus] = useState<RecorderStatus>(RecorderStatus.IDLE);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const previousPreviewUrlRef = useRef<string | null>(null);
  const stopRequestedRef = useRef<boolean>(false);
  const chunksAtStopRef = useRef<number>(0);
  const maxWaitTimeRef = useRef<number>(3000); // 3 segundos máximo de espera
  const previewCreatedRef = useRef<boolean>(false);
  const chunksSnapshotRef = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    if (!isMediaRecorderSupported) {
      return;
    }

    setRecordedChunks([]);
    setElapsedTime(0);
    stopRequestedRef.current = false;
    chunksAtStopRef.current = 0;
    previewCreatedRef.current = false;
    chunksSnapshotRef.current = [];
    // Limpar preview URL anterior se existir
    if (previousPreviewUrlRef.current) {
      URL.revokeObjectURL(previousPreviewUrlRef.current);
      previousPreviewUrlRef.current = null;
    }
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

        // Marcar que o stop foi chamado e aguardar processamento dos chunks
        stopRequestedRef.current = true;
        const stopTime = Date.now();
        let lastChunkCount = 0;
        let stableIterations = 0;

        const checkInterval = setInterval(() => {
          // Obter o estado atual dos chunks através de uma função de callback
          setRecordedChunks((currentChunks) => {
            const currentCount = currentChunks.length;
            const elapsed = Date.now() - stopTime;

            // Se o número de chunks mudou, resetar contador de estabilidade
            if (currentCount !== lastChunkCount) {
              lastChunkCount = currentCount;
              stableIterations = 0;
            } else {
              stableIterations++;
            }

            // Se o número de chunks está estável por 4 verificações (200ms), considerar completo
            if (stableIterations >= 4 && currentCount > 0) {
              clearInterval(checkInterval);
              stopRequestedRef.current = false;
              // Fazer snapshot dos chunks finais antes de mudar o status
              chunksSnapshotRef.current = [...currentChunks];
              setStatus(RecorderStatus.REVIEWING);
              onRecordingComplete();
              return currentChunks;
            }

            // Timeout máximo - se não processar em 3 segundos, mostrar erro
            if (elapsed > maxWaitTimeRef.current) {
              clearInterval(checkInterval);
              stopRequestedRef.current = false;
              // Fazer snapshot dos chunks disponíveis mesmo com timeout
              chunksSnapshotRef.current = [...currentChunks];
              if (currentCount === 0) {
                alert(
                  'Erro: Nenhum chunk de vídeo foi processado. A gravação falhou completamente.'
                );
              } else {
                alert(
                  'Erro: Nem todos os chunks de vídeo foram processados dentro do tempo limite. A gravação pode estar incompleta.'
                );
              }
              setStatus(RecorderStatus.REVIEWING);
              onRecordingComplete();
              return currentChunks;
            }

            return currentChunks;
          });
        }, 50);
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
        setStatus(RecorderStatus.IDLE);
      };

      // Para iOS/Safari, usar timeslice maior pode ajudar
      const timeslice = isIOS ? 2000 : 1000;
      recorder.start(timeslice);
      mediaRecorderRef.current = recorder;
      setStatus(RecorderStatus.RECORDING);

      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= maxDurationSeconds) {
            // Parar gravação quando atingir o tempo máximo
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state !== 'inactive'
            ) {
              // Forçar captura do último chunk antes de parar
              try {
                mediaRecorderRef.current.requestData();
              } catch (e) {
                // Alguns navegadores podem não suportar requestData
                console.log('requestData not supported or already called');
              }
              mediaRecorderRef.current.stop();
            }
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            // Não mudar status aqui - o onstop handler cuidará disso
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error starting MediaRecorder:', err);
      setStatus(RecorderStatus.IDLE);
    }
  }, [stream, mimeType, maxDurationSeconds, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      // Forçar captura do último chunk antes de parar
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {
        // Alguns navegadores podem não suportar requestData
        console.log('requestData not supported or already called');
      }
      // Parar a gravação - o status será mudado no onstop
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Não mudar o status aqui - aguardar o evento onstop
  }, []);

  // Criar preview URL quando entrar em reviewing (apenas uma vez)
  useEffect(() => {
    if (status === RecorderStatus.REVIEWING && !previewCreatedRef.current) {
      // Marcar que vamos criar o preview para evitar recriações
      previewCreatedRef.current = true;

      // Aguardar um pouco para garantir que o snapshot foi atualizado
      const timeoutId = setTimeout(() => {
        // Usar apenas o snapshot dos chunks finais capturados no momento do stop
        const chunksToUse = chunksSnapshotRef.current;

        // Limpar preview URL anterior se existir
        if (previousPreviewUrlRef.current) {
          URL.revokeObjectURL(previousPreviewUrlRef.current);
          previousPreviewUrlRef.current = null;
        }

        // Verificar se temos chunks válidos
        if (!chunksToUse || chunksToUse.length === 0) {
          alert(
            'Erro: Nenhum chunk de vídeo foi gravado. A gravação está vazia.'
          );
          return;
        }

        // Verificar tamanho total dos chunks
        const totalSize = chunksToUse.reduce(
          (sum, chunk) => sum + chunk.size,
          0
        );
        if (totalSize === 0) {
          alert(
            'Erro: O vídeo gravado está vazio (0 bytes). A gravação falhou.'
          );
          return;
        }

        // Determinar o tipo MIME correto baseado no codec usado
        const blobType = mimeType?.includes('mp4')
          ? 'video/mp4'
          : mimeType || 'video/webm';

        try {
          const blob = new Blob(chunksToUse, { type: blobType });

          // Verificar se o blob foi criado corretamente
          if (blob.size === 0) {
            alert(
              'Erro: O blob de vídeo está vazio. A gravação pode estar incompleta.'
            );
            return;
          }

          const url = URL.createObjectURL(blob);
          previousPreviewUrlRef.current = url;
          setPreviewUrl(url);
        } catch (error) {
          console.error('Erro ao criar blob:', error);
          alert(
            'Erro: Não foi possível criar o preview do vídeo. A gravação pode estar corrompida.'
          );
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [status, mimeType]); // Removido recordedChunks das dependências para evitar recriações

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
