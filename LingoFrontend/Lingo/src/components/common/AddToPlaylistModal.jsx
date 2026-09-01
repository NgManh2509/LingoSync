import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiPlus, 
  FiCheck, 
  FiLoader, 
  FiAlertCircle, 
  FiFolder
} from 'react-icons/fi';
import { MdOutlineQueueMusic } from 'react-icons/md';
import apiClient from '../../api/apiClient';

const AddToPlaylistModal = ({ isOpen, onClose, videoId, videoTitle }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
      setMessage(null);
      setErrorMessage(null);
      setAddedIds(new Set());
    }
  }, [isOpen, videoId]);

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

  const handleAddToPlaylist = async (playlist) => {
    if (addedIds.has(playlist.id)) return;
    setAddingId(playlist.id);
    setMessage(null);
    setErrorMessage(null);

    try {
      await apiClient.post(`/api/playlists/${playlist.id}/videos/${videoId}`);
      setAddedIds(prev => new Set(prev).add(playlist.id));
      setMessage(`Đã thêm vào "${playlist.name}" thành công!`);
      setPlaylists(prev => prev.map(p => 
        p.id === playlist.id ? { ...p, totalVideos: (p.totalVideos || 0) + 1 } : p
      ));
    } catch (err) {
      if (err.response?.status === 409) {
        setAddedIds(prev => new Set(prev).add(playlist.id));
        setMessage(`Video đã có sẵn trong "${playlist.name}".`);
      } else {
        setErrorMessage(err.response?.data?.message || 'Không thể thêm video vào playlist');
      }
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setErrorMessage(null);

    try {
      const createRes = await apiClient.post('/api/playlists', {
        name: newName.trim(),
        description: newDesc.trim()
      });
      const newPlaylist = createRes.data;
      if (newPlaylist?.id) {
        await apiClient.post(`/api/playlists/${newPlaylist.id}/videos/${videoId}`);
        setAddedIds(prev => new Set(prev).add(newPlaylist.id));
        setMessage(`Đã tạo và thêm vào "${newPlaylist.name}" thành công!`);
        setShowCreateForm(false);
        setNewName('');
        setNewDesc('');
        fetchPlaylists();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Không thể tạo playlist');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] max-w-md w-full shadow-xl overflow-hidden text-[#25231F] flex flex-col max-h-[85vh]">
        
        <div className="p-4 sm:p-5 border-b border-[#DED8CC] flex items-center justify-between bg-[#FAF6EE]/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] border border-[#DED8CC] flex items-center justify-center text-[#A67C52]">
              <MdOutlineQueueMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#25231F]">Lưu vào Playlist</h3>
              <p className="text-[11px] text-[#777168] line-clamp-1 max-w-[260px]">
                {videoTitle || 'Video bài học'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#777168] hover:text-[#25231F] rounded-[3px] hover:bg-[#F4EDE1] transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-[5px] text-xs text-emerald-800 flex items-center gap-2">
            <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="line-clamp-1">{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-[5px] text-xs text-rose-700 flex items-center gap-2">
            <FiAlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 text-center text-[#777168] flex items-center justify-center gap-2 text-xs">
              <FiLoader className="w-4 h-4 animate-spin text-[#A67C52]" />
              <span>Đang tải danh sách playlist...</span>
            </div>
          ) : playlists.length === 0 ? (
            <div className="py-8 text-center bg-[#FAF6EE]/50 border border-dashed border-[#DED8CC] rounded-[5px] p-5">
              <FiFolder className="w-8 h-8 text-[#A67C52] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-[#25231F] mb-1">Chưa có Playlist nào</p>
              <p className="text-[11px] text-[#777168] mb-3">Tạo playlist mới đầu tiên để lưu bài học này.</p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A67C52] hover:bg-[#79542E] text-white rounded-[5px] text-xs font-semibold transition-colors cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Tạo playlist mới</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold text-[#777168] uppercase tracking-wider">
                  Chọn playlist
                </span>
                {!showCreateForm && (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#79542E] hover:underline cursor-pointer"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>Tạo mới</span>
                  </button>
                )}
              </div>

              {playlists.map((pl) => {
                const isAdded = addedIds.has(pl.id);
                const isAdding = addingId === pl.id;

                return (
                  <div
                    key={pl.id}
                    onClick={() => handleAddToPlaylist(pl)}
                    className={`flex items-center justify-between p-3 rounded-[5px] border transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-[#F4EDE1] border-[#A67C52]/60'
                        : 'bg-[#FFF9ED]/60 border-[#DED8CC] hover:bg-[#FAF6EE] hover:border-[#A67C52]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="text-xs font-bold text-[#25231F] truncate mb-0.5">
                        {pl.name}
                      </h4>
                      <p className="text-[11px] text-[#777168] truncate">
                        {pl.description || `${pl.totalVideos || 0} bài học`}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isAdding ? (
                        <FiLoader className="w-4 h-4 animate-spin text-[#A67C52]" />
                      ) : isAdded ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-[3px] text-[10px] font-bold">
                          <FiCheck className="w-3 h-3" />
                          <span>Đã lưu</span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-[4px] border border-[#DED8CC] bg-[#FFFDF8] hover:bg-[#F4EDE1] flex items-center justify-center text-[#777168] hover:text-[#25231F] transition-colors">
                          <FiPlus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreateAndAdd} className="p-3.5 bg-[#FAF6EE] border border-[#DED8CC] rounded-[5px] space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#25231F]">Tạo playlist & lưu ngay</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-[#777168] hover:text-[#25231F] cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên Playlist mới..."
                className="w-full bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] px-3 py-1.5 text-xs text-[#25231F] focus:outline-none focus:border-[#A67C52]"
              />

              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Mô tả ngắn (tùy chọn)..."
                className="w-full bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] px-3 py-1.5 text-xs text-[#25231F] focus:outline-none focus:border-[#A67C52]"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 rounded-[5px] border border-[#DED8CC] bg-[#FFFDF8] text-xs text-[#777168] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {creating ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiPlus className="w-3.5 h-3.5" />}
                  <span>Lưu ngay</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-[#DED8CC] bg-[#FAF6EE]/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[5px] bg-[#25231F] hover:bg-[#3b3833] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddToPlaylistModal;
