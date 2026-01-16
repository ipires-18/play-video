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
  isProcessingChunks: boolean;
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
  const [isProcessingChunks, setIsProcessingChunks] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const previousPreviewUrlRef = useRef<string | null>(null);
  const stopRequestedRef = useRef<boolean>(false);
  const chunksAtStopRef = useRef<number>(0);
  const maxWaitTimeRef = useRef<number>(3000); // 3 segundos máximo de espera
  const previewCreatedRef = useRef<boolean>(false);
  const chunksSnapshotRef = useRef<Blob[]>([]);
  // Ref local para armazenar chunks durante a gravação (mais confiável que state)
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    if (!isMediaRecorderSupported) {
      return;
    }

    // Prevenir múltiplas inicializações - se já existe um recorder ativo, não iniciar outro
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      console.warn(
        '⚠️ MediaRecorder já está ativo, ignorando nova inicialização'
      );
      return;
    }

    setRecordedChunks([]);
    chunksRef.current = []; // Limpar ref local também
    setElapsedTime(0);
    setIsProcessingChunks(false); // Resetar loading
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
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        // IMPORTANTE: Capturar TODOS os chunks, mesmo os vazios podem ser importantes
        // Alguns navegadores enviam chunks vazios no final que precisam ser processados
        if (event.data) {
          // Armazenar no ref local primeiro (mais confiável)
          chunksRef.current.push(event.data);

          // Atualizar state também para sincronização
          setRecordedChunks((prev) => {
            const newChunks = [...prev, event.data];
            return newChunks;
          });

          const totalSize = chunksRef.current.reduce(
            (sum, c) => sum + c.size,
            0
          );
          console.log(
            `📦 Chunk recebido: ${event.data.size} bytes (total: ${chunksRef.current.length} chunks, ${totalSize} bytes)`
          );
        }
      };

      // Adicionar handler onstop para garantir que a gravação termine corretamente
      recorder.onstop = () => {
        console.log('MediaRecorder stopped');
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        // Ativar loading enquanto processa chunks
        setIsProcessingChunks(true);

        // Marcar que o stop foi chamado e aguardar processamento dos chunks
        stopRequestedRef.current = true;
        const stopTime = Date.now();
        let lastChunkCount = 0;
        let lastTotalSize = 0;
        let stableIterations = 0;
        // Aguardar um tempo mínimo antes de começar a verificar estabilidade
        // Isso garante que chunks que ainda estão sendo processados tenham tempo de chegar
        const minWaitTime = 500; // 500ms mínimo de espera

        const checkInterval = setInterval(() => {
          // Usar o ref local que é mais confiável e atualizado em tempo real
          const currentChunks = chunksRef.current;
          const currentCount = currentChunks.length;
          const currentTotalSize = currentChunks.reduce(
            (sum, chunk) => sum + chunk.size,
            0
          );
          const elapsed = Date.now() - stopTime;

          // Se ainda não passou o tempo mínimo, continuar aguardando
          if (elapsed < minWaitTime) {
            console.log(
              `⏳ Aguardando tempo mínimo... (${elapsed}ms / ${minWaitTime}ms)`
            );
            return;
          }

          // Se o número de chunks ou tamanho total mudou, resetar contador de estabilidade
          if (
            currentCount !== lastChunkCount ||
            currentTotalSize !== lastTotalSize
          ) {
            lastChunkCount = currentCount;
            lastTotalSize = currentTotalSize;
            stableIterations = 0;
            console.log(
              `⏳ Aguardando chunks finais... (${currentCount} chunks, ${currentTotalSize} bytes)`
            );
          } else {
            stableIterations++;
          }

          // Se o número de chunks e tamanho estão estáveis por 20 verificações (1000ms após tempo mínimo),
          // considerar completo. Isso garante que todos os chunks finais tenham tempo de chegar
          if (stableIterations >= 20 && currentCount > 0) {
            clearInterval(checkInterval);
            stopRequestedRef.current = false;
            // Fazer snapshot dos chunks finais antes de mudar o status
            chunksSnapshotRef.current = [...currentChunks];
            // Sincronizar state também
            setRecordedChunks([...currentChunks]);
            console.log(
              `✅ Gravação completa: ${currentCount} chunks, ${currentTotalSize} bytes`
            );
            // Desativar loading quando chunks estiverem processados
            setIsProcessingChunks(false);
            setStatus(RecorderStatus.REVIEWING);
            onRecordingComplete();
            return;
          }

          // Timeout máximo - se não processar em 5 segundos, usar o que temos
          // Aumentado para dar mais tempo para chunks finais chegarem
          if (elapsed > 5000) {
            clearInterval(checkInterval);
            stopRequestedRef.current = false;
            // Fazer snapshot dos chunks disponíveis mesmo com timeout
            chunksSnapshotRef.current = [...currentChunks];
            setRecordedChunks([...currentChunks]);
            if (currentCount === 0) {
              console.error('❌ Nenhum chunk foi processado');
              alert(
                'Erro: Nenhum chunk de vídeo foi processado. A gravação falhou completamente.'
              );
            } else {
              console.warn(
                `⚠️ Timeout: usando ${currentCount} chunks disponíveis (${currentTotalSize} bytes)`
              );
              // Não mostrar alerta se temos chunks, apenas usar o que temos
            }
            // Desativar loading mesmo com timeout
            setIsProcessingChunks(false);
            setStatus(RecorderStatus.REVIEWING);
            onRecordingComplete();
            return;
          }
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

      // Reduzir timeslice para capturar chunks mais frequentemente e evitar perda de dados
      // Valores menores = mais chunks = melhor captura do stream ao vivo
      // 100ms garante captura muito frequente e reduz perda de dados
      const timeslice = isIOS ? 200 : 100;
      console.log(`🎬 Iniciando gravação com timeslice de ${timeslice}ms`);
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
              console.log('⏱️ Tempo máximo atingido, parando gravação...');
              // Forçar captura do último chunk antes de parar
              try {
                mediaRecorderRef.current.requestData();
                // Chamar novamente após um delay para garantir captura completa
                setTimeout(() => {
                  try {
                    if (
                      mediaRecorderRef.current &&
                      mediaRecorderRef.current.state !== 'inactive'
                    ) {
                      mediaRecorderRef.current.requestData();
                    }
                  } catch (e) {
                    console.log('Segundo requestData não suportado');
                  }
                }, 50);

                // Aguardar mais tempo para garantir que o último chunk seja processado
                setTimeout(() => {
                  if (
                    mediaRecorderRef.current &&
                    mediaRecorderRef.current.state !== 'inactive'
                  ) {
                    mediaRecorderRef.current.stop();
                  }
                }, 300);
              } catch (e) {
                // Alguns navegadores podem não suportar requestData
                console.log('requestData not supported or already called');
                mediaRecorderRef.current.stop();
              }
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
      console.log('🛑 Parando gravação...');
      console.log(
        `📊 Chunks atuais antes de parar: ${chunksRef.current.length} chunks, ${chunksRef.current.reduce((sum, c) => sum + c.size, 0)} bytes`
      );

      // Ativar loading imediatamente quando parar a gravação
      setIsProcessingChunks(true);

      // Forçar captura do último chunk antes de parar
      try {
        // Chamar requestData() múltiplas vezes para garantir captura de todos os dados pendentes
        mediaRecorderRef.current.requestData();

        // Aguardar um pouco e chamar novamente para garantir que não perdemos nada
        setTimeout(() => {
          try {
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state !== 'inactive'
            ) {
              mediaRecorderRef.current.requestData();
            }
          } catch (e) {
            console.log('Segundo requestData não suportado ou já chamado');
          }
        }, 50);

        // Aguardar mais tempo para garantir que o último chunk seja processado antes de parar
        setTimeout(() => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
          ) {
            console.log('🛑 Chamando stop() após requestData()');
            mediaRecorderRef.current.stop();
          }
        }, 300); // Aumentar delay para garantir processamento completo
      } catch (e) {
        // Alguns navegadores podem não suportar requestData
        console.log('requestData not supported or already called');
        mediaRecorderRef.current.stop();
      }
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
    isProcessingChunks,
    startRecording,
    stopRecording,
    setStatus,
    setPreviewUrl,
    setRecordedChunks,
    setElapsedTime,
  };
};
