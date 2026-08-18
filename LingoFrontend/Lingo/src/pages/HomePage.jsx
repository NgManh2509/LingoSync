import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Zap, Trophy, LogOut, CheckCircle2, User, Sparkles } from 'lucide-react';

const HomePage = () => {
  const { user, logout } = useAuth();

  const streak = user?.streakCount || 0;
  const level = user?.level || 1;
  const xp = user?.xpPoints || 0;
  const nextLevelXp = user?.nextLevelXp || 300;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <CheckCircle2 className="w-4 h-4" />
          <span>Đăng nhập thành công!</span>
        </div>

        <div className="relative inline-block mb-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 mx-auto shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-xl">
              {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-white truncate">
          {user?.fullName || 'Học viên'}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5 truncate">{user?.email}</p>

        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-semibold mb-1">
              <Flame className="w-4 h-4 fill-amber-400" /> Streak
            </div>
            <p className="text-lg font-extrabold text-white">{streak}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs font-semibold mb-1">
              <Trophy className="w-4 h-4" /> Level
            </div>
            <p className="text-lg font-extrabold text-white">{level}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-violet-400 text-xs font-semibold mb-1">
              <Zap className="w-4 h-4 fill-violet-400" /> XP
            </div>
            <p className="text-lg font-extrabold text-white">{xp}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold py-3 px-4 rounded-xl transition duration-200 cursor-pointer text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
