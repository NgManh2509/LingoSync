import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiPlus, 
  FiSidebar, 
  FiBell, 
  FiLogOut, 
  FiChevronDown, 
  FiChevronUp,
  FiUser
} from 'react-icons/fi';
import { 
  HiOutlineBookOpen, 
  HiOutlineTrophy, 
  HiOutlineChevronUpDown 
} from 'react-icons/hi2';
import { 
  MdOutlineVideoLibrary, 
  MdOutlineQueueMusic, 
  MdOutlineTranslate,
  MdHistory
} from 'react-icons/md';
import { BsRobot } from 'react-icons/bs';
import apiClient from '../../api/apiClient';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsOpen, setPlaylistsOpen] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await apiClient.get('/api/playlists');
        if (res.data && Array.isArray(res.data)) {
          setPlaylists(res.data);
        }
      } catch {
        setPlaylists([]);
      }
    };
    fetchPlaylists();
  }, [location.pathname]);

  const getInitials = (username, email) => {
    const raw = username || (email ? email.split('@')[0] : 'U');
    const parts = raw.split(/[_\s.-]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  };

  const displayName = user?.username || (user?.email ? user.email.split('@')[0] : 'Learner');

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-[#FFFDF8] border-r border-[#DED8CC] flex flex-col h-screen sticky top-0 shrink-0 select-none font-['Plus_Jakarta_Sans',sans-serif] text-[#555048] z-30 transition-all duration-300 ease-in-out`}
    >
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5">
              <img 
                src="/lingosync-logo.svg" 
                alt="LingoSync Logo" 
                className="w-7 h-7 object-contain rounded-[4px] shadow-xs"
              />
              <span className="font-bold text-base text-[#25231F] tracking-tight">
                Lingo<span className="text-[#A67C52] font-semibold">Sync</span>
              </span>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-[5px] text-[#777168] hover:text-[#25231F] hover:bg-[#F4EDE1] transition-colors cursor-pointer"
              title="Thu gọn Sidebar"
            >
              <FiSidebar className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded-[5px] hover:bg-[#F4EDE1] transition-colors cursor-pointer"
            title="Bấm để mở rộng Sidebar"
          >
            <img 
              src="/lingosync-logo.svg" 
              alt="LingoSync Logo" 
              className="w-7 h-7 object-contain rounded-[4px] shadow-xs"
            />
          </button>
        )}
      </div>

      <div className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div>
          {isCollapsed ? (
            <div className="space-y-1">
              <NavLink
                to="/lessons"
                title="Lessons"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-[5px] text-xs transition-colors ${
                    isActive
                      ? 'bg-[#F4EDE1] text-[#25231F] font-bold'
                      : 'text-[#555048] hover:bg-[#FAF6EE] hover:text-[#25231F]'
                  }`
                }
              >
                <MdOutlineVideoLibrary className="w-4 h-4" />
              </NavLink>

              <NavLink
                to="/playlists"
                title="Playlists"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-[5px] text-xs transition-colors ${
                    isActive
                      ? 'bg-[#F4EDE1] text-[#25231F] font-bold'
                      : 'text-[#555048] hover:bg-[#FAF6EE] hover:text-[#25231F]'
                  }`
                }
              >
                <MdOutlineQueueMusic className="w-4 h-4" />
              </NavLink>

              <NavLink
                to="/vocabulary"
                title="Vocabulary"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-[5px] text-xs transition-colors ${
                    isActive
                      ? 'bg-[#F4EDE1] text-[#25231F] font-bold'
                      : 'text-[#555048] hover:bg-[#FAF6EE] hover:text-[#25231F]'
                  }`
                }
              >
                <MdOutlineTranslate className="w-4 h-4" />
              </NavLink>
            </div>
          ) : (
            <>
              <button
                onClick={() => setLibraryOpen(!libraryOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-xs font-semibold transition-colors cursor-pointer ${
                  ['/lessons', '/playlists', '/vocabulary', '/'].some(p => location.pathname === p)
                    ? 'bg-[#F4EDE1] text-[#25231F] font-bold'
                    : 'text-[#555048] hover:bg-[#FAF6EE] hover:text-[#25231F]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HiOutlineBookOpen className="w-4 h-4 text-[#79542E]" />
                  <span>Library</span>
                </div>
                {libraryOpen ? (
                  <FiChevronUp className="w-3.5 h-3.5 text-[#777168]" />
                ) : (
                  <FiChevronDown className="w-3.5 h-3.5 text-[#777168]" />
                )}
              </button>

              {libraryOpen && (
                <div className="pl-6 pr-1 pt-1 space-y-0.5">
                  <NavLink
                    to="/lessons"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                        isActive
                          ? 'bg-[#F4EDE1] text-[#25231F] font-semibold'
                          : 'text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE]'
                      }`
                    }
                  >
                    <MdOutlineVideoLibrary className="w-3.5 h-3.5" />
                    <span>Lessons</span>
                  </NavLink>

                  <div>
                    <div className="flex items-center justify-between">
                      <NavLink
                        to="/playlists"
                        className={({ isActive }) =>
                          `flex-1 flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                            isActive && !location.search
                              ? 'bg-[#F4EDE1] text-[#25231F] font-semibold'
                              : 'text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE]'
                          }`
                        }
                      >
                        <MdOutlineQueueMusic className="w-3.5 h-3.5" />
                        <span>Playlists</span>
                        {playlists.length > 0 && (
                          <span className="ml-auto text-[10px] bg-[#FAF6EE] border border-[#DED8CC] text-[#777168] px-1.5 py-0.2 rounded-[3px]">
                            {playlists.length}
                          </span>
                        )}
                      </NavLink>
                      {playlists.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPlaylistsOpen(!playlistsOpen)}
                          className="p-1 text-[#777168] hover:text-[#25231F] rounded-[3px] hover:bg-[#FAF6EE] cursor-pointer"
                        >
                          {playlistsOpen ? (
                            <FiChevronUp className="w-3 h-3" />
                          ) : (
                            <FiChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {playlistsOpen && playlists.length > 0 && (
                      <div className="pl-6 space-y-0.5 pt-0.5">
                        {playlists.map((pl, idx) => {
                          const isCurrent = location.pathname === '/playlists' && new URLSearchParams(location.search).get('id') === String(pl.id);
                          return (
                            <NavLink
                              key={pl.id || `side-pl-${idx}`}
                              to={`/playlists?id=${pl.id}`}
                              className={`flex items-center justify-between px-2 py-1 rounded-[4px] text-[11px] transition-colors truncate ${
                                isCurrent
                                  ? 'bg-[#F4EDE1] text-[#25231F] font-medium'
                                  : 'text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE]'
                              }`}
                              title={pl.name}
                            >
                              <span className="truncate">{pl.name}</span>
                              <span className="text-[10px] text-[#A67C52] ml-1 shrink-0">
                                {pl.totalVideos}
                              </span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <NavLink
                    to="/vocabulary"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                        isActive
                          ? 'bg-[#F4EDE1] text-[#25231F] font-semibold'
                          : 'text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE]'
                      }`
                    }
                  >
                    <MdOutlineTranslate className="w-3.5 h-3.5" />
                    <span>Vocabulary</span>
                  </NavLink>
                </div>
              )}
            </>
          )}
        </div>

        <NavLink
          to="/lingo-ai"
          title="LingoAI"
          className={({ isActive }) =>
            `flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            } rounded-[5px] text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-[#F4EDE1] text-[#25231F] font-bold'
                : 'text-[#555048] hover:bg-[#FAF6EE] hover:text-[#25231F]'
            }`
          }
        >
          <BsRobot className="w-4 h-4 text-[#A67C52] shrink-0" />
          {!isCollapsed && (
            <>
              <span>LingoAI</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-[3px] bg-[#F4EDE1] text-[#79542E] text-[9px] font-bold border border-[#DED8CC]">
                Writing
              </span>
            </>
          )}
        </NavLink>

        <div className="pt-2">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-semibold text-[#777168] uppercase tracking-wider">
              Profile & Practice
            </div>
          )}
          <div className="space-y-0.5">
            <NavLink
              to="/profile"
              title="My Profile"
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5'
                } rounded-[5px] text-xs transition-colors ${
                  isActive
                    ? 'bg-[#F4EDE1] text-[#25231F] font-semibold'
                    : 'text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE]'
                }`
              }
            >
              <FiUser className="w-4 h-4 text-[#777168] shrink-0" />
              {!isCollapsed && <span>My Profile</span>}
            </NavLink>

            <NavLink
              to="/challenges"
              title="Challenges"
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5'
                } rounded-[5px] text-xs transition-colors ${
                  isActive
                    ? 'bg-[#F4EDE1] text-[#25231F] font-semibold'
                    : 'text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE]'
                }`
              }
            >
              <HiOutlineTrophy className="w-4 h-4 text-[#A67C52] shrink-0" />
              {!isCollapsed && <span>Challenges</span>}
            </NavLink>
          </div>
        </div>

        <div className="pt-3">
          {isCollapsed ? (
            <button
              title="Activities"
              className="w-full flex items-center justify-center p-2 rounded-[5px] text-[#777168] hover:bg-[#FAF6EE] transition-colors"
            >
              <MdHistory className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setActivitiesOpen(!activitiesOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-[5px] bg-[#FAF6EE] hover:bg-[#F4EDE1] border border-[#DED8CC] text-xs font-semibold text-[#25231F] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MdHistory className="w-4 h-4 text-[#79542E]" />
                  <span>Activities</span>
                </div>
                <HiOutlineChevronUpDown className="w-3.5 h-3.5 text-[#777168]" />
              </button>

              {activitiesOpen && (
                <div className="mt-1 px-1">
                  <NavLink
                    to="/lessons"
                    className="flex items-center gap-2.5 p-2 rounded-[5px] hover:bg-[#FAF6EE] transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-[4px] bg-[#25231F] text-[#F7F3EA] font-bold text-[9px] flex items-center justify-center shrink-0">
                      1a
                    </div>
                    <p className="text-xs text-[#555048] truncate font-medium group-hover:text-[#25231F]">
                      1a - Mike Is a Cook, Part 1
                    </p>
                  </NavLink>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-[#DED8CC] relative bg-[#FFFDF8]">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2.5 p-1 rounded-[5px] hover:bg-[#FAF6EE] transition-colors text-left ${
              isCollapsed ? '' : 'flex-1 min-w-0 mr-1'
            } cursor-pointer`}
            title={displayName}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#DED8CC]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#EFE9DD] text-[#79542E] font-bold text-xs flex items-center justify-center shrink-0 border border-[#DED8CC]">
                {getInitials(user?.username, user?.email)}
              </div>
            )}
            {!isCollapsed && (
              <>
                <span className="text-xs font-semibold text-[#25231F] truncate">
                  {displayName}
                </span>
                <HiOutlineChevronUpDown className="w-3.5 h-3.5 text-[#777168] shrink-0 ml-auto" />
              </>
            )}
          </button>

          {!isCollapsed && (
            <button 
              className="p-2 rounded-[5px] text-[#777168] hover:text-[#25231F] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
              title="Notifications"
            >
              <FiBell className="w-4 h-4" />
            </button>
          )}
        </div>

        {showUserMenu && (
          <div className={`absolute bottom-14 ${isCollapsed ? 'left-2 w-48' : 'left-3 right-3'} bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150`}>
            <div className="px-2.5 py-1.5 border-b border-[#DED8CC] mb-1">
              <p className="text-xs font-semibold text-[#25231F] truncate">{displayName}</p>
              <p className="text-[11px] text-[#777168] truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
