import React, { useState, useEffect, useMemo } from 'react';
import {
  FiFolder,
  FiPlus,
  FiSearch,
  FiVolume2,
  FiTrash2,
  FiArrowLeft,
  FiClock,
  FiBookOpen,
  FiLayers,
  FiX,
  FiAlertCircle,
  FiPlay
} from 'react-icons/fi';
import { MdOutlineTranslate } from 'react-icons/md';
import apiClient from '../api/apiClient';
import { useTranslation } from 'react-i18next';
import FlashcardStudyModal from '../components/common/FlashcardStudyModal';

const VocabularyPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('decks');
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const [allWords, setAllWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [studyDeck, setStudyDeck] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchDecks = async () => {
    setLoadingDecks(true);
    try {
      const res = await apiClient.get('/api/decks');
      if (res.data && Array.isArray(res.data)) {
        setDecks(res.data);
      }
    } catch {
      setDecks([]);
    } finally {
      setLoadingDecks(false);
    }
  };

  const fetchDeckCards = async (deckId) => {
    setLoadingCards(true);
    try {
      const res = await apiClient.get(`/api/decks/${deckId}/cards`);
      if (res.data && Array.isArray(res.data)) {
        setDeckCards(res.data);
      }
    } catch {
      setDeckCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const fetchAllWords = async () => {
    setLoadingWords(true);
    try {
      const res = await apiClient.get('/api/vocabulary/my-list');
      if (res.data && Array.isArray(res.data)) {
        setAllWords(res.data);
      }
    } catch {
      setAllWords([]);
    } finally {
      setLoadingWords(false);
    }
  };

  useEffect(() => {
    fetchDecks();
    fetchAllWords();
  }, []);

  const handleSelectDeck = (deck) => {
    setSelectedDeck(deck);
    fetchDeckCards(deck.id);
  };

  const handleBackToDecks = () => {
    setSelectedDeck(null);
    setDeckCards([]);
    fetchDecks();
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) {
      setCreateError(t('vocab.name_required'));
      return;
    }
    setCreatingDeck(true);
    setCreateError(null);
    try {
      await apiClient.post('/api/decks', {
        name: newDeckName.trim(),
        description: newDeckDesc.trim() || null
      });
      setNewDeckName('');
      setNewDeckDesc('');
      setShowCreateModal(false);
      fetchDecks();
    } catch (err) {
      setCreateError(err.response?.data?.message || t('vocab.create_failed'));
    } finally {
      setCreatingDeck(false);
    }
  };

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation();
    if (!window.confirm(t('vocab.delete_deck_confirm'))) return;
    try {
      await apiClient.delete(`/api/decks/${deckId}`);
      if (selectedDeck?.id === deckId) {
        handleBackToDecks();
      } else {
        fetchDecks();
      }
    } catch (err) {
      alert(err.response?.data?.message || t('vocab.delete_deck_failed'));
    }
  };

  const speakWord = (word, lang = 'en') => {
    if (!window.speechSynthesis || !word) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang === 'en' ? 'en-US' : lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    const q = searchQuery.toLowerCase();
    return decks.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  }, [decks, searchQuery]);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return deckCards;
    const q = searchQuery.toLowerCase();
    return deckCards.filter(c =>
      (c.word || c.vocabulary?.word)?.toLowerCase().includes(q) ||
      (c.definition || c.vocabulary?.definition)?.toLowerCase().includes(q) ||
      (c.phonetic || c.vocabulary?.phonetic)?.toLowerCase().includes(q)
    );
  }, [deckCards, searchQuery]);

  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return allWords;
    const q = searchQuery.toLowerCase();
    return allWords.filter(w =>
      w.word?.toLowerCase().includes(q) ||
      w.definition?.toLowerCase().includes(q) ||
      w.phonetic?.toLowerCase().includes(q)
    );
  }, [allWords, searchQuery]);

  const totalCardsCount = useMemo(() => {
    return decks.reduce((acc, d) => acc + (d.flashCardCount || 0), 0);
  }, [decks]);

  return (
    <div className="min-h-full bg-[#FAF6EE] text-[#25231F] font-['Plus_Jakarta_Sans',sans-serif] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DED8CC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[11px] font-semibold tracking-wide uppercase bg-[#F4EDE1] text-[#79542E] border border-[#DED8CC]">
                <FiBookOpen className="w-3.5 h-3.5" />
                {t('vocab.badge')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#25231F] tracking-tight">
              {t('vocab.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#777168] mt-1">
              {t('vocab.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors shadow-xs cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>{t('vocab.create_deck_btn')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 my-6">
          <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#777168]">{t('vocab.total_decks')}</span>
              <FiFolder className="w-4 h-4 text-[#A67C52]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#25231F] mt-1.5">
              {decks.length}
            </div>
          </div>

          <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#777168]">{t('vocab.total_cards')}</span>
              <FiLayers className="w-4 h-4 text-[#79542E]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#25231F] mt-1.5">
              {totalCardsCount}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#777168]">{t('vocab.saved_words')}</span>
              <MdOutlineTranslate className="w-4 h-4 text-[#A67C52]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#25231F] mt-1.5">
              {allWords.length}
            </div>
          </div>
        </div>

        {!selectedDeck && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-[#DED8CC]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setActiveTab('decks'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[5px] transition-colors cursor-pointer ${activeTab === 'decks'
                  ? 'bg-[#79542E] text-[#FFFDF8]'
                  : 'bg-[#FFFDF8] text-[#555048] border border-[#DED8CC] hover:bg-[#F4EDE1]'
                  }`}
              >
                <FiFolder className="w-3.5 h-3.5" />
                <span>{t('vocab.decks_tab', { count: decks.length })}</span>
              </button>

              <button
                onClick={() => { setActiveTab('all_words'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[5px] transition-colors cursor-pointer ${activeTab === 'all_words'
                  ? 'bg-[#79542E] text-[#FFFDF8]'
                  : 'bg-[#FFFDF8] text-[#555048] border border-[#DED8CC] hover:bg-[#F4EDE1]'
                  }`}
              >
                <MdOutlineTranslate className="w-3.5 h-3.5" />
                <span>{t('vocab.all_words_tab', { count: allWords.length })}</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777168]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'decks' ? t('vocab.search_decks_placeholder') : t('vocab.search_words_placeholder')}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] text-[#25231F] placeholder-[#777168] focus:outline-none focus:border-[#79542E]"
              />
            </div>
          </div>
        )}

        {selectedDeck ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-3.5">
                <button
                  onClick={handleBackToDecks}
                  className="p-2 mt-0.5 bg-[#F4EDE1] hover:bg-[#E9DFCF] text-[#79542E] rounded-[5px] transition-colors cursor-pointer"
                  title={t('vocab.back_to_decks')}
                >
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-[#25231F] tracking-tight">
                      {selectedDeck.name}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F4EDE1] text-[#79542E] border border-[#DED8CC] rounded-[3px]">
                      {t('challenges.cards_count', { count: deckCards.length })}
                    </span>
                  </div>
                  <p className="text-xs text-[#777168] mt-1">
                    {selectedDeck.description || t('challenges.no_deck_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setStudyDeck(selectedDeck)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-xs font-semibold rounded-[5px] transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <FiPlay className="w-3.5 h-3.5" />
                  <span>{t('vocab.study_this_deck')}</span>
                </button>

                <div className="relative w-full sm:w-60">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777168]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('vocab.search_cards_placeholder')}
                    className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] text-[#25231F] placeholder-[#777168] focus:outline-none focus:border-[#79542E]"
                  />
                </div>
              </div>
            </div>

            {loadingCards ? (
              <div className="py-16 text-center text-[#777168] text-xs">
                {t('vocab.loading_cards')}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="bg-[#FFFDF8] border border-dashed border-[#DED8CC] rounded-[5px] p-12 text-center">
                <FiLayers className="w-8 h-8 text-[#A67C52] mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-bold text-[#25231F]">{t('vocab.empty_cards_title')}</h3>
                <p className="text-xs text-[#777168] mt-1 max-w-sm mx-auto">
                  {t('vocab.empty_cards_desc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredCards.map((card) => {
                  const word = card.word || card.vocabulary?.word || '';
                  const phonetic = card.phonetic || card.vocabulary?.phonetic || '';
                  const definition = card.definition || card.vocabulary?.definition || '';
                  const sourceLang = card.sourceLanguage || card.vocabulary?.sourceLanguage || 'en';
                  const vocab = { word, phonetic, definition, sourceLanguage: sourceLang };
                  return (
                    <div
                      key={card.id}
                      className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-4 hover:border-[#A67C52] transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#25231F]">
                              {vocab.word}
                            </span>
                            {vocab.phonetic && (
                              <span className="text-xs text-[#A67C52] font-serif bg-[#F4EDE1] px-1.5 py-0.5 rounded-[3px]">
                                {vocab.phonetic}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => speakWord(vocab.word, vocab.sourceLanguage)}
                            className="p-1.5 text-[#777168] hover:text-[#79542E] hover:bg-[#F4EDE1] rounded-[4px] transition-colors cursor-pointer"
                            title={t('vocab.listen_tooltip')}
                          >
                            <FiVolume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-2.5 text-xs text-[#25231F] font-medium leading-relaxed">
                          {vocab.definition || t('vocab.no_definition')}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F4EDE1] flex items-center justify-between text-[11px] text-[#777168]">
                        <span className="inline-flex items-center gap-1 font-mono uppercase text-[10px] px-1.5 py-0.5 bg-[#FAF6EE] border border-[#DED8CC] rounded-[3px]">
                          {card.status || t('vocab.status_new')}
                        </span>
                        <span>
                          {card.nextReviewDate ? t('vocab.next_review', { date: card.nextReviewDate }) : t('vocab.not_reviewed')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'decks' ? (
          <div>
            {loadingDecks ? (
              <div className="py-16 text-center text-[#777168] text-xs">
                {t('vocab.loading_decks')}
              </div>
            ) : filteredDecks.length === 0 ? (
              <div className="bg-[#FFFDF8] border border-dashed border-[#DED8CC] rounded-[5px] p-12 text-center">
                <FiFolder className="w-8 h-8 text-[#A67C52] mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-bold text-[#25231F]">{t('vocab.empty_decks_title')}</h3>
                <p className="text-xs text-[#777168] mt-1 mb-4">
                  {t('vocab.empty_decks_desc')}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#79542E] text-[#FFFDF8] text-xs font-semibold rounded-[5px] hover:bg-[#634322] cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>{t('vocab.create_deck_btn')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => handleSelectDeck(deck)}
                    className="group bg-[#FFFDF8] border border-[#DED8CC] hover:border-[#A67C52] hover:shadow-sm rounded-[5px] p-5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#F4EDE1] text-[#79542E] rounded-[5px] group-hover:bg-[#79542E] group-hover:text-[#FFFDF8] transition-colors">
                            <FiFolder className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#25231F] group-hover:text-[#79542E] transition-colors">
                              {deck.name}
                            </h3>
                            <span className="text-[11px] text-[#777168]">
                              {deck.flashCardCount || 0} {t('vocab.cards_unit')}
                            </span>
                          </div>
                        </div>

                        {deck.name !== 'My Vocabulary' && (
                          <button
                            onClick={(e) => handleDeleteDeck(deck.id, e)}
                            className="p-1.5 text-[#777168] hover:text-red-600 hover:bg-red-50 rounded-[4px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title={t('vocab.delete_deck_tooltip')}
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-[#777168] mt-3 line-clamp-2 leading-relaxed">
                        {deck.description || t('vocab.personal_deck_desc')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F4EDE1] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#777168] text-[11px]">
                          {t('vocab.due_label')}
                        </span>
                        <span className={`font-semibold px-2 py-0.5 rounded-[3px] text-[11px] ${(deck.dueCount || 0) > 0
                          ? 'bg-[#F4EDE1] text-[#79542E] border border-[#DED8CC]'
                          : 'bg-[#FAF6EE] text-[#777168]'
                          }`}>
                          {deck.dueCount || 0} {t('vocab.words_unit')}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudyDeck(deck);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] text-[11px] font-semibold rounded-[4px] transition-colors cursor-pointer shadow-xs"
                      >
                        <FiPlay className="w-3 h-3" />
                        <span>{t('vocab.study_btn')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingWords ? (
              <div className="py-16 text-center text-[#777168] text-xs">
                {t('vocab.loading_words')}
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="bg-[#FFFDF8] border border-dashed border-[#DED8CC] rounded-[5px] p-12 text-center">
                <MdOutlineTranslate className="w-8 h-8 text-[#A67C52] mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-bold text-[#25231F]">{t('vocab.empty_words_title')}</h3>
                <p className="text-xs text-[#777168] mt-1">
                  {t('vocab.empty_words_desc')}
                </p>
              </div>
            ) : (
              <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] divide-y divide-[#F4EDE1] shadow-xs overflow-hidden">
                {filteredWords.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-[#FAF6EE] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => speakWord(item.word, item.sourceLanguage)}
                        className="p-2 mt-0.5 text-[#777168] hover:text-[#79542E] hover:bg-[#F4EDE1] rounded-[4px] transition-colors cursor-pointer"
                        title={t('vocab.listen_tooltip')}
                      >
                        <FiVolume2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#25231F]">
                            {item.word}
                          </span>
                          {item.phonetic && (
                            <span className="text-xs text-[#A67C52] font-serif bg-[#F4EDE1] px-1.5 py-0.2 rounded-[3px]">
                              {item.phonetic}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#FAF6EE] border border-[#DED8CC] text-[#777168] rounded-[3px]">
                            {item.sourceLanguage || 'en'} → {item.targetLanguage || 'vi'}
                          </span>
                        </div>
                        <div className="text-xs text-[#555048] font-medium mt-1">
                          {item.definition}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#777168] flex items-center gap-1.5 sm:self-center shrink-0">
                      <FiClock className="w-3 h-3 text-[#A67C52]" />
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#333028]/40 backdrop-blur-xs">
            <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] w-full max-w-md p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#DED8CC]">
                <h3 className="text-base font-bold text-[#25231F]">
                  {t('vocab.create_modal_title')}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-[#777168] hover:text-[#25231F] rounded-[4px] cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDeck} className="mt-4 space-y-4">
                {createError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[5px] flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#25231F] mb-1">
                    {t('vocab.deck_name_label')}
                  </label>
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder={t('vocab.deck_name_placeholder')}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EE] border border-[#DED8CC] rounded-[5px] text-[#25231F] placeholder-[#777168] focus:outline-none focus:border-[#79542E]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25231F] mb-1">
                    {t('vocab.deck_desc_label')}
                  </label>
                  <textarea
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                    placeholder={t('vocab.deck_desc_placeholder')}
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EE] border border-[#DED8CC] rounded-[5px] text-[#25231F] placeholder-[#777168] focus:outline-none focus:border-[#79542E] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-1.5 text-xs text-[#555048] hover:text-[#25231F] bg-[#FAF6EE] hover:bg-[#F4EDE1] border border-[#DED8CC] rounded-[5px] transition-colors cursor-pointer"
                  >
                    {t('vocab.cancel_btn')}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingDeck}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#79542E] hover:bg-[#634322] text-[#FFFDF8] rounded-[5px] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {creatingDeck ? t('vocab.creating_btn') : t('vocab.create_btn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {studyDeck && (
          <FlashcardStudyModal
            isOpen={!!studyDeck}
            deckId={studyDeck.id}
            deckName={studyDeck.name}
            onClose={() => setStudyDeck(null)}
            onSessionComplete={() => {
              fetchDecks();
              if (selectedDeck) {
                fetchDeckCards(selectedDeck.id);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VocabularyPage;
