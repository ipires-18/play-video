
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoRecorderProps, RecorderStatus } from '../types';
import Icons from './Icons';

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  jobType,
  maxDurationSeconds = 180, // Default to 3 minutes as in the screenshot
  allowReRecord = true,
  onRecordingComplete
}) => {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdownValue, setCountdownValue] = useState(5);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Themes mapping
  const isCompany = jobType === 'company';
  const theme = {
    barBg: 'bg-[#e9f2ee]', // Light greenish background from screenshot
    textPrimary: 'text-[#4a5568]',
    progressBg: 'bg-[#d1d5db]',
    progressFill: isCompany ? 'bg-indigo-600' : 'bg-slate-400',
    dot: 'bg-[#10b981]', // Green dot from screenshot
  };

  const startStream = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }
      setStatus('idle');
    } catch (err) {
      console.error('Error accessing camera/mic:', err);
      setError('Não foi possível acessar a câmera ou microfone. Verifique as permissões.');
      setStatus('idle');
    }
  };

  const startCountdown = () => {
    if (!stream) return;
    setStatus('countdown');
    setCountdownValue(5);
  };

  useEffect(() => {
    let interval: number;
    if (status === 'countdown') {
      interval = window.setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startRecording = () => {
    if (!stream) return;
    
    setRecordedChunks([]);
    setElapsedTime(0);
    setPreviewUrl(null);
    
    const options = { mimeType: 'video/webm;codecs=vp8,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      delete (options as any).mimeType;
    }

    const recorder = new MediaRecorder(stream, options);
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setStatus('recording');

    timerIntervalRef.current = window.setInterval(() => {
      setElapsedTime((prev) => {
        if (prev >= maxDurationSeconds) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStatus('reviewing');
  }, []);

  useEffect(() => {
    if (status === 'reviewing' && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  }, [status, recordedChunks]);

  const handleFinish = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      onRecordingComplete?.(blob);
      setStatus('completed');
      stopStream();
    }
  };

  const handleReRecord = () => {
    if (!allowReRecord) return;
    setRecordedChunks([]);
    setElapsedTime(0);
    setPreviewUrl(null);
    setStatus('idle');
    if (!stream) {
      startStream();
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col p-4 md:p-8">
      {/* Video Canvas Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg bg-black">
        <video
          ref={videoPreviewRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transform scale-x-[-1] ${status === 'reviewing' || status === 'completed' ? 'hidden' : 'block'}`}
        />
        
        {previewUrl && (status === 'reviewing' || status === 'completed') && (
          <video
            src={previewUrl}
            controls
            className="w-full h-full object-contain"
          />
        )}

        {/* Countdown Overlay */}
        {status === 'countdown' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white">
            <h3 className="text-2xl font-medium mb-6">A gravação começará em:</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/20"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={364}
                  strokeDashoffset={364 * (1 - countdownValue / 5)}
                  className="text-white transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute text-4xl font-bold">{countdownValue}</span>
            </div>
          </div>
        )}

        {/* Initial Overlay if not streaming */}
        {!stream && status === 'idle' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white p-6 text-center">
            <button 
              onClick={startStream}
              className="px-8 py-3 bg-white text-black rounded-full font-bold shadow-xl hover:bg-slate-100 transition-all transform hover:scale-105"
            >
              Ativar Câmera
            </button>
          </div>
        )}

        {/* Status UI (Requesting / Error) */}
        {status === 'requesting' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 text-white text-center">
             <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
             <p className="font-medium">Solicitando permissão...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 text-white text-center p-6">
            <Icons.Mute className="w-16 h-16 text-rose-500 mb-4" />
            <p className="max-w-xs mb-6">{error}</p>
            <button onClick={startStream} className="px-6 py-2 bg-indigo-600 rounded-full font-bold">Tentar Novamente</button>
          </div>
        )}
      </div>

      {/* Themed Control Bar */}
      <div className="mt-6 flex justify-center">
        <div className={`w-full max-w-4xl h-16 rounded-full ${theme.barBg} flex items-center px-6 shadow-sm border border-slate-200/50`}>
          
          {/* Left Side: Time and Status Icon */}
          <div className="flex items-center space-x-3 min-w-[140px]">
            <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${status === 'recording' ? 'bg-rose-600 animate-pulse' : 'bg-slate-300'}`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-slate-700 font-medium whitespace-nowrap tabular-nums">
              {formatTime(elapsedTime)} de {formatTime(maxDurationSeconds)}
            </span>
          </div>

          {/* Center: Progress Scrubber */}
          <div className="flex-1 px-8 relative flex items-center">
            <div className="w-full h-1 bg-slate-300 rounded-full relative overflow-hidden">
               <div 
                 className="h-full bg-slate-400/50" 
                 style={{ width: `${(elapsedTime / maxDurationSeconds) * 100}%` }} 
               />
            </div>
            {/* The Green Dot indicator from layout */}
            <div 
              className={`absolute w-2 h-2 rounded-full ${theme.dot} shadow-sm transition-all duration-300`}
              style={{ left: `calc(${8 + (elapsedTime / maxDurationSeconds) * 84}% )` }}
            />
          </div>

          {/* Right Side: Action Button */}
          <div className="flex items-center ml-4">
            {status === 'idle' && stream && (
              <button 
                onClick={startCountdown}
                className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 transition-colors font-semibold"
              >
                <Icons.Play className="w-5 h-5" />
                <span>Gravar</span>
              </button>
            )}

            {status === 'recording' && (
              <button 
                onClick={stopRecording}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
              >
                <Icons.StopSquare className="w-6 h-6" />
                <span>Concluir</span>
              </button>
            )}

            {(status === 'reviewing' || status === 'completed') && (
              <div className="flex items-center space-x-4">
                {allowReRecord && status === 'reviewing' && (
                  <button onClick={handleReRecord} className="text-slate-500 hover:text-slate-800 text-sm font-semibold">Regravar</button>
                )}
                {status === 'reviewing' && (
                  <button onClick={handleFinish} className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-sm">Finalizar</button>
                )}
                {status === 'completed' && (
                  <span className="text-emerald-600 font-bold text-sm">✓ Enviado</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;
