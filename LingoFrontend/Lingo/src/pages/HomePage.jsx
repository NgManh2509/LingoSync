import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  FiZap, 
  FiAward, 
  FiCheckCircle, 
  FiPlay, 
  FiClock, 
  FiArrowRight, 
  FiLayers, 
  FiBookmark, 
  FiBookOpen,
  FiList
} from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi2';
import { MdOutlineVideoLibrary } from 'react-icons/md';
import apiClient from '../api/apiClient';
import FlashcardStudyModal from '../components/common/FlashcardStudyModal';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [profileData, setProfileData] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const [studyDeck, setStudyDeck] = useState(null);

  const fetchHomeData = useCallback(async () => {
    try {
      const [historyRes, profileRes, decksRes] = await Promise.allSettled([
        apiClient.get('/api/videos/history'),
        apiClient.get('/api/users/profile'),
        apiClient.get('/api/decks')
      ]);

      if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value.data)) {
        setHistoryList(historyRes.value.data);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.data) {
        setProfileData(profileRes.value.data);
      }
      if (decksRes.status === 'fulfilled' && Array.isArray(decksRes.value.data)) {
        setDecks(decksRes.value.data);
      }
    } catch {
    } finally {
      setLoadingHistory(false);
      setLoadingGoals(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const streak = profileData?.streakCount ?? user?.streakCount ?? 0;
  const level = profileData?.level ?? user?.level ?? 1;
  const xp = profileData?.xpPoints ?? user?.xpPoints ?? 0;

  const totalDueCards = decks.reduce((acc, d) => acc + (d.dueCount || 0), 0);
  const totalCards = decks.reduce((acc, d) => acc + (d.cardCount || 0), 0);
  const firstDueDeck = decks.find((d) => (d.dueCount || 0) > 0) || decks[0] || null;

  const isStudiedToday = Boolean(profileData?.isStudiedToday);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calcProgress = (lastPos, dur) => {
    if (!dur || dur <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round(((lastPos || 0) / dur) * 100)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200/90 rounded-[5px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
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
                {user?.fullName || t('home.learner')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                <FiCheckCircle className="w-3 h-3" /> {t('home.online')}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-amber-50/70 border border-amber-200/60 text-amber-800 text-xs font-semibold">
            <HiOutlineFire className="w-4 h-4 text-amber-500" />
            <span>{t('home.days_streak', { count: streak })}</span>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-indigo-50/70 border border-indigo-200/60 text-indigo-800 text-xs font-semibold">
            <FiAward className="w-4 h-4 text-indigo-500" />
            <span>{t('home.level', { level })}</span>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-violet-50/70 border border-violet-200/60 text-violet-800 text-xs font-semibold">
            <FiZap className="w-4 h-4 text-violet-500" />
            <span>{xp} {t('common.xp', 'XP')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200/90 rounded-[5px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <MdOutlineVideoLibrary className="w-4 h-4 text-indigo-600" />
                {t('home.continue_learning')}
              </h2>
              {historyList.length > 0 && (
                <button
                  onClick={() => navigate('/lessons')}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  {t('home.view_library')} <FiArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              {t('home.continue_learning_desc')}
            </p>

            {loadingHistory ? (
              <div className="space-y-3 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-[5px] bg-zinc-50 border border-zinc-100">
                    <div className="w-20 h-12 bg-zinc-200 rounded-[4px]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-200 rounded w-3/4" />
                      <div className="h-2 bg-zinc-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-8 rounded-[5px] bg-zinc-50/60 border border-dashed border-zinc-200 text-center flex flex-col items-center justify-center my-auto">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2.5">
                  <FiPlay className="w-4 h-4 ml-0.5" />
                </div>
                <h3 className="text-xs font-semibold text-zinc-800 mb-1">
                  {t('home.no_in_progress')}
                </h3>
                <p className="text-[11px] text-zinc-400 max-w-xs mb-3.5">
                  {t('home.no_in_progress_desc')}
                </p>
                <button
                  onClick={() => navigate('/lessons')}
                  className="px-3.5 py-1.5 rounded-[5px] bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {t('home.explore_lessons')} <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyList.slice(0, 3).map((item) => {
                  const progress = calcProgress(item.lastPositionSeconds, item.durationSeconds);
                  const thumbnail = item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg` : null);

                  return (
                    <div
                      key={item.id || item.videoId}
                      onClick={() => navigate(`/lessons/${item.videoId}`)}
                      className="group p-2.5 rounded-[5px] bg-zinc-50/80 hover:bg-zinc-100/90 border border-zinc-200/70 transition-all cursor-pointer flex items-center gap-3.5"
                    >
                      <div className="relative w-20 h-13 rounded-[4px] overflow-hidden bg-zinc-200 shrink-0">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400">
                            <FiPlay className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-xs">
                            <FiPlay className="w-2.5 h-2.5 ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title || t('home.lesson_video')}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <FiClock className="w-3 h-3 text-zinc-400" />
                            {formatTime(item.lastPositionSeconds)} / {formatTime(item.durationSeconds)}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-200/80 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lessons/${item.videoId}`);
                        }}
                        className="p-2 rounded-[4px] text-zinc-400 group-hover:text-indigo-600 group-hover:bg-white transition-colors"
                        title={t('home.continue_this_lesson')}
                      >
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/90 rounded-[5px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <FiAward className="w-4 h-4 text-amber-500" />
                {t('home.daily_goals_title')}
              </h2>
              <button
                onClick={() => navigate('/challenges')}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                {t('home.challenges')} <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              {t('home.daily_goals_desc')}
            </p>

            {loadingGoals ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 rounded-[5px] bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                    <div className="space-y-2 w-2/3">
                      <div className="h-3 bg-zinc-200 rounded" />
                      <div className="h-2 bg-zinc-200 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-zinc-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className={`p-3 rounded-[5px] border transition-colors flex items-center justify-between gap-3 ${
                  isStudiedToday 
                    ? 'bg-emerald-50/50 border-emerald-200/70' 
                    : 'bg-zinc-50/80 border-zinc-200/70'
                }`}>
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-[4px] shrink-0 mt-0.5 ${
                      isStudiedToday 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100/80 text-amber-700'
                    }`}>
                      {isStudiedToday ? (
                        <FiCheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <HiOutlineFire className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-zinc-900">
                          {t('home.streak_goal_title')}
                        </h4>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          isStudiedToday 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isStudiedToday ? t('home.completed') : t('home.not_completed')}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {isStudiedToday 
                          ? t('home.streak_completed_desc', { streak })
                          : t('home.streak_incomplete_desc', { streak })}
                      </p>
                    </div>
                  </div>

                  {!isStudiedToday && (
                    <button
                      onClick={() => navigate('/challenges')}
                      className="shrink-0 px-2.5 py-1 rounded-[4px] bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      {t('home.study_now')}
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-[5px] bg-zinc-50/80 border border-zinc-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-[4px] bg-indigo-100/80 text-indigo-700 shrink-0 mt-0.5">
                      <FiLayers className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-zinc-900">
                          {t('home.flashcard_title')}
                        </h4>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          totalDueCards > 0 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {totalDueCards > 0 ? t('home.cards_due', { count: totalDueCards }) : t('home.flashcard_all_done')}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {totalDueCards > 0 
                          ? t('home.flashcard_due_desc')
                          : totalCards > 0 
                            ? t('home.flashcard_all_done_desc')
                            : t('home.flashcard_empty_desc')}
                      </p>
                    </div>
                  </div>

                  {totalDueCards > 0 && firstDueDeck ? (
                    <button
                      onClick={() => setStudyDeck(firstDueDeck)}
                      className="shrink-0 px-2.5 py-1 rounded-[4px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      {t('home.review_now')}
                    </button>
                  ) : totalCards === 0 ? (
                    <button
                      onClick={() => navigate('/lessons')}
                      className="shrink-0 px-2.5 py-1 rounded-[4px] bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-medium transition-colors"
                    >
                      {t('home.watch_video')}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/vocabulary')}
                      className="shrink-0 px-2.5 py-1 rounded-[4px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors"
                    >
                      {t('home.view_vocab')}
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-[5px] bg-zinc-50/80 border border-zinc-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-[4px] bg-violet-100/80 text-violet-700 shrink-0 mt-0.5">
                      <FiZap className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-zinc-900">
                          {t('home.cloze_title')}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-violet-100 text-violet-800">
                          +30~50 {t('common.xp', 'XP')}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {t('home.cloze_desc')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/challenges')}
                    className="shrink-0 px-2.5 py-1 rounded-[4px] bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    {t('home.start')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div
          onClick={() => navigate('/lessons')}
          className="p-3.5 rounded-[5px] bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <MdOutlineVideoLibrary className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
              {t('home.shortcuts.video_lessons')}
            </div>
            <div className="text-[10px] text-zinc-400">{t('home.shortcuts.video_lessons_sub')}</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/vocabulary')}
          className="p-3.5 rounded-[5px] bg-white border border-zinc-200/80 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FiBookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
              {t('home.shortcuts.vocab_hub')}
            </div>
            <div className="text-[10px] text-zinc-400">
              {t('home.shortcuts.vocab_hub_sub', { count: totalCards })}
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/challenges')}
          className="p-3.5 rounded-[5px] bg-white border border-zinc-200/80 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FiAward className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
              {t('home.shortcuts.arena')}
            </div>
            <div className="text-[10px] text-zinc-400">{t('home.shortcuts.arena_sub')}</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/playlists')}
          className="p-3.5 rounded-[5px] bg-white border border-zinc-200/80 hover:border-violet-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FiList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 group-hover:text-violet-600 transition-colors">
              {t('home.shortcuts.playlists')}
            </div>
            <div className="text-[10px] text-zinc-400">{t('home.shortcuts.playlists_sub')}</div>
          </div>
        </div>
      </div>

      {studyDeck && (
        <FlashcardStudyModal
          isOpen={Boolean(studyDeck)}
          deckId={studyDeck.id}
          deckName={studyDeck.name}
          onClose={() => setStudyDeck(null)}
          onSessionComplete={() => {
            setStudyDeck(null);
            fetchHomeData();
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
