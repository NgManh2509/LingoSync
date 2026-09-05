import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import {
  FiUser,
  FiMail,
  FiAward,
  FiZap,
  FiBookOpen,
  FiCheckCircle,
  FiVideo,
  FiRotateCw,
  FiGlobe,
  FiSave,
  FiLogOut,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiTrendingUp,
  FiTarget
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const SUPPORTED_TARGET_LANGS = [
  { code: 'en', name: 'English', sub: 'Tiếng Anh', flag: '🇬🇧' },
  { code: 'zh', name: '中文', sub: 'Tiếng Trung', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', sub: 'Tiếng Nhật', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', sub: 'Tiếng Hàn', flag: '🇰🇷' },
  { code: 'de', name: 'Deutsch', sub: 'Tiếng Đức', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', sub: 'Tiếng Pháp', flag: '🇫🇷' },
  { code: 'es', name: 'Español', sub: 'Tiếng TBN', flag: '🇪🇸' },
];

const NATIVE_LANGS = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
];

const DEFAULT_MILESTONES = [
  {
    id: 'streak_3',
    name: 'Khởi đầu kiên định',
    desc: 'Đạt chuỗi học tập 3 ngày liên tiếp',
    icon: '🔥',
    reqType: 'STREAK',
    reqValue: 3,
  },
  {
    id: 'words_20',
    name: 'Vốn từ mở rộng',
    desc: 'Học và lưu trữ thành công 20 từ vựng',
    icon: '📚',
    reqType: 'WORDS',
    reqValue: 20,
  },
  {
    id: 'videos_5',
    name: 'Khán giả tích cực',
    desc: 'Hoàn thành xem 5 bài học video',
    icon: '🎬',
    reqType: 'VIDEOS',
    reqValue: 5,
  },
  {
    id: 'reviews_30',
    name: 'Bậc thầy Flashcard',
    desc: 'Thực hiện 30 lượt ôn tập thẻ nhớ SM-2',
    icon: '🧠',
    reqType: 'REVIEWS',
    reqValue: 30,
  },
  {
    id: 'level_3',
    name: 'Nhà thông thái',
    desc: 'Tích lũy XP đạt mốc Cấp độ 3',
    icon: '⭐',
    reqType: 'LEVEL',
    reqValue: 3,
  },
  {
    id: 'words_50',
    name: 'Vốn từ dồi dào',
    desc: 'Lưu trữ thành công 50 từ vựng vào kho từ',
    icon: '💡',
    reqType: 'WORDS',
    reqValue: 50,
  }
];

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, updateLanguagePreference, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalWordsLearned: 0,
    totalWordsReviewed: 0,
    totalVideosWatched: 0,
    currentStreak: 0,
  });
  const [studyLogs, setStudyLogs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [targetLang, setTargetLang] = useState(user?.targetLanguage || 'en');
  const [nativeLang, setNativeLang] = useState(user?.nativeLanguage || 'vi');

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  const handleSelectTargetLang = (code) => {
    setTargetLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('lingosync_target_lang', code);
  };

  useEffect(() => {
    if (user) {
      if (user.targetLanguage) setTargetLang(user.targetLanguage);
      if (user.nativeLanguage) setNativeLang(user.nativeLanguage);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, logsRes, achRes] = await Promise.allSettled([
        apiClient.get('/api/dashboard/stats'),
        apiClient.get('/api/dashboard/study-logs?range=week'),
        apiClient.get('/api/users/achievements'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
      if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value.data)) {
        setStudyLogs(logsRes.value.data);
      }
      if (achRes.status === 'fulfilled' && Array.isArray(achRes.value.data)) {
        setAchievements(achRes.value.data);
      }
    } catch {
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      await updateLanguagePreference(targetLang, nativeLang);
      if (refreshUser) await refreshUser();
      setSaveSuccessMsg(t('profile.save_success'));
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      setSaveErrorMsg(err.response?.data?.message || 'Error updating settings');
      setTimeout(() => setSaveErrorMsg(''), 5000);
    } finally {
      setSavingPrefs(false);
    }
  };

  const getInitials = (username, email) => {
    const raw = username || (email ? email.split('@')[0] : 'U');
    const parts = raw.split(/[_\s.-]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  };

  const displayName = user?.username || (user?.email ? user.email.split('@')[0] : 'Learner');
  const userXp = user?.xpPoints || 0;
  const userLevel = user?.level || (Math.floor(userXp / 100) + 1);
  const nextLevelXp = user?.nextLevelXp || (userLevel * 100);
  const currentLevelBaseXp = (userLevel - 1) * 100;
  const xpInCurrentLevel = Math.max(0, userXp - currentLevelBaseXp);
  const xpNeededForNext = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const getLevelTitle = (lvl) => {
    if (lvl <= 1) return t('levels.lvl1');
    if (lvl === 2) return t('levels.lvl2');
    if (lvl === 3) return t('levels.lvl3');
    if (lvl === 4) return t('levels.lvl4');
    return t('levels.lvl5');
  };

  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const normalizedLogs = (() => {
    const map = {};
    studyLogs.forEach(log => {
      if (log.date) map[log.date] = log;
    });

    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();
      const adjustedDayIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      const log = map[iso] || { wordsLearned: 0, wordsReviewed: 0 };
      const count = (log.wordsLearned || 0) + (log.wordsReviewed || 0);
      list.push({
        date: iso,
        label: weekDayLabels[adjustedDayIdx],
        isToday: i === 0,
        count: count,
      });
    }
    return list;
  })();

  const maxCountInWeek = Math.max(...normalizedLogs.map(l => l.count), 15);

  const displayMilestones = achievements.length > 0 ? achievements.map(ach => ({
    id: ach.id,
    name: ach.name,
    desc: ach.description,
    icon: ach.icon || '🏆',
    isUnlocked: ach.isUnlocked,
    unlockedAt: ach.unlockedAt,
    progress: ach.currentProgress || 0,
    requirement: ach.requirementValue || 1,
    percent: Math.min(100, Math.round(((ach.currentProgress || 0) / (ach.requirementValue || 1)) * 100)),
  })) : DEFAULT_MILESTONES.map(item => {
    let current = 0;
    if (item.reqType === 'STREAK') current = stats.currentStreak || user?.streakCount || 0;
    if (item.reqType === 'WORDS') current = stats.totalWordsLearned || 0;
    if (item.reqType === 'VIDEOS') current = stats.totalVideosWatched || 0;
    if (item.reqType === 'REVIEWS') current = stats.totalWordsReviewed || 0;
    if (item.reqType === 'LEVEL') current = userLevel;

    const isUnlocked = current >= item.reqValue;
    return {
      id: item.id,
      name: t(`milestones.${item.id}_name`) || item.name,
      desc: t(`milestones.${item.id}_desc`) || item.desc,
      icon: item.icon,
      isUnlocked,
      unlockedAt: null,
      progress: Math.min(current, item.reqValue),
      requirement: item.reqValue,
      percent: Math.min(100, Math.round((Math.min(current, item.reqValue) / item.reqValue) * 100)),
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED8CC] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#79542E] text-xs font-semibold uppercase tracking-wider mb-1">
            <FiUser className="w-3.5 h-3.5" />
            <span>{t('profile.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#25231F]">
            {t('profile.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#777168] mt-1">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfileData}
            disabled={loadingStats}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#555048] bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] hover:bg-[#FAF6EE] hover:text-[#25231F] transition-colors cursor-pointer disabled:opacity-60"
            title={t('profile.sync_data')}
          >
            <FiRotateCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>{t('profile.sync_data')}</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-[5px] hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#EFE9DD]">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-[#79542E]/30 shadow-xs"
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#FAF6EE] border border-[#DED8CC] text-[#79542E] font-serif font-bold text-2xl flex items-center justify-center shadow-xs">
                  {getInitials(user?.username, user?.email)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-[#79542E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#FFFDF8]">
                {t('common.level')} {userLevel}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#25231F]">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#FAF6EE] text-[#79542E] border border-[#DED8CC] px-2 py-0.5 rounded-[4px]">
                  <FiAward className="w-3 h-3" />
                  {getLevelTitle(userLevel)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#777168] mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <FiMail className="w-3.5 h-3.5 text-[#A67C52]" />
                  {user?.email || 'user@lingosync.com'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiGlobe className="w-3.5 h-3.5 text-[#A67C52]" />
                  {SUPPORTED_TARGET_LANGS.find(l => l.code === (user?.targetLanguage || 'en'))?.name || 'Target'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <div className="bg-[#FAF6EE] border border-[#DED8CC] rounded-[5px] px-4 py-2.5 text-center min-w-[105px]">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[#777168]">
                {t('profile.study_streak')}
              </div>
              <div className="text-xl font-bold text-[#25231F] flex items-center justify-center gap-1 mt-0.5">
                <span className="text-amber-600">🔥</span>
                <span>{stats.currentStreak || user?.streakCount || 0}</span>
                <span className="text-xs font-normal text-[#777168]">{t('common.days')}</span>
              </div>
            </div>

            <div className="bg-[#FAF6EE] border border-[#DED8CC] rounded-[5px] px-4 py-2.5 text-center min-w-[105px]">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[#777168]">
                {t('profile.exp_points')}
              </div>
              <div className="text-xl font-bold text-[#79542E] flex items-center justify-center gap-1 mt-0.5">
                <FiZap className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{userXp}</span>
                <span className="text-xs font-normal text-[#777168]">{t('common.xp')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-[#555048] mb-2">
            <span className="font-semibold text-[#25231F] flex items-center gap-1.5">
              <span>{t('profile.level_progress')} {userLevel}</span>
              <span className="text-[#777168] font-normal">→ {t('common.level')} {userLevel + 1}</span>
            </span>
            <span className="font-medium text-[#79542E]">
              {xpInCurrentLevel} / {xpNeededForNext} {t('common.xp')} ({levelProgressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#EFE9DD] h-2.5 rounded-full overflow-hidden border border-[#DED8CC]">
            <div
              className="bg-gradient-to-r from-[#A67C52] to-[#79542E] h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#777168] mt-1.5">
            <span>{currentLevelBaseXp} {t('common.xp')}</span>
            <span>{t('profile.to_next_level', { xp: Math.max(0, xpNeededForNext - xpInCurrentLevel) })}</span>
            <span>{nextLevelXp} {t('common.xp')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#A67C52] mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777168]">
              {t('profile.stats_words_learned')}
            </span>
            <div className="p-2 bg-[#FAF6EE] rounded-[4px] border border-[#EFE9DD]">
              <FiBookOpen className="w-4 h-4 text-[#79542E]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#25231F]">
            {stats.totalWordsLearned || 0}
          </div>
          <p className="text-[11px] text-[#777168] mt-1">{t('profile.stats_words_learned_desc')}</p>
        </div>

        <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#A67C52] mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777168]">
              {t('profile.stats_reviews')}
            </span>
            <div className="p-2 bg-[#FAF6EE] rounded-[4px] border border-[#EFE9DD]">
              <FiRotateCw className="w-4 h-4 text-[#79542E]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#25231F]">
            {stats.totalWordsReviewed || 0}
          </div>
          <p className="text-[11px] text-[#777168] mt-1">{t('profile.stats_reviews_desc')}</p>
        </div>

        <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#A67C52] mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777168]">
              {t('profile.stats_videos')}
            </span>
            <div className="p-2 bg-[#FAF6EE] rounded-[4px] border border-[#EFE9DD]">
              <FiVideo className="w-4 h-4 text-[#79542E]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#25231F]">
            {stats.totalVideosWatched || 0}
          </div>
          <p className="text-[11px] text-[#777168] mt-1">{t('profile.stats_videos_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#25231F] flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-[#79542E]" />
                  <span>{t('profile.rhythm_title')}</span>
                </h3>
                <p className="text-xs text-[#777168] mt-0.5">
                  {t('profile.rhythm_desc')}
                </p>
              </div>
            </div>

            <div className="pt-6 pb-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-40">
                {normalizedLogs.map((item, idx) => {
                  const heightPercent = maxCountInWeek > 0 
                    ? Math.max(8, Math.min(100, Math.round((item.count / maxCountInWeek) * 100)))
                    : 8;
                  const isHigh = item.count >= 10;

                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] font-semibold text-[#777168] mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </div>
                      <div className="w-full max-w-[38px] bg-[#FAF6EE] border border-[#EFE9DD] rounded-t-[4px] h-full flex items-end p-0.5">
                        <div
                          className={`w-full rounded-t-[3px] transition-all duration-500 ${
                            item.isToday
                              ? isHigh
                                ? 'bg-[#79542E]'
                                : 'bg-[#A67C52]'
                              : isHigh
                              ? 'bg-[#79542E]/80'
                              : item.count > 0
                              ? 'bg-[#A67C52]/60'
                              : 'bg-[#E5DDCF]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-semibold ${item.isToday ? 'text-[#79542E]' : 'text-[#555048]'}`}>
                          {item.label}
                        </div>
                        <div className="text-[9px] text-[#777168]">
                          {item.date.slice(8)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFE9DD] flex items-center justify-between flex-wrap gap-3 text-xs text-[#777168]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#79542E]" />
                <span>{t('profile.legend_met')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A67C52]/60" />
                <span>{t('profile.legend_active')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDCF]" />
                <span>{t('profile.legend_rest')}</span>
              </span>
            </div>
            <div className="text-[#25231F] font-medium">
              {t('profile.total_week', { count: normalizedLogs.reduce((acc, cur) => acc + cur.count, 0) })}
            </div>
          </div>
        </div>

        <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-[#25231F] flex items-center gap-2 mb-1">
              <FiTarget className="w-4 h-4 text-[#79542E]" />
              <span>{t('profile.diligence_title')}</span>
            </h3>
            <p className="text-xs text-[#777168] mb-4">
              {t('profile.diligence_desc')}
            </p>

            <div className="space-y-3.5">
              <div className="p-3 bg-[#FAF6EE] border border-[#EFE9DD] rounded-[5px]">
                <div className="text-[11px] text-[#777168] uppercase tracking-wider font-semibold">
                  {t('profile.today_status')}
                </div>
                <div className="text-sm font-bold text-[#25231F] mt-1 flex items-center gap-1.5">
                  {user?.isStudiedToday || normalizedLogs[normalizedLogs.length - 1]?.count > 0 ? (
                    <>
                      <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">{t('profile.today_done')}</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800">{t('profile.today_pending')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#FAF6EE] border border-[#EFE9DD] rounded-[5px]">
                <div className="text-[11px] text-[#777168] uppercase tracking-wider font-semibold">
                  {t('profile.week_efficiency')}
                </div>
                <div className="text-sm font-bold text-[#25231F] mt-1">
                  {t('profile.days_studied', { count: normalizedLogs.filter(l => l.count > 0).length })}
                </div>
                <div className="w-full bg-[#EFE9DD] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-[#79542E] h-full rounded-full"
                    style={{ width: `${(normalizedLogs.filter(l => l.count > 0).length / 7) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF6EE] border border-[#EFE9DD] rounded-[5px]">
                <div className="text-[11px] text-[#777168] uppercase tracking-wider font-semibold">
                  {t('profile.due_words_title')}
                </div>
                <div className="text-sm font-bold text-[#79542E] mt-1 flex items-center justify-between">
                  <span>{t('profile.deck_ready')}</span>
                  <button
                    onClick={() => navigate('/vocabulary')}
                    className="text-xs font-semibold text-[#79542E] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    {t('profile.review_now')} <FiArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/challenges')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#79542E] hover:bg-[#634323] text-white text-xs font-semibold rounded-[5px] transition-colors cursor-pointer"
          >
            <FiZap className="w-3.5 h-3.5 fill-current" />
            <span>{t('profile.do_challenge_today')}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4 mb-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#25231F] flex items-center gap-2">
              <FiGlobe className="w-4 h-4 text-[#79542E]" />
              <span>{t('profile.settings_title')}</span>
            </h3>
            <p className="text-xs text-[#777168] mt-0.5">
              {t('profile.settings_desc')}
            </p>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[5px] flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[5px] flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#25231F] uppercase tracking-wider mb-2.5">
              {t('profile.target_lang_label')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {SUPPORTED_TARGET_LANGS.map(lang => {
                const isSelected = targetLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectTargetLang(lang.code)}
                    className={`flex items-center gap-2.5 p-3 rounded-[5px] border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF6EE] border-[#79542E] text-[#25231F] ring-1 ring-[#79542E]'
                        : 'bg-[#FFFDF8] border-[#DED8CC] text-[#555048] hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{lang.name}</div>
                      <div className="text-[10px] text-[#777168] truncate">{lang.sub}</div>
                    </div>
                    {isSelected && <FiCheck className="w-3.5 h-3.5 text-[#79542E] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#EFE9DD]">
            <div>
              <label className="block text-xs font-semibold text-[#25231F] uppercase tracking-wider mb-2">
                {t('profile.native_lang_label')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {NATIVE_LANGS.map(lang => {
                  const isSelected = nativeLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setNativeLang(lang.code)}
                      className={`flex items-center gap-2.5 p-3 rounded-[5px] border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF6EE] border-[#79542E] text-[#25231F] ring-1 ring-[#79542E]'
                          : 'bg-[#FFFDF8] border-[#DED8CC] text-[#555048] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{lang.name}</div>
                      </div>
                      {isSelected && <FiCheck className="w-3.5 h-3.5 text-[#79542E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={savingPrefs}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#79542E] hover:bg-[#634323] text-white text-xs font-semibold rounded-[5px] transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <FiSave className="w-3.5 h-3.5" />
              <span>{savingPrefs ? t('profile.saving_prefs_btn') : t('profile.save_prefs_btn')}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4 mb-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#25231F] flex items-center gap-2">
              <FiAward className="w-4 h-4 text-[#79542E]" />
              <span>{t('profile.achievements_title')}</span>
            </h3>
            <p className="text-xs text-[#777168] mt-0.5">
              {t('profile.achievements_desc')}
            </p>
          </div>
          <div className="text-xs text-[#777168]">
            {t('profile.achieved_count', { count: displayMilestones.filter(m => m.isUnlocked).length, total: displayMilestones.length })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayMilestones.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-[5px] border transition-all ${
                item.isUnlocked
                  ? 'bg-[#FAF6EE]/80 border-[#C9B99E] shadow-xs'
                  : 'bg-[#FFFDF8] border-[#EFE9DD] opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-[5px] flex items-center justify-center text-xl shrink-0 border ${
                    item.isUnlocked
                      ? 'bg-[#FFFDF8] border-[#C9B99E] text-[#79542E]'
                      : 'bg-[#EFE9DD] border-[#DED8CC] grayscale'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-[#25231F] truncate">{item.name}</h4>
                    {item.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        <FiCheck className="w-2.5 h-2.5" /> {t('profile.unlocked')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#777168]">
                        {item.progress}/{item.requirement}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#777168] mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-[#EFE9DD] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.isUnlocked ? 'bg-emerald-600' : 'bg-[#A67C52]'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
        <div
          onClick={() => navigate('/vocabulary')}
          className="p-4 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF6EE] group-hover:bg-[#FFFDF8] rounded-[4px] border border-[#EFE9DD]">
              <FiBookOpen className="w-4 h-4 text-[#79542E]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#25231F]">{t('profile.quick_hub_vocab')}</div>
              <div className="text-[11px] text-[#777168]">{t('profile.quick_hub_vocab_desc')}</div>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-[#777168] group-hover:text-[#25231F] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => navigate('/challenges')}
          className="p-4 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF6EE] group-hover:bg-[#FFFDF8] rounded-[4px] border border-[#EFE9DD]">
              <FiZap className="w-4 h-4 text-[#79542E]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#25231F]">{t('profile.quick_hub_challenges')}</div>
              <div className="text-[11px] text-[#777168]">{t('profile.quick_hub_challenges_desc')}</div>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-[#777168] group-hover:text-[#25231F] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => navigate('/playlists')}
          className="p-4 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF6EE] group-hover:bg-[#FFFDF8] rounded-[4px] border border-[#EFE9DD]">
              <FiVideo className="w-4 h-4 text-[#79542E]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#25231F]">{t('profile.quick_hub_playlists')}</div>
              <div className="text-[11px] text-[#777168]">{t('profile.quick_hub_playlists_desc')}</div>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-[#777168] group-hover:text-[#25231F] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
