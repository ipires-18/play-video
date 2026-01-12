import {
  isMediaRecorderSupported,
  isSafari,
  isIOS,
  isMac,
} from './device-detection';

/**
 * Detecta codecs suportados (priorizando H.264 para Safari/iOS/Mac)
 */
export const getSupportedMimeType = (): string | null => {
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
