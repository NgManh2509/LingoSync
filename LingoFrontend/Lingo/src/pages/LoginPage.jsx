import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import GradientWaves from '../components/common/GradientWaves';

const LoginPage = () => {
  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-900 flex flex-col justify-between items-center p-6 sm:p-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden select-none">
      <div className="absolute inset-0 w-full h-full pointer-events-auto opacity-90">
        <GradientWaves
          horizonColor="#06B6D4"
          waveColor="#06B6D4"
          crestColor="#94a3b8"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1}
          opacity={1}
          grain
          grainIntensity={0.05}
          mouseInteraction
          parallaxStrength={0.5}
        />
      </div>

      <header className="w-full max-w-4xl flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-white/70 backdrop-blur-md border border-white/50 shadow-xs">
          <div className="w-6 h-6 rounded-[5px] bg-zinc-900 flex items-center justify-center text-white shadow-xs">
            <span className="font-bold text-xs">L</span>
          </div>
          <span className="font-bold text-sm text-zinc-900 tracking-tight">
            Lingo<span className="text-zinc-500 font-normal">Sync</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] bg-white/70 backdrop-blur-md border border-white/50 text-[11px] font-medium text-zinc-700 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>v1.0 Live</span>
        </div>
      </header>

      <main className="w-full max-w-[360px] my-auto relative z-10">
        <div className="bg-white/85 border border-white/60 rounded-[5px] p-7 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl text-center">
          <div className="w-9 h-9 rounded-[5px] bg-zinc-900 text-white flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Sparkles className="w-4 h-4 text-zinc-200" />
          </div>

          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight mb-1.5">
            Welcome to LingoSync
          </h1>
          <p className="text-zinc-600 text-xs mb-6 leading-relaxed">
            Master languages naturally through smart video subtitles & AI
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 bg-white/95 hover:bg-white text-zinc-800 font-medium py-2.5 px-4 rounded-[5px] border border-zinc-300/80 hover:border-zinc-400 transition-all duration-150 shadow-xs active:scale-[0.99] cursor-pointer text-xs group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <div className="mt-6 pt-5 border-t border-zinc-200/50 flex items-center justify-between text-[11px] text-zinc-500">
            <span>OAuth 2.0 Secure</span>
            <span>Multi-device Sync</span>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-600 relative z-10 px-3 py-1.5 rounded-[5px] bg-white/60 backdrop-blur-md border border-white/40 shadow-xs">
        <span>© 2026 LingoSync. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
          <span>·</span>
          <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:text-zinc-900 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
