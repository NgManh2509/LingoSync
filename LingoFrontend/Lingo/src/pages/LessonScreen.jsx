import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiMaximize, 
  FiSearch, 
  FiBookmark, 
  FiDownload, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiClock, 
  FiBookOpen,
  FiPlus,
  FiCheck,
  FiX,
  FiLink,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';
import apiClient from '../api/apiClient';

const LessonScreen = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [selectedWord, setSelectedWord] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [isSavingWord, setIsSavingWord] = useState(false);
  const [wordSaved, setWordSaved] = useState(false);
  const [subtitlesMode, setSubtitlesMode] = useState('dual');

  const transcriptScrollRef = useRef(null);
  const activeLineRef = useRef(null);

  const parseTime = (timeVal) => {
    if (timeVal === null || timeVal === undefined) return 0;
    if (typeof timeVal === 'number') return timeVal;
    const str = String(timeVal).trim().replace(',', '.');
    if (!isNaN(Number(str))) return Number(str);
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const fetchVideoDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/videos/${id}`);
      if (res.data) {
        let realTitle = res.data.title;
        if (!realTitle || realTitle.startsWith('YouTube Lesson (')) {
          try {
            const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${res.data.youtubeId}`);
            if (noembedRes.ok) {
              const noembedJson = await noembedRes.json();
              if (noembedJson.title) {
                realTitle = noembedJson.title;
              }
            }
          } catch {}
        }

        let rawSubtitles = res.data.subtitles || [];
        if (rawSubtitles.length === 0 && res.data.scriptUrl) {
          try {
            const scriptRes = await fetch(res.data.scriptUrl);
            if (scriptRes.ok) {
              const scriptJson = await scriptRes.json();
              if (Array.isArray(scriptJson)) {
                rawSubtitles = scriptJson;
              }
            }
          } catch {}
        }

        const formattedSubtitles = rawSubtitles.map((s, idx) => {
          const rawTime = s.start !== undefined ? s.start : (s.time || s.timestamp || "00:00");
          const secs = parseTime(rawTime);
          return {
            id: idx + 1,
            time: typeof rawTime === 'number' ? formatTime(rawTime) : String(rawTime),
            seconds: secs,
            text: s.text || "",
            translated: s.translated || ""
          };
        }).sort((a, b) => a.seconds - b.seconds);

        setVideoData({
          ...res.data,
          title: realTitle,
          formattedSubtitles
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin bài học.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get('/api/videos/history');
      if (res.data && Array.isArray(res.data)) {
        const enriched = res.data.map(item => {
          const thumb = item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : null);
          return {
            ...item,
            thumbnailUrl: thumb
          };
        });
        setHistoryList(enriched);
      }
    } catch {
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  useEffect(() => {
    if (videoId && isValidUUID(videoId)) {
      fetchVideoDetail(videoId);
    } else {
      fetchHistory();
      setLoading(false);
    }
  }, [videoId]);

  const handleProcessVideo = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await apiClient.post('/api/videos/process', {
        youtubeUrl: importUrl.trim(),
        targetLanguage: 'vi',
        originalLanguage: 'en'
      });
      if (res.data?.id) {
        setImportUrl('');
        navigate(`/lessons/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xử lý video thất bại. Vui lòng thử lại với URL YouTube khác.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (player && isPlaying && videoData?.formattedSubtitles?.length > 0) {
      interval = setInterval(async () => {
        try {
          const time = await player.getCurrentTime();
          const dur = await player.getDuration();
          setCurrentTime(time);
          if (dur) setDuration(dur);

          const subs = videoData.formattedSubtitles;
          let foundIdx = -1;
          for (let i = 0; i < subs.length; i++) {
            const nextSub = subs[i + 1];
            if (time >= subs[i].seconds && (!nextSub || time < nextSub.seconds)) {
              foundIdx = i;
              break;
            }
          }
          if (foundIdx === -1 && time >= (subs[subs.length - 1]?.seconds || 0)) {
            foundIdx = subs.length - 1;
          }
          if (foundIdx !== -1 && foundIdx !== activeSubtitleIndex) {
            setActiveSubtitleIndex(foundIdx);
          }
        } catch {}
      }, 250);
    }
    return () => clearInterval(interval);
  }, [player, isPlaying, videoData, activeSubtitleIndex]);

  useEffect(() => {
    if (activeLineRef.current && transcriptScrollRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeSubtitleIndex]);

  const disableNativeCaptions = (ytPlayer) => {
    if (!ytPlayer) return;
    try {
      if (typeof ytPlayer.unloadModule === 'function') {
        ytPlayer.unloadModule('captions');
        ytPlayer.unloadModule('cc');
      }
      if (typeof ytPlayer.setOption === 'function') {
        ytPlayer.setOption('captions', 'track', {});
        ytPlayer.setOption('cc', 'track', {});
      }
    } catch {}
  };

  const onPlayerReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration() || 0);
    disableNativeCaptions(event.target);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
      disableNativeCaptions(event.target);
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false);
      if (videoId && currentTime > 0) {
        apiClient.post(`/api/videos/${videoId}/history`, {
          lastPositionSeconds: Math.floor(currentTime),
          completed: event.data === 0
        }).catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!player || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleSubtitleClick = (seconds, index) => {
    if (player) {
      player.seekTo(seconds, true);
      player.playVideo();
      setIsPlaying(true);
    }
    setActiveSubtitleIndex(index);
  };

  const cyclePlaybackRate = () => {
    if (!player) return;
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    player.setPlaybackRate(nextRate);
    setPlaybackRate(nextRate);
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.querySelector('#youtube-player-frame iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      }
    }
  };

  const handleWordClick = (e, word, fullSentence) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[^a-zA-Z0-9'-]/g, '');
    if (!cleanWord) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      x: Math.min(rect.left, window.innerWidth - 300),
      y: rect.bottom + window.scrollY + 8
    });

    setSelectedWord({
      word: cleanWord,
      context: fullSentence,
      meaning: "Từ vựng trong câu: " + fullSentence
    });
    setWordSaved(false);
  };

  const handleSaveWord = async () => {
    if (!selectedWord || isSavingWord || wordSaved) return;
    setIsSavingWord(true);
    try {
      await apiClient.post('/api/vocabulary', {
        word: selectedWord.word,
        contextSentence: selectedWord.context,
        translation: selectedWord.meaning
      });
      setWordSaved(true);
    } catch {
      setWordSaved(true);
    } finally {
      setIsSavingWord(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] text-[#25231F] font-['Plus_Jakarta_Sans',sans-serif] -m-6 sm:-m-8 p-6 sm:p-10">
        <div className="max-w-[1120px] mx-auto w-full space-y-8">
          
          <header>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#25231F] tracking-tight">
              Lessons & Video Library
            </h1>
            <p className="text-xs sm:text-[13px] text-[#777168] mt-1">
              Học tiếng Anh qua video phụ đề song ngữ đồng bộ thời gian thực
            </p>
          </header>

          <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#25231F] mb-1 flex items-center gap-2">
              <FiLink className="w-4 h-4 text-[#A67C52]" />
              <span>Thêm video bài học từ YouTube</span>
            </h2>
            <p className="text-xs text-[#777168] mb-4">
              Dán liên kết video YouTube bất kỳ để hệ thống tạo phụ đề song ngữ
            </p>

            <form onSubmit={handleProcessVideo} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 text-xs bg-[#FFF9ED] border border-[#DED8CC] rounded-[5px] px-3.5 py-2.5 text-[#25231F] placeholder-[#777168]/60 focus:outline-none focus:bg-[#FFFDF8] focus:border-[#A67C52] transition-colors"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[5px] bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <FiLoader className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Tạo bài học</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-[5px] p-2.5">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#25231F]">Bài học gần đây</h2>
              <span className="text-xs text-[#777168]">{historyList.length} bài học</span>
            </div>

            {loadingHistory ? (
              <div className="py-12 text-center text-[#777168] flex items-center justify-center gap-2 text-xs">
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Đang tải danh sách bài học...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-8 text-center">
                <FiBookOpen className="w-8 h-8 text-[#A67C52] mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-bold text-[#25231F] mb-1">Chưa có bài học nào</h3>
                <p className="text-xs text-[#777168]">Hãy dán liên kết YouTube ở trên để bắt đầu bài học đầu tiên của bạn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyList.map((item) => {
                  const thumbSrc = item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : null);
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/lessons/${item.videoId}`)}
                      className="bg-[#FFFDF8] border border-[#DED8CC] hover:border-[#A67C52] rounded-[5px] overflow-hidden group cursor-pointer transition-all shadow-xs"
                    >
                      <div className="aspect-video bg-[#25231F] relative overflow-hidden flex items-center justify-center">
                        {thumbSrc ? (
                          <img 
                            src={thumbSrc} 
                            alt={item.title || 'Video Thumbnail'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#A67C52]">
                            <FiPlay className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      </div>

                      <div className="p-4">
                        <h3 className="text-xs font-bold text-[#25231F] line-clamp-2 mb-2 group-hover:text-[#79542E] transition-colors">
                          {item.title || 'Video bài học'}
                        </h3>
                        
                        <div className="flex items-center justify-between text-[11px] text-[#777168]">
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-[#A67C52]" />
                            {item.durationSeconds ? formatTime(item.durationSeconds) : '--:--'}
                          </span>
                          <span className="font-medium text-[#79542E]">Học tiếp →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center text-[#777168] gap-2 text-xs font-medium">
        <FiLoader className="w-4 h-4 animate-spin text-[#A67C52]" />
        <span>Đang tải nội dung bài học...</span>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] text-[#25231F] p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-8 max-w-md w-full shadow-xs">
          <FiAlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold mb-1">Không tìm thấy bài học</h2>
          <p className="text-xs text-[#777168] mb-5">{error || 'Video không tồn tại hoặc đã bị xóa.'}</p>
          <button
            onClick={() => navigate('/lessons')}
            className="w-full py-2 px-4 rounded-[5px] bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Quay lại danh sách bài học
          </button>
        </div>
      </div>
    );
  }

  const subtitlesList = videoData.formattedSubtitles || [];
  const filteredSubtitles = subtitlesList.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.translated.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cycleSubtitleMode = () => {
    const modes = ['dual', 'original', 'translated', 'off'];
    const nextIdx = (modes.indexOf(subtitlesMode) + 1) % modes.length;
    setSubtitlesMode(modes[nextIdx]);
  };

  const activeSubtitle = activeSubtitleIndex >= 0 && activeSubtitleIndex < subtitlesList.length 
    ? subtitlesList[activeSubtitleIndex] 
    : null;

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#25231F] font-['Plus_Jakarta_Sans',sans-serif] -m-6 sm:-m-8 p-6 sm:p-10 select-none">
      <div className="max-w-[1120px] mx-auto w-full">
        
        <header className="mb-6">
          <button
            onClick={() => navigate('/lessons')}
            className="inline-flex items-center gap-1.5 text-xs text-[#777168] hover:text-[#25231F] mb-3 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Tất cả bài học</span>
          </button>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#25231F] tracking-tight leading-tight">
            {videoData.title || 'Video Lesson'}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
          
          <div className="lg:col-span-8 bg-[#181715] rounded-[5px] overflow-hidden relative flex flex-col border border-[#333028] shadow-sm">
            <div id="youtube-player-frame" className="relative w-full aspect-video flex items-center justify-center bg-black overflow-hidden">
              <YouTube
                videoId={videoData.youtubeId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                    disablekb: 1,
                    iv_load_policy: 3,
                    cc_load_policy: 0
                  }
                }}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                className="w-full h-full absolute inset-0"
              />

              {!isPlaying && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer group"
                >
                  <button className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 text-white group-hover:scale-105 group-hover:bg-white/25 transition-all shadow-lg">
                    <FiPlay className="w-6 h-6 ml-1 fill-white" />
                  </button>
                </div>
              )}

              {activeSubtitle && subtitlesMode !== 'off' && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[86%] max-w-2xl text-center pointer-events-auto z-20 transition-all duration-200">
                  <div className="inline-block bg-black/85 backdrop-blur-md px-4 py-2 sm:py-2.5 rounded-[5px] border border-white/15 shadow-2xl max-w-full">
                    {(subtitlesMode === 'dual' || subtitlesMode === 'original') && (
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-white tracking-wide leading-relaxed">
                        {activeSubtitle.text.split(' ').map((word, wIdx) => (
                          <span
                            key={wIdx}
                            onClick={(e) => handleWordClick(e, word, activeSubtitle.text)}
                            className="hover:text-[#E8C59A] hover:underline cursor-pointer transition-colors px-0.5 inline-block"
                          >
                            {word}{' '}
                          </span>
                        ))}
                      </p>
                    )}
                    {(subtitlesMode === 'dual' || subtitlesMode === 'translated') && activeSubtitle.translated && (
                      <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#F4EDE1]/90 mt-1 leading-snug">
                        {activeSubtitle.translated}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-12 bg-gradient-to-t from-black/90 to-black/40 px-4 flex items-center justify-between text-white/90 text-xs font-medium border-t border-white/5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <FiPause className="w-4 h-4 fill-white" /> : <FiPlay className="w-4 h-4 fill-white" />}
                </button>
                <span className="font-mono text-[11px] text-white/70">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div 
                onClick={handleSeek}
                className="flex-1 mx-4 sm:mx-6 h-1.5 bg-white/20 rounded-[5px] relative overflow-hidden group cursor-pointer"
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-[#A67C52] transition-all"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <button 
                  onClick={cycleSubtitleMode}
                  title={`Chế độ phụ đề: ${
                    subtitlesMode === 'dual' ? 'Song ngữ (Bilingual)' :
                    subtitlesMode === 'original' ? 'Chỉ tiếng gốc' :
                    subtitlesMode === 'translated' ? 'Chỉ bản dịch' : 'Tắt phụ đề'
                  }`}
                  className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    subtitlesMode !== 'off'
                      ? 'bg-[#A67C52] text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white/50'
                  }`}
                >
                  CC {subtitlesMode === 'dual' ? 'Dual' : subtitlesMode === 'original' ? 'Orig' : subtitlesMode === 'translated' ? 'Trans' : 'Off'}
                </button>
                <button 
                  onClick={cyclePlaybackRate}
                  className="px-1.5 py-0.5 rounded-[3px] bg-white/10 hover:bg-white/20 text-[11px] font-mono text-white transition-colors cursor-pointer"
                >
                  {playbackRate}x
                </button>
                <button 
                  onClick={toggleMute}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={toggleFullscreen}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                >
                  <FiMaximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#FFFDF8] rounded-[5px] border border-[#DED8CC] flex flex-col h-[380px] lg:h-[460px] shadow-xs">
            <div className="p-3.5 border-b border-[#DED8CC] flex justify-between items-center bg-[#F4EDE1] rounded-t-[5px]">
              <div className="flex items-center gap-2">
                <FiBookOpen className="w-4 h-4 text-[#79542E]" />
                <h3 className="text-xs font-bold text-[#25231F] uppercase tracking-wider">
                  Transcript ({subtitlesList.length})
                </h3>
              </div>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                  showSearch ? 'bg-[#DED8CC] text-[#25231F]' : 'text-[#777168] hover:text-[#25231F] hover:bg-white/60'
                }`}
                title="Search transcript"
              >
                <FiSearch className="w-3.5 h-3.5" />
              </button>
            </div>

            {showSearch && (
              <div className="p-2 border-b border-[#DED8CC] bg-[#FFFDF8]">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm từ khóa trong phụ đề..."
                    className="w-full text-xs bg-white border border-[#DED8CC] rounded-[4px] py-1.5 pl-7 pr-3 text-[#25231F] placeholder-[#777168]/70 focus:outline-none focus:border-[#A67C52]"
                  />
                  <FiSearch className="w-3.5 h-3.5 absolute left-2 top-2 text-[#777168]" />
                </div>
              </div>
            )}

            <div 
              ref={transcriptScrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-[#F4EDE1]"
            >
              {filteredSubtitles.length === 0 ? (
                <div className="py-12 text-center text-[#777168] text-xs">
                  Không tìm thấy phụ đề nào.
                </div>
              ) : (
                filteredSubtitles.map((item, index) => {
                  const isActive = index === activeSubtitleIndex;
                  return (
                    <div
                      key={item.id}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => handleSubtitleClick(item.seconds, index)}
                      className={`pt-3 first:pt-0 flex gap-3 transition-all rounded-[4px] p-2 -mx-1 cursor-pointer ${
                        isActive 
                          ? 'bg-[#F4EDE1]/80 relative pl-3' 
                          : 'hover:bg-[#FAF6EE]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#A67C52] rounded-r-[2px]" />
                      )}

                      <span className={`font-mono text-[11px] mt-0.5 w-9 shrink-0 font-medium ${
                        isActive ? 'text-[#A67C52] font-bold' : 'text-[#777168]'
                      }`}>
                        {item.time}
                      </span>

                      <div className="flex-1 space-y-1">
                        <p className={`text-[13px] leading-relaxed ${
                          isActive ? 'text-[#25231F] font-semibold' : 'text-[#50453B]'
                        }`}>
                          {item.text.split(' ').map((w, wIdx) => (
                            <span
                              key={wIdx}
                              onClick={(e) => handleWordClick(e, w, item.text)}
                              className="hover:bg-[#EBDCCB] hover:text-[#79542E] rounded-[2px] px-0.5 py-0.2 transition-colors inline-block"
                            >
                              {w}{' '}
                            </span>
                          ))}
                        </p>

                        {item.translated && (
                          <p className="text-[11px] text-[#777168] italic leading-normal">
                            {item.translated}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-[#DED8CC]">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#25231F] mb-3">
              {videoData.title || 'Video Lesson'}
            </h2>

            <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#777168]">
              <div className="flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-[#A67C52]" />
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiBookOpen className="w-3.5 h-3.5 text-[#A67C52]" />
                <span>{subtitlesList.length} câu phụ đề</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 border rounded-[5px] text-xs font-semibold transition-colors cursor-pointer min-h-[38px] ${
                isBookmarked 
                  ? 'bg-[#EFE9DD] border-[#A67C52] text-[#79542E]' 
                  : 'border-[#DED8CC] bg-[#FFFDF8] text-[#25231F] hover:bg-[#EFE9DD]'
              }`}
            >
              <FiBookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#79542E]' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button 
              onClick={() => setIsCompleted(!isCompleted)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-[5px] text-xs font-semibold text-white transition-colors cursor-pointer min-h-[38px] ${
                isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#A67C52] hover:bg-[#79542E]'
              }`}
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed' : 'Mark as Completed'}</span>
            </button>
          </div>
        </div>

      </div>

      {selectedWord && (
        <div
          style={{ top: `${popoverPos.y}px`, left: `${popoverPos.x}px` }}
          className="fixed z-50 w-72 bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between border-b border-[#DED8CC]/60 pb-2 mb-2.5">
            <div>
              <span className="text-sm font-bold text-[#25231F]">{selectedWord.word}</span>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              className="text-[#777168] hover:text-[#25231F] p-1 cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 mb-3 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#777168] tracking-wider mb-0.5">Ngữ cảnh câu</p>
              <p className="text-[#25231F] font-medium leading-snug italic text-[11px]">{selectedWord.context}</p>
            </div>
          </div>

          <button
            onClick={handleSaveWord}
            disabled={wordSaved || isSavingWord}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
              wordSaved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-[#A67C52] hover:bg-[#79542E] text-white'
            }`}
          >
            {wordSaved ? (
              <>
                <FiCheck className="w-3.5 h-3.5" />
                <span>Đã lưu vào từ vựng</span>
              </>
            ) : (
              <>
                <FiPlus className="w-3.5 h-3.5" />
                <span>{isSavingWord ? 'Đang lưu...' : 'Lưu vào sổ từ vựng'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonScreen;
