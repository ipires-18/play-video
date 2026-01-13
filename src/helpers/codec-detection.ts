import {
  isMediaRecorderSupported,
  isSafari,
  isIOS,
  isMac,
} from './device-detection';

/**
 * Detecta codecs suportados seguindo as melhores práticas do WebRTC
 * 
 * Estratégia:
 * - macOS/Safari: Prioriza H.264 Baseline (mais compatível, aceleração por hardware)
 * - Outros navegadores: Prioriza VP8 (maduro, estável, amplamente suportado)
 * - Fallback: Deixa o navegador escolher automaticamente
 * 
 * H.264 Baseline é preferido sobre Main/High para evitar problemas em devices antigos
 * VP8 é o codec mais seguro e estável do WebRTC (usado há ~15 anos)
 * 
 * @returns MIME type do codec suportado ou null para usar o padrão do navegador
 */
export const getSupportedMimeType = (): string | null => {
  if (!isMediaRecorderSupported) return null;

  // H.264 Baseline Profile - Perfil mais compatível (evita problemas em devices antigos)
  // avc1.42E01E = Baseline Profile Level 3.0 (compatível com Safari, iOS, macOS)
  const h264Baseline = 'video/mp4;codecs=avc1.42E01E';
  
  // Outros perfis H.264 (menos compatíveis, mas podem ter melhor qualidade)
  const h264OtherProfiles = [
    'video/mp4;codecs=avc1.4D001E', // Main Profile
    'video/mp4;codecs=avc1.64001E', // High Profile
    'video/mp4;codecs=h264',
    'video/mp4;codecs=H264',
  ];

  // VP8 - Codec maduro e estável do WebRTC (usado há ~15 anos)
  // Priorizado em Chrome, Firefox, Edge
  const vp8Types = [
    'video/webm;codecs=vp8,opus', // VP8 com áudio Opus
    'video/webm;codecs=vp8', // VP8 sem especificar áudio
  ];

  // VP9 - Mais pesado, edge cases, menos estável que VP8
  const vp9Types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
  ];

  // Fallback genérico
  const fallbackTypes = ['video/webm'];

  // Para macOS/Safari/iOS: Priorizar H.264 Baseline primeiro (codec nativo, aceleração por hardware)
  // Depois tentar outros perfis H.264, depois VP8 como fallback seguro
  if (isSafari || isIOS || isMac) {
    const typesToTry = [
      h264Baseline, // Baseline primeiro (mais compatível)
      ...h264OtherProfiles, // Outros perfis H.264
      ...vp8Types, // VP8 como fallback seguro
      ...fallbackTypes,
    ];

    for (const type of typesToTry) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('✅ Codec selecionado (macOS/Safari):', type);
        return type;
      }
    }
  } else {
    // Para outros navegadores (Chrome, Firefox, Edge): Priorizar VP8 primeiro
    // VP8 é o codec mais estável e maduro do WebRTC
    // Depois tentar H.264, depois VP9, depois fallback
    const typesToTry = [
      ...vp8Types, // VP8 primeiro (mais estável)
      h264Baseline, // H.264 Baseline como alternativa
      ...h264OtherProfiles,
      ...vp9Types, // VP9 por último (menos estável)
      ...fallbackTypes,
    ];

    for (const type of typesToTry) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('✅ Codec selecionado:', type);
        return type;
      }
    }
  }

  // Fallback: deixar o navegador escolher automaticamente
  console.warn(
    '⚠️ Nenhum codec específico suportado, usando padrão do navegador'
  );
  return null;
};
