import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlayCircle, 
  FiX, 
  FiPlus, 
  FiLoader, 
  FiAlertCircle, 
  FiPlay, 
  FiCheck
} from 'react-icons/fi';
import apiClient from '../../api/apiClient';

const CreateVideoModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [extractedId, setExtractedId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [channelName, setChannelName] = useState('');

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const id = extractYoutubeId(youtubeUrl);
    setExtractedId(id);
    setError(null);
    if (id) {
      fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.title) setPreviewTitle(data.title);
          if (data.author_name) setChannelName(data.author_name);
        })
        .catch(() => {});
    } else {
      setPreviewTitle('');
      setChannelName('');
    }
  }, [youtubeUrl]);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/api/playlists')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setPlaylists(res.data);
          }
        })
        .catch(() => setPlaylists([]));
    }
  }, [isOpen]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setYoutubeUrl(text);
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !extractedId) {
      setError('Vui lòng nhập đường dẫn video YouTube hợp lệ.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const res = await apiClient.post('/api/videos/process', {
        youtubeUrl: youtubeUrl.trim(),
        targetLanguage: targetLanguage,
        originalLanguage: 'en'
      });

      if (res.data?.id) {
        if (selectedPlaylist) {
          await apiClient.post(`/api/playlists/${selectedPlaylist}/videos/${res.data.id}`).catch(() => {});
        }
        onClose();
        setYoutubeUrl('');
        navigate(`/lessons/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xử lý video. Vui lòng kiểm tra lại URL hoặc kết nối API.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#333028]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-[5px] border border-[#DED8CC] shadow-[0_4px_20px_rgba(37,35,31,0.08)] z-50 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-150">
        
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-[#DED8CC] flex items-start justify-between bg-[#F4EDE1]">
          <div>
            <span className="block text-[11px] font-bold text-[#777168] uppercase tracking-wider mb-1">
              Video Source
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#25231F] tracking-tight">
              Add YouTube Video
            </h2>
            <p className="text-xs text-[#777168] mt-1">
              Dán liên kết video YouTube để hệ thống tự động bóc tách phụ đề và dịch song ngữ
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-[#777168] hover:text-[#25231F] hover:bg-white/60 transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-6 sm:px-8 py-6 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#25231F]" htmlFor="youtube-url">
                YouTube URL
              </label>
              <div className="relative flex items-center">
                <FiPlayCircle className="absolute left-3.5 text-[#82756A] w-4 h-4" />
                <input
                  id="youtube-url"
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#FFF9ED] border border-[#DED8CC] rounded-[5px] pl-10 pr-20 py-2.5 text-xs text-[#25231F] placeholder-[#82756A]/60 focus:outline-none focus:border-[#A67C52] focus:ring-1 focus:ring-[#A67C52] transition-all"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#EFE9DD] hover:bg-[#E8E2D6] border border-[#DED8CC] text-[#25231F] px-3 py-1 rounded-[3px] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Paste
                </button>
              </div>
            </div>

            {extractedId && (
              <div className="flex flex-col gap-3 p-3.5 rounded-[5px] bg-[#F4EDE1]/60 border border-[#DED8CC] animate-in fade-in duration-200">
                <div className="relative w-full aspect-video rounded-[4px] overflow-hidden border border-[#DED8CC] group bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`}
                    alt="Video preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center shadow-md">
                      <FiPlay className="w-5 h-5 fill-[#79542E] text-[#79542E] ml-0.5" />
                    </div>
                  </div>
                </div>

                {previewTitle && (
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-bold text-[#25231F] line-clamp-1">{previewTitle}</h4>
                    {channelName && <p className="text-[11px] text-[#777168]">{channelName}</p>}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#777168]">
                  <span>Source: youtube.com/watch?v={extractedId}</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <FiCheck className="w-3 h-3" /> URL hợp lệ
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#25231F]" htmlFor="target-lang">
                  Ngôn ngữ dịch phụ đề
                </label>
                <select
                  id="target-lang"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full bg-[#FFF9ED] border border-[#DED8CC] rounded-[5px] px-3 py-2 text-xs text-[#25231F] focus:outline-none focus:border-[#A67C52]"
                >
                  <option value="vi">Tiếng Việt (Vietnamese)</option>
                  <option value="en">Tiếng Anh (English)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#25231F]" htmlFor="lesson-select">
                  Thêm vào Playlist (Tùy chọn)
                </label>
                <select
                  id="lesson-select"
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="w-full bg-[#FFF9ED] border border-[#DED8CC] rounded-[5px] px-3 py-2 text-xs text-[#25231F] focus:outline-none focus:border-[#A67C52]"
                >
                  <option value="">-- Lưu vào Thư viện chung --</option>
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-[5px] p-3">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </div>

          <div className="px-6 sm:px-8 py-4 border-t border-[#DED8CC] bg-[#F4EDE1] flex items-center justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-[#50453B] hover:text-[#25231F] transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing || !extractedId}
              className="flex items-center gap-2 bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold px-5 py-2 rounded-[5px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isProcessing ? (
                <>
                  <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang bóc tách & dịch...</span>
                </>
              ) : (
                <>
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Add Video</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateVideoModal;
