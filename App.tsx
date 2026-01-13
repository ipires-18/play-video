import React, { useState } from 'react';
import { JobType } from './types';
import VideoPlayer from './src/components/video-player';
import VideoRecorder from './src/components/video-recorder';
import PreRecordingTimer from './src/components/pre-recording-timer';

const App: React.FC = () => {
  const [jobType, setJobType] = useState<JobType>(JobType.COMPANY);
  const [mode, setMode] = useState<'view' | 'timer' | 'record'>('view');
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const videoSrc =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const posterUrl = 'https://picsum.photos/seed/video/1280/720';

  const handleRecordingComplete = (blob: Blob) => {
    console.log('Recording finished, blob size:', blob.size);
    // In a real app, you'd upload this blob
  };

  const handleTimerComplete = () => {
    // Quando o timer de 10 segundos acabar, iniciar a gravação automaticamente
    console.log('⏰ Timer completo - iniciando gravação automática');
    setShouldAutoStart(true);
    setMode('record');
  };

  const handleSkipTimer = () => {
    // Permite pular o timer e ir direto para a gravação
    setShouldAutoStart(true);
    setMode('record');
  };

  const handleStartTimer = () => {
    // Resetar autoStart quando iniciar novo timer
    setShouldAutoStart(false);
    setMode('timer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-4xl w-full space-y-8">
        <header className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setMode('view')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'view'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Player Mode
              </button>
              <button
                onClick={handleStartTimer}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'timer'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Timer + Record
              </button>
              <button
                onClick={() => {
                  setShouldAutoStart(false);
                  setMode('record');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'record' && !shouldAutoStart
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Recorder Mode
              </button>
            </div>
          </div>
        </header>

        <main className="aspect-video w-full bg-transparent relative">
          {mode === 'view' ? (
            <VideoPlayer
              src={videoSrc}
              poster={posterUrl}
              jobType={jobType}
              companyName="TechCorp"
            />
          ) : mode === 'timer' ? (
            <PreRecordingTimer
              jobType={jobType}
              durationSeconds={10}
              onTimerComplete={handleTimerComplete}
              onSkip={handleSkipTimer}
            />
          ) : (
            <VideoRecorder
              jobType={jobType}
              maxDurationSeconds={180}
              allowReRecord={true}
              onRecordingComplete={handleRecordingComplete}
              autoStart={shouldAutoStart}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
