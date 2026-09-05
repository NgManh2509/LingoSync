import React, { useState, useEffect } from 'react';
import { 
  FiAward, 
  FiZap, 
  FiLayers, 
  FiPlay, 
  FiCheck, 
  FiX, 
  FiRotateCw, 
  FiVolume2, 
  FiArrowRight, 
  FiFolder, 
  FiCheckCircle, 
  FiAlertCircle,
  FiHelpCircle
} from 'react-icons/fi';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import FlashcardStudyModal from '../components/common/FlashcardStudyModal';

const ChallengesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cloze');
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [selectedDeckForStudy, setSelectedDeckForStudy] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileStats, setProfileStats] = useState({
    streak: user?.streakCount || 0,
    xp: user?.xpPoints || 0,
    level: Math.floor((user?.xpPoints || 0) / 100) + 1
  });

  useEffect(() => {
    fetchDecks();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/api/users/profile');
      if (res.data) {
        setProfileStats({
          streak: res.data.streakCount || 0,
          xp: res.data.xpPoints || 0,
          level: Math.floor((res.data.xpPoints || 0) / 100) + 1
        });
      }
    } catch {}
  };

  const fetchDecks = async () => {
    setLoadingDecks(true);
    try {
      const res = await apiClient.get('/api/decks');
      setDecks(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDecks([]);
    } finally {
      setLoadingDecks(false);
    }
  };

  const startClozeQuiz = async () => {
    setQuizLoading(true);
    setQuizStarted(false);
    setQuizFinished(false);
    setSubmitResult(null);
    setCurrentQIndex(0);
    setUserAnswer('');
    setIsAnswerChecked(false);
    setScore(0);

    try {
      const res = await apiClient.get('/api/exercises/fill-in-the-blank?limit=10');
      const qList = res.data?.questions || [];
      setQuestions(qList);
      if (qList.length > 0) {
        setQuizStarted(true);
        setQuizStartTime(Date.now());
      }
    } catch {
      setQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  };

  const speakSentence = (text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      en: 'en-US',
      vi: 'vi-VN',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ko: 'ko-KR'
    };
    utterance.lang = langMap[user?.targetLanguage] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCheckAnswer = (e) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || isAnswerChecked) return;

    const currentQ = questions[currentQIndex];
    const target = (currentQ?.targetWord || '').trim().toLowerCase();
    const input = userAnswer.trim().toLowerCase();

    const isMatch = input === target;
    setIsCurrentCorrect(isMatch);
    setIsAnswerChecked(true);

    if (isMatch) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswerChecked(false);
      setIsCurrentCorrect(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsSubmitting(true);
    const elapsedSeconds = quizStartTime ? Math.max(1, Math.round((Date.now() - quizStartTime) / 1000)) : 10;
    const finalScore = score + (isCurrentCorrect ? 0 : 0);

    try {
      const res = await apiClient.post('/api/exercises/submit', {
        videoId: null,
        totalQuestions: questions.length,
        correctAnswers: score,
        timeSpentSeconds: elapsedSeconds
      });
      setSubmitResult(res.data);
      if (res.data?.currentStreak !== undefined) {
        setProfileStats((prev) => ({
          ...prev,
          streak: res.data.currentStreak,
          xp: res.data.totalXp ?? prev.xp,
          level: res.data.level ?? prev.level
        }));
      }
    } catch {}
    setIsSubmitting(false);
    setQuizFinished(true);
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#25231F] font-['Plus_Jakarta_Sans',sans-serif] -m-6 sm:-m-8 p-6 sm:p-10">
      <div className="max-w-[1120px] mx-auto w-full space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#25231F] tracking-tight">
              {t('challenges.title')}
            </h1>
            <p className="text-xs text-[#777168] mt-1">
              {t('challenges.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] shadow-xs">
              <span className="text-base">🔥</span>
              <div>
                <span className="block text-[10px] text-[#777168] uppercase font-bold leading-none">{t('challenges.streak_label')}</span>
                <span className="text-xs font-bold text-[#79542E]">{t('challenges.streak_days', { count: profileStats.streak })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] shadow-xs">
              <FiZap className="w-4 h-4 text-amber-600" />
              <div>
                <span className="block text-[10px] text-[#777168] uppercase font-bold leading-none">{t('challenges.level_badge', { level: profileStats.level })}</span>
                <span className="text-xs font-bold text-[#25231F]">{profileStats.xp} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#DED8CC] pb-2">
          <button
            onClick={() => setActiveTab('cloze')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[5px] transition-colors cursor-pointer ${
              activeTab === 'cloze'
                ? 'bg-[#79542E] text-[#FFFDF8] shadow-xs'
                : 'bg-[#FFFDF8] text-[#555048] border border-[#DED8CC] hover:bg-[#F4EDE1]'
            }`}
          >
            <FiZap className="w-3.5 h-3.5" />
            <span>{t('challenges.cloze_tab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[5px] transition-colors cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-[#79542E] text-[#FFFDF8] shadow-xs'
                : 'bg-[#FFFDF8] text-[#555048] border border-[#DED8CC] hover:bg-[#F4EDE1]'
            }`}
          >
            <FiLayers className="w-3.5 h-3.5" />
            <span>{t('challenges.flashcards_tab', { count: decks.reduce((sum, d) => sum + (d.dueCount || 0), 0) })}</span>
          </button>
        </div>

        {activeTab === 'cloze' ? (
          <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 sm:p-8 shadow-xs">
            {!quizStarted && !quizFinished ? (
              <div className="max-w-lg mx-auto text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF6EE] border border-[#DED8CC] flex items-center justify-center mx-auto text-[#79542E] shadow-xs">
                  <FiZap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#25231F]">{t('challenges.cloze_welcome_title')}</h3>
                  <p className="text-xs text-[#777168] mt-1.5 leading-relaxed">
                    {t('challenges.cloze_welcome_desc')}
                  </p>
                </div>

                <div className="pt-3">
                  <button
                    onClick={startClozeQuiz}
                    disabled={quizLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {quizLoading ? (
                      <>
                        <FiRotateCw className="w-4 h-4 animate-spin" />
                        <span>{t('challenges.loading_questions')}</span>
                      </>
                    ) : (
                      <>
                        <FiPlay className="w-4 h-4" />
                        <span>{t('challenges.start_btn')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : quizFinished ? (
              <div className="max-w-md mx-auto text-center py-8 space-y-5 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border border-[#DED8CC] flex items-center justify-center mx-auto text-[#79542E] shadow-xs">
                  <FiAward className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#25231F]">{t('challenges.finished_title')}</h3>
                  <p className="text-xs text-[#777168] mt-1">
                    {t('challenges.finished_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF6EE] rounded-[5px] border border-[#EBDCCB]/70">
                  <div>
                    <span className="block text-[11px] text-[#777168]">{t('challenges.correct_result')}</span>
                    <span className="text-lg font-bold text-[#25231F]">{score} / {questions.length}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#777168]">{t('challenges.bonus_xp')}</span>
                    <span className="text-lg font-bold text-amber-700">+{submitResult?.earnedXp || score * 10} XP</span>
                  </div>
                </div>

                {submitResult?.newAchievementsUnlocked?.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-[5px] text-xs text-amber-900 flex items-center gap-2 justify-center">
                    <FiAward className="w-4 h-4 text-amber-600" />
                    <span>{t('challenges.new_achievement', { name: submitResult.newAchievementsUnlocked[0].name })}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={startClozeQuiz}
                    className="px-5 py-2.5 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs"
                  >
                    {t('challenges.retry_btn')}
                  </button>
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className="px-4 py-2.5 border border-[#DED8CC] bg-[#FFFDF8] hover:bg-[#FAF6EE] text-[#25231F] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer"
                  >
                    {t('challenges.review_flashcards_btn')}
                  </button>
                </div>
              </div>
            ) : currentQ ? (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between text-xs text-[#777168] pb-3 border-b border-[#F4EDE1]">
                  <span className="font-semibold text-[#79542E]">
                    {t('challenges.question_counter', { current: currentQIndex + 1, total: questions.length })}
                  </span>
                  <span className="font-mono text-[11px]">
                    {t('challenges.score_counter', { score })}
                  </span>
                </div>

                <div className="w-full bg-[#FAF6EE] h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#A67C52] h-full transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start justify-between gap-3 p-4 bg-[#FAF6EE] rounded-[5px] border border-[#EBDCCB]/60">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#A67C52]">{t('challenges.video_sentence')}</span>
                      <p className="text-base sm:text-lg font-medium text-[#25231F] leading-relaxed">
                        {currentQ.sentenceWithBlank}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakSentence(currentQ.originalSentence)}
                      className="p-2 rounded-[4px] hover:bg-white text-[#777168] hover:text-[#79542E] transition-colors shrink-0 cursor-pointer"
                      title={t('challenges.listen_sentence')}
                    >
                      <FiVolume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {currentQ.hint && (
                    <div className="text-xs text-[#777168] flex items-center gap-1.5 px-1">
                      <FiHelpCircle className="w-3.5 h-3.5 text-[#A67C52]" />
                      <span>{t('challenges.hint_label')} <em>{currentQ.hint}</em></span>
                    </div>
                  )}

                  <form onSubmit={handleCheckAnswer} className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={isAnswerChecked}
                        autoFocus
                        placeholder={t('challenges.input_placeholder', { word: currentQ.maskedWord || '...' })}
                        className={`flex-1 px-4 py-2.5 text-sm bg-[#FFFDF8] border rounded-[5px] text-[#25231F] placeholder-[#777168]/70 focus:outline-none transition-colors ${
                          isAnswerChecked
                            ? isCurrentCorrect
                              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                              : 'border-rose-500 bg-rose-50/40 text-rose-900 font-semibold'
                            : 'border-[#DED8CC] focus:border-[#79542E]'
                        }`}
                      />

                      {!isAnswerChecked ? (
                        <button
                          type="submit"
                          disabled={!userAnswer.trim()}
                          className="px-5 py-2.5 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {t('challenges.check_btn')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-5 py-2.5 bg-[#25231F] hover:bg-black text-white text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <span>{currentQIndex + 1 < questions.length ? t('challenges.next_btn') : t('challenges.submit_btn')}</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isAnswerChecked && (
                      <div className={`p-3 rounded-[5px] border text-xs flex items-center justify-between animate-in fade-in duration-150 ${
                        isCurrentCorrect 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isCurrentCorrect ? (
                            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>
                            {isCurrentCorrect 
                              ? t('challenges.correct_feedback') 
                              : t('challenges.wrong_feedback')}
                            {!isCurrentCorrect && (
                              <strong className="underline decoration-rose-400 font-bold ml-1">
                                {currentQ.targetWord}
                              </strong>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#777168] space-y-2">
                <FiAlertCircle className="w-8 h-8 text-[#A67C52] mx-auto opacity-70" />
                <p>{t('challenges.empty_vocab_warn')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loadingDecks ? (
              <div className="py-16 text-center text-xs text-[#777168]">
                {t('challenges.loading_decks')}
              </div>
            ) : decks.length === 0 ? (
              <div className="bg-[#FFFDF8] border border-dashed border-[#DED8CC] rounded-[5px] p-12 text-center">
                <FiLayers className="w-8 h-8 text-[#A67C52] mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-bold text-[#25231F]">{t('challenges.no_decks_title')}</h3>
                <p className="text-xs text-[#777168] mt-1 max-w-sm mx-auto">
                  {t('challenges.no_decks_desc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-5 shadow-xs flex flex-col justify-between hover:border-[#A67C52] transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FiFolder className="w-4 h-4 text-[#A67C52]" />
                          <h3 className="text-sm font-bold text-[#25231F]">{deck.name}</h3>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#FAF6EE] border border-[#DED8CC] rounded-[3px] text-[#79542E]">
                          {t('challenges.cards_count', { count: deck.totalCards || 0 })}
                        </span>
                      </div>
                      <p className="text-xs text-[#777168] mt-2 line-clamp-2">
                        {deck.description || t('challenges.no_deck_desc')}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#F4EDE1] flex items-center justify-between">
                      <div className="text-[11px]">
                        <span className="text-[#777168]">{t('challenges.due_today')}</span>
                        <span className={`font-bold ${
                          (deck.dueCount || 0) > 0 ? 'text-[#79542E]' : 'text-[#777168]'
                        }`}>
                          {t('challenges.cards_count', { count: deck.dueCount || 0 })}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedDeckForStudy(deck)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs"
                      >
                        <FiPlay className="w-3 h-3" />
                        <span>{t('challenges.study_btn')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {selectedDeckForStudy && (
        <FlashcardStudyModal
          isOpen={!!selectedDeckForStudy}
          deckId={selectedDeckForStudy.id}
          deckName={selectedDeckForStudy.name}
          onClose={() => setSelectedDeckForStudy(null)}
          onSessionComplete={() => {
            fetchDecks();
            fetchProfile();
          }}
        />
      )}
    </div>
  );
};

export default ChallengesPage;
