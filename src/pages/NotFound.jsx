import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Radar } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Decorative Grid Overlay (Subtle dots) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        
        {/* Animated Radar Icon */}
        <div className="relative mb-8">
          <Radar size={80} className="text-indigo-500 animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse"></div>
        </div>

        {/* Massive Gradient 404 Text */}
        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter mb-4 drop-shadow-lg">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-4">
          Signal Lost in the Noise
        </h2>

        <p className="text-slate-400 max-w-md mb-10 text-lg leading-relaxed">
          The AI couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the pipeline.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>Return to Dashboard</span>
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}