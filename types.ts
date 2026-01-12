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
}
