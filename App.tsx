import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import VideoRecorder from './components/VideoRecorder';
import { JobType } from './types';

const App: React.FC = () => {
  const [jobType, setJobType] = useState<JobType>('company');
  const [mode, setMode] = useState<'view' | 'record'>('view');
  const videoSrc = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const posterUrl = 'https://picsum.photos/seed/video/1280/720';

  const handleRecordingComplete = (blob: Blob) => {
    console.log('Recording finished, blob size:', blob.size);
    // In a real app, you'd upload this blob
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-4xl w-full space-y-8">
        <header className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Portal de Recrutamento
            </h1>
            <p className="text-lg text-slate-600">
              {mode === 'view' ? 'Visualize os detalhes da vaga' : 'Grave sua apresentação para a vaga'}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setJobType('company')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  jobType === 'company'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Branding Empresa
              </button>
              <button
                onClick={() => setJobType('secret')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  jobType === 'secret'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Padrão Sigiloso
              </button>
            </div>

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
                onClick={() => setMode('record')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'record'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Recorder Mode
              </button>
            </div>
          </div>
        </header>

        <main className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {jobType === 'company' ? 'Desenvolvedor Frontend Sênior' : 'Oportunidade Confidencial'}
              </h2>
              <p className="text-sm text-slate-500">
                {jobType === 'company' ? 'TechCorp Solutions Inc.' : 'Empresa de Grande Porte'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              jobType === 'company' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
            }`}>
              {jobType === 'company' ? 'Pública' : 'Sigilosa'}
            </div>
          </div>

          <div className="aspect-video w-full bg-black relative">
            {mode === 'view' ? (
              <VideoPlayer 
                src={videoSrc} 
                poster={posterUrl} 
                jobType={jobType} 
                companyName="TechCorp"
              />
            ) : (
              <VideoRecorder 
                jobType={jobType}
                maxDurationSeconds={60}
                allowReRecord={true}
                onRecordingComplete={handleRecordingComplete}
              />
            )}
          </div>

          <div className="p-8 space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {mode === 'view' ? 'Sobre a Vaga' : 'Instruções de Gravação'}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {mode === 'view' 
                  ? 'Esta posição requer profundo conhecimento em ecossistemas modernos de desenvolvimento. O vídeo acima detalha nossa cultura e desafios.'
                  : 'Fale brevemente sobre sua experiência com React, TypeScript e sua motivação para esta vaga. Você tem até 60 segundos.'}
              </p>
            </section>
          </div>
        </main>

        <footer className="text-center text-slate-400 text-sm pb-12">
          &copy; 2024 Portal de Talentos. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
};

export default App;
