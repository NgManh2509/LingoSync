import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiZap, FiAward, FiCheckCircle } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi2';

const HomePage = () => {
  const { user } = useAuth();

  const streak = user?.streakCount || 0;
  const level = user?.level || 1;
  const xp = user?.xpPoints || 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200/90 rounded-[5px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-[5px] object-cover ring-1 ring-zinc-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-[5px] bg-[#E5D7B7] text-[#5C4D2E] font-bold text-base flex items-center justify-center">
              {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                {user?.fullName || 'Học viên'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                <FiCheckCircle className="w-3 h-3" /> Online
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-amber-50/70 border border-amber-200/60 text-amber-800 text-xs font-semibold">
            <HiOutlineFire className="w-4 h-4 text-amber-500" />
            <span>{streak} Days Streak</span>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-indigo-50/70 border border-indigo-200/60 text-indigo-800 text-xs font-semibold">
            <FiAward className="w-4 h-4 text-indigo-500" />
            <span>Level {level}</span>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-violet-50/70 border border-violet-200/60 text-violet-800 text-xs font-semibold">
            <FiZap className="w-4 h-4 text-violet-500" />
            <span>{xp} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200/90 rounded-[5px] p-5 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 mb-1">Tiếp tục học</h2>
          <p className="text-xs text-zinc-400 mb-4">Các video bài học gần đây bạn đang xem dở</p>
          <div className="p-3 rounded-[5px] bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700">1a - Mike Is a Cook, Part 1</span>
            <span className="text-emerald-600 font-semibold">Đang học</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-[5px] p-5 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 mb-1">Mục tiêu hôm nay</h2>
          <p className="text-xs text-zinc-400 mb-4">Luyện 1 bài điền từ w____ hoặc ôn 10 thẻ flashcard</p>
          <div className="p-3 rounded-[5px] bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700">Chưa hoàn thành</span>
            <span className="text-amber-600 font-semibold">+30 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
