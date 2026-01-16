import React from 'react';

export enum JobType {
  SECRET = 'secret',
  COMPANY = 'company',
}

export enum RecorderStatus {
  IDLE = 'idle',
  REQUESTING = 'requesting',
  COUNTDOWN = 'countdown',
  RECORDING = 'recording',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
}

/**
 * Interface para cores customizáveis dos controles de vídeo
 */
export interface VideoControlsColors {
  /** Cor de fundo dos controles (barra de controles) - padrão: roxo claro */
  controlBarBg?: string;
  /** Cor dos controles individuais (ícones, textos) - padrão: roxo forte */
  controlColor?: string;
  /** Cor dos controles no estado hover - padrão: roxo mais escuro */
  controlColorHover?: string;
  /** Cor da barra de progresso preenchida - padrão: roxo forte */
  progressFill?: string;
  /** Cor de fundo da barra de progresso - padrão: cinza claro */
  progressBg?: string;
}

export interface VideoPlayerProps {
  src?: string;
  srcObject?: MediaStream;
  poster?: string;
  jobType: JobType;
  companyName?: string;
  onEnded?: () => void;
  hideControls?: boolean;
  showControlsOnPlay?: boolean;
  onStateChange?: (state: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  }) => void;
  externalControl?: {
    togglePlay?: () => void;
    setCurrentTime?: (time: number) => void;
  };
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  bigPlayButtonRightButton?: React.ReactNode;
  customFullscreenControlBar?: React.ReactNode;
  /** Cores customizáveis para os controles */
  colors?: VideoControlsColors;
}

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackRate: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  isBuffering: boolean;
}

export interface VideoRecorderProps {
  jobType: JobType;
  maxDurationSeconds?: number;
  allowReRecord?: boolean;
  onRecordingComplete?: (blob: Blob) => void;
  autoStart?: boolean; // Se true, inicia stream e gravação automaticamente
  /** Cores customizáveis para os controles */
  colors?: VideoControlsColors;
}
