import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiVolume2, 
  FiRotateCw, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLayers, 
  FiArrowRight, 
  FiSmile, 
  FiAward 
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const FlashcardStudyModal = ({ isOpen, onClose, deckId, deckName, onSessionComplete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  useEffect(() => {
    if (isOpen && deckId) {
      fetchCardsForReview();
    }
  }, [isOpen, deckId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || loading || cards.length === 0 || isFinished) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped && !submitting) {
        if (e.key === '1') handleRating(1);
        else if (e.key === '2') handleRating(2);
        else if (e.key === '3') handleRating(3);
        else if (e.key === '4') handleRating(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipped, loading, cards, currentIndex, submitting, isFinished]);

  const fetchCardsForReview = async () => {
    setLoading(true);
    setIsFinished(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });

    try {
      const res = await apiClient.get(`/api/decks/${deckId}/review`);
      const reviewCards = Array.isArray(res.data) ? res.data : [];
      setCards(reviewCards);
    } catch {
      try {
        const fallback = await apiClient.get(`/api/decks/${deckId}/cards`);
        setCards(Array.isArray(fallback.data) ? fallback.data : []);
      } catch {
        setCards([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (text, lang) => {
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
    const targetLang = lang || currentCard?.sourceLanguage || user?.targetLanguage || 'en';
    utterance.lang = langMap[targetLang] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleRating = async (rating) => {
    if (submitting || currentIndex >= cards.length) return;
    const currentCard = cards[currentIndex];
    setSubmitting(true);

    if (rating === 1) setStats((prev) => ({ ...prev, again: prev.again + 1 }));
    else if (rating === 2) setStats((prev) => ({ ...prev, hard: prev.hard + 1 }));
    else if (rating === 3) setStats((prev) => ({ ...prev, good: prev.good + 1 }));
    else if (rating === 5) setStats((prev) => ({ ...prev, easy: prev.easy + 1 }));

    try {
      await apiClient.post('/api/decks/review', {
        flashcardId: currentCard.id,
        rating: rating
      });
    } catch {}

    if (rating === 1) {
      setCards((prev) => [...prev, currentCard]);
    }

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      if (onSessionComplete) onSessionComplete();
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 
    ? Math.min(100, Math.round(((currentIndex + (isFinished ? 1 : 0)) / cards.length) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#25231F]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-xl bg-[#FFFDF8] rounded-[5px] border border-[#DED8CC] shadow-[0_8px_32px_rgba(37,35,31,0.12)] z-50 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 fade-in duration-150">
        
        <div className="px-6 py-4 border-b border-[#DED8CC] bg-[#FAF6EE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiLayers className="w-4 h-4 text-[#A67C52]" />
            <span className="text-xs font-bold text-[#25231F] tracking-tight">
              {deckName || t('flashcard.default_deck_title', 'Flashcard Deck')}
            </span>
            {cards.length > 0 && !isFinished && (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-[#FFFDF8] border border-[#DED8CC] rounded-[3px] text-[#79542E]">
                {currentIndex + 1} / {cards.length}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#777168] hover:text-[#25231F] hover:bg-[#F4EDE1] transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full bg-[#EBDCCB]/50 h-1">
          <div 
            className="bg-[#A67C52] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center overflow-y-auto min-h-[380px]">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#777168] space-y-2">
              <FiRotateCw className="w-6 h-6 animate-spin mx-auto text-[#A67C52]" />
              <p>{t('flashcard.loading')}</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <FiCheckCircle className="w-12 h-12 text-emerald-600 mx-auto opacity-80" />
              <h3 className="text-base font-bold text-[#25231F]">{t('flashcard.empty_title')}</h3>
              <p className="text-xs text-[#777168] max-w-sm mx-auto leading-relaxed">
                {t('flashcard.empty_desc')}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer"
              >
                {t('flashcard.close_btn')}
              </button>
            </div>
          ) : isFinished ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-[#FAF6EE] border border-[#DED8CC] flex items-center justify-center mx-auto text-[#A67C52] shadow-xs">
                <FiAward className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#25231F]">{t('flashcard.finished_title')}</h3>
                <p className="text-xs text-[#777168] mt-1">
                  {t('flashcard.finished_desc', { count: cards.length })}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto my-3 text-center">
                <div className="p-2 bg-rose-50 border border-rose-100 rounded-[4px]">
                  <span className="block text-xs font-bold text-rose-700">{stats.again}</span>
                  <span className="text-[10px] text-rose-600">{t('flashcard.again')}</span>
                </div>
                <div className="p-2 bg-amber-50 border border-amber-100 rounded-[4px]">
                  <span className="block text-xs font-bold text-amber-700">{stats.hard}</span>
                  <span className="text-[10px] text-amber-600">{t('flashcard.hard')}</span>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-[4px]">
                  <span className="block text-xs font-bold text-blue-700">{stats.good}</span>
                  <span className="text-[10px] text-blue-600">{t('flashcard.good')}</span>
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-[4px]">
                  <span className="block text-xs font-bold text-emerald-700">{stats.easy}</span>
                  <span className="text-[10px] text-emerald-600">{t('flashcard.easy')}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={fetchCardsForReview}
                  className="px-4 py-2 border border-[#DED8CC] bg-[#FFFDF8] hover:bg-[#F4EDE1] text-[#25231F] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer"
                >
                  {t('flashcard.review_again_btn')}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs"
                >
                  {t('flashcard.finish_btn')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: '1000px' }}
                className="w-full max-w-md h-64 sm:h-72 cursor-pointer select-none group"
              >
                <div 
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className="w-full h-full relative"
                >
                  <div 
                    style={{ backfaceVisibility: 'hidden' }}
                    className="absolute inset-0 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 flex flex-col justify-between items-center text-center shadow-xs group-hover:border-[#A67C52] transition-colors"
                  >
                    <div className="w-full flex items-center justify-between text-[11px] text-[#777168]">
                      <span className="uppercase font-mono tracking-wider font-semibold text-[#A67C52]">
                        {currentCard.partOfSpeech || t('flashcard.default_pos')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(currentCard.word, currentCard.sourceLanguage);
                        }}
                        className="p-1.5 rounded-[4px] hover:bg-[#FAF6EE] text-[#777168] hover:text-[#79542E] transition-colors cursor-pointer"
                        title={t('vocab.listen_tooltip')}
                      >
                        <FiVolume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="my-auto space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#25231F] tracking-tight">
                        {currentCard.word}
                      </h2>
                      {currentCard.phonetic && (
                        <p className="text-sm font-serif text-[#79542E] bg-[#FAF6EE] inline-block px-2.5 py-0.5 rounded-[3px] border border-[#EBDCCB]">
                          {currentCard.phonetic}
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] text-[#777168] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <span>{t('flashcard.flip_hint')}</span>
                      <FiRotateCw className="w-3 h-3" />
                    </div>
                  </div>

                  <div 
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                    className="absolute inset-0 bg-[#FAF6EE] border border-[#DED8CC] rounded-[5px] p-6 flex flex-col justify-between items-center text-center shadow-xs"
                  >
                    <div className="w-full flex items-center justify-between text-[11px] text-[#777168]">
                      <span className="font-bold text-[#79542E]">
                        {currentCard.word}
                      </span>
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-[#FFFDF8] border border-[#DED8CC] rounded-[3px]">
                        {currentCard.status || 'REVIEW'}
                      </span>
                    </div>

                    <div className="my-auto space-y-2 max-w-sm">
                      <p className="text-base sm:text-lg font-bold text-[#25231F] leading-snug">
                        {currentCard.definition || t('flashcard.no_definition')}
                      </p>
                    </div>

                    <div className="text-[11px] text-[#777168]">
                      <span>{t('flashcard.rate_hint')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-md mt-6">
                {!isFlipped ? (
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-2.5 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>{t('flashcard.flip_btn')}</span>
                    <span className="text-[10px] opacity-75 font-mono">{t('flashcard.flip_space')}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleRating(1)}
                        disabled={submitting}
                        className="py-2.5 px-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-[5px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
                      >
                        <span>{t('flashcard.again_btn')}</span>
                        <span className="text-[9px] font-mono text-rose-500 font-normal">{t('flashcard.key_1')}</span>
                      </button>

                      <button
                        onClick={() => handleRating(2)}
                        disabled={submitting}
                        className="py-2.5 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-[5px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
                      >
                        <span>{t('flashcard.hard_btn')}</span>
                        <span className="text-[9px] font-mono text-amber-500 font-normal">{t('flashcard.key_2')}</span>
                      </button>

                      <button
                        onClick={() => handleRating(3)}
                        disabled={submitting}
                        className="py-2.5 px-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-[5px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
                      >
                        <span>{t('flashcard.good_btn')}</span>
                        <span className="text-[9px] font-mono text-blue-500 font-normal">{t('flashcard.key_3')}</span>
                      </button>

                      <button
                        onClick={() => handleRating(5)}
                        disabled={submitting}
                        className="py-2.5 px-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-[5px] text-xs font-bold transition-colors cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
                      >
                        <span>{t('flashcard.easy_btn')}</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-normal">{t('flashcard.key_4')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FlashcardStudyModal;
