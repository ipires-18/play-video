/**
 * Detecta se é iOS/Safari/Mac
 * Usa maxTouchPoints para detectar iPad (não usa navigator.platform que está deprecated)
 */
export const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

export const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(
  navigator.userAgent
);

export const isSafari = /^((?!chrome|android).)*safari/i.test(
  navigator.userAgent
);

export const isAndroid = /Android/.test(navigator.userAgent);

/**
 * Detecta suporte do MediaRecorder
 */
export const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined';
