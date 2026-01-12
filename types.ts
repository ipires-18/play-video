export type JobType = 'secret' | 'company';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  jobType: JobType;
  companyName?: string;
  onEnded?: () => void;
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

export type RecorderStatus =
  | 'idle'
  | 'requesting'
  | 'countdown'
  | 'recording'
  | 'reviewing'
  | 'completed';

export interface VideoRecorderProps {
  jobType: JobType;
  maxDurationSeconds?: number;
  allowReRecord?: boolean;
  onRecordingComplete?: (blob: Blob) => void;
}
