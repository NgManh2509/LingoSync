import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiPlus, 
  FiTrash2, 
  FiClock, 
  FiFolder, 
  FiPlay, 
  FiLoader, 
  FiArrowLeft, 
  FiX,
  FiAlertCircle
} from 'react-icons/fi';
import { MdOutlineQueueMusic } from 'react-icons/md';
import apiClient from '../api/apiClient';

const PlaylistsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activePlaylistId = searchParams.get('id');

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylistDetail, setSelectedPlaylistDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/playlists');
      if (res.data && Array.isArray(res.data)) {
        setPlaylists(res.data);
      }
    } catch {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(`/api/playlists/${id}`);
      setSelectedPlaylistDetail(res.data);
    } catch {
      setSelectedPlaylistDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (activePlaylistId) {
      fetchPlaylistDetail(activePlaylistId);
    } else {
      setSelectedPlaylistDetail(null);
    }
  }, [activePlaylistId]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiClient.post('/api/playlists', {
        name: newName.trim(),
        description: newDesc.trim()
      });
      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
      await fetchPlaylists();
      if (res.data?.id) {
        setSearchParams({ id: res.data.id });
      }
    } catch (err) {
      setError(err.response?.data?.message || t('playlists.error_create'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (id, name) => {
    if (!window.confirm(t('playlists.confirm_delete', { name }))) return;
    try {
      await apiClient.delete(`/api/playlists/${id}`);
      if (activePlaylistId === id) {
        setSearchParams({});
      }
      fetchPlaylists();
    } catch (err) {
      alert(err.response?.data?.message || t('playlists.error_delete'));
    }
  };

  const handleRemoveVideo = async (playlistId, videoId) => {
    try {
      await apiClient.delete(`/api/playlists/${playlistId}/videos/${videoId}`);
      fetchPlaylistDetail(playlistId);
      fetchPlaylists();
    } catch (err) {
      alert(err.response?.data?.message || t('playlists.error_remove'));
    }
  };

  const formatSeconds = (totalSeconds) => {
    if (!totalSeconds) return '--:--';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 text-[#25231F]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED8CC] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A67C52] uppercase tracking-wider mb-1">
            <MdOutlineQueueMusic className="w-4 h-4" />
            <span>{t('playlists.library_badge')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#25231F]">
            {selectedPlaylistDetail ? selectedPlaylistDetail.name : t('playlists.your_playlists')}
          </h1>
          <p className="text-xs text-[#777168] mt-1">
            {selectedPlaylistDetail 
              ? (selectedPlaylistDetail.description || t('playlists.manage_desc')) 
              : t('playlists.personalized_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedPlaylistDetail ? (
            <>
              <button
                onClick={() => setSearchParams({})}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] border border-[#DED8CC] bg-[#FFFDF8] hover:bg-[#F4EDE1] text-xs font-semibold text-[#555048] transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>{t('playlists.all_playlists')}</span>
              </button>
              <button
                onClick={() => handleDeletePlaylist(selectedPlaylistDetail.id, selectedPlaylistDetail.name)}
                className="p-2 rounded-[5px] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                title={t('playlists.delete_tooltip')}
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[5px] bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FiPlus className="w-4 h-4" />
              <span>{t('playlists.create_new')}</span>
            </button>
          )}
        </div>
      </div>

      {activePlaylistId && selectedPlaylistDetail ? (
        <div>
          {loadingDetail ? (
            <div className="py-16 text-center text-[#777168] flex items-center justify-center gap-2 text-xs">
              <FiLoader className="w-4 h-4 animate-spin text-[#A67C52]" />
              <span>{t('playlists.loading_videos')}</span>
            </div>
          ) : selectedPlaylistDetail.videos?.length === 0 ? (
            <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-12 text-center">
              <MdOutlineQueueMusic className="w-10 h-10 text-[#A67C52] mx-auto mb-2 opacity-70" />
              <h3 className="text-sm font-bold text-[#25231F] mb-1">{t('playlists.empty_videos_title')}</h3>
              <p className="text-xs text-[#777168] max-w-md mx-auto mb-4">
                {t('playlists.empty_videos_desc')}
              </p>
              <button
                onClick={() => navigate('/lessons')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF6EE] hover:bg-[#F4EDE1] border border-[#DED8CC] rounded-[5px] text-xs font-semibold text-[#79542E] transition-colors cursor-pointer"
              >
                <span>{t('playlists.browse_lessons')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlaylistDetail.videos.map((item, index) => {
                const thumbSrc = item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : null);
                return (
                  <div
                    key={item.videoId || item.id || `video-${index}`}
                    className="bg-[#FFFDF8] border border-[#DED8CC] hover:border-[#A67C52] rounded-[5px] overflow-hidden group transition-all shadow-xs flex flex-col"
                  >
                    <div 
                      onClick={() => navigate(`/lessons/${item.videoId}`)}
                      className="aspect-video bg-[#25231F] relative overflow-hidden flex items-center justify-center cursor-pointer"
                    >
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <FiPlay className="w-8 h-8 text-[#A67C52]" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 
                          onClick={() => navigate(`/lessons/${item.videoId}`)}
                          className="text-xs font-bold text-[#25231F] line-clamp-2 mb-2 group-hover:text-[#79542E] transition-colors cursor-pointer"
                        >
                          {item.title || t('playlists.lesson_video')}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#DED8CC]/60 mt-3 text-[11px] text-[#777168]">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-[#A67C52]" />
                          {formatSeconds(item.durationSeconds)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveVideo(selectedPlaylistDetail.id, item.videoId)}
                            className="p-1 text-[#777168] hover:text-rose-700 transition-colors cursor-pointer"
                            title={t('playlists.remove_tooltip')}
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/lessons/${item.videoId}`)}
                            className="font-medium text-[#79542E] hover:underline cursor-pointer"
                          >
                            {t('playlists.study_now')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="py-16 text-center text-[#777168] flex items-center justify-center gap-2 text-xs">
              <FiLoader className="w-4 h-4 animate-spin text-[#A67C52]" />
              <span>{t('playlists.loading_playlists')}</span>
            </div>
          ) : playlists.length === 0 ? (
            <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-12 text-center">
              <FiFolder className="w-10 h-10 text-[#A67C52] mx-auto mb-2 opacity-70" />
              <h3 className="text-sm font-bold text-[#25231F] mb-1">{t('playlists.empty_playlists_title')}</h3>
              <p className="text-xs text-[#777168] max-w-md mx-auto mb-4">
                {t('playlists.empty_playlists_desc')}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A67C52] hover:bg-[#79542E] text-white rounded-[5px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>{t('playlists.create_btn')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((pl, index) => (
                <div
                  key={pl.id || `pl-${index}`}
                  onClick={() => setSearchParams({ id: pl.id })}
                  className="bg-[#FFFDF8] border border-[#DED8CC] hover:border-[#A67C52] rounded-[5px] p-5 cursor-pointer transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-[4px] bg-[#FAF6EE] border border-[#DED8CC] flex items-center justify-center text-[#A67C52]">
                        <MdOutlineQueueMusic className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold bg-[#FAF6EE] text-[#79542E] border border-[#DED8CC] px-2 py-0.5 rounded-[3px]">
                        {t('playlists.lessons_count', { count: pl.totalVideos || 0 })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#25231F] group-hover:text-[#79542E] transition-colors line-clamp-1 mb-1">
                      {pl.name}
                    </h3>
                    <p className="text-xs text-[#777168] line-clamp-2 leading-relaxed">
                      {pl.description || t('playlists.no_description')}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#DED8CC]/60 mt-4 flex items-center justify-between text-[11px] text-[#777168]">
                    <span>
                      {new Date(pl.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-[#79542E] group-hover:translate-x-0.5 transition-transform">
                      {t('playlists.open_playlist')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] max-w-md w-full shadow-xl overflow-hidden text-[#25231F]">
            <div className="p-5 border-b border-[#DED8CC] flex items-center justify-between bg-[#FAF6EE]/70">
              <h3 className="text-sm font-bold text-[#25231F] flex items-center gap-2">
                <FiFolder className="w-4 h-4 text-[#A67C52]" />
                <span>{t('playlists.modal_title')}</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#777168] hover:text-[#25231F] rounded-[3px] hover:bg-[#F4EDE1] transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#25231F]">
                  {t('playlists.name_label')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('playlists.name_placeholder')}
                  className="w-full bg-[#FFF9ED] border border-[#DED8CC] rounded-[5px] px-3.5 py-2 text-xs text-[#25231F] focus:outline-none focus:bg-[#FFFDF8] focus:border-[#A67C52] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#25231F]">
                  {t('playlists.desc_label')}
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={t('playlists.desc_placeholder')}
                  className="w-full bg-[#FFF9ED] border border-[#DED8CC] rounded-[5px] px-3.5 py-2 text-xs text-[#25231F] focus:outline-none focus:bg-[#FFFDF8] focus:border-[#A67C52] transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-[5px] p-2.5">
                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-[5px] border border-[#DED8CC] bg-[#FAF6EE] hover:bg-[#F4EDE1] text-xs font-semibold text-[#555048] transition-colors cursor-pointer"
                >
                  {t('playlists.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-[5px] bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {creating ? (
                    <>
                      <FiLoader className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('playlists.creating')}</span>
                    </>
                  ) : (
                    <span>{t('playlists.create_btn')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlaylistsPage;
